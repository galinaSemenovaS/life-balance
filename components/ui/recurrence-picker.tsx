"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn, coerceDate } from "@/lib/utils";
import {
  DEFAULT_RECURRENCE,
  PRESET_OPTIONS,
  WEEKDAY_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  formatRecurrenceLabel,
  ruleFromPreset,
  type MonthlyMode,
  type RecurrenceEndType,
  type RecurrencePreset,
  type RecurrenceRule,
  type RecurrenceUnit,
} from "@/lib/recurrence";

type RecurrencePickerProps = {
  name?: string;
  defaultValue?: RecurrenceRule;
  /** Якорная дата (dueDate) — для подписи «этого числа» */
  anchorDate?: string | null;
  showEnds?: boolean;
  className?: string;
};

const UNIT_OPTIONS: { value: RecurrenceUnit; label: string }[] = [
  { value: "day", label: "день" },
  { value: "week", label: "нед." },
  { value: "month", label: "мес." },
  { value: "year", label: "год" },
];

const selectClass =
  "h-11 w-full rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus-visible:border-[var(--foreground)] focus-visible:ring-1 focus-visible:ring-[var(--foreground)]";

export function RecurrencePicker({
  name = "recurrence",
  defaultValue = DEFAULT_RECURRENCE,
  anchorDate,
  showEnds = true,
  className,
}: RecurrencePickerProps) {
  const [rule, setRule] = useState<RecurrenceRule>(defaultValue);

  const update = (patch: Partial<RecurrenceRule>) => {
    setRule((prev) => ({ ...prev, ...patch }));
  };

  const selectPreset = (preset: RecurrencePreset) => {
    setRule(ruleFromPreset(preset, rule));
  };

  const toggleDay = (day: number) => {
    const days = rule.daysOfWeek.includes(day)
      ? rule.daysOfWeek.filter((d) => d !== day)
      : [...rule.daysOfWeek, day].sort((a, b) => a - b);
    update({
      daysOfWeek: days.length ? days : [day],
      preset: "custom",
      unit: "week",
    });
  };

  const setSingleWeekday = (day: number) => {
    update({ daysOfWeek: [day] });
  };

  const showCustomWeekDays = rule.preset === "custom" && rule.unit === "week";
  const showCustomMonthOptions =
    rule.preset === "custom" && rule.unit === "month";
  const showCustomInterval = rule.preset === "custom";

  const anchorDay = anchorDate
    ? (() => {
        const d = coerceDate(anchorDate);
        return Number.isNaN(d.getTime()) ? null : d.getDate();
      })()
    : null;

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={JSON.stringify(rule)} />

      <div className="space-y-2">
        <Label>Повторение</Label>
        <select
          value={rule.preset}
          onChange={(e) => selectPreset(e.target.value as RecurrencePreset)}
          className={selectClass}
        >
          {PRESET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--muted)]">
          {formatRecurrenceLabel(rule, anchorDate)}
        </p>
      </div>

      {showCustomInterval && (
        <div className="flex items-center gap-2 border border-[var(--border)] p-3">
          <span className="shrink-0 text-sm text-[var(--muted)]">Каждые</span>
          <Input
            type="number"
            min={1}
            max={99}
            value={rule.interval}
            onChange={(e) =>
              update({ interval: Math.max(1, Number(e.target.value) || 1) })
            }
            className="w-16 text-center"
          />
          <select
            value={rule.unit}
            onChange={(e) => {
              const unit = e.target.value as RecurrenceUnit;
              update({
                unit,
                ...(unit === "month"
                  ? { monthlyMode: rule.monthlyMode ?? "dayOfMonth" }
                  : {}),
              });
            }}
            className={cn(selectClass, "flex-1")}
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {showCustomWeekDays && (
        <div className="space-y-2">
          <Label className="text-xs text-[var(--muted)]">Дни недели</Label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDay(value)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-sm border text-xs font-medium transition-colors duration-300",
                  rule.daysOfWeek.includes(value)
                    ? "border-[var(--accent)] bg-[var(--primary-soft)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCustomMonthOptions && (
        <div className="space-y-3 border border-[var(--border)] p-3">
          <Label className="text-xs text-[var(--muted)]">Ежемесячно</Label>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${name}-monthly-mode`}
                checked={rule.monthlyMode !== "nthWeekday"}
                onChange={() => update({ monthlyMode: "dayOfMonth" as MonthlyMode })}
                className="accent-[var(--accent)]"
              />
              <span>
                {anchorDay != null
                  ? `Каждый месяц ${anchorDay}-го числа`
                  : "Каждый месяц — укажите дату"}
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="radio"
                name={`${name}-monthly-mode`}
                checked={rule.monthlyMode === "nthWeekday"}
                onChange={() =>
                  update({
                    monthlyMode: "nthWeekday",
                    weekOfMonth: rule.weekOfMonth ?? 1,
                    daysOfWeek: rule.daysOfWeek.length
                      ? [rule.daysOfWeek[0]]
                      : [1],
                  })
                }
                className="mt-1 accent-[var(--accent)]"
              />
              <span className="flex flex-col gap-2">
                <span>Каждый месяц в</span>
                {rule.monthlyMode === "nthWeekday" && (
                  <span className="flex flex-wrap items-center gap-2">
                    <select
                      value={rule.weekOfMonth ?? 1}
                      onChange={(e) =>
                        update({ weekOfMonth: Number(e.target.value) })
                      }
                      className={cn(selectClass, "h-9 w-auto")}
                    >
                      {WEEK_OF_MONTH_OPTIONS.map((w) => (
                        <option key={w.value} value={w.value}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={rule.daysOfWeek[0] ?? 1}
                      onChange={(e) =>
                        setSingleWeekday(Number(e.target.value))
                      }
                      className={cn(selectClass, "h-9 flex-1")}
                    >
                      {WEEKDAY_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </span>
                )}
              </span>
            </label>
          </div>
        </div>
      )}

      {showEnds && rule.preset !== "none" && (
        <div className="space-y-2 border border-[var(--border)] p-3">
          <Label className="text-xs text-[var(--muted)]">Заканчивается</Label>
          <div className="space-y-2">
            {(
              [
                { value: "never", label: "Никогда" },
                { value: "onDate", label: "Дата" },
                { value: "afterCount", label: "После" },
              ] as const
            ).map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={`${name}-end`}
                  checked={rule.endType === value}
                  onChange={() => update({ endType: value as RecurrenceEndType })}
                  className="accent-[var(--accent)]"
                />
                <span>{label}</span>
                {value === "onDate" && rule.endType === "onDate" && (
                  <Input
                    type="date"
                    value={rule.endDate ?? ""}
                    onChange={(e) => update({ endDate: e.target.value })}
                    className="ml-auto h-9 w-auto"
                  />
                )}
                {value === "afterCount" && rule.endType === "afterCount" && (
                  <span className="ml-auto flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      value={rule.endCount ?? 10}
                      onChange={(e) =>
                        update({ endCount: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="h-9 w-16 text-center"
                    />
                    <span className="text-xs text-[var(--muted)]">раз</span>
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
