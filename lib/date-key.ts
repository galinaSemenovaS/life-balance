import { format, isValid, parse, startOfDay } from "date-fns";

/** Локальный ключ даты для URL и кэша (без сдвига UTC) */
export function toDateKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function parseDateKey(raw?: string | null): Date | null {
  if (!raw?.trim()) return null;

  if (raw.includes("T")) {
    const legacy = startOfDay(new Date(raw));
    return isValid(legacy) ? legacy : null;
  }

  const parsed = parse(raw, "yyyy-MM-dd", new Date());
  if (!isValid(parsed)) return null;
  return startOfDay(parsed);
}
