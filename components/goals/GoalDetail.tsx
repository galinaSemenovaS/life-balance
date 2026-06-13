"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  createPlanStep,
  toggleTask,
  updateGoalStatus,
} from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CollapsibleForm } from "@/components/ui/collapsible-form";
import {
  CreateHabitForm,
  CreateTaskForm,
} from "@/components/goals/GoalForm";
import { HabitSettingsForm } from "@/components/goals/HabitSettingsForm";
import { TaskSettingsForm } from "@/components/goals/TaskSettingsForm";
import { formatRecurrenceLabel, parseRecurrenceJson } from "@/lib/recurrence";
import { ArrowLeft } from "lucide-react";
import { getGoalProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  recurrence: unknown;
  reminderTime: string | null;
  reminderEnabled: boolean;
};
type Step = { id: string; title: string; order: number; tasks: Task[] };
type Habit = {
  id: string;
  title: string;
  reminderTime: string | null;
  reminderEnabled: boolean;
  schedule: unknown;
  endDate: string | null;
};

function metaLine(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(" · ");
}

function TaskRow({
  task,
  pending,
  onToggle,
}: {
  task: Task;
  pending: boolean;
  onToggle: (completed: boolean) => void;
}) {
  const completed = task.status === "COMPLETED";

  return (
    <Card className={cn("space-y-2 py-3", completed && "opacity-80")}>
      <div className="flex items-start gap-2">
        <Checkbox
          className="mt-0.5"
          checked={completed}
          disabled={pending}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              completed && "text-slate-500 line-through"
            )}
          >
            {task.title}
          </p>
          <p className="text-xs text-slate-500">
            {metaLine([
              task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("ru-RU")
                : null,
              formatRecurrenceLabel(parseRecurrenceJson(task.recurrence)),
              task.reminderEnabled && task.reminderTime
                ? `push ${task.reminderTime}`
                : null,
            ])}
          </p>
        </div>
      </div>
      <TaskSettingsForm
        taskId={task.id}
        dueDate={task.dueDate}
        recurrence={task.recurrence}
        reminderTime={task.reminderTime}
        reminderEnabled={task.reminderEnabled}
      />
    </Card>
  );
}

export function GoalDetail({
  goal,
  steps,
  looseTasks,
  habits,
  sphereId,
}: {
  goal: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    sphere: { name: string; color: string };
  };
  steps: Step[];
  looseTasks: Task[];
  habits: Habit[];
  sphereId: string;
}) {
  const [pending, startTransition] = useTransition();
  const allTasks = [...looseTasks, ...steps.flatMap((s) => s.tasks)];
  const progress = getGoalProgress(
    allTasks.map((t) => ({ status: t.status as "PENDING" | "COMPLETED" }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/spheres/${sphereId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{goal.title}</h1>
          <p className="text-sm text-slate-500">{goal.sphere.name}</p>
        </div>
      </div>

      {goal.description ? (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">{goal.description}</p>
        </Card>
      ) : null}

      <Card className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Прогресс цели</span>
          <span className="font-semibold text-teal-600">{progress}%</span>
        </div>
        <Progress value={progress} />
      </Card>

      {goal.status === "ACTIVE" ? (
        <Button
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateGoalStatus(goal.id, "COMPLETED");
            })
          }
        >
          Отметить цель выполненной
        </Button>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-semibold">План</h2>
        <p className="text-xs text-slate-500">Этапы на пути к цели</p>
        {steps.map((step) => (
          <Card key={step.id} className="space-y-2">
            <p className="font-medium">{step.title}</p>
            {step.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                pending={pending}
                onToggle={(completed) =>
                  startTransition(async () => {
                    await toggleTask(task.id, completed);
                  })
                }
              />
            ))}
          </Card>
        ))}

        <CollapsibleForm label="Добавить этап">
          <form
            className="flex gap-2"
            action={(formData) => {
              startTransition(async () => {
                await createPlanStep(goal.id, formData.get("stepTitle") as string);
              });
            }}
          >
            <Input name="stepTitle" placeholder="Название этапа" required />
            <Button type="submit" disabled={pending}>
              +
            </Button>
          </form>
        </CollapsibleForm>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Задачи</h2>
        {looseTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            pending={pending}
            onToggle={(completed) =>
              startTransition(async () => {
                await toggleTask(task.id, completed);
              })
            }
          />
        ))}
        <CreateTaskForm goalId={goal.id} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Привычки</h2>
        {habits.map((habit) => (
          <Card key={habit.id} className="space-y-2 py-3 text-sm">
            <div>
              <p className="font-medium">{habit.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {metaLine([
                  formatRecurrenceLabel(parseRecurrenceJson(habit.schedule)),
                  habit.reminderEnabled && habit.reminderTime
                    ? `push ${habit.reminderTime}`
                    : null,
                  habit.endDate
                    ? `до ${new Date(habit.endDate).toLocaleDateString("ru-RU")}`
                    : null,
                ])}
              </p>
            </div>
            <HabitSettingsForm
              habitId={habit.id}
              schedule={habit.schedule}
              reminderTime={habit.reminderTime}
              reminderEnabled={habit.reminderEnabled}
            />
          </Card>
        ))}
        <CreateHabitForm goalId={goal.id} />
      </section>
    </div>
  );
}
