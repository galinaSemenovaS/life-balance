"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleTask } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  CreateHabitForm,
  CreateTaskForm,
} from "@/components/goals/GoalForm";
import { GoalEditForm } from "@/components/goals/GoalEditForm";
import { HabitSettingsForm } from "@/components/goals/HabitSettingsForm";
import { TaskSettingsForm } from "@/components/goals/TaskSettingsForm";
import { formatRecurrenceLabel, parseRecurrenceJson } from "@/lib/recurrence";
import { sectionLabel } from "@/lib/ui-classes";
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
type Habit = {
  id: string;
  title: string;
  description: string | null;
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
              completed && "text-[var(--muted)] line-through"
            )}
          >
            {task.title}
          </p>
          <p className="text-xs text-[var(--muted)]">
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
        title={task.title}
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
  tasks,
  habits,
  sphereId,
}: {
  goal: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    deadline: string | null;
    sphere: { name: string; color: string };
  };
  tasks: Task[];
  habits: Habit[];
  sphereId: string;
}) {
  const [pending, startTransition] = useTransition();
  const progress = getGoalProgress(
    tasks.map((t) => ({ status: t.status as "PENDING" | "COMPLETED" }))
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
          <h1 className="font-display text-xl font-semibold">{goal.title}</h1>
          <p className="text-sm text-[var(--muted)]">{goal.sphere.name}</p>
        </div>
      </div>

      {goal.description ? (
        <Card>
          <p className="text-sm text-[var(--muted)]">{goal.description}</p>
        </Card>
      ) : null}

      <Card className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Прогресс цели</span>
          <span className="font-display tabular-nums">{progress}%</span>
        </div>
        <Progress value={progress} />
      </Card>

      <GoalEditForm
        goalId={goal.id}
        sphereId={sphereId}
        title={goal.title}
        description={goal.description}
        deadline={goal.deadline}
        status={goal.status}
      />

      <section className="space-y-3">
        <h2 className={sectionLabel}>Задачи</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Пока нет задач</p>
        ) : (
          tasks.map((task) => (
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
          ))
        )}
        <CreateTaskForm goalId={goal.id} />
      </section>

      <section className="space-y-3">
        <h2 className={sectionLabel}>Привычки</h2>
        {habits.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Пока нет привычек</p>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id} className="space-y-2 py-3 text-sm">
              <div>
                <p className="font-medium">{habit.title}</p>
                {habit.description ? (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {habit.description}
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs text-[var(--muted)]">
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
                title={habit.title}
                description={habit.description}
                schedule={habit.schedule}
                reminderTime={habit.reminderTime}
                reminderEnabled={habit.reminderEnabled}
              />
            </Card>
          ))
        )}
        <CreateHabitForm goalId={goal.id} />
      </section>
    </div>
  );
}
