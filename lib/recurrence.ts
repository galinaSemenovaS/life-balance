import { coerceDate } from "@/lib/utils";

export type RecurrencePreset =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export type RecurrenceUnit = "day" | "week" | "month" | "year";

export type RecurrenceEndType = "never" | "onDate" | "afterCount";

export type MonthlyMode = "dayOfMonth" | "nthWeekday";

export type RecurrenceRule = {
  preset: RecurrencePreset;
  interval: number;
  unit: RecurrenceUnit;
  /** 0 = Sunday … 6 = Saturday */
  daysOfWeek: number[];
  /** Для custom/monthly: по числу или по N-й день недели */
  monthlyMode?: MonthlyMode;
  /** 1–4 или -1 (последний) */
  weekOfMonth?: number;
  endType: RecurrenceEndType;
  endDate?: string;
  endCount?: number;
};

export const DEFAULT_RECURRENCE: RecurrenceRule = {
  preset: "none",
  interval: 1,
  unit: "week",
  daysOfWeek: [1, 2, 3, 4, 5],
  monthlyMode: "dayOfMonth",
  weekOfMonth: 1,
  endType: "never",
};

export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 0, label: "Вс" },
] as const;

export const WEEK_OF_MONTH_OPTIONS = [
  { value: 1, label: "1-й" },
  { value: 2, label: "2-й" },
  { value: 3, label: "3-й" },
  { value: 4, label: "4-й" },
  { value: -1, label: "последний" },
] as const;

export const PRESET_OPTIONS: { value: RecurrencePreset; label: string }[] = [
  { value: "none", label: "Не повторяется" },
  { value: "daily", label: "Каждый день" },
  { value: "weekly", label: "Каждую неделю" },
  { value: "monthly", label: "Каждый месяц" },
  { value: "yearly", label: "Каждый год" },
  { value: "custom", label: "Другое…" },
];

export function parseRecurrenceRule(raw: unknown): RecurrenceRule {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_RECURRENCE };
  const r = raw as Partial<RecurrenceRule>;
  return {
    preset: r.preset ?? "none",
    interval: Math.max(1, r.interval ?? 1),
    unit: r.unit ?? "week",
    daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [1, 2, 3, 4, 5],
    monthlyMode: r.monthlyMode ?? "dayOfMonth",
    weekOfMonth: r.weekOfMonth ?? 1,
    endType: r.endType ?? "never",
    endDate: r.endDate,
    endCount: r.endCount,
  };
}

export function parseRecurrenceJson(json: unknown): RecurrenceRule {
  if (json == null) return { ...DEFAULT_RECURRENCE };
  if (typeof json === "string") {
    try {
      return parseRecurrenceRule(JSON.parse(json));
    } catch {
      return { ...DEFAULT_RECURRENCE };
    }
  }
  return parseRecurrenceRule(json);
}

export function recurrenceToFrequency(
  rule: RecurrenceRule
): "DAILY" | "WEEKLY" | "CUSTOM" {
  if (rule.preset === "none") return "DAILY";
  if (rule.preset === "daily") return "DAILY";
  if (rule.preset === "weekly") return "WEEKLY";
  return "CUSTOM";
}

export function ruleFromPreset(
  preset: RecurrencePreset,
  current?: RecurrenceRule
): RecurrenceRule {
  const base = current ?? { ...DEFAULT_RECURRENCE };
  switch (preset) {
    case "none":
      return { ...base, preset: "none", interval: 1, unit: "day", endType: "never" };
    case "daily":
      return { ...base, preset: "daily", interval: 1, unit: "day" };
    case "weekly":
      return { ...base, preset: "weekly", interval: 1, unit: "week" };
    case "monthly":
      return {
        ...base,
        preset: "monthly",
        interval: 1,
        unit: "month",
        monthlyMode: "dayOfMonth",
      };
    case "yearly":
      return { ...base, preset: "yearly", interval: 1, unit: "year" };
    case "custom":
      return { ...base, preset: "custom" };
    default:
      return base;
  }
}

function startOfDay(d: Date | string | number) {
  const x = coerceDate(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthsBetween(anchor: Date, date: Date): number {
  return (
    (date.getFullYear() - anchor.getFullYear()) * 12 +
    (date.getMonth() - anchor.getMonth())
  );
}

function yearsBetween(anchor: Date, date: Date): number {
  return date.getFullYear() - anchor.getFullYear();
}

/** N-й день недели в месяце (weekOfMonth: 1–4 или -1 = последний) */
export function getNthWeekdayInMonth(
  year: number,
  month: number,
  weekOfMonth: number,
  dayOfWeek: number
): Date {
  if (weekOfMonth === -1) {
    const last = new Date(year, month + 1, 0);
    while (last.getDay() !== dayOfWeek) {
      last.setDate(last.getDate() - 1);
    }
    return startOfDay(last);
  }

  let count = 0;
  const cursor = new Date(year, month, 1);
  while (cursor.getMonth() === month) {
    if (cursor.getDay() === dayOfWeek) {
      count++;
      if (count === weekOfMonth) return startOfDay(cursor);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return startOfDay(new Date(year, month, 1));
}

function weekdayLabel(day: number): string {
  return WEEKDAY_OPTIONS.find((w) => w.value === day)?.label ?? "";
}

function weekOfMonthLabel(weekOfMonth: number): string {
  return (
    WEEK_OF_MONTH_OPTIONS.find((w) => w.value === weekOfMonth)?.label ??
    `${weekOfMonth}-й`
  );
}

function formatDayOfMonth(day: number): string {
  return `${day}-го числа`;
}

function formatYearlyDate(anchor: Date): string {
  return anchor.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function monthlyByDayLabel(interval: number, day: number | null): string {
  const dayPart =
    day != null ? ` ${formatDayOfMonth(day)}` : " — укажите дату";
  if (interval === 1) return `Каждый месяц${dayPart}`;
  return `Каждые ${interval} ${plural(interval, UNIT_LABELS.month)}${dayPart}`;
}

function isMonthlyDue(
  rule: RecurrenceRule,
  dayDate: Date,
  anchor: Date | undefined
): boolean {
  if (!anchor) {
    return dayDate.getDate() === new Date().getDate();
  }

  const monthDiff = monthsBetween(startOfDay(anchor), dayDate);
  if (monthDiff < 0 || monthDiff % rule.interval !== 0) return false;

  if (rule.monthlyMode === "nthWeekday") {
    const dow = rule.daysOfWeek[0] ?? anchor.getDay();
    const wom = rule.weekOfMonth ?? 1;
    const target = getNthWeekdayInMonth(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      wom,
      dow
    );
    return startOfDay(dayDate).getTime() === target.getTime();
  }

  return dayDate.getDate() === anchor.getDate();
}

function isPastEnd(rule: RecurrenceRule, date: Date, startDate?: Date): boolean {
  if (rule.endType === "onDate" && rule.endDate) {
    return startOfDay(date) > startOfDay(new Date(rule.endDate));
  }
  if (rule.endType === "afterCount" && rule.endCount && startDate) {
    let count = 0;
    let cursor = startOfDay(startDate);
    const limit = 500;
    let i = 0;
    while (cursor <= startOfDay(date) && i < limit) {
      if (isDueOnDate(rule, cursor, startDate)) count++;
      cursor = new Date(cursor.getTime() + 86400000);
      i++;
    }
    return count > rule.endCount;
  }
  return false;
}

export function isDueOnDate(
  rule: RecurrenceRule,
  date: Date | string,
  startDate?: Date | string
): boolean {
  const dayDate = coerceDate(date);
  const anchor = startDate != null ? coerceDate(startDate) : undefined;

  if (rule.preset === "none") {
    if (!anchor) return true;
    return startOfDay(dayDate).getTime() === startOfDay(anchor).getTime();
  }

  if (anchor && startOfDay(dayDate) < startOfDay(anchor)) return false;
  if (isPastEnd(rule, dayDate, anchor)) return false;

  const day = dayDate.getDay();
  const diffDays = anchor
    ? Math.floor(
        (startOfDay(dayDate).getTime() - startOfDay(anchor).getTime()) / 86400000
      )
    : 0;

  switch (rule.preset) {
    case "daily":
      if (!anchor) return false;
      return diffDays >= 0 && diffDays % rule.interval === 0;
    case "weekly":
      if (!anchor) return false;
      if (!rule.daysOfWeek.includes(day)) return false;
      if (diffDays < 0) return false;
      return Math.floor(diffDays / 7) % rule.interval === 0;
    case "monthly":
      if (!anchor) return false;
      return isMonthlyDue(rule, dayDate, anchor);
    case "yearly":
      if (!anchor) return false;
      if (yearsBetween(anchor, dayDate) < 0) return false;
      if (yearsBetween(anchor, dayDate) % rule.interval !== 0) return false;
      return (
        dayDate.getMonth() === anchor.getMonth() &&
        dayDate.getDate() === anchor.getDate()
      );
    case "custom": {
      if (!anchor) return false;
      if (diffDays < 0) return false;
      if (rule.unit === "day") return diffDays % rule.interval === 0;
      if (rule.unit === "week") {
        if (!rule.daysOfWeek.includes(day)) return false;
        return Math.floor(diffDays / 7) % rule.interval === 0;
      }
      if (rule.unit === "month") return isMonthlyDue(rule, dayDate, anchor);
      if (rule.unit === "year") {
        if (yearsBetween(anchor, dayDate) % rule.interval !== 0) return false;
        return (
          dayDate.getMonth() === anchor.getMonth() &&
          dayDate.getDate() === anchor.getDate()
        );
      }
      return false;
    }
    default:
      return false;
  }
}

export function getNextOccurrence(
  rule: RecurrenceRule,
  fromDate: Date
): Date | null {
  if (rule.preset === "none") return null;
  let cursor = startOfDay(fromDate);
  cursor.setDate(cursor.getDate() + 1);
  for (let i = 0; i < 366; i++) {
    if (isDueOnDate(rule, cursor, fromDate)) return cursor;
    cursor = new Date(cursor.getTime() + 86400000);
  }
  return null;
}

const UNIT_LABELS: Record<RecurrenceUnit, [string, string, string]> = {
  day: ["день", "дня", "дней"],
  week: ["неделю", "недели", "недель"],
  month: ["месяц", "месяца", "месяцев"],
  year: ["год", "года", "лет"],
};

function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function formatRecurrenceLabel(
  rule: RecurrenceRule,
  anchorDate?: Date | string | null
): string {
  if (rule.preset === "none") return "Не повторяется";

  const anchor =
    anchorDate != null && anchorDate !== ""
      ? coerceDate(anchorDate)
      : null;
  const anchorValid =
    anchor && !Number.isNaN(anchor.getTime()) ? anchor : null;
  const monthDay = anchorValid ? anchorValid.getDate() : null;

  let main = "";
  switch (rule.preset) {
    case "daily":
      main =
        rule.interval === 1
          ? "Каждый день"
          : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.day)}`;
      break;
    case "weekly": {
      const days = rule.daysOfWeek
        .map((d) => weekdayLabel(d))
        .filter(Boolean)
        .join(", ");
      const weekBase =
        rule.interval === 1
          ? "Каждую неделю"
          : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.week)}`;
      main = days ? `${weekBase}: ${days}` : weekBase;
      break;
    }
    case "monthly":
      if (rule.monthlyMode === "nthWeekday") {
        const dow = rule.daysOfWeek[0];
        const nth = `в ${weekOfMonthLabel(rule.weekOfMonth ?? 1)} ${weekdayLabel(dow)}`;
        main =
          rule.interval === 1
            ? `Каждый месяц ${nth}`
            : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.month)} ${nth}`;
      } else {
        main = monthlyByDayLabel(rule.interval, monthDay);
      }
      break;
    case "yearly":
      if (anchorValid) {
        const onDate = formatYearlyDate(anchorValid);
        main =
          rule.interval === 1
            ? `Каждый год ${onDate}`
            : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.year)} ${onDate}`;
      } else {
        main =
          rule.interval === 1
            ? "Каждый год"
            : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.year)}`;
      }
      break;
    case "custom": {
      if (rule.unit === "week") {
        const days = rule.daysOfWeek
          .map((d) => weekdayLabel(d))
          .filter(Boolean)
          .join(", ");
        main = `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.week)}${days ? `: ${days}` : ""}`;
      } else if (rule.unit === "month") {
        if (rule.monthlyMode === "nthWeekday") {
          const dow = rule.daysOfWeek[0];
          main = `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.month)} в ${weekOfMonthLabel(rule.weekOfMonth ?? 1)} ${weekdayLabel(dow)}`;
        } else {
          main = monthlyByDayLabel(rule.interval, monthDay);
        }
      } else if (rule.unit === "year" && anchorValid) {
        main = `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.year)} ${formatYearlyDate(anchorValid)}`;
      } else {
        main = `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS[rule.unit])}`;
      }
      break;
    }
  }

  if (rule.endType === "onDate" && rule.endDate) {
    const d = new Date(rule.endDate);
    main += ` · до ${d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`;
  } else if (rule.endType === "afterCount" && rule.endCount) {
    main += ` · ${rule.endCount} раз`;
  }

  return main;
}
