package com.mohamewael66sorganization.owwab.prayercheck;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONObject;

/**
 * «صليت؟» as a card that slides in at the top of the screen, over whatever app is open, in the
 * look of the floating sebha's dhikr card (dark card, gold rim). Its two buttons send the same
 * broadcasts as the notification's, so the receiver handles both the same way.
 *
 * Shown only when it can be seen: the screen is on and unlocked and the app may draw over other
 * apps. Otherwise the caller falls back to the notification. Left alone, it slides away after a
 * minute; the first question then counts as «لسه» (asked again later).
 */
final class PrayerCheckCard {
    private static final String TAG = "PrayerCheckCard";
    private static final long SHOW_MS = 60_000L;
    /** The prayer id of a card shown from settings to try it: its buttons only close it. */
    static final String PREVIEW = "preview";
    private static final int GOLD = Color.parseColor("#D4AF37");
    private static final int CARD = Color.parseColor("#F21A140F");
    private static final int RIM = Color.parseColor("#66D4AF37");
    private static final int TEXT = Color.parseColor("#F5EFE6");
    private static final int MUTED = Color.parseColor("#A89F93");
    private static final int ON_GOLD = Color.parseColor("#1A140F");

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
                View v = build(c, item, followUp, prayerId);

                int screenW = c.getResources().getDisplayMetrics().widthPixels;
                int width = Math.min(screenW - dp(c, 24), dp(c, 380));
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
                lp.y = statusBar(c) + dp(c, 10);
                wm.addView(v, lp);
                card = v;
                cardPrayer = prayerId;

                // slide down from above the screen
                v.setAlpha(0f);
                v.setTranslationY(-dp(c, 160));
                v.animate().translationY(0).alpha(1f).setDuration(380).setInterpolator(new DecelerateInterpolator(2f)).start();

                timeout = () -> {
                    hide(prayerId);
                    if (!followUp) send(c, PrayerChecks.ACTION_LATER, prayerId); // unanswered: ask again later
                };
                if (PREVIEW.equals(prayerId)) timeout = () -> hide(prayerId);
                main.postDelayed(timeout, SHOW_MS);
            } catch (Exception e) {
                Log.w(TAG, "Could not show the card", e);
                card = null;
                cardPrayer = null;
            }
        });
        return true;
    }

    private static View build(Context c, JSONObject item, boolean followUp, String prayerId) {
        LinearLayout root = new LinearLayout(c);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setPadding(dp(c, 18), dp(c, 14), dp(c, 18), dp(c, 14));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(CARD);
        bg.setCornerRadius(dp(c, 18));
        bg.setStroke(dp(c, 1), RIM);
        root.setBackground(bg);
        root.setElevation(dp(c, 8));

        TextView header = text(c, "بعد الأذان", 12, GOLD, true);
        root.addView(header);

        TextView title = text(c, item.optString(followUp ? "followUpTitle" : "title"), 20, TEXT, true);
        LinearLayout.LayoutParams tlp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        tlp.topMargin = dp(c, 4);
        root.addView(title, tlp);

        String bodyText = item.optString(followUp ? "followUpBody" : "body");
        if (!bodyText.isEmpty()) {
            TextView body = text(c, bodyText, 14, MUTED, false);
            LinearLayout.LayoutParams blp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            blp.topMargin = dp(c, 2);
            root.addView(body, blp);
        }

        // in reading order: «صليت» on the right
        LinearLayout row = new LinearLayout(c);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout.LayoutParams rlp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        rlp.topMargin = dp(c, 12);
        row.addView(button(c, item.optString("prayedLabel", "صليت"), true, v -> {
            hide(prayerId);
            send(c, PrayerChecks.ACTION_PRAYED, prayerId);
        }), weighted(c, 0));
        row.addView(button(c, followUp ? "مش دلوقتي" : item.optString("laterLabel", "لسه"), false, v -> {
            hide(prayerId);
            // the follow-up is the last ask: «مش دلوقتي» just closes it
            if (!followUp) send(c, PrayerChecks.ACTION_LATER, prayerId);
        }), weighted(c, 10));
        root.addView(row, rlp);
        return root;
    }

    private static LinearLayout.LayoutParams weighted(Context c, int startGapDp) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(c, 42), 1f);
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

    private static TextView button(Context c, String label, boolean primary, View.OnClickListener onClick) {
        TextView b = text(c, label, 15, primary ? ON_GOLD : GOLD, true);
        b.setGravity(Gravity.CENTER);
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(c, 21));
        if (primary) bg.setColor(GOLD);
        else { bg.setColor(Color.TRANSPARENT); bg.setStroke(dp(c, 1), RIM); }
        b.setBackground(bg);
        b.setOnClickListener(onClick);
        return b;
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
