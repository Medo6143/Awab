/** What the floating sebha overlay is told to look like. */
export interface FloatingSebhaConfig {
  scale: number;
  accentColor: string;
  showBorder: boolean;
  showReset: boolean;
  reminderInterval: number; // minutes
}

export interface FloatingSebhaDiagnostics {
  serviceRunning: boolean;
  overlayPermission: boolean;
  bubbleViewExists: boolean;
  lastEvent?: string;
  lastError?: string;
}

type Unsubscribe = () => void;

/**
 * The floating sebha that lives above other apps. UI and hooks depend on this contract;
 * the Android overlay is one implementation, and platforms without it get a no-op one.
 */
export interface FloatingSebha {
  readonly isAvailable: boolean;
  hasPermission(): Promise<boolean>;
  /** Opens the system "display over other apps" page. */
  requestPermission(): Promise<void>;
  initialize(): Promise<void>;
  show(): Promise<void>;
  hide(): Promise<void>;
  isVisible(): Promise<boolean>;
  diagnostics(): Promise<FloatingSebhaDiagnostics | null>;
  configure(config: FloatingSebhaConfig): void;
  setCount(count: number): void;
  setLabel(label: string): void;
  showReminder(label: string): void;
  /** Count the overlay saved while the app was not listening. */
  getSavedCount(): Promise<number | null>;
  onPress(listener: () => void): Unsubscribe;
  onReset(listener: () => void): Unsubscribe;
  /** The user stopped the sebha from the overlay itself. */
  onRemove(listener: () => void): Unsubscribe;
}

export type CountReconciliation =
  | { kind: 'add'; amount: number }   // the overlay counted while the app was away
  | { kind: 'reset' }                 // the overlay was reset to zero
  | { kind: 'push' }                  // the app is ahead: send its count to the overlay
  | { kind: 'none' };

/** Decide how to merge the overlay's saved count with the app's count. */
export const reconcileCount = (nativeCount: number | null, appCount: number): CountReconciliation => {
  if (nativeCount === null || !Number.isFinite(nativeCount)) return { kind: 'push' };
  if (nativeCount > appCount) return { kind: 'add', amount: nativeCount - appCount };
  if (nativeCount === 0 && appCount > 0) return { kind: 'reset' };
  if (appCount > nativeCount) return { kind: 'push' };
  return { kind: 'none' };
};
