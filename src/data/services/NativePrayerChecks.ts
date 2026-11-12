import { DeviceEventEmitter } from 'react-native';
import { PRAYER_IDS, PrayerId } from '../../domain/entities/notifications';
import { PRAYER_CHECK_FOLLOW_UP_MIN } from '../../domain/entities/prayerCheck';
import { PrayerCheckAnswer, PrayerCheckItem, PrayerChecks } from '../../domain/services/PrayerChecks';
import { prayerCheckNative } from './nativeModules';

const isPrayerId = (id: string): id is PrayerId => (PRAYER_IDS as string[]).includes(id);

/** PrayerChecks on the PrayerCheck native module (Android); does nothing elsewhere. */
export class NativePrayerChecks implements PrayerChecks {
  private get mod() {
    return prayerCheckNative();
  }

  async schedule(items: PrayerCheckItem[]) {
    if (!this.mod?.schedule) return;
    const json = items.map(({ at, ...rest }) => ({
      ...rest, hour: at.hours, minute: at.minutes, followUpMinutes: PRAYER_CHECK_FOLLOW_UP_MIN,
    }));
    await this.mod.schedule(JSON.stringify(json));
  }

  async cancelAll() {
    try { await this.mod?.cancelAll?.(); } catch {}
  }

  setDoneToday(prayerIds: PrayerId[]) {
    try { this.mod?.setDoneToday?.(prayerIds); } catch {}
  }

  async takeAnswers(): Promise<PrayerCheckAnswer[]> {
    try {
      const raw = (await this.mod?.takeAnswers?.()) ?? [];
      return raw.flatMap((a) => (isPrayerId(a.prayerId) && a.day ? [{ prayerId: a.prayerId, day: a.day }] : []));
    } catch {
      return [];
    }
  }

  onAnswered(listener: () => void) {
    const sub = DeviceEventEmitter.addListener('prayerCheckAnswered', listener);
    return () => sub.remove();
  }
}
