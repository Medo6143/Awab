/**
 * A backup of everything the user built in the app (the worship calendar, khatmas, tasbeeh,
 * reminders, settings...) as one JSON file they keep themselves. No account, no server: the
 * file goes to a folder on the phone or wherever they share it (Drive, WhatsApp to self).
 */
export const BACKUP_PREFIX = 'owwab-backup';

export type BackupFile = {
  app: 'owwab';
  /** The store version the state was saved under (migrations bring it up to date). */
  version: number;
  createdAt: string;
  state: Record<string, unknown>;
};

/** Where backup files are written and read: the platform's folders and share sheet. */
export interface BackupFiles {
  /** Asks the user for a folder and writes the file there; false when they cancelled. */
  saveToFolder(fileName: string, json: string): Promise<boolean>;
  /** Opens the share sheet with the file. */
  share(fileName: string, json: string): Promise<void>;
  /** Asks for the folder that holds the backups and returns the newest one, or null if none. */
  openLatest(prefix: string): Promise<{ name: string; json: string } | null>;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "owwab-backup-2026-11-13-1842.json": sorts by time, so the newest is the last name. */
export const backupFileName = (d: Date) =>
  `${BACKUP_PREFIX}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`;

export const makeBackup = (state: Record<string, unknown>, version: number, now: Date): string =>
  JSON.stringify({ app: 'owwab', version, createdAt: now.toISOString(), state } satisfies BackupFile);

/** The backup in `json`, or null when it is not one of ours (or from a newer app). */
export const readBackup = (json: string, currentVersion: number): BackupFile | null => {
  try {
    const b = JSON.parse(json) as Partial<BackupFile>;
    if (b?.app !== 'owwab' || typeof b.version !== 'number' || b.version > currentVersion) return null;
    if (!b.state || typeof b.state !== 'object' || Array.isArray(b.state)) return null;
    return b as BackupFile;
  } catch {
    return null;
  }
};
