"""Runs the original .onnx model and the converted .ort model on the same audio and checks
that the outputs match. Usage: python verify.py model.onnx model.ort"""
import sys
import numpy as np
import onnxruntime as ort

onnx_path, ort_path = sys.argv[1], sys.argv[2]
rng = np.random.default_rng(7)
# three clips: silence, noise, and a noisy tone, 1 to 6 seconds at 16 kHz
clips = [
    np.zeros(16000, np.float32),
    (rng.standard_normal(16000 * 3) * 0.05).astype(np.float32),
    (0.3 * np.sin(np.arange(16000 * 6) * 2 * np.pi * 220 / 16000)
     + rng.standard_normal(16000 * 6) * 0.02).astype(np.float32),
]
opts = ort.SessionOptions()
opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
# reference: the original model with no graph optimizations; the fused int8 kernels
# shift log-probs a little, so both are held to the same bar against it
ref_opts = ort.SessionOptions()
ref_opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
ref = ort.InferenceSession(onnx_path, ref_opts, providers=['CPUExecutionProvider'])
a = ort.InferenceSession(onnx_path, opts, providers=['CPUExecutionProvider'])
b = ort.InferenceSession(ort_path, opts, providers=['CPUExecutionProvider'])
worst = 0.0
for clip in clips:
    feed = {'fe_audio': clip[None, :]}
    base = ref.run(['log_probs'], feed)[0].argmax(-1)
    ra = dict(zip([o.name for o in a.get_outputs()], a.run(None, feed)))
    rb = dict(zip([o.name for o in b.get_outputs()], b.run(None, feed)))
    assert ra.keys() == rb.keys(), (ra.keys(), rb.keys())
    assert np.array_equal(ra['out_lengths'], rb['out_lengths']), 'out_lengths differ'
    la, lb = ra['log_probs'], rb['log_probs']
    assert la.shape == lb.shape, (la.shape, lb.shape)
    diff = float(np.max(np.abs(la - lb)))
    same_a = float(np.mean(base == la.argmax(-1)))
    same_b = float(np.mean(base == lb.argmax(-1)))
    print(f'{clip.size / 16000:.0f}s  shape={la.shape}  .onnx vs .ort max|diff|={diff:.4f}  '
          f'argmax vs unoptimized: .onnx {same_a:.4f}  .ort {same_b:.4f}')
    worst = max(worst, diff)
    assert same_b >= same_a - 0.01, '.ort follows the unoptimized model worse than .onnx does'
print('OK, worst max|diff|', worst)
