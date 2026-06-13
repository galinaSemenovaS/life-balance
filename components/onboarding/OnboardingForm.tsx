"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import { WheelChart } from "@/components/wheel/WheelChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
  const [activeSphere, setActiveSphere] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const wheelData = spheres.map((s) => ({
    name: s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name,
    score: scores[s.id] ?? 5,
    color: s.color,
    sphereId: s.id,
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
        <div className="text-center">
          <h1 className="text-2xl font-bold">Добро пожаловать</h1>
          <p className="mt-2 text-sm text-slate-500">
            Оцените каждую сферу от 1 до 10 — насколько вы довольны ею сейчас
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Нажмите на точку колеса, чтобы увидеть оценку
          </p>
        </div>
        <WheelChart
          data={wheelData}
          size="lg"
          selectedSphereId={activeSphere}
          onSphereSelect={setActiveSphere}
        />
        <div className="space-y-4">
          {spheres.map((sphere) => (
            <Card
              key={sphere.id}
              className={cn(
                activeSphere === sphere.id && "ring-2 ring-emerald-500"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: sphere.color }}
                    />
                    {sphere.name}
                  </span>
                  <span className="text-emerald-600">{scores[sphere.id]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ))}
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Приоритеты</h1>
        <p className="mt-2 text-sm text-slate-500">
          Выберите 1–2 сферы, на которых сфокусируетесь в первую очередь
        </p>
        {lowSpheres.length > 0 && (
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3.5 w-3.5" />
            Сферы с оценкой ≤{LOW_SCORE_THRESHOLD} — зона роста
          </p>
        )}
      </div>
      <WheelChart
        data={wheelData}
        size="md"
        selectedSphereId={activeSphere}
        onSphereSelect={setActiveSphere}
      />
      <div className="space-y-2">
        <Label>Приоритетные сферы</Label>
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
                  "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                  selected &&
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
                  !selected &&
                    isLow &&
                    "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40",
                  !selected &&
                    !isLow &&
                    "border-slate-200 dark:border-slate-800"
                )}
              >
                {isLow && (
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                )}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: sphere.color }}
                />
                <span className="flex-1 font-medium">{sphere.name}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                    isLow
                      ? "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
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
