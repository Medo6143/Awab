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

    private MediaPlayer       mediaPlayer;
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

        String prayerName = (intent != null) ? intent.getStringExtra("prayerName") : "الصلاة";
        String azanType   = (intent != null) ? intent.getStringExtra("type")        : "full";
        if (prayerName == null) prayerName = "الصلاة";

        Log.d(TAG, "Starting Azan for: " + prayerName + " type=" + azanType);

        // ► MUST call startForeground within 5 seconds of startForegroundService
        startForeground(NOTIFICATION_ID, buildNotification(prayerName));

        // Optional: Open app on lock screen (only if overlay permission granted)
        launchActivityIfAllowed(prayerName);

        playAzan();

        return START_NOT_STICKY; // Don't restart if killed after completion
    }

    @Override
    public void onDestroy() {
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

    private void stopAzan() {
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
