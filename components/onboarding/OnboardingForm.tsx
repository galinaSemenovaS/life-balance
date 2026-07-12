"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import { WheelChart } from "@/components/wheel/WheelChart";
import { toast } from "sonner";

type Sphere = {
  id: string;
  name: string;
  color: string;
};

const LOW_SCORE_THRESHOLD = 5;

export function OnboardingForm({ spheres }: { spheres: Sphere[] }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(spheres.map((s) => [s.id, 5]))
  );
  const [priorities, setPriorities] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const sphereScores = spheres.map((s) => ({
    sphereId: s.id,
    name: s.name.length > 10 ? `${s.name.slice(0, 9)}…` : s.name,
    color: s.color,
    score: scores[s.id] ?? 5,
  }));

  const togglePriority = (id: string) => {
    setPriorities((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) {
        toast.error("Выберите не более 2 приоритетных сфер");
        return prev;
      }
      return [...prev, id];
    });
  };

  const finish = () => {
    startTransition(async () => {
      await completeOnboarding(
        spheres.map((s) => ({ sphereId: s.id, score: scores[s.id] ?? 5 })),
        priorities
      );
    });
  };

  if (step === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Добро пожаловать
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Оцените каждую сферу от 1 до 10 — насколько вы довольны ею сейчас
          </p>
        </div>

        <div className="flex justify-center">
          <WheelChart sphereScores={sphereScores} size={280} interactive={false} />
        </div>

        <div className="space-y-3">
          {spheres.map((sphere) => (
            <div
              key={sphere.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: sphere.color }}
                  />
                  <span className="font-medium text-sm text-[var(--foreground)]">
                    {sphere.name}
                  </span>
                </div>
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{ color: sphere.color }}
                >
                  {scores[sphere.id]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={scores[sphere.id] ?? 5}
                onChange={(e) =>
                  setScores((prev) => ({ ...prev, [sphere.id]: Number(e.target.value) }))
                }
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${sphere.color} ${((scores[sphere.id] ?? 5) - 1) / 9 * 100}%, var(--border) ${((scores[sphere.id] ?? 5) - 1) / 9 * 100}%)`,
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep(1)}
          className="w-full rounded-2xl bg-[var(--accent)] text-white font-semibold py-4 text-base"
        >
          Далее
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Фокус
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          Выберите 1–2 сферы, на которых сфокусируетесь в первую очередь
        </p>
      </div>

      <div className="flex justify-center">
        <WheelChart sphereScores={sphereScores} size={260} interactive={false} />
      </div>

      <div className="space-y-2">
        {spheres.map((sphere) => {
          const score = scores[sphere.id] ?? 5;
          const selected = priorities.includes(sphere.id);
          const isLow = score <= LOW_SCORE_THRESHOLD;

          return (
            <button
              key={sphere.id}
              type="button"
              onClick={() => togglePriority(sphere.id)}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                selected
                  ? "border-[var(--accent)] bg-blue-50 dark:bg-blue-950/20"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: sphere.color }}
              />
              <span className="flex-1 font-medium text-[var(--foreground)]">
                {sphere.name}
              </span>
              <span className="text-sm tabular-nums text-[var(--muted)]">
                {score}
              </span>
              {selected && (
                <span className="text-[var(--accent)] font-bold text-xs">★</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(0)}
          className="flex-1 rounded-2xl border border-[var(--border)] py-4 text-sm font-medium text-[var(--muted)]"
        >
          Назад
        </button>
        <button
          onClick={finish}
          disabled={pending}
          className="flex-1 rounded-2xl bg-[var(--accent)] text-white font-semibold py-4 text-base disabled:opacity-60"
        >
          {pending ? "Сохраняю…" : "Начать"}
        </button>
      </div>
    </div>
  );
}
