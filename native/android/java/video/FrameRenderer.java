package com.mohamewael66sorganization.owwab.video;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.opengl.EGL14;
import android.opengl.EGLConfig;
import android.opengl.EGLContext;
import android.opengl.EGLDisplay;
import android.opengl.EGLExt;
import android.opengl.EGLSurface;
import android.opengl.GLES20;
import android.opengl.GLUtils;
import android.view.Surface;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;

/**
 * Draws video frames with OpenGL ES 2 onto the encoder's input Surface. Every draw is one
 * textured quad: a rectangle of a source image (in its pixels) to a rectangle of the frame
 * (in frame pixels, 1080×1920 space), at an opacity. Images are uploaded once as textures.
 * Must be created, used and released on one thread.
 */
final class FrameRenderer {
    /** The coordinate space callers use, whatever the encoder's real size. */
    static final float FRAME_W = 1080f, FRAME_H = 1920f;

    private static final int EGL_RECORDABLE_ANDROID = 0x3142;

    private static final String VERTEX =
            "attribute vec2 aPos;\n" +
            "attribute vec2 aTex;\n" +
            "varying vec2 vTex;\n" +
            "void main() {\n" +
            "  gl_Position = vec4(aPos, 0.0, 1.0);\n" +
            "  vTex = aTex;\n" +
            "}\n";

    // the bitmaps are uploaded premultiplied, so the whole colour is scaled by the alpha
    private static final String FRAGMENT =
            "precision mediump float;\n" +
            "uniform sampler2D uTex;\n" +
            "uniform float uAlpha;\n" +
            "varying vec2 vTex;\n" +
            "void main() {\n" +
            "  gl_FragColor = texture2D(uTex, vTex) * uAlpha;\n" +
            "}\n";

    static final class Texture {
        final int id, width, height;
        Texture(int id, int width, int height) { this.id = id; this.width = width; this.height = height; }
    }

    private EGLDisplay display = EGL14.EGL_NO_DISPLAY;
    private EGLContext context = EGL14.EGL_NO_CONTEXT;
    private EGLSurface surface = EGL14.EGL_NO_SURFACE;
    private int program;
    private int aPos, aTex, uAlpha, uTex;
    private final FloatBuffer quad = ByteBuffer.allocateDirect(16 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer();
    private final float[] verts = new float[16];
    private final int width, height;

    FrameRenderer(Surface target, int width, int height) {
        this.width = width;
        this.height = height;
        setUpEgl(target);
        setUpProgram();
    }

    private void setUpEgl(Surface target) {
        display = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY);
        if (display == EGL14.EGL_NO_DISPLAY) throw new IllegalStateException("no EGL display");
        int[] version = new int[2];
        if (!EGL14.eglInitialize(display, version, 0, version, 1)) throw new IllegalStateException("eglInitialize failed");

        int[] attribs = {
                EGL14.EGL_RED_SIZE, 8,
                EGL14.EGL_GREEN_SIZE, 8,
                EGL14.EGL_BLUE_SIZE, 8,
                EGL14.EGL_ALPHA_SIZE, 8,
                EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
                EGL_RECORDABLE_ANDROID, 1,
                EGL14.EGL_NONE,
        };
        EGLConfig[] configs = new EGLConfig[1];
        int[] count = new int[1];
        if (!EGL14.eglChooseConfig(display, attribs, 0, configs, 0, 1, count, 0) || count[0] == 0) {
            throw new IllegalStateException("no recordable EGL config");
        }
        int[] ctxAttribs = { EGL14.EGL_CONTEXT_CLIENT_VERSION, 2, EGL14.EGL_NONE };
        context = EGL14.eglCreateContext(display, configs[0], EGL14.EGL_NO_CONTEXT, ctxAttribs, 0);
        checkEgl("eglCreateContext");
        int[] surfAttribs = { EGL14.EGL_NONE };
        surface = EGL14.eglCreateWindowSurface(display, configs[0], target, surfAttribs, 0);
        checkEgl("eglCreateWindowSurface");
        if (!EGL14.eglMakeCurrent(display, surface, surface, context)) throw new IllegalStateException("eglMakeCurrent failed");
    }

    private void setUpProgram() {
        int vs = compile(GLES20.GL_VERTEX_SHADER, VERTEX);
        int fs = compile(GLES20.GL_FRAGMENT_SHADER, FRAGMENT);
        program = GLES20.glCreateProgram();
        GLES20.glAttachShader(program, vs);
        GLES20.glAttachShader(program, fs);
        GLES20.glLinkProgram(program);
        int[] linked = new int[1];
        GLES20.glGetProgramiv(program, GLES20.GL_LINK_STATUS, linked, 0);
        if (linked[0] == 0) throw new IllegalStateException("link failed: " + GLES20.glGetProgramInfoLog(program));
        aPos = GLES20.glGetAttribLocation(program, "aPos");
        aTex = GLES20.glGetAttribLocation(program, "aTex");
        uAlpha = GLES20.glGetUniformLocation(program, "uAlpha");
        uTex = GLES20.glGetUniformLocation(program, "uTex");
    }

    private static int compile(int type, String src) {
        int shader = GLES20.glCreateShader(type);
        GLES20.glShaderSource(shader, src);
        GLES20.glCompileShader(shader);
        int[] ok = new int[1];
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, ok, 0);
        if (ok[0] == 0) throw new IllegalStateException("shader failed: " + GLES20.glGetShaderInfoLog(shader));
        return shader;
    }

    Texture load(String path) throws IOException {
        Bitmap bitmap = BitmapFactory.decodeFile(path);
        if (bitmap == null) throw new IOException("cannot read " + path);
        int[] tex = new int[1];
        GLES20.glGenTextures(1, tex, 0);
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, tex[0]);
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
        GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bitmap, 0);
        Texture t = new Texture(tex[0], bitmap.getWidth(), bitmap.getHeight());
        bitmap.recycle();
        return t;
    }

    /** Starts a frame: black, then everything is drawn with alpha blending. */
    void begin() {
        GLES20.glViewport(0, 0, width, height);
        GLES20.glClearColor(0f, 0f, 0f, 1f);
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
        GLES20.glUseProgram(program);
        GLES20.glEnable(GLES20.GL_BLEND);
        GLES20.glBlendFunc(GLES20.GL_ONE, GLES20.GL_ONE_MINUS_SRC_ALPHA);
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
        GLES20.glUniform1i(uTex, 0);
    }

    /**
     * Draws the rectangle (sx, sy, sw, sh) of `tex`, in the image's pixels scaled to the
     * 1080×1920 frame space, onto (dx, dy, dw, dh) of the frame, at `alpha`.
     */
    void draw(Texture tex, float sx, float sy, float sw, float sh, float dx, float dy, float dw, float dh, float alpha) {
        if (alpha <= 0f) return;
        // source rectangle → texture coordinates (rows start at the top of the bitmap)
        float s0 = sx / FRAME_W, s1 = (sx + sw) / FRAME_W;
        float t0 = sy / FRAME_H, t1 = (sy + sh) / FRAME_H;
        // destination rectangle → clip space (y up)
        float x0 = dx / FRAME_W * 2f - 1f, x1 = (dx + dw) / FRAME_W * 2f - 1f;
        float y0 = 1f - (dy + dh) / FRAME_H * 2f, y1 = 1f - dy / FRAME_H * 2f;
        float[] v = verts;
        v[0] = x0; v[1] = y0; v[2] = s0; v[3] = t1;
        v[4] = x1; v[5] = y0; v[6] = s1; v[7] = t1;
        v[8] = x0; v[9] = y1; v[10] = s0; v[11] = t0;
        v[12] = x1; v[13] = y1; v[14] = s1; v[15] = t0;
        quad.clear();
        quad.put(v).position(0);
        GLES20.glVertexAttribPointer(aPos, 2, GLES20.GL_FLOAT, false, 16, quad);
        GLES20.glEnableVertexAttribArray(aPos);
        quad.position(2);
        GLES20.glVertexAttribPointer(aTex, 2, GLES20.GL_FLOAT, false, 16, quad);
        GLES20.glEnableVertexAttribArray(aTex);
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, tex.id);
        GLES20.glUniform1f(uAlpha, Math.min(1f, alpha));
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
    }

    /** Draws the whole image over the whole frame. */
    void drawFull(Texture tex, float alpha) {
        draw(tex, 0, 0, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H, alpha);
    }

    /** Hands the drawn frame to the encoder, stamped with its time in the video. */
    void present(long presentationNs) {
        EGLExt.eglPresentationTimeANDROID(display, surface, presentationNs);
        EGL14.eglSwapBuffers(display, surface);
    }

    void release(Texture... textures) {
        if (display != EGL14.EGL_NO_DISPLAY) {
            for (Texture t : textures) if (t != null) GLES20.glDeleteTextures(1, new int[]{ t.id }, 0);
            if (program != 0) GLES20.glDeleteProgram(program);
            EGL14.eglMakeCurrent(display, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT);
            if (surface != EGL14.EGL_NO_SURFACE) EGL14.eglDestroySurface(display, surface);
            if (context != EGL14.EGL_NO_CONTEXT) EGL14.eglDestroyContext(display, context);
            EGL14.eglReleaseThread();
            EGL14.eglTerminate(display);
        }
        display = EGL14.EGL_NO_DISPLAY;
        context = EGL14.EGL_NO_CONTEXT;
        surface = EGL14.EGL_NO_SURFACE;
    }

    private static void checkEgl(String what) {
        int err = EGL14.eglGetError();
        if (err != EGL14.EGL_SUCCESS) throw new IllegalStateException(what + ": EGL error 0x" + Integer.toHexString(err));
    }
}
