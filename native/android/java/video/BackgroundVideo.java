package com.mohamewael66sorganization.owwab.video;

import android.graphics.SurfaceTexture;
import android.media.MediaCodec;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.opengl.GLES11Ext;
import android.opengl.GLES20;
import android.os.Handler;
import android.os.HandlerThread;
import android.view.Surface;

import java.io.IOException;
import java.nio.ByteBuffer;

/**
 * A nature clip played behind the ayah, on a loop: decoded with MediaCodec onto a
 * SurfaceTexture, so each frame lands in an OpenGL external texture the renderer draws. Frames
 * are taken in order and matched to the video's clock (the clip's own rate may be 25, 30 or
 * 60 fps; the video is 24). At the clip's end it starts again from the beginning.
 * Created, used and released on the GL thread.
 */
final class BackgroundVideo {
    private static final long TIMEOUT_US = 10_000L;
    private static final long FRAME_WAIT_MS = 2_500L;

    final int texture;
    /** Width / height as the clip is shown (rotation applied). */
    final float aspect;
    final float[] transform = new float[16];

    private final MediaExtractor extractor = new MediaExtractor();
    private final MediaCodec decoder;
    private final SurfaceTexture surfaceTexture;
    private final Surface surface;
    private final HandlerThread callbacks = new HandlerThread("bg-video-frames");
    private final Object lock = new Object();
    private boolean frameAvailable;

    private final long clipUs;
    /** Video time where the current pass over the clip started. */
    private long loopStartUs = 0;
    /** The clip time of the frame now in the texture; -1 before the first. */
    private long shownUs = -1;
    private boolean inputDone, outputDone;
    private final MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();

    BackgroundVideo(String path) throws IOException {
        extractor.setDataSource(path);
        MediaFormat format = null;
        for (int t = 0; t < extractor.getTrackCount(); t++) {
            MediaFormat f = extractor.getTrackFormat(t);
            String mime = f.getString(MediaFormat.KEY_MIME);
            if (mime != null && mime.startsWith("video/")) {
                extractor.selectTrack(t);
                format = f;
                break;
            }
        }
        if (format == null) throw new IOException("no video track in " + path);
        clipUs = format.containsKey(MediaFormat.KEY_DURATION) ? Math.max(1_000_000L, format.getLong(MediaFormat.KEY_DURATION)) : 10_000_000L;
        int w = format.getInteger(MediaFormat.KEY_WIDTH), h = format.getInteger(MediaFormat.KEY_HEIGHT);
        int rotation = format.containsKey("rotation-degrees") ? format.getInteger("rotation-degrees") : 0;
        aspect = (rotation == 90 || rotation == 270) ? (float) h / w : (float) w / h;

        int[] tex = new int[1];
        GLES20.glGenTextures(1, tex, 0);
        texture = tex[0];
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, texture);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);

        // frame-available callbacks need a looper; this thread is the encoder's, which has none
        callbacks.start();
        surfaceTexture = new SurfaceTexture(texture);
        surfaceTexture.setOnFrameAvailableListener(st -> {
            synchronized (lock) { frameAvailable = true; lock.notifyAll(); }
        }, new Handler(callbacks.getLooper()));
        surface = new Surface(surfaceTexture);

        decoder = MediaCodec.createDecoderByType(format.getString(MediaFormat.KEY_MIME));
        decoder.configure(format, surface, null, 0);
        decoder.start();
    }

    /**
     * Brings the texture to the clip's frame for video time `videoUs`: decodes forward, skipping
     * frames that are already past, and starts the clip again when it ends. Returns false when
     * no frame could be had (the texture keeps the last one).
     */
    boolean advanceTo(long videoUs) {
        long target = videoUs - loopStartUs;
        if (target >= clipUs) { restart(videoUs); target = videoUs - loopStartUs; }
        if (shownUs >= 0 && shownUs + 1 >= target) return true; // the frame shown is still the right one
        int guard = 0;
        while (guard++ < 400) {
            feed();
            int out = decoder.dequeueOutputBuffer(info, TIMEOUT_US);
            if (out == MediaCodec.INFO_TRY_AGAIN_LATER || out == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED || out == MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED) {
                continue;
            }
            if (out < 0) continue;
            boolean end = (info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0;
            if (end || info.size == 0) {
                decoder.releaseOutputBuffer(out, false);
                if (end) {
                    // the clip ended before reaching the target: play it again from the start
                    restart(videoUs);
                    target = videoUs - loopStartUs;
                }
                continue;
            }
            long pts = info.presentationTimeUs;
            // a frame still before the one wanted (the clip is faster than the video): skip it,
            // unless nothing has been shown yet
            boolean late = pts + frameGapUs() < target && shownUs >= 0;
            decoder.releaseOutputBuffer(out, !late);
            if (late) continue;
            if (!awaitFrame()) return false;
            surfaceTexture.updateTexImage();
            surfaceTexture.getTransformMatrix(transform);
            shownUs = pts;
            return true;
        }
        return false;
    }

    /** About one source frame (the decoder's rate is not known ahead): 1/60 s. */
    private static long frameGapUs() { return 16_000L; }

    private void feed() {
        if (inputDone) return;
        int in = decoder.dequeueInputBuffer(0);
        if (in < 0) return;
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

    private void restart(long videoUs) {
        extractor.seekTo(0, MediaExtractor.SEEK_TO_CLOSEST_SYNC);
        decoder.flush();
        inputDone = false;
        outputDone = false;
        loopStartUs = videoUs;
        shownUs = -1;
    }

    private boolean awaitFrame() {
        synchronized (lock) {
            long until = System.currentTimeMillis() + FRAME_WAIT_MS;
            while (!frameAvailable) {
                long left = until - System.currentTimeMillis();
                if (left <= 0) return false;
                try { lock.wait(left); } catch (InterruptedException e) { return false; }
            }
            frameAvailable = false;
            return true;
        }
    }

    void release() {
        try { decoder.stop(); } catch (Exception ignored) {}
        decoder.release();
        extractor.release();
        surface.release();
        surfaceTexture.release();
        callbacks.quitSafely();
        GLES20.glDeleteTextures(1, new int[]{ texture }, 0);
    }
}
