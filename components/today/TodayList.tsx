"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleHabitLog } from "@/actions/habits";
import { dismissOverdueTask, toggleTask } from "@/actions/goals";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { sectionLabel } from "@/lib/ui-classes";
import { addDays, format, isSameDay, startOfDay, subDays } from "date-fns";
import { ru } from "date-fns/locale";

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

type OverdueTaskItem = {
  id: string;
  title: string;
  goalTitle: string;
  recurrenceLabel?: string;
  overdueDate: string;
  isRecurring: boolean;
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

function OverdueTaskRow({
  task,
  pending,
  onComplete,
  onDismiss,
}: {
  task: OverdueTaskItem;
  pending: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}) {
  const overdueLabel = format(
    startOfDay(new Date(task.overdueDate)),
    "d MMM",
    { locale: ru }
  );

  return (
    <div className="border border-[var(--destructive)] border-l-[3px] bg-[color-mix(in_srgb,var(--destructive)_6%,var(--surface))] p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          className="mt-0.5"
          checked={false}
          disabled={pending}
          onCheckedChange={(checked) => {
            if (checked) onComplete();
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{task.title}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{task.goalTitle}</p>
          <p className="mt-1 text-xs text-[var(--destructive)]">
            Просрочено с {overdueLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          disabled={pending}
          onClick={onComplete}
        >
          Выполнить
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={pending}
          onClick={onDismiss}
        >
          {task.isRecurring ? "Пропустить" : "Удалить"}
        </Button>
      </div>
    </div>
  );
}

export function TodayList({
  selectedDate,
  habits: initialHabits,
  tasks: initialTasks,
  overdueTasks: initialOverdueTasks = [],
  backlogCount = 0,
}: {
  selectedDate: string;
  habits: HabitItem[];
  tasks: TaskItem[];
  overdueTasks?: OverdueTaskItem[];
  backlogCount?: number;
}) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [tasks, setTasks] = useState(initialTasks);
  const [overdueTasks, setOverdueTasks] = useState(initialOverdueTasks);
  const [pending, startTransition] = useTransition();

  const day = startOfDay(new Date(selectedDate));
  const today = startOfDay(new Date());
  const isToday = isSameDay(day, today);
  const canGoForward = !isToday;
  const canGoBack = day > subDays(today, 60);

  useEffect(() => {
    setHabits(initialHabits);
    setTasks(initialTasks);
    setOverdueTasks(initialOverdueTasks);
  }, [initialHabits, initialTasks, initialOverdueTasks, selectedDate]);

  const navigateDay = (target: Date) => {
    const key = startOfDay(target).toISOString().slice(0, 10);
    router.push(`/today?date=${key}`);
  };

  const completed =
    habits.filter((h) => h.completed).length +
    tasks.filter((t) => t.completed).length;
  const total = habits.length + tasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const isEmpty =
    habits.length === 0 && tasks.length === 0 && overdueTasks.length === 0;

  const dateISO = day.toISOString();

  const toggleTaskItem = (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
    );
    startTransition(async () => {
      try {
        await toggleTask(taskId, completed, dateISO);
        router.refresh();
      } catch {
        setTasks(initialTasks);
      }
    });
  };

  const dateLabel = format(day, "EEEE, d MMMM", { locale: ru });

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canGoBack}
            onClick={() => navigateDay(subDays(day, 1))}
            aria-label="Предыдущий день"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className={cn(sectionLabel, "text-center")}>{dateLabel}</p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canGoForward}
            onClick={() => navigateDay(addDays(day, 1))}
            aria-label="Следующий день"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {isToday ? "Сегодня" : format(day, "d MMMM", { locale: ru })}
        </h1>
        {!isToday ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-[var(--muted)]"
            onClick={() => router.push("/today")}
          >
            Вернуться к сегодня
          </Button>
        ) : null}
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

      {isToday && backlogCount > 0 ? (
        <Link
          href="/backlog"
          className="interactive-surface flex items-center gap-3 border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--background)]">
            <Inbox className="h-4 w-4 text-[var(--muted)]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Без срока</p>
            <p className="text-xs text-[var(--muted)]">
              {backlogCount}{" "}
              {backlogCount === 1
                ? "задача"
                : backlogCount < 5
                  ? "задачи"
                  : "задач"}{" "}
              — по сферам
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
        </Link>
      ) : null}

      {isEmpty ? (
        <EmptyState
          icon={CalendarCheck}
          title={isToday ? "На сегодня пусто" : "На этот день пусто"}
          description="Создайте цель и добавьте к ней привычки — они появятся в нужный день"
        />
      ) : (
        <>
          {isToday && overdueTasks.length > 0 && (
            <section className="space-y-2">
              <div>
                <h2 className={sectionLabel}>Просрочено</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Невыполненные задачи с прошлых дат — закройте или пропустите
                </p>
              </div>
              {overdueTasks.map((task) => (
                <OverdueTaskRow
                  key={`${task.id}-${task.overdueDate}`}
                  task={task}
                  pending={pending}
                  onComplete={() => {
                    startTransition(async () => {
                      try {
                        await toggleTask(task.id, true, task.overdueDate);
                        router.refresh();
                      } catch {
                        setOverdueTasks(initialOverdueTasks);
                      }
                    });
                  }}
                  onDismiss={() => {
                    startTransition(async () => {
                      try {
                        await dismissOverdueTask(task.id);
                        setOverdueTasks((prev) =>
                          prev.filter((t) => t.id !== task.id)
                        );
                        router.refresh();
                      } catch {
                        setOverdueTasks(initialOverdueTasks);
                      }
                    });
                  }}
                />
              ))}
            </section>
          )}

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
                          await toggleHabitLog(habit.id, completed, dateISO);
                          router.refresh();
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
