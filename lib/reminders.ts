import { DEFAULT_TIMEZONE, getLocalDay, getLocalHHmm } from "@/lib/timezone";

/** Окно для внешнего cron (GitHub Actions = 5 мин, cron-job.org = 1 мин) */
export function getReminderWindowMinutes(): number {
  const value = Number(process.env.CRON_WINDOW_MINUTES ?? 5);
  return Number.isFinite(value) && value >= 1 ? Math.min(value, 60) : 5;
}

export function isReminderInWindow(
  reminderTime: string,
  now: Date,
  timeZone: string,
  windowMinutes = getReminderWindowMinutes()
): boolean {
  for (let i = 0; i < windowMinutes; i++) {
    const check = new Date(now.getTime() - i * 60_000);
    if (getLocalHHmm(check, timeZone) === reminderTime) return true;
  }
  return false;
}

export function wasReminderSentRecently(
  lastSentAt: Date | null | undefined,
  now: Date,
  cooldownMinutes = getReminderWindowMinutes()
): boolean {
  if (!lastSentAt) return false;
  return now.getTime() - lastSentAt.getTime() < cooldownMinutes * 60_000;
}

export function isWheelReviewDue(
  pref: {
    wheelReviewDay: number;
    wheelReviewTime: string;
    lastWheelReminderAt: Date | null;
  },
  now: Date,
  timeZone: string
): boolean {
  if (getLocalDay(now, timeZone) !== pref.wheelReviewDay) return false;
  if (!isReminderInWindow(pref.wheelReviewTime, now, timeZone)) return false;
  if (wasReminderSentRecently(pref.lastWheelReminderAt, now)) return false;
  return true;
}

export { DEFAULT_TIMEZONE, getLocalDay, getLocalHHmm };
