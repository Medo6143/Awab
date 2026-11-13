import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { BackupFiles } from '../../domain/services/Backup';

const SAF = FileSystem.StorageAccessFramework;

/** The Downloads folder as the folder picker's starting point. */
const downloads = () => {
  try { return SAF.getUriForDirectoryInRoot('Download'); } catch { return undefined; }
};

/** The file name at the end of a SAF document URI ("…%2Fowwab-backup-….json"). */
const nameOf = (uri: string) => decodeURIComponent(uri).split('/').pop() ?? '';

/** BackupFiles on Android's folder picker (Storage Access Framework) and the share sheet. */
export class ExpoBackupFiles implements BackupFiles {
  async saveToFolder(fileName: string, json: string) {
    const perm = await SAF.requestDirectoryPermissionsAsync(downloads());
    if (!perm.granted) return false;
    const uri = await SAF.createFileAsync(perm.directoryUri, fileName.replace(/\.json$/, ''), 'application/json');
    await SAF.writeAsStringAsync(uri, json);
    return true;
  }

  async share(fileName: string, json: string) {
    const path = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(path, json);
    await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: fileName });
  }

  async openLatest(prefix: string) {
    const perm = await SAF.requestDirectoryPermissionsAsync(downloads());
    if (!perm.granted) return null;
    const files = (await SAF.readDirectoryAsync(perm.directoryUri))
      .map((uri) => ({ uri, name: nameOf(uri) }))
      .filter((f) => f.name.startsWith(prefix) && f.name.endsWith('.json'))
      .sort((a, b) => a.name.localeCompare(b.name));
    const newest = files[files.length - 1];
    if (!newest) return null;
    return { name: newest.name, json: await SAF.readAsStringAsync(newest.uri) };
  }
}
