/** Signals from the native azan alarms (exact alarms that outlive the app). */
export interface AzanAlarms {
  /** A prayer whose alarm fired while the app was not running, if any. */
  getPending(): Promise<string | null>;
  /** True when re-arming after a reboot failed (e.g. exact-alarm permission revoked). */
  didBootRescheduleFail(): Promise<boolean>;
  clearBootRescheduleFailed(): void;
  /** An alarm fired while the app is running. */
  onTriggered(listener: (prayerName: string) => void): () => void;
  /** Seconds into the adhan the alarm is playing, or null when it is not. */
  playbackPosition(): Promise<number | null>;
  /** Stops the adhan the alarm is playing, if any. */
  stop(): void;
  /** The azan screen closed: stop showing the app over the lock screen. */
  releaseLockScreen(): void;
}
