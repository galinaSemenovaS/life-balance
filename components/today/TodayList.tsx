"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleHabitLog } from "@/actions/habits";
import { toggleTask } from "@/actions/goals";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type HabitItem = {
  id: string;
  title: string;
  sphereName?: string;
  goalTitle?: string;
  recurrenceLabel?: string;
  color?: string;
  completed: boolean;
};

type TaskItem = {
  id: string;
  title: string;
  goalTitle: string;
  recurrenceLabel?: string;
  completed: boolean;
};

function TaskCard({
  task,
  pending,
  onToggle,
}: {
  task: TaskItem;
  pending: boolean;
  onToggle: (completed: boolean) => void;
}) {
  return (
    <Card
      className={cn(
        "flex items-center gap-3 py-3",
        task.completed && "opacity-75"
      )}
    >
      <Checkbox
        checked={task.completed}
        disabled={pending}
        onCheckedChange={(checked) => onToggle(checked === true)}
      />
      <div className="flex-1">
        <p
          className={cn(
            "font-medium",
            task.completed && "text-slate-500 line-through"
          )}
        >
          {task.title}
        </p>
        <p className="text-xs text-slate-500">{task.goalTitle}</p>
        {task.recurrenceLabel && task.recurrenceLabel !== "Не повторяется" ? (
          <p className="text-xs text-slate-400">{task.recurrenceLabel}</p>
        ) : null}
      </div>
    </Card>
  );
}

export function TodayList({
  habits: initialHabits,
  tasks: initialTasks,
}: {
  habits: HabitItem[];
  tasks: TaskItem[];
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [tasks, setTasks] = useState(initialTasks);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setHabits(initialHabits);
    setTasks(initialTasks);
  }, [initialHabits, initialTasks]);

  const completed =
    habits.filter((h) => h.completed).length +
    tasks.filter((t) => t.completed).length;
  const total = habits.length + tasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const isEmpty = habits.length === 0 && tasks.length === 0;

  const toggleTaskItem = (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
    );
    startTransition(async () => {
      try {
        await toggleTask(taskId, completed);
      } catch {
        setTasks(initialTasks);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-teal-300 dark:to-cyan-300">
          Сегодня
        </h1>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <Card className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Прогресс дня</span>
          <span className="text-sm font-semibold text-teal-600">{percent}%</span>
        </div>
        <Progress value={percent} />
        <p className="text-xs text-slate-500">
          {completed} из {total} выполнено
        </p>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={CalendarCheck}
          title="На сегодня пусто"
          description="Создайте цель и добавьте к ней привычки — они появятся здесь"
        />
      ) : (
        <>
          {habits.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500">Привычки</h2>
              {habits.map((habit) => (
                <Card key={habit.id} className="flex items-center gap-3 py-3">
                  <Checkbox
                    checked={habit.completed}
                    disabled={pending}
                    onCheckedChange={(checked) => {
                      const completed = checked === true;
                      setHabits((prev) =>
                        prev.map((h) =>
                          h.id === habit.id ? { ...h, completed } : h
                        )
                      );
                      startTransition(async () => {
                        try {
                          await toggleHabitLog(habit.id, completed);
                        } catch {
                          setHabits(initialHabits);
                        }
                      });
                    }}
                  />
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-medium",
                        habit.completed && "text-slate-500 line-through"
                      )}
                    >
                      {habit.title}
                    </p>
                    {habit.goalTitle && (
                      <p className="text-xs text-slate-500">Цель: {habit.goalTitle}</p>
                    )}
                    {habit.recurrenceLabel &&
                    habit.recurrenceLabel !== "Не повторяется" ? (
                      <p className="text-xs text-slate-400">{habit.recurrenceLabel}</p>
                    ) : null}
                  </div>
                  {habit.color && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                  )}
                </Card>
              ))}
            </section>
          )}

          {tasks.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500">Задачи</h2>
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  pending={pending}
                  onToggle={(completed) => toggleTaskItem(task.id, completed)}
                />
              ))}
              {completedTasks.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-slate-400">Выполнено</p>
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      pending={pending}
                      onToggle={(completed) => toggleTaskItem(task.id, completed)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
