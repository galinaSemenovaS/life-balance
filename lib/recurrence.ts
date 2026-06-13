export type RecurrencePreset =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export type RecurrenceUnit = "day" | "week" | "month" | "year";

export type RecurrenceEndType = "never" | "onDate" | "afterCount";

export type RecurrenceRule = {
  preset: RecurrencePreset;
  interval: number;
  unit: RecurrenceUnit;
  /** 0 = Sunday … 6 = Saturday */
  daysOfWeek: number[];
  endType: RecurrenceEndType;
  endDate?: string;
  endCount?: number;
};

export const DEFAULT_RECURRENCE: RecurrenceRule = {
  preset: "none",
  interval: 1,
  unit: "week",
  daysOfWeek: [1, 2, 3, 4, 5],
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

export const PRESET_OPTIONS: { value: RecurrencePreset; label: string }[] = [
  { value: "none", label: "Не повторяется" },
  { value: "daily", label: "Каждый день" },
  { value: "weekly", label: "Каждую неделю" },
  { value: "monthly", label: "Каждый месяц" },
  { value: "yearly", label: "Каждый год" },
  { value: "custom", label: "Настроить…" },
];

export function parseRecurrenceRule(raw: unknown): RecurrenceRule {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_RECURRENCE };
  const r = raw as Partial<RecurrenceRule>;
  return {
    preset: r.preset ?? "none",
    interval: Math.max(1, r.interval ?? 1),
    unit: r.unit ?? "week",
    daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [1, 2, 3, 4, 5],
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
      return {
        ...base,
        preset: "weekly",
        interval: 1,
        unit: "week",
        daysOfWeek: base.daysOfWeek.length ? base.daysOfWeek : [1, 2, 3, 4, 5],
      };
    case "monthly":
      return { ...base, preset: "monthly", interval: 1, unit: "month" };
    case "yearly":
      return { ...base, preset: "yearly", interval: 1, unit: "year" };
    case "custom":
      return { ...base, preset: "custom" };
    default:
      return base;
  }
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isPastEnd(rule: RecurrenceRule, date: Date, startDate?: Date): boolean {
  if (rule.endType === "onDate" && rule.endDate) {
    return startOfDay(date) > startOfDay(new Date(rule.endDate));
  }
  if (rule.endType === "afterCount" && rule.endCount && startDate) {
    // approximate: count occurrences from startDate to date
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
  date: Date,
  startDate?: Date
): boolean {
  if (rule.preset === "none") {
    if (!startDate) return true;
    return startOfDay(date).getTime() === startOfDay(startDate).getTime();
  }

  if (startDate && startOfDay(date) < startOfDay(startDate)) return false;
  if (isPastEnd(rule, date, startDate)) return false;

  const day = date.getDay();

  switch (rule.preset) {
    case "daily":
      if (!startDate) return true;
      return (
        Math.floor(
          (startOfDay(date).getTime() - startOfDay(startDate).getTime()) /
            86400000
        ) %
          rule.interval ===
        0
      );
    case "weekly":
      return rule.daysOfWeek.includes(day);
    case "monthly":
      if (!startDate) return date.getDate() === new Date().getDate();
      return date.getDate() === startDate.getDate();
    case "yearly":
      if (!startDate) return false;
      return (
        date.getMonth() === startDate.getMonth() &&
        date.getDate() === startDate.getDate()
      );
    case "custom": {
      if (!startDate) return rule.unit === "day";
      const diffDays = Math.floor(
        (startOfDay(date).getTime() - startOfDay(startDate).getTime()) / 86400000
      );
      if (diffDays < 0) return false;
      if (rule.unit === "day") return diffDays % rule.interval === 0;
      if (rule.unit === "week") {
        if (diffDays % (7 * rule.interval) !== 0 && rule.daysOfWeek.length) {
          return rule.daysOfWeek.includes(day);
        }
        return rule.daysOfWeek.length
          ? rule.daysOfWeek.includes(day)
          : diffDays % (7 * rule.interval) === 0;
      }
      if (rule.unit === "month") return date.getDate() === startDate.getDate();
      if (rule.unit === "year") {
        return (
          date.getMonth() === startDate.getMonth() &&
          date.getDate() === startDate.getDate()
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

export function formatRecurrenceLabel(rule: RecurrenceRule): string {
  if (rule.preset === "none") return "Не повторяется";

  let main = "";
  switch (rule.preset) {
    case "daily":
      main = rule.interval === 1 ? "Каждый день" : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.day)}`;
      break;
    case "weekly": {
      const days = rule.daysOfWeek
        .map((d) => WEEKDAY_OPTIONS.find((w) => w.value === d)?.label)
        .filter(Boolean)
        .join(", ");
      main = days ? `Каждую неделю: ${days}` : "Каждую неделю";
      break;
    }
    case "monthly":
      main = rule.interval === 1 ? "Каждый месяц" : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.month)}`;
      break;
    case "yearly":
      main = rule.interval === 1 ? "Каждый год" : `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS.year)}`;
      break;
    case "custom":
      main = `Каждые ${rule.interval} ${plural(rule.interval, UNIT_LABELS[rule.unit])}`;
      break;
  }

  if (rule.endType === "onDate" && rule.endDate) {
    const d = new Date(rule.endDate);
    main += ` · до ${d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`;
  } else if (rule.endType === "afterCount" && rule.endCount) {
    main += ` · ${rule.endCount} раз`;
  }

  return main;
}
