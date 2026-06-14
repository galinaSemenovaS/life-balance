"use client";

import { useState, useTransition } from "react";
import { createGoal, createTask } from "@/actions/goals";
import { createHabit } from "@/actions/habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleForm } from "@/components/ui/collapsible-form";
import { ItemReminderFields } from "@/components/ui/item-reminder-fields";
import { RecurrencePicker } from "@/components/ui/recurrence-picker";
import { toast } from "sonner";

export function CreateGoalForm({ sphereId }: { sphereId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <CollapsibleForm
      label="Добавить цель"
      hint="Привычки создаются внутри цели"
    >
      <form
        className="space-y-3"
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
        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input id="title" name="title" required placeholder="Например: Выучить испанский" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" name="description" placeholder="Зачем эта цель?" rows={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Дедлайн цели</Label>
          <Input id="deadline" name="deadline" type="date" />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          Создать цель
        </Button>
      </form>
    </CollapsibleForm>
  );
}

export function CreateHabitForm({ goalId }: { goalId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <CollapsibleForm label="Добавить привычку">
      <form
        className="space-y-3"
        action={(formData) => {
          startTransition(async () => {
            try {
              await createHabit({
                title: formData.get("title") as string,
                description: (formData.get("description") as string) || undefined,
                goalId,
                reminderEnabled: formData.get("reminderEnabled") === "1",
                reminderTime: (formData.get("reminderTime") as string) || undefined,
                recurrenceJson: formData.get("recurrence") as string,
                timezone: (formData.get("timezone") as string) || undefined,
              });
              toast.success("Привычка добавлена");
            } catch {
              toast.error("Ошибка");
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="habit-title">Название</Label>
          <Input
            id="habit-title"
            name="title"
            required
            placeholder="Например: 10 минут медитации"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="habit-description">Описание</Label>
          <Textarea
            id="habit-description"
            name="description"
            placeholder="Зачем эта привычка?"
            rows={2}
          />
        </div>
        <RecurrencePicker
          defaultValue={{
            preset: "daily",
            interval: 1,
            unit: "day",
            daysOfWeek: [1, 2, 3, 4, 5],
            monthlyMode: "dayOfMonth",
            weekOfMonth: 1,
            endType: "never",
          }}
        />
        <ItemReminderFields />
        <Button type="submit" className="w-full" disabled={pending}>
          Добавить привычку
        </Button>
      </form>
    </CollapsibleForm>
  );
}

export function CreateTaskForm({ goalId }: { goalId: string }) {
  const [pending, startTransition] = useTransition();
  const [dueDate, setDueDate] = useState("");

  return (
    <CollapsibleForm label="Добавить задачу">
      <form
        className="space-y-3"
        action={(formData) => {
          startTransition(async () => {
            try {
              await createTask({
                goalId,
                title: formData.get("taskTitle") as string,
                dueDate: (formData.get("dueDate") as string) || undefined,
                recurrenceJson: formData.get("recurrence") as string,
                reminderEnabled: formData.get("reminderEnabled") === "1",
                reminderTime: (formData.get("reminderTime") as string) || undefined,
                timezone: (formData.get("timezone") as string) || undefined,
              });
              toast.success("Задача добавлена");
            } catch {
              toast.error("Ошибка");
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="taskTitle">Название</Label>
          <Input id="taskTitle" name="taskTitle" required placeholder="Что сделать?" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Дата</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <RecurrencePicker anchorDate={dueDate || null} />
        <ItemReminderFields />
        <Button type="submit" className="w-full" disabled={pending}>
          Добавить задачу
        </Button>
      </form>
    </CollapsibleForm>
  );
}
