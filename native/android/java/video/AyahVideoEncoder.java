package com.mohamewael66sorganization.owwab.video;

import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaCodecList;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaMuxer;
import android.util.Log;
import android.view.Surface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds the ayah MP4 on the phone, without ffmpeg:
 *  1. the MP3s (one per ayah) are decoded one after another and re-encoded into one AAC track,
 *     kept in memory (about 1 MB a minute); each ayah's start and length are noted;
 *  2. the frames are drawn by FrameRenderer onto the H.264 encoder's input Surface: the nature
 *     clip (BackgroundVideo, looped) fades in under a darkening shade, while the overlay (logo,
 *     surah, reciter) and the text stay still; a long ayah's
 *     text is in pages, and each page cross-fades to the next when its first word is recited
 *     (each word's time is its share of its ayah's recitation, by letters);
 *  3. MediaMuxer writes both tracks, the audio interleaved as the video goes.
 * Runs on the caller's thread (not the UI thread).
 */
final class AyahVideoEncoder {
    static final String TAG = "AyahVideo";

    interface Progress {
        /** fraction of the whole job (0..1); durationMs once known, else -1. */
        void on(double fraction, long durationMs);
    }

    static final class EncodeException extends Exception {
        final String code;
        EncodeException(String code, String message, Throwable cause) {
            super(message, cause);
            this.code = code;
        }
    }

    private static final int FPS = 24;
    private static final float BG_FADE_S = 0.5f, OVERLAY_FADE_S = 0.8f, PAGE_FADE_S = 0.5f;
    /** The last words stay on screen this long after the recitation ends. */
    private static final long HOLD_US = 900_000L;
    private static final double AUDIO_SHARE = 0.25; // of the progress bar
    private static final long TIMEOUT_US = 10_000L;

    private static final class Sample {
        final byte[] data;
        final long pts;
        Sample(byte[] data, long pts) { this.data = data; this.pts = pts; }
    }

    /** A word box on its page image, and when it appears. */
    private static final class Word {
        float x, y, w, h, weight;
        int ayah;
        float revealS;
    }

    private static final class Page {
        String image;
        final List<Word> words = new ArrayList<>();
        float startS;
        FrameRenderer.Texture texture;
    }

    private final List<Sample> audio = new ArrayList<>();
    private final List<Long> ayahStartUs = new ArrayList<>();
    private final List<Long> ayahLengthUs = new ArrayList<>();
    private MediaFormat audioFormat;
    private long audioDurationUs;
    private int audioWritten;

    private MediaMuxer muxer;
    private int videoTrack = -1, audioTrack = -1;
    private boolean muxing;

    /** Encodes the video described by the JSON `spec` (see AyahVideoModule); returns its length in ms. */
    long encode(String spec, Progress progress) throws EncodeException {
        String video, shade, overlay, out;
        List<String> mp3s = new ArrayList<>();
        List<Page> pages = new ArrayList<>();
        try {
            JSONObject o = new JSONObject(spec);
            video = o.getString("video");
            shade = o.getString("shade");
            overlay = o.getString("overlay");
            out = o.getString("out");
            JSONArray a = o.getJSONArray("audios");
            for (int i = 0; i < a.length(); i++) mp3s.add(a.getString(i));
            JSONArray ps = o.getJSONArray("pages");
            for (int i = 0; i < ps.length(); i++) {
                JSONObject pj = ps.getJSONObject(i);
                Page p = new Page();
                p.image = pj.getString("image");
                JSONArray ws = pj.getJSONArray("words");
                for (int k = 0; k < ws.length(); k++) {
                    JSONObject wj = ws.getJSONObject(k);
                    Word w = new Word();
                    w.x = (float) wj.getDouble("x"); w.y = (float) wj.getDouble("y");
                    w.w = (float) wj.getDouble("w"); w.h = (float) wj.getDouble("h");
                    w.ayah = wj.getInt("ayah"); w.weight = (float) wj.getDouble("weight");
                    p.words.add(w);
                }
                pages.add(p);
            }
        } catch (JSONException e) {
            throw new EncodeException("BAD_SPEC", "spec: " + e.getMessage(), e);
        }
        if (mp3s.isEmpty() || pages.isEmpty()) throw new EncodeException("BAD_SPEC", "no audio or no text", null);

        try {
            encodeAudio(mp3s, progress);
        } catch (EncodeException e) {
            throw e;
        } catch (Exception e) {
            throw new EncodeException("DECODE_FAILED", "audio: " + e, e);
        }
        if (audioFormat == null || audio.isEmpty() || audioDurationUs <= 0) {
            throw new EncodeException("DECODE_FAILED", "no audio decoded", null);
        }
        long durationMs = (audioDurationUs + HOLD_US) / 1000;
        progress.on(AUDIO_SHARE, durationMs);
        timeWords(pages);

        try {
            encodeVideo(video, shade, overlay, pages, out, progress, durationMs);
        } catch (EncodeException e) {
            new File(out).delete();
            throw e;
        } catch (Exception e) {
            new File(out).delete();
            throw new EncodeException("ENCODE_FAILED", "video: " + e, e);
        }
        return durationMs;
    }

    // ── audio ────────────────────────────────────────────────────────────────

    private void encodeAudio(List<String> mp3s, Progress progress) throws Exception {
        MediaFormat first = audioTrackFormat(mp3s.get(0), null);
        int rate = first.getInteger(MediaFormat.KEY_SAMPLE_RATE);
        int channels = first.getInteger(MediaFormat.KEY_CHANNEL_COUNT);

        MediaFormat aac = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC, rate, channels);
        aac.setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC);
        aac.setInteger(MediaFormat.KEY_BIT_RATE, 128_000);
        aac.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, 64 * 1024);
        MediaCodec encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC);
        try {
            encoder.configure(aac, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
            encoder.start();
            long frames = 0; // PCM frames (one sample per channel) fed so far: the next pts
            MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();

            for (int i = 0; i < mp3s.size(); i++) {
                long ayahStartFrames = frames;
                MediaExtractor extractor = new MediaExtractor();
                MediaCodec decoder = null;
                try {
                    MediaFormat format = audioTrackFormat(mp3s.get(i), extractor);
                    if (format.getInteger(MediaFormat.KEY_SAMPLE_RATE) != rate
                            || format.getInteger(MediaFormat.KEY_CHANNEL_COUNT) != channels) {
                        throw new EncodeException("DECODE_FAILED", "ayah " + i + " has another sample rate or channel count", null);
                    }
                    decoder = MediaCodec.createDecoderByType(format.getString(MediaFormat.KEY_MIME));
                    decoder.configure(format, null, null, 0);
                    decoder.start();
                    boolean inputDone = false, outputDone = false;
                    while (!outputDone) {
                        if (!inputDone) {
                            int in = decoder.dequeueInputBuffer(TIMEOUT_US);
                            if (in >= 0) {
                                ByteBuffer buf = decoder.getInputBuffer(in);
                                int n = buf == null ? -1 : extractor.readSampleData(buf, 0);
                                if (n < 0) {
                                    decoder.queueInputBuffer(in, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
                                    inputDone = true;
                                } else {
                                    decoder.queueInputBuffer(in, 0, n, extractor.getSampleTime(), 0);
                                    extractor.advance();
                                }
                            }
                        }
                        int outIndex = decoder.dequeueOutputBuffer(info, TIMEOUT_US);
                        if (outIndex >= 0) {
                            ByteBuffer pcm = decoder.getOutputBuffer(outIndex);
                            if (pcm != null && info.size > 0) {
                                pcm.position(info.offset);
                                pcm.limit(info.offset + info.size);
                                frames = feedPcm(encoder, pcm, frames, rate, channels);
                            }
                            decoder.releaseOutputBuffer(outIndex, false);
                            if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) outputDone = true;
                        } else if (outIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                            MediaFormat pcmFormat = decoder.getOutputFormat();
                            if (pcmFormat.containsKey(MediaFormat.KEY_PCM_ENCODING)
                                    && pcmFormat.getInteger(MediaFormat.KEY_PCM_ENCODING) != android.media.AudioFormat.ENCODING_PCM_16BIT) {
                                throw new EncodeException("DECODE_FAILED", "decoder gives non-16-bit PCM", null);
                            }
                        }
                        drainAudio(encoder, false);
                    }
                } finally {
                    if (decoder != null) { try { decoder.stop(); } catch (Exception ignored) {} decoder.release(); }
                    extractor.release();
                }
                ayahStartUs.add(ayahStartFrames * 1_000_000L / rate);
                ayahLengthUs.add((frames - ayahStartFrames) * 1_000_000L / rate);
                progress.on(AUDIO_SHARE * (i + 1) / mp3s.size(), -1);
            }

            int in;
            while ((in = encoder.dequeueInputBuffer(TIMEOUT_US)) < 0) drainAudio(encoder, false);
            encoder.queueInputBuffer(in, 0, 0, frames * 1_000_000L / rate, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
            drainAudio(encoder, true);
            audioDurationUs = frames * 1_000_000L / rate;
        } finally {
            try { encoder.stop(); } catch (Exception ignored) {}
            encoder.release();
        }
    }

    /** The first audio track's format; selects it on `extractor` when one is given. */
    private static MediaFormat audioTrackFormat(String path, MediaExtractor extractor) throws Exception {
        MediaExtractor ex = extractor != null ? extractor : new MediaExtractor();
        try {
            ex.setDataSource(path);
            for (int t = 0; t < ex.getTrackCount(); t++) {
                MediaFormat f = ex.getTrackFormat(t);
                String mime = f.getString(MediaFormat.KEY_MIME);
                if (mime != null && mime.startsWith("audio/")) {
                    if (extractor != null) ex.selectTrack(t);
                    return f;
                }
            }
            throw new EncodeException("DECODE_FAILED", "no audio track in " + path, null);
        } finally {
            if (extractor == null) ex.release();
        }
    }

    /** Copies decoded PCM into the AAC encoder; returns the new frame count. */
    private long feedPcm(MediaCodec encoder, ByteBuffer pcm, long frames, int rate, int channels) {
        int frameBytes = 2 * channels;
        while (pcm.remaining() >= frameBytes) {
            int in = encoder.dequeueInputBuffer(TIMEOUT_US);
            if (in < 0) { drainAudio(encoder, false); continue; }
            ByteBuffer dst = encoder.getInputBuffer(in);
            dst.clear();
            int n = Math.min(dst.remaining(), pcm.remaining());
            n -= n % frameBytes;
            ByteBuffer chunk = pcm.duplicate();
            chunk.limit(chunk.position() + n);
            dst.put(chunk);
            pcm.position(pcm.position() + n);
            encoder.queueInputBuffer(in, 0, n, frames * 1_000_000L / rate, 0);
            frames += n / frameBytes;
            drainAudio(encoder, false);
        }
        return frames;
    }

    private void drainAudio(MediaCodec encoder, boolean untilEnd) {
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        while (true) {
            int out = encoder.dequeueOutputBuffer(info, untilEnd ? TIMEOUT_US : 0);
            if (out == MediaCodec.INFO_TRY_AGAIN_LATER) {
                if (!untilEnd) return;
            } else if (out == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                audioFormat = encoder.getOutputFormat();
            } else if (out >= 0) {
                ByteBuffer buf = encoder.getOutputBuffer(out);
                boolean config = (info.flags & MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0;
                if (buf != null && info.size > 0 && !config) {
                    byte[] data = new byte[info.size];
                    buf.position(info.offset);
                    buf.get(data, 0, info.size);
                    audio.add(new Sample(data, info.presentationTimeUs));
                }
                encoder.releaseOutputBuffer(out, false);
                if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) return;
            }
        }
    }

    // ── video ────────────────────────────────────────────────────────────────

    /**
     * When each word appears: its ayah's recitation is shared between the ayah's words by their
     * weight (letters), after a short lead-in; a page starts with its first word (the first page
     * at 0).
     */
    private void timeWords(List<Page> pages) {
        int ayahs = ayahStartUs.size();
        float[] total = new float[ayahs];
        for (Page p : pages) for (Word w : p.words) if (w.ayah >= 0 && w.ayah < ayahs) total[w.ayah] += w.weight;
        float[] done = new float[ayahs];
        for (Page p : pages) {
            for (Word w : p.words) {
                int a = Math.max(0, Math.min(ayahs - 1, w.ayah));
                float start = ayahStartUs.get(a) / 1e6f, length = ayahLengthUs.get(a) / 1e6f;
                float lead = Math.min(0.25f, length * 0.1f), tail = Math.min(0.4f, length * 0.1f);
                float span = Math.max(0f, length - lead - tail);
                w.revealS = start + lead + (total[a] > 0 ? done[a] / total[a] : 0f) * span;
                done[a] += w.weight;
            }
        }
        for (int i = 0; i < pages.size(); i++) {
            Page p = pages.get(i);
            float first = Float.MAX_VALUE;
            for (Word w : p.words) first = Math.min(first, w.revealS);
            p.startS = i == 0 ? 0f : (first == Float.MAX_VALUE ? 0f : first);
        }
    }

    private static float clamp01(float v) { return v < 0f ? 0f : (v > 1f ? 1f : v); }

    private void encodeVideo(String video, String shade, String overlay, List<Page> pages, String out, Progress progress, long durationMs) throws Exception {
        MediaCodec encoder = null;
        Surface input = null;
        FrameRenderer renderer = null;
        FrameRenderer.Texture shadeTex = null, overlayTex = null;
        BackgroundVideo clip = null;
        int[][] sizes = { { 1080, 1920, 6_000_000 }, { 720, 1280, 3_500_000 } };
        int width = 0, height = 0;
        for (int[] s : sizes) {
            MediaFormat f = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, s[0], s[1]);
            f.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
            f.setInteger(MediaFormat.KEY_BIT_RATE, s[2]);
            f.setInteger(MediaFormat.KEY_FRAME_RATE, FPS);
            f.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 2);
            String name = new MediaCodecList(MediaCodecList.REGULAR_CODECS).findEncoderForFormat(f);
            if (name == null) continue;
            MediaCodec c = null;
            try {
                c = MediaCodec.createByCodecName(name);
                c.configure(f, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
                encoder = c;
                width = s[0];
                height = s[1];
                break;
            } catch (Exception e) {
                Log.w(TAG, "encoder " + name + " refused " + s[0] + "x" + s[1], e);
                if (c != null) c.release();
            }
        }
        if (encoder == null) throw new EncodeException("ENCODER_UNAVAILABLE", "no H.264 encoder for 1080x1920 or 720x1280", null);
        if (width != 1080) Log.i(TAG, "using " + width + "x" + height);

        try {
            input = encoder.createInputSurface();
            encoder.start();
            renderer = new FrameRenderer(input, width, height);
            clip = new BackgroundVideo(video);
            shadeTex = renderer.load(shade);
            overlayTex = renderer.load(overlay);
            for (Page p : pages) p.texture = renderer.load(p.image);
            muxer = new MediaMuxer(out, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);

            long durationUs = durationMs * 1000L;
            int frames = (int) Math.max(1, Math.ceil(durationUs * FPS / 1_000_000.0));
            MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
            double lastReported = 0;
            final float W = FrameRenderer.FRAME_W, H = FrameRenderer.FRAME_H;
            for (int i = 0; i < frames; i++) {
                drainVideo(encoder, info, false);
                long ptsUs = i * 1_000_000L / FPS;
                float t = ptsUs / 1e6f;

                renderer.begin();
                // the clip, looped, fading in from black; the shade darkens it so the text reads
                clip.advanceTo(ptsUs);
                renderer.drawVideo(clip, clip.aspect, clamp01(t / BG_FADE_S));
                renderer.drawFull(shadeTex, 1f);
                renderer.drawFull(overlayTex, clamp01(t / OVERLAY_FADE_S));

                // the text stays still: the first page fades in with the overlay; on a long ayah
                // each next page cross-fades in when its first word is recited
                for (int p = 0; p < pages.size(); p++) {
                    Page page = pages.get(p);
                    if (t < page.startS) continue;
                    float alpha = p == 0 ? clamp01(t / OVERLAY_FADE_S) : clamp01((t - page.startS) / PAGE_FADE_S);
                    if (p + 1 < pages.size() && t >= pages.get(p + 1).startS) {
                        alpha *= 1f - clamp01((t - pages.get(p + 1).startS) / PAGE_FADE_S);
                    }
                    if (alpha > 0f) renderer.drawFull(page.texture, alpha);
                }
                renderer.present(ptsUs * 1000L);
                double fraction = AUDIO_SHARE + (1 - AUDIO_SHARE) * (i + 1) / frames;
                if (fraction - lastReported >= 0.01) { progress.on(Math.min(0.99, fraction), durationMs); lastReported = fraction; }
            }
            encoder.signalEndOfInputStream();
            drainVideo(encoder, info, true);
            writeAudioUpTo(Long.MAX_VALUE);
            muxer.stop();
            progress.on(1, durationMs);
        } finally {
            if (renderer != null) {
                List<FrameRenderer.Texture> all = new ArrayList<>();
                all.add(shadeTex);
                all.add(overlayTex);
                for (Page p : pages) all.add(p.texture);
                if (clip != null) clip.release();
                renderer.release(all.toArray(new FrameRenderer.Texture[0]));
            }
            try { encoder.stop(); } catch (Exception ignored) {}
            encoder.release();
            if (input != null) input.release();
            if (muxer != null) { try { muxer.release(); } catch (Exception ignored) {} muxer = null; }
        }
    }

    private void drainVideo(MediaCodec encoder, MediaCodec.BufferInfo info, boolean untilEnd) {
        while (true) {
            int out = encoder.dequeueOutputBuffer(info, untilEnd ? TIMEOUT_US : 0);
            if (out == MediaCodec.INFO_TRY_AGAIN_LATER) {
                if (!untilEnd) return;
            } else if (out == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                if (muxing) throw new IllegalStateException("video format changed twice");
                videoTrack = muxer.addTrack(encoder.getOutputFormat());
                audioTrack = muxer.addTrack(audioFormat);
                muxer.start();
                muxing = true;
            } else if (out >= 0) {
                ByteBuffer buf = encoder.getOutputBuffer(out);
                boolean config = (info.flags & MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0;
                if (buf != null && info.size > 0 && !config) {
                    if (!muxing) throw new IllegalStateException("video data before its format");
                    buf.position(info.offset);
                    buf.limit(info.offset + info.size);
                    muxer.writeSampleData(videoTrack, buf, info);
                    writeAudioUpTo(info.presentationTimeUs);
                }
                encoder.releaseOutputBuffer(out, false);
                if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) return;
            }
        }
    }

    /** Writes the AAC frames up to `ptsUs`, so the file interleaves audio with video. */
    private void writeAudioUpTo(long ptsUs) {
        if (!muxing) return;
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        while (audioWritten < audio.size() && audio.get(audioWritten).pts <= ptsUs) {
            Sample s = audio.get(audioWritten++);
            info.set(0, s.data.length, s.pts, MediaCodec.BUFFER_FLAG_KEY_FRAME);
            muxer.writeSampleData(audioTrack, ByteBuffer.wrap(s.data), info);
        }
    }
}
