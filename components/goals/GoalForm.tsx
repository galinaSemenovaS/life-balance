"use client";

import { useTransition } from "react";
import { createGoal } from "@/actions/goals";
import { createHabit } from "@/actions/habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CreateGoalForm({ sphereId }: { sphereId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
      action={(formData) => {
        startTransition(async () => {
          try {
            await createGoal({
              sphereId,
              title: formData.get("title") as string,
              description: (formData.get("description") as string) || undefined,
              deadline: (formData.get("deadline") as string) || undefined,
            });
            toast.success("Цель создана");
          } catch {
            toast.error("Ошибка создания цели");
          }
        });
      }}
    >
      <h3 className="font-semibold">Новая цель</h3>
      <p className="text-xs text-slate-500">
        Привычки добавляются внутри цели — так они поддерживают конкретный результат
      </p>
      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
        <Input id="title" name="title" required placeholder="Например: Бегать 3 раза в неделю" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" placeholder="Зачем эта цель?" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deadline">Дедлайн</Label>
        <Input id="deadline" name="deadline" type="date" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        Создать цель
      </Button>
    </form>
  );
}

export function CreateHabitForm({ goalId }: { goalId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
      action={(formData) => {
        startTransition(async () => {
          try {
            await createHabit({
              title: formData.get("title") as string,
              goalId,
              reminderTime: (formData.get("reminderTime") as string) || undefined,
            });
            toast.success("Привычка добавлена");
          } catch {
            toast.error("Ошибка");
          }
        });
      }}
    >
      <h3 className="font-semibold">Новая привычка</h3>
      <p className="text-xs text-slate-500">
        Ежедневное действие, которое приближает к этой цели
      </p>
      <div className="space-y-2">
        <Label htmlFor="habit-title">Название</Label>
        <Input id="habit-title" name="title" required placeholder="Например: 10 минут медитации" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reminderTime">Напоминание</Label>
        <Input id="reminderTime" name="reminderTime" type="time" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        Добавить привычку
      </Button>
    </form>
  );
}
