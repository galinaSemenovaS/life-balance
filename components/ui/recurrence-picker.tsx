"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_RECURRENCE,
  PRESET_OPTIONS,
  WEEKDAY_OPTIONS,
  formatRecurrenceLabel,
  ruleFromPreset,
  type RecurrenceEndType,
  type RecurrencePreset,
  type RecurrenceRule,
  type RecurrenceUnit,
} from "@/lib/recurrence";

type RecurrencePickerProps = {
  name?: string;
  defaultValue?: RecurrenceRule;
  /** Показывать блок «Заканчивается» */
  showEnds?: boolean;
  className?: string;
};

const UNIT_OPTIONS: { value: RecurrenceUnit; label: string }[] = [
  { value: "day", label: "день" },
  { value: "week", label: "нед." },
  { value: "month", label: "мес." },
  { value: "year", label: "год" },
];

export function RecurrencePicker({
  name = "recurrence",
  defaultValue = DEFAULT_RECURRENCE,
  showEnds = true,
  className,
}: RecurrencePickerProps) {
  const [rule, setRule] = useState<RecurrenceRule>(defaultValue);

  const update = (patch: Partial<RecurrenceRule>) => {
    setRule((prev) => ({ ...prev, ...patch }));
  };

  const selectPreset = (preset: RecurrencePreset) => {
    const next = ruleFromPreset(preset, rule);
    setRule(next);
  };

  const toggleDay = (day: number) => {
    const days = rule.daysOfWeek.includes(day)
      ? rule.daysOfWeek.filter((d) => d !== day)
      : [...rule.daysOfWeek, day].sort((a, b) => a - b);
    update({ daysOfWeek: days.length ? days : [day], preset: "weekly", unit: "week" });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={JSON.stringify(rule)} />

      <div className="space-y-2">
        <Label>Повторение</Label>
        <select
          value={rule.preset}
          onChange={(e) => selectPreset(e.target.value as RecurrencePreset)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          {PRESET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500">{formatRecurrenceLabel(rule)}</p>
      </div>

      {(rule.preset === "weekly" || rule.preset === "custom") && (
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Дни недели</Label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDay(value)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  rule.daysOfWeek.includes(value)
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {rule.preset === "custom" && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <span className="shrink-0 text-sm text-slate-500">Каждые</span>
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
            onChange={(e) => update({ unit: e.target.value as RecurrenceUnit })}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {showEnds && rule.preset !== "none" && (
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <Label className="text-xs text-slate-500">Заканчивается</Label>
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
                  className="accent-teal-600"
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
                    <span className="text-xs text-slate-500">раз</span>
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
