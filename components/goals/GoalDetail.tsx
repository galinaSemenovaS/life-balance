"use client";

import { useTransition } from "react";
import Link from "next/link";
import { createPlanStep, createTask, toggleTask, updateGoalStatus } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CreateHabitForm } from "@/components/goals/GoalForm";
import { ArrowLeft } from "lucide-react";
import { getGoalProgress } from "@/lib/progress";

type Task = { id: string; title: string; status: string; dueDate: string | null };
type Step = { id: string; title: string; order: number; tasks: Task[] };
type Habit = { id: string; title: string; reminderTime: string | null };

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
  const progress = getGoalProgress(allTasks.map((t) => ({ status: t.status as "PENDING" | "COMPLETED" })));

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

      {goal.description && (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">{goal.description}</p>
        </Card>
      )}

      <Card className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Прогресс цели</span>
          <span className="text-emerald-600">{progress}%</span>
        </div>
        <Progress value={progress} />
      </Card>

      {goal.status === "ACTIVE" && (
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
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">План</h2>
        {steps.map((step) => (
          <Card key={step.id} className="space-y-2">
            <p className="font-medium">{step.title}</p>
            {step.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <Checkbox
                  checked={task.status === "COMPLETED"}
                  disabled={pending}
                  onCheckedChange={(checked) => {
                    startTransition(async () => {
                      await toggleTask(task.id, checked === true);
                    });
                  }}
                />
                <span className="text-sm">{task.title}</span>
              </div>
            ))}
          </Card>
        ))}

        <form
          className="flex gap-2"
          action={(formData) => {
            startTransition(async () => {
              await createPlanStep(goal.id, formData.get("stepTitle") as string);
            });
          }}
        >
          <Input name="stepTitle" placeholder="Новый этап плана" required />
          <Button type="submit" disabled={pending}>
            +
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Задачи</h2>
        {looseTasks.map((task) => (
          <Card key={task.id} className="flex items-center gap-2 py-3">
            <Checkbox
              checked={task.status === "COMPLETED"}
              disabled={pending}
              onCheckedChange={(checked) => {
                startTransition(async () => {
                  await toggleTask(task.id, checked === true);
                });
              }}
            />
            <span className="flex-1 text-sm">{task.title}</span>
          </Card>
        ))}

        <form
          className="flex flex-col gap-2 sm:flex-row"
          action={(formData) => {
            startTransition(async () => {
              await createTask({
                goalId: goal.id,
                title: formData.get("taskTitle") as string,
                dueDate: (formData.get("dueDate") as string) || undefined,
              });
            });
          }}
        >
          <Input name="taskTitle" placeholder="Новая задача" required className="flex-1" />
          <Input name="dueDate" type="date" className="w-full sm:w-auto" />
          <Button type="submit" disabled={pending}>
            Добавить
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Привычки</h2>
          <p className="text-xs text-slate-500">
            Регулярные действия, которые поддерживают эту цель
          </p>
        </div>
        {habits.length === 0 && (
          <Card className="py-3 text-sm text-slate-500">
            Пока нет привычек — добавьте первую ниже
          </Card>
        )}
        {habits.map((habit) => (
          <Card key={habit.id} className="py-3 text-sm">
            {habit.title}
            {habit.reminderTime && (
              <span className="ml-2 text-slate-500">· {habit.reminderTime}</span>
            )}
          </Card>
        ))}
        <CreateHabitForm goalId={goal.id} />
      </section>
    </div>
  );
}
