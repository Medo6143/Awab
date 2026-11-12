/** What a notification carried: enough to tell which prayer (or reminder) it was about. */
export type NotificationContent = { title?: string | null; data?: Record<string, unknown> | null };

/** Notifications reaching the app: delivered while it runs, or tapped to open it. */
export interface IncomingNotifications {
  /**
   * The notification the user tapped to open the app, with when it was shown (ms), or null.
   * It is forgotten once read: otherwise it would come back on every later launch.
   */
  takeLastTapped(): Promise<{ content: NotificationContent; shownAt: number } | null>;
  /** A notification delivered while the app is open. */
  onReceived(listener: (content: NotificationContent) => void): () => void;
  /** A notification tapped while the app is open. */
  onTapped(listener: (content: NotificationContent) => void): () => void;
}
