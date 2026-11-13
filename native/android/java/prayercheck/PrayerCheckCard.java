package com.mohamewael66sorganization.owwab.prayercheck;

import android.annotation.SuppressLint;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.LinearInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.mohamewael66sorganization.owwab.R;

import org.json.JSONObject;

/**
 * «صليت؟» as a floating card that slides in at the top of the screen, over whatever app is open:
 * a mosque icon with the prayer and its adhan time, the question, a short line, «صليت» and «لسه»,
 * and a thin bar that runs out with the time the card stays. Light or dark with the app's
 * theme setting. Its buttons send the same broadcasts as the notification's, so the receiver handles both
 * the same way. A soft notification sound (or a short buzz on vibrate) comes with it.
 *
 * Shown only when it can be seen: the screen is on and unlocked and the app may draw over other
 * apps. Otherwise the caller posts the notification and shows the card when the phone is next
 * unlocked (PrayerChecks.showWaiting). Left alone, or swiped up, it slides away after a minute;
 * the first question then counts as «لسه» (asked again later).
 */
final class PrayerCheckCard {
    private static final String TAG = "PrayerCheckCard";
    private static final long SHOW_MS = 60_000L;
    /** The prayer id of a card shown from settings to try it: its buttons only close it. */
    static final String PREVIEW = "preview";

    /** The app's tokens (src/shared/theme/tokens.ts), dark and light. */
    private static final class Palette {
        final int card, text, muted, gold, goldSoft, onGold, hairline;
        Palette(String card, String text, String muted, String gold, String goldSoft, String onGold, String hairline) {
            this.card = Color.parseColor(card);
            this.text = Color.parseColor(text);
            this.muted = Color.parseColor(muted);
            this.gold = Color.parseColor(gold);
            this.goldSoft = Color.parseColor(goldSoft);
            this.onGold = Color.parseColor(onGold);
            this.hairline = Color.parseColor(hairline);
        }
    }
    private static final Palette DARK = new Palette("#F71A140F", "#F5EFE6", "#A89F93", "#D4AF37", "#24D4AF37", "#1A140F", "#14FFFFFF");
    private static final Palette LIGHT = new Palette("#FAFFFFFF", "#2B1F15", "#7A6A58", "#B8901F", "#1FB8901F", "#FFFFFF", "#142B1F15");

    private static final Handler main = new Handler(Looper.getMainLooper());
    private static View card;
    private static String cardPrayer;
    private static Runnable timeout;

    private PrayerCheckCard() {}

    /** Whether a card would be seen now: screen on, unlocked, and allowed over other apps. */
    static boolean canShow(Context c) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(c)) return false;
            PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
            if (pm == null || !pm.isInteractive()) return false;
            KeyguardManager km = (KeyguardManager) c.getSystemService(Context.KEYGUARD_SERVICE);
            return km == null || !km.isKeyguardLocked();
        } catch (Exception e) {
            return false;
        }
    }

    private static int dp(Context c, float v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, c.getResources().getDisplayMetrics()));
    }

    /** The app's light/dark setting; "system" follows the phone. */
    private static Palette palette(Context c) {
        String look = PrayerChecks.look(c);
        if ("light".equals(look)) return LIGHT;
        if ("dark".equals(look)) return DARK;
        int night = c.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return night == Configuration.UI_MODE_NIGHT_YES ? DARK : LIGHT;
    }

    /** Shows the question; returns false if it could not, so the caller posts the notification. */
    static boolean show(Context context, JSONObject item, boolean followUp) {
        final Context c = context.getApplicationContext();
        if (!canShow(c)) return false;
        final String prayerId = item.optString("prayerId");
        main.post(() -> {
            hideNow();
            try {
                WindowManager wm = (WindowManager) c.getSystemService(Context.WINDOW_SERVICE);
                if (wm == null) return;
                final Runnable dismissed = () -> {
                    hide(prayerId);
                    if (!followUp) send(c, PrayerChecks.ACTION_LATER, prayerId); // unanswered: ask again later
                };
                Palette p = palette(c);
                View bar = progressBar(c, p);
                View v = build(c, p, item, followUp, prayerId, bar, dismissed);

                int screenW = c.getResources().getDisplayMetrics().widthPixels;
                int width = Math.min(screenW - dp(c, 20), dp(c, 400));
                int type = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                        : WindowManager.LayoutParams.TYPE_PHONE;
                // not focusable: the keyboard and the app underneath keep working; touches outside
                // the card reach the app under it
                WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                        width, WindowManager.LayoutParams.WRAP_CONTENT, type,
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                        PixelFormat.TRANSLUCENT);
                lp.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
                lp.y = statusBar(c) + dp(c, 8);
                wm.addView(v, lp);
                card = v;
                cardPrayer = prayerId;

                // slide down from above the screen, a touch of scale for depth
                v.setAlpha(0f);
                v.setTranslationY(-dp(c, 160));
                v.setScaleX(0.96f);
                v.setScaleY(0.96f);
                v.animate().translationY(0).alpha(1f).scaleX(1f).scaleY(1f)
                        .setDuration(420).setInterpolator(new DecelerateInterpolator(2.2f)).start();
                // the bar runs out with the time left; it shrinks toward the reading start (right)
                bar.post(() -> {
                    bar.setPivotX(bar.getWidth());
                    bar.animate().scaleX(0f).setDuration(SHOW_MS).setInterpolator(new LinearInterpolator()).start();
                });

                timeout = PREVIEW.equals(prayerId) ? () -> hide(prayerId) : dismissed;
                main.postDelayed(timeout, SHOW_MS);
                chime(c);
            } catch (Exception e) {
                Log.w(TAG, "Could not show the card", e);
                card = null;
                cardPrayer = null;
            }
        });
        return true;
    }

    @SuppressLint("ClickableViewAccessibility")
    private static View build(Context c, Palette p, JSONObject item, boolean followUp, String prayerId, View bar, Runnable dismissed) {
        LinearLayout root = new LinearLayout(c);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setPadding(dp(c, 18), dp(c, 16), dp(c, 18), 0);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(p.card);
        bg.setCornerRadius(dp(c, 26));
        bg.setStroke(dp(c, 1), p.hairline);
        root.setBackground(bg);
        root.setElevation(dp(c, 18));
        root.setClipToOutline(true);
        root.setClipToPadding(false); // the time bar runs edge to edge

        // header: icon in a soft circle, then the prayer and its adhan time
        LinearLayout header = new LinearLayout(c);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        FrameLayout badge = new FrameLayout(c);
        GradientDrawable circle = new GradientDrawable();
        circle.setShape(GradientDrawable.OVAL);
        circle.setColor(p.goldSoft);
        badge.setBackground(circle);
        ImageView icon = new ImageView(c);
        icon.setImageResource(R.drawable.ic_prayer_check);
        icon.setImageTintList(ColorStateList.valueOf(p.gold));
        badge.addView(icon, new FrameLayout.LayoutParams(dp(c, 20), dp(c, 20), Gravity.CENTER));
        header.addView(badge, new LinearLayout.LayoutParams(dp(c, 38), dp(c, 38)));
        String kicker = item.optString("kicker", followUp ? "تذكير" : "بعد الأذان");
        TextView kick = text(c, kicker, 13, p.muted, true);
        LinearLayout.LayoutParams klp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        klp.setMarginStart(dp(c, 10));
        header.addView(kick, klp);
        root.addView(header);

        TextView title = text(c, item.optString(followUp ? "followUpTitle" : "title"), 22, p.text, true);
        LinearLayout.LayoutParams tlp = full();
        tlp.topMargin = dp(c, 12);
        root.addView(title, tlp);

        String bodyText = item.optString(followUp ? "followUpBody" : "body");
        if (!bodyText.isEmpty()) {
            TextView body = text(c, bodyText, 14, p.muted, false);
            LinearLayout.LayoutParams blp = full();
            blp.topMargin = dp(c, 2);
            root.addView(body, blp);
        }

        // in reading order: «صليت» on the right
        LinearLayout row = new LinearLayout(c);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout.LayoutParams rlp = full();
        rlp.topMargin = dp(c, 16);
        row.addView(button(c, p, "✓  " + item.optString("prayedLabel", "صليت"), true, v -> {
            hide(prayerId);
            send(c, PrayerChecks.ACTION_PRAYED, prayerId);
        }), weighted(c, 0));
        row.addView(button(c, p, followUp ? "مش دلوقتي" : item.optString("laterLabel", "لسه"), false, v -> {
            hide(prayerId);
            // the follow-up is the last ask: «مش دلوقتي» just closes it
            if (!followUp) send(c, PrayerChecks.ACTION_LATER, prayerId);
        }), weighted(c, 10));
        root.addView(row, rlp);

        // the time left, along the bottom edge
        LinearLayout.LayoutParams plp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(c, 3));
        plp.topMargin = dp(c, 16);
        plp.setMarginStart(-dp(c, 18));
        plp.setMarginEnd(-dp(c, 18));
        root.addView(bar, plp);

        // swipe up to put it away (counts as not answered, like the timeout)
        final float[] downY = {0};
        root.setOnTouchListener((v, e) -> {
            switch (e.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    downY[0] = e.getRawY();
                    return true;
                case MotionEvent.ACTION_MOVE:
                    v.setTranslationY(Math.min(0f, e.getRawY() - downY[0]));
                    return true;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    if (downY[0] - e.getRawY() > dp(c, 36)) {
                        if (PREVIEW.equals(prayerId)) hide(prayerId); else dismissed.run();
                    } else {
                        v.animate().translationY(0).setDuration(160).start();
                    }
                    return true;
                default:
                    return false;
            }
        });
        return root;
    }

    private static View progressBar(Context c, Palette p) {
        View bar = new View(c);
        bar.setBackgroundColor(p.gold);
        bar.setAlpha(0.7f);
        return bar;
    }

    private static LinearLayout.LayoutParams full() {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private static LinearLayout.LayoutParams weighted(Context c, int startGapDp) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(c, 46), 1f);
        lp.setMarginStart(dp(c, startGapDp));
        return lp;
    }

    private static TextView text(Context c, String s, int sp, int color, boolean bold) {
        TextView t = new TextView(c);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        t.setGravity(Gravity.START);
        t.setTextDirection(View.TEXT_DIRECTION_RTL);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private static TextView button(Context c, Palette p, String label, boolean primary, View.OnClickListener onClick) {
        TextView b = text(c, label, 15, primary ? p.onGold : p.gold, true);
        b.setGravity(Gravity.CENTER);
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(c, 16));
        bg.setColor(primary ? p.gold : p.goldSoft);
        b.setBackground(bg);
        b.setOnClickListener(onClick);
        return b;
    }

    /** The phone's notification sound, or a short buzz when it is on vibrate; nothing on silent. */
    private static void chime(Context c) {
        try {
            AudioManager am = (AudioManager) c.getSystemService(Context.AUDIO_SERVICE);
            int mode = am != null ? am.getRingerMode() : AudioManager.RINGER_MODE_NORMAL;
            if (mode == AudioManager.RINGER_MODE_NORMAL) {
                Ringtone r = RingtoneManager.getRingtone(c, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION));
                if (r != null) {
                    r.setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build());
                    r.play();
                }
            } else if (mode == AudioManager.RINGER_MODE_VIBRATE) {
                Vibrator vib = (Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE);
                if (vib == null) return;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) vib.vibrate(VibrationEffect.createWaveform(new long[]{0, 60, 80, 60}, -1));
                else vib.vibrate(new long[]{0, 60, 80, 60}, -1);
            }
        } catch (Exception e) {
            Log.w(TAG, "No sound for the card", e);
        }
    }

    private static int statusBar(Context c) {
        int id = c.getResources().getIdentifier("status_bar_height", "dimen", "android");
        return id > 0 ? c.getResources().getDimensionPixelSize(id) : dp(c, 24);
    }

    private static void send(Context c, String action, String prayerId) {
        if (PREVIEW.equals(prayerId)) return; // a try from settings: nothing to record or re-ask
        c.sendBroadcast(new Intent(c, PrayerCheckReceiver.class).setAction(action).putExtra(PrayerChecks.EXTRA_PRAYER, prayerId));
    }

    /** Takes the card away if it is this prayer's (an answer from the notification or the app). */
    static void hide(String prayerId) {
        main.post(() -> {
            if (card != null && (prayerId == null || prayerId.equals(cardPrayer))) hideNow();
        });
    }

    private static void hideNow() {
        if (timeout != null) main.removeCallbacks(timeout);
        timeout = null;
        final View v = card;
        card = null;
        cardPrayer = null;
        if (v == null) return;
        v.animate().translationY(-v.getHeight() - 40).alpha(0f).setDuration(220).withEndAction(() -> {
            try {
                WindowManager wm = (WindowManager) v.getContext().getSystemService(Context.WINDOW_SERVICE);
                if (wm != null && v.isAttachedToWindow()) wm.removeViewImmediate(v);
            } catch (Exception ignored) {}
        }).start();
    }
}
