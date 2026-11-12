import { ReminderScheduler, ScheduleContext } from '../../domain/services/Notifications';
import { PrayerChecks } from '../../domain/services/PrayerChecks';
import { PRAYER_AR_NAMES } from '../../domain/entities/prayer';
import { DEFAULT_PRAYER_CHECK, isExcused, prayerCheckCopy, prayerCheckTimes } from '../../domain/entities/prayerCheck';

/**
 * «صليت؟» some minutes after each adhan, when the user turned it on and is not paused
 * («معذورة»). The questions themselves live in PrayerChecks (native, so the buttons work
 * while the app is closed).
 */
export class PrayerCheckScheduler implements ReminderScheduler {
  readonly ids: readonly string[] = [];

  constructor(private readonly checks: PrayerChecks) {}

  async schedule({ timings, prayerCheck }: ScheduleContext) {
    const settings = { ...DEFAULT_PRAYER_CHECK, ...prayerCheck };
    if (!settings.enabled || isExcused(settings, Date.now())) return;
    const items = prayerCheckTimes(timings as Partial<Record<string, string>>, settings.delayMinutes).map(({ prayerId, at }) => ({
      prayerId,
      at,
      ...prayerCheckCopy(PRAYER_AR_NAMES[prayerId], settings.delayMinutes),
    }));
    await this.checks.schedule(items);
  }

  cancelExtra() {
    return this.checks.cancelAll();
  }
}
