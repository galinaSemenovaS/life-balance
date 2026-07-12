"use client";

import { useState, useTransition } from "react";
import { updateSingleSphereScore } from "@/actions/spheres";

type Props = {
  sphereId: string;
  currentScore: number | null;
};

export function SphereAssessForm({ sphereId, currentScore }: Props) {
  const [score, setScore] = useState<number>(currentScore ?? 5);
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateSingleSphereScore(sphereId, score, description);
      setDescription("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Оценка
          </label>
          <span className="text-2xl font-bold tabular-nums text-[var(--accent)]">
            {score}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent) ${(score - 1) / 9 * 100}%, var(--border) ${(score - 1) / 9 * 100}%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--muted)]">1</span>
          <span className="text-xs text-[var(--muted)]">10</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--foreground)] block mb-2">
          Как я сейчас себя чувствую
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите текущее состояние этой сферы жизни…"
          rows={4}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[var(--accent)] text-white font-semibold py-3 text-sm disabled:opacity-60 transition-opacity"
      >
        {isPending ? "Сохраняю…" : saved ? "Сохранено ✓" : "Сохранить оценку"}
      </button>
    </form>
  );
}
