import type { ReminderArt } from '../../../domain/entities/reminders';

/** The pictures behind the reminder alarm screen (generated in Figma, compressed JPEGs). */
export const REMINDER_ART: Record<ReminderArt, number> = {
  qiyam: require('../../../../assets/alarm/qiyam.jpg'),
  quran: require('../../../../assets/alarm/quran.jpg'),
  mosque: require('../../../../assets/alarm/default.jpg'),
};
