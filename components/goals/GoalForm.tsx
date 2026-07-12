"use client";

import { useTransition } from "react";
import { createGoal } from "@/actions/goals";
import { toast } from "sonner";

export function CreateGoalForm({ sphereId }: { sphereId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      action={(formData) => {
        startTransition(async () => {
          try {
            await createGoal({
              sphereId,
              title: formData.get("title") as string,
              description: (formData.get("description") as string) || undefined,
            });
            toast.success("Блок создан");
            (formData as unknown as HTMLFormElement).reset?.();
          } catch {
            toast.error("Ошибка создания блока");
          }
        });
      }}
    >
      <input
        name="title"
        required
        placeholder="Название блока (например: Питание)"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
      />
      <textarea
        name="description"
        placeholder="Описание (необязательно)"
        rows={2}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--accent)] text-white font-semibold py-3 text-sm disabled:opacity-60"
      >
        {pending ? "Создаю…" : "Создать блок"}
      </button>
    </form>
  );
}

export function CreateTaskForm({ goalId }: { goalId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      action={(formData) => {
        startTransition(async () => {
          const { createTask } = await import("@/actions/goals");
          try {
            await createTask({
              goalId,
              title: formData.get("title") as string,
            });
            (formData as unknown as HTMLFormElement).reset?.();
          } catch {
            toast.error("Ошибка добавления задачи");
          }
        });
      }}
    >
      <input
        name="title"
        required
        placeholder="Новая задача…"
        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[var(--accent)] text-white font-semibold px-4 py-2.5 text-sm disabled:opacity-60 shrink-0"
      >
        +
      </button>
    </form>
  );
}
