import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import { FloatingSebha, FloatingSebhaConfig, FloatingSebhaDiagnostics } from '../../domain/services/FloatingSebha';

const DEFAULT_LABEL = 'سبحان الله';

/**
 * FloatingSebha backed by the patched react-native-floating-bubble Android module.
 * Every native call is guarded: a missing method or a native exception is logged and
 * turned into a safe result instead of crashing the JS side.
 */
export class NativeFloatingSebha implements FloatingSebha {
  private get mod(): any {
    return NativeModules.RNFloatingBubble;
  }

  get isAvailable() {
    return Platform.OS === 'android' && !!this.mod;
  }

  private call<T>(name: string, fallback: T, ...args: unknown[]): T | Promise<T> {
    const fn = this.mod?.[name];
    if (typeof fn !== 'function') return fallback;
    try {
      return fn(...args);
    } catch (e) {
      console.warn(`FloatingSebha.${name} failed`, e);
      return fallback;
    }
  }

  async hasPermission() { return !!(await this.call('checkPermission', false)); }
  async requestPermission() {
    if (!this.mod?.requestPermission) throw new Error('floating sebha module not available');
    await this.mod.requestPermission();
  }
  async initialize() { await this.call('initialize', undefined); }
  async show() {
    if (!this.mod?.showFloatingBubble) throw new Error('floating sebha module not available');
    await this.mod.showFloatingBubble(-1, -1); // -1: restore the last saved position
  }
  async hide() { await this.call('hideFloatingBubble', undefined); }

  async diagnostics(): Promise<FloatingSebhaDiagnostics | null> {
    try { return (await this.call('isBubbleVisible', null)) ?? null; } catch { return null; }
  }
  async isVisible() { return !!(await this.diagnostics())?.bubbleViewExists; }

  configure(config: FloatingSebhaConfig) { this.call('config', undefined, config); }
  setCount(count: number) { this.call('updateTasbeehCount', undefined, count); }
  setLabel(label: string) { this.call('updateTasbeehLabel', undefined, label || DEFAULT_LABEL); }
  showReminder(label: string) { this.call('showDhikrReminder', undefined, label || DEFAULT_LABEL); }

  async getSavedCount(): Promise<number | null> {
    try {
      const n = await this.call<number | null>('getSavedTasbeehCount', null);
      return typeof n === 'number' ? n : null;
    } catch { return null; }
  }

  private listen(event: string, listener: () => void) {
    const sub = DeviceEventEmitter.addListener(event, listener);
    return () => sub.remove();
  }
  onPress(l: () => void) { return this.listen('floating-bubble-press', l); }
  onReset(l: () => void) { return this.listen('floating-bubble-reset', l); }
  onRemove(l: () => void) { return this.listen('floating-bubble-remove', l); }
}
