"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import { WheelChart } from "@/components/wheel/WheelChart";
import {
  ActiveScoreDisplay,
  OnboardingStepIndicator,
} from "@/components/onboarding/OnboardingEditorial";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { interactiveCard, selectedAccentBar, tapScale } from "@/lib/ui-classes";
import { AlertCircle } from "lucide-react";
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
  const [activeSphere, setActiveSphere] = useState<string | null>(
    spheres[0]?.id ?? null
  );
  const [pending, startTransition] = useTransition();

  const wheelData = spheres.map((s) => ({
    name: s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name,
    score: scores[s.id] ?? 5,
    color: s.color,
    sphereId: s.id,
  }));

  const activeSphereData = spheres.find((s) => s.id === activeSphere);

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
      <div className="space-y-8">
        <OnboardingStepIndicator step={0} total={2} label="Оценка" />

        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Добро пожаловать
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Оцените каждую сферу от 1 до 10 — насколько вы довольны ею сейчас
          </p>
        </div>

        <WheelChart
          data={wheelData}
          size="lg"
          selectedSphereId={activeSphere}
          onSphereSelect={setActiveSphere}
          hideFooter
          fullBleed
        />

        <ActiveScoreDisplay
          sphereName={activeSphereData?.name ?? null}
          score={activeSphere ? (scores[activeSphere] ?? 5) : 0}
        />

        <div className="space-y-3">
          <p className="editorial-section-label">Сферы</p>
          {spheres.map((sphere) => {
            const isActive = activeSphere === sphere.id;
            return (
              <div
                key={sphere.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveSphere(sphere.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveSphere(sphere.id);
                  }
                }}
                className={cn(
                  interactiveCard,
                  "rounded-sm p-4",
                  isActive && selectedAccentBar
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 font-medium">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: sphere.color }}
                    />
                    {sphere.name}
                  </span>
                  <span className="font-display text-lg tabular-nums">
                    {scores[sphere.id]}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[scores[sphere.id] ?? 5]}
                  onValueChange={([v]) => {
                    setScores((prev) => ({ ...prev, [sphere.id]: v }));
                    setActiveSphere(sphere.id);
                  }}
                />
              </div>
            );
          })}
        </div>

        <Button className="w-full" size="lg" onClick={() => setStep(1)}>
          Далее
        </Button>
      </div>
    );
  }

  const lowSpheres = spheres.filter(
    (s) => (scores[s.id] ?? 5) <= LOW_SCORE_THRESHOLD
  );

  return (
    <div className="space-y-8">
      <OnboardingStepIndicator step={1} total={2} label="Приоритеты" />

      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Фокус
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
          Выберите 1–2 сферы, на которых сфокусируетесь в первую очередь
        </p>
        {lowSpheres.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--destructive)]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Сферы с оценкой ≤{LOW_SCORE_THRESHOLD} — зона роста
          </p>
        )}
      </div>

      <div className="museum-frame bg-[var(--surface)] p-4">
        <WheelChart
          data={wheelData}
          size="md"
          selectedSphereId={activeSphere}
          onSphereSelect={setActiveSphere}
        />
      </div>

      <div className="space-y-3">
        <Label className="editorial-section-label">Приоритетные сферы</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {spheres.map((sphere) => {
            const score = scores[sphere.id] ?? 5;
            const selected = priorities.includes(sphere.id);
            const isLow = score <= LOW_SCORE_THRESHOLD;

            return (
              <button
                key={sphere.id}
                type="button"
                onClick={() => togglePriority(sphere.id)}
                className={cn(
                  "flex items-center gap-2 rounded-sm border p-3 text-left text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  tapScale,
                  selected &&
                    "editorial-accent-bar border-[var(--accent)] bg-[var(--primary-soft)]",
                  !selected &&
                    isLow &&
                    "border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_8%,var(--surface))]",
                  !selected &&
                    !isLow &&
                    "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--foreground)]"
                )}
              >
                {isLow && (
                  <AlertCircle className="h-4 w-4 shrink-0 text-[var(--destructive)]" />
                )}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: sphere.color }}
                />
                <span className="flex-1 font-medium">{sphere.name}</span>
                <span className="shrink-0 font-display text-sm tabular-nums text-[var(--muted)]">
                  {score}/10
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
          Назад
        </Button>
        <Button className="flex-1" size="lg" disabled={pending} onClick={finish}>
          {pending ? "Сохранение..." : "Начать"}
        </Button>
      </div>
    </div>
  );
}
