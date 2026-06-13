"use client";

import { useState, useTransition } from "react";
import { saveReassessment } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Sphere = { id: string; name: string; score: number };

export function ReassessForm({ spheres }: { spheres: Sphere[] }) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(spheres.map((s) => [s.id, s.score]))
  );
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-semibold">Переоценить сферы</h3>
      {spheres.map((sphere) => (
        <div key={sphere.id} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{sphere.name}</span>
            <span className="text-teal-600">{scores[sphere.id]}</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[scores[sphere.id]]}
            onValueChange={([v]) => setScores((p) => ({ ...p, [sphere.id]: v }))}
          />
        </div>
      ))}
      <Textarea
        placeholder="Заметка (необязательно)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button
        className="w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await saveReassessment(
                spheres.map((s) => ({ sphereId: s.id, score: scores[s.id] })),
                note || undefined
              );
              toast.success("Оценки сохранены");
            } catch {
              toast.error("Не удалось сохранить");
            }
          })
        }
      >
        Сохранить оценки
      </Button>
    </div>
  );
}
