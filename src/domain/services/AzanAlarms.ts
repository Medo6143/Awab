/** Signals from the native azan alarms (exact alarms that outlive the app). */
export interface AzanAlarms {
  /** A prayer whose alarm fired while the app was not running, if any. */
  getPending(): Promise<string | null>;
  /** True when re-arming after a reboot failed (e.g. exact-alarm permission revoked). */
  didBootRescheduleFail(): Promise<boolean>;
  clearBootRescheduleFailed(): void;
  /**
   * Whether the adhan can ring at the exact minute. On Android 14+ this is off for a new
   * install until the user allows «المنبهات والتذكيرات»; true where it does not apply.
   */
  canScheduleExact(): Promise<boolean>;
  /** Opens the system page where the user allows exact alarms for this app. */
  openExactAlarmSettings(): void;
  /** An alarm fired while the app is running. */
  onTriggered(listener: (prayerName: string) => void): () => void;
  /** Seconds into the adhan the alarm is playing, or null when it is not. */
  playbackPosition(): Promise<number | null>;
  /** Stops the adhan the alarm is playing, if any. */
  stop(): void;
  /**
   * The adhan (or reminder) screen is now showing: the alarm's heads-up notification must not
   * sit on top of it. The notification stays in the shade, with its stop button.
   */
  screenShown(): void;
  /** The azan screen closed: stop showing the app over the lock screen. */
  releaseLockScreen(): void;
}
