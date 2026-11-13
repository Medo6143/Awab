import { useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useDependencies } from '../providers/DependencyProvider';
import { RootState, STORE_VERSION, backupState, restoreBackup } from '../store';
import { BACKUP_PREFIX, backupFileName, makeBackup, readBackup } from '../../domain/services/Backup';

export type BackupResult = { ok: boolean; message: string } | null;

/** Saves, shares and restores the backup file; `result` is the last outcome, in words. */
export const useBackup = () => {
  const { backupFiles } = useDependencies();
  const store = useStore<RootState>();
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BackupResult>(null);

  const run = async (job: () => Promise<BackupResult>) => {
    setBusy(true);
    try { setResult(await job()); } catch { setResult({ ok: false, message: 'حصلت مشكلة، جرّب تاني' }); } finally { setBusy(false); }
  };

  const current = () => {
    const now = new Date();
    return { name: backupFileName(now), json: makeBackup(backupState(store.getState()), STORE_VERSION, now) };
  };

  const save = () => run(async () => {
    const { name, json } = current();
    return (await backupFiles.saveToFolder(name, json))
      ? { ok: true, message: `اتحفظت النسخة: ${name}` }
      : null;
  });

  const share = () => run(async () => {
    const { name, json } = current();
    await backupFiles.share(name, json);
    return null;
  });

  /** Reads the newest backup from a folder the user picks; `confirm` asks before replacing. */
  const restore = (confirm: (fileName: string) => Promise<boolean>) => run(async () => {
    const found = await backupFiles.openLatest(BACKUP_PREFIX);
    if (!found) return { ok: false, message: 'مالقيناش نسخة في الفولدر ده' };
    const backup = readBackup(found.json, STORE_VERSION);
    if (!backup) return { ok: false, message: 'الملف ده مش نسخة من أوّاب، أو من نسخة أحدث من التطبيق' };
    if (!(await confirm(found.name))) return null;
    dispatch(restoreBackup(backup.state, backup.version));
    return { ok: true, message: `رجّعنا النسخة: ${found.name}` };
  });

  return { busy, result, save, share, restore };
};
