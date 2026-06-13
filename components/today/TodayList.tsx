"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleHabitLog } from "@/actions/habits";
import { toggleTask } from "@/actions/goals";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { sectionLabel } from "@/lib/ui-classes";

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

function EditorialRow({
  children,
  completed,
  className,
}: {
  children: React.ReactNode;
  completed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "interactive-surface flex items-start gap-3 border border-[var(--border)] bg-[var(--surface)] p-4",
        completed && "opacity-70",
        className
      )}
    >
      {children}
    </div>
  );
}

function TaskRow({
  task,
  pending,
  onToggle,
}: {
  task: TaskItem;
  pending: boolean;
  onToggle: (completed: boolean) => void;
}) {
  return (
    <EditorialRow completed={task.completed}>
      <Checkbox
        checked={task.completed}
        disabled={pending}
        onCheckedChange={(checked) => onToggle(checked === true)}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium leading-snug",
            task.completed && "text-[var(--muted)] line-through"
          )}
        >
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{task.goalTitle}</p>
        {task.recurrenceLabel && task.recurrenceLabel !== "Не повторяется" ? (
          <p className="mt-0.5 text-xs text-[var(--muted)] opacity-80">
            {task.recurrenceLabel}
          </p>
        ) : null}
      </div>
    </EditorialRow>
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

  const dateLabel = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className={sectionLabel}>{dateLabel}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Сегодня</h1>
        <div className="h-px w-12 bg-[var(--accent)]" aria-hidden />
      </header>

      <div className="space-y-3 border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className={sectionLabel}>Прогресс дня</span>
          <span className="font-display text-2xl tabular-nums">{percent}%</span>
        </div>
        <Progress value={percent} />
        <p className="text-xs text-[var(--muted)]">
          {completed} из {total} выполнено
        </p>
      </div>

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
              <h2 className={sectionLabel}>Привычки</h2>
              {habits.map((habit) => (
                <EditorialRow key={habit.id} completed={habit.completed}>
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
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-medium leading-snug",
                        habit.completed && "text-[var(--muted)] line-through"
                      )}
                    >
                      {habit.title}
                    </p>
                    {habit.goalTitle && (
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        Цель: {habit.goalTitle}
                      </p>
                    )}
                    {habit.recurrenceLabel &&
                    habit.recurrenceLabel !== "Не повторяется" ? (
                      <p className="mt-0.5 text-xs text-[var(--muted)] opacity-80">
                        {habit.recurrenceLabel}
                      </p>
                    ) : null}
                  </div>
                  {habit.color && (
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                  )}
                </EditorialRow>
              ))}
            </section>
          )}

          {tasks.length > 0 && (
            <section className="space-y-2">
              <h2 className={sectionLabel}>Задачи</h2>
              {pendingTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  pending={pending}
                  onToggle={(completed) => toggleTaskItem(task.id, completed)}
                />
              ))}
              {completedTasks.length > 0 && (
                <div className="space-y-2 pt-3">
                  <p className={sectionLabel}>Выполнено</p>
                  {completedTasks.map((task) => (
                    <TaskRow
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
