package com.mohamewael66sorganization.owwab;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.IOException;

public class AzanService extends Service {
    private static final String TAG              = "AzanService";
    private static final String CHANNEL_ID       = "azan_channel_v2";
    private static final int    NOTIFICATION_ID  = 2001;
    public  static final String ACTION_STOP      = "STOP_AZAN";
    public  static final String ACTION_PREVIEW   = "PREVIEW_REMINDER_SOUND";
    private static final long   REMINDER_MAX_MS  = 5 * 60 * 1000L; // a reminder rings at most 5 minutes
    private static final long   PREVIEW_MS       = 8 * 1000L;
    private static final long   RAMP_MS          = 30 * 1000L;     // volume rises from soft to full

    /** The reminder ringing now (JSON), so JS can show its screen; null for the adhan. */
    private static volatile String ringingReminder;
    private final android.os.Handler handler = new android.os.Handler(android.os.Looper.getMainLooper());
    private java.util.List<android.net.Uri> playlist;
    private int playIndex;
    private boolean loopPlaylist;
    private long playStartedAt;

    private MediaPlayer       mediaPlayer;
    private PowerManager.WakeLock screenLock;

    /** The running service, so AzanModule can report the playback position to JS. */
    private static AzanService current;

    /** Milliseconds into the adhan, or -1 when nothing is playing. */
    public static boolean isRunning() {
        return current != null;
    }

    public static int currentPositionMs() {
        AzanService svc = current;
        if (svc == null || svc.mediaPlayer == null) return -1;
        try { return svc.mediaPlayer.isPlaying() ? svc.mediaPlayer.getCurrentPosition() : -1; }
        catch (IllegalStateException e) { return -1; }
    }
    private AudioManager      audioManager;
    private AudioFocusRequest audioFocusRequest; // API 26+

    // ──────────────────────────────────────────────────────────────
    // Lifecycle
    // ──────────────────────────────────────────────────────────────

    @Override
    public void onCreate() {
        super.onCreate();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Handle stop action from notification button
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            Log.d(TAG, "Stop action received");
            stopAzan();
            return START_NOT_STICKY;
        }

        if (intent != null && ACTION_PREVIEW.equals(intent.getAction())) {
            preview(intent.getStringExtra("sound"));
            return START_NOT_STICKY;
        }

        String reminder = intent != null ? intent.getStringExtra(ReminderAlarms.EXTRA) : null;
        if (reminder != null) {
            startReminder(reminder);
            return START_NOT_STICKY;
        }

        String prayerName = (intent != null) ? intent.getStringExtra("prayerName") : "الصلاة";
        String azanType   = (intent != null) ? intent.getStringExtra("type")        : "full";
        if (prayerName == null) prayerName = "الصلاة";

        Log.d(TAG, "Starting Azan for: " + prayerName + " type=" + azanType);

        // ► MUST call startForeground within 5 seconds of startForegroundService
        startForeground(NOTIFICATION_ID, buildNotification(prayerName));

        // Light the screen like an alarm clock. Works on every phone, so even where the maker
        // blocks the adhan screen over the lock screen, the user sees the notification + stop.
        wakeScreen();

        // Optional: Open app on lock screen (only if overlay permission granted)
        launchActivityIfAllowed(prayerName);

        playAzan();

        return START_NOT_STICKY; // Don't restart if killed after completion
    }

    @Override
    public void onDestroy() {
        if (current == this) current = null;
        ringingReminder = null;
        handler.removeCallbacksAndMessages(null);
        releaseScreenLock();
        releaseMediaPlayer();
        abandonAudioFocus();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) { return null; }

    // ──────────────────────────────────────────────────────────────
    // Audio Playback
    // ──────────────────────────────────────────────────────────────

    public static String currentReminder() {
        return ringingReminder;
    }

    /** A user reminder: its own notification and screen, its sound looping and rising. */
    private void startReminder(String json) {
        org.json.JSONObject r;
        try { r = new org.json.JSONObject(json); } catch (org.json.JSONException e) { stopSelf(); return; }
        String id = r.optString("id");
        startForeground(NOTIFICATION_ID, buildReminderNotification(r.optString("title", "تذكير"), r.optString("body"), id));
        ringingReminder = json;
        current = this;
        wakeScreen();
        launchActivityIfAllowed(ReminderAlarms.PREFIX + id);
        playlist = resolveSound(r.optString("sound"), false);
        loopPlaylist = true;
        playStartedAt = System.currentTimeMillis();
        requestAudioFocus();
        playAt(0);
        rampVolume();
        handler.postDelayed(this::stopAzan, REMINDER_MAX_MS);
    }

    /** A few seconds of a sound for the picker; no notification, nothing over the lock screen. */
    private void preview(String sound) {
        handler.removeCallbacksAndMessages(null);
        playlist = resolveSound(sound, true);
        loopPlaylist = false;
        playStartedAt = System.currentTimeMillis() - RAMP_MS; // full volume
        playAt(0);
        handler.postDelayed(() -> { releaseMediaPlayer(); stopSelf(); }, PREVIEW_MS);
    }

    /**
     * "raw:<name>" a bundled sound, "system" the phone's alarm tone, "urls:a|b" downloaded
     * recitations (streamed when previewing). Anything missing falls back to the bundled
     * salawat, so a reminder always makes a sound.
     */
    private java.util.List<android.net.Uri> resolveSound(String sound, boolean allowStream) {
        java.util.List<android.net.Uri> out = new java.util.ArrayList<>();
        if (sound != null && sound.startsWith("urls:")) {
            for (String u : sound.substring(5).split("\\|")) {
                java.io.File f = ReminderAlarms.cached(this, u);
                if (f.exists() && f.length() > 0) out.add(android.net.Uri.fromFile(f));
                else if (allowStream) out.add(android.net.Uri.parse(u));
            }
        } else if ("system".equals(sound)) {
            android.net.Uri u = android.media.RingtoneManager.getActualDefaultRingtoneUri(this, android.media.RingtoneManager.TYPE_ALARM);
            if (u == null) u = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM);
            if (u != null) out.add(u);
        } else if (sound != null && sound.startsWith("raw:")) {
            int res = getResources().getIdentifier(sound.substring(4), "raw", getPackageName());
            if (res != 0) out.add(android.net.Uri.parse("android.resource://" + getPackageName() + "/" + res));
        }
        if (out.isEmpty()) {
            int res = getResources().getIdentifier("sali_ala_nabii", "raw", getPackageName());
            if (res != 0) out.add(android.net.Uri.parse("android.resource://" + getPackageName() + "/" + res));
        }
        return out;
    }

    private void playAt(int index) {
        releaseMediaPlayer();
        if (playlist == null || playlist.isEmpty()) return;
        playIndex = index;
        try {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build());
            mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
            mediaPlayer.setDataSource(getApplicationContext(), playlist.get(index));
            mediaPlayer.setVolume(currentVolume(), currentVolume());
            mediaPlayer.setOnPreparedListener(MediaPlayer::start);
            mediaPlayer.setOnCompletionListener(mp -> {
                int next = playIndex + 1;
                if (next < playlist.size()) playAt(next);
                else if (loopPlaylist) handler.postDelayed(() -> playAt(0), 1500); // a breath between rounds
                else releaseMediaPlayer();
            });
            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                Log.e(TAG, "Reminder sound error " + what + "/" + extra);
                return true;
            });
            mediaPlayer.prepareAsync();
        } catch (IOException | IllegalStateException | IllegalArgumentException | SecurityException e) {
            Log.e(TAG, "Failed to play reminder sound", e);
        }
    }

    private float currentVolume() {
        long t = System.currentTimeMillis() - playStartedAt;
        return Math.min(1f, 0.25f + 0.75f * t / (float) RAMP_MS);
    }

    private void rampVolume() {
        handler.postDelayed(new Runnable() {
            @Override public void run() {
                if (mediaPlayer != null) {
                    try { mediaPlayer.setVolume(currentVolume(), currentVolume()); } catch (IllegalStateException ignored) {}
                }
                if (System.currentTimeMillis() - playStartedAt < RAMP_MS) handler.postDelayed(this, 1000);
            }
        }, 1000);
    }

    private Notification buildReminderNotification(String title, String body, String id) {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.putExtra("isAzanTriggered", true);
        openIntent.putExtra("prayerName", ReminderAlarms.PREFIX + id);
        openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        PendingIntent openPending = PendingIntent.getActivity(this, 2, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Intent stopIntent = new Intent(this, AzanService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPending = PendingIntent.getService(this, 1, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(body == null || body.isEmpty() ? "حان موعد تذكيرك" : body)
                .setSmallIcon(R.drawable.notification_icon)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(false)
                .setFullScreenIntent(openPending, true)
                .setContentIntent(openPending)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "إيقاف", stopPending)
                .build();
    }

    private void playAzan() {
        try {
            releaseMediaPlayer();

            // Request audio focus as an alarm so we duck/pause other audio
            requestAudioFocus();

            int resId = getResources().getIdentifier("azan", "raw", getPackageName());
            if (resId == 0) {
                Log.e(TAG, "azan.mp3 raw resource not found!");
                stopSelf();
                return;
            }

            /*
             * CRITICAL: Do NOT use MediaPlayer.create(ctx, resId).
             * That helper calls prepare() internally BEFORE setAudioAttributes(),
             * so the custom attributes are ignored.
             * We must set attributes BEFORE prepare() to bypass silent/vibrate.
             */
            mediaPlayer = new MediaPlayer();

            // USAGE_ALARM bypasses the device ringer/silent/vibrate profile,
            // exactly like the built-in alarm clock app.
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
            mediaPlayer.setAudioAttributes(audioAttributes);

            // PARTIAL_WAKE_LOCK keeps the CPU running so audio doesn't stutter
            // or cut off when the device screen turns off.
            mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);

            // Set data source using the raw resource URI
            android.net.Uri uri = android.net.Uri.parse(
                    "android.resource://" + getPackageName() + "/" + resId);
            mediaPlayer.setDataSource(getApplicationContext(), uri);

            mediaPlayer.setLooping(false);
            mediaPlayer.prepareAsync();

            current = this;
            mediaPlayer.setOnPreparedListener(MediaPlayer::start);

            mediaPlayer.setOnCompletionListener(mp -> {
                Log.d(TAG, "Azan playback complete");
                stopAzan();
            });

            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                Log.e(TAG, "MediaPlayer error: what=" + what + " extra=" + extra);
                stopAzan();
                return true;
            });

        } catch (IOException | IllegalStateException e) {
            Log.e(TAG, "Failed to play Azan", e);
            stopSelf();
        }
    }

    @SuppressWarnings("deprecation") // the only way for a service to turn the screen on
    private void wakeScreen() {
        try {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm == null || pm.isInteractive()) return;
            releaseScreenLock();
            screenLock = pm.newWakeLock(
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE,
                    "owwab:azan-screen");
            screenLock.acquire(60 * 1000L); // the screen may dim again after a minute
        } catch (Exception e) {
            Log.w(TAG, "wakeScreen failed", e);
        }
    }

    private void releaseScreenLock() {
        try {
            if (screenLock != null && screenLock.isHeld()) screenLock.release();
        } catch (Exception ignored) {}
        screenLock = null;
    }

    private void stopAzan() {
        ringingReminder = null;
        handler.removeCallbacksAndMessages(null);
        releaseScreenLock();
        releaseMediaPlayer();
        abandonAudioFocus();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        stopSelf();
    }

    private void releaseMediaPlayer() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) mediaPlayer.stop();
            } catch (Exception ignored) {}
            mediaPlayer.release();
            mediaPlayer = null;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Audio Focus
    // ──────────────────────────────────────────────────────────────

    private void requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                    .setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .build())
                    .setAcceptsDelayedFocusGain(false)
                    .setOnAudioFocusChangeListener(focusChange ->
                            Log.d(TAG, "AudioFocus changed: " + focusChange))
                    .build();
            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            //noinspection deprecation
            audioManager.requestAudioFocus(
                    null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
        }
    }

    private void abandonAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
            audioManager.abandonAudioFocusRequest(audioFocusRequest);
        } else {
            //noinspection deprecation
            audioManager.abandonAudioFocus(null);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Notification
    // ──────────────────────────────────────────────────────────────

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "تنبيهات الأذان",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("تنبيهات الأذان في أوقات الصلاة");
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true);  // bypass Do-Not-Disturb
            channel.setSound(null, null); // MediaPlayer owns the sound, not the channel
            channel.enableVibration(false);

            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification(String prayerName) {
        // Tap notification → open app
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.putExtra("isAzanTriggered", true);
        openIntent.putExtra("prayerName", prayerName);
        openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                | Intent.FLAG_ACTIVITY_SINGLE_TOP
                | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        PendingIntent openPending = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Stop button
        Intent stopIntent = new Intent(this, AzanService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPending = PendingIntent.getService(
                this, 1, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("حان موعد صلاة " + prayerName)
                .setContentText("حيَّ على الصلاة • حيَّ على الفلاح")
                .setSmallIcon(R.drawable.notification_icon)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(false)
                .setFullScreenIntent(openPending, true)
                .setContentIntent(openPending)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "إيقاف الأذان", stopPending)
                .build();
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────

    /** Open app on top of lock screen only when overlay permission is granted */
    private void launchActivityIfAllowed(String prayerName) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                && android.provider.Settings.canDrawOverlays(this)) {
            Intent actIntent = new Intent(this, MainActivity.class);
            actIntent.putExtra("isAzanTriggered", true);
            actIntent.putExtra("prayerName", prayerName);
            actIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_SINGLE_TOP
                    | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                    | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(actIntent);
        }
    }
}
