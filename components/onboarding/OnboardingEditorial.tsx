"use client";

import { cn } from "@/lib/utils";

export function OnboardingStepIndicator({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: string;
}) {
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="editorial-section-label">
          Шаг {step + 1} — {label}
        </p>
        <span className="text-xs tabular-nums text-[var(--muted)]">
          {step + 1}/{total}
        </span>
      </div>
      <div className="h-px w-full bg-[var(--border)]">
        <div
          className="h-px bg-[var(--accent)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ActiveScoreDisplay({
  sphereName,
  score,
  className,
}: {
  sphereName: string | null;
  score: number;
  className?: string;
}) {
  if (!sphereName) {
    return (
      <div className={cn("py-6 text-center", className)}>
        <p className="text-sm text-[var(--muted)]">
          Выберите сферу на колесе или в списке
        </p>
      </div>
    );
  }

  return (
    <div
      key={`${sphereName}-${score}`}
      className={cn("animate-score-reveal py-4 text-center", className)}
    >
      <p className="editorial-section-label mb-2">{sphereName}</p>
      <p className="font-display text-5xl tabular-nums leading-none text-[var(--foreground)]">
        {score}
        <span className="ml-1 text-2xl text-[var(--muted)]">/10</span>
      </p>
    </div>
  );
}
