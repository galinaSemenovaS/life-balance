import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** unstable_cache сериализует Date в ISO-строки — приводим обратно */
export function coerceDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
