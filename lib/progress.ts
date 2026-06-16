import { startOfDay, isSameDay } from "date-fns";
import type { Habit, HabitLog, Task } from "@prisma/client";
import { coerceDate } from "@/lib/utils";
import {
  isDueOnDate,
  parseRecurrenceJson,
  type RecurrenceRule,
} from "@/lib/recurrence";

type TaskLogPick = { date: Date | string; completed: boolean };

export function getRecurrenceAnchor(
  item: Pick<Task, "dueDate" | "createdAt">
): Date {
  return startOfDay(item.dueDate ?? item.createdAt);
}

export function getHabitStreak(
  logs: Pick<HabitLog, "date" | "completed">[],
  today = new Date()
): number {
  const completedDates = new Set(
    logs
      .filter((l) => l.completed)
      .map((l) => startOfDay(l.date).getTime())
  );

  let streak = 0;
  let cursor = startOfDay(today);

  while (completedDates.has(cursor.getTime())) {
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }

  return streak;
}

export function getGoalProgress(tasks: Pick<Task, "status">[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "COMPLETED").length;
  return Math.round((done / tasks.length) * 100);
}

function habitRecurrence(habit: Pick<Habit, "frequency" | "schedule">): RecurrenceRule {
  const schedule = habit.schedule as Record<string, unknown> | null;
  if (schedule?.preset) return parseRecurrenceJson(schedule);
  if (habit.frequency === "WEEKLY") {
    return parseRecurrenceJson({
      preset: "weekly",
      daysOfWeek: (schedule?.days as number[]) ?? [1, 2, 3, 4, 5],
    });
  }
  return parseRecurrenceJson({ preset: "daily" });
}

export function isHabitDueOnDate(
  habit: Pick<Habit, "frequency" | "schedule" | "endDate" | "createdAt">,
  date: Date | string
): boolean {
  const day = coerceDate(date);
  if (habit.endDate && startOfDay(day) > startOfDay(habit.endDate)) return false;
  const rule = habitRecurrence(habit);
  if (rule.endType === "onDate" && rule.endDate) {
    if (startOfDay(day) > startOfDay(new Date(rule.endDate))) return false;
  }
  if (rule.preset === "none") return false;
  return isDueOnDate(rule, day, habit.createdAt);
}

/** @deprecated alias */
export function isHabitDueToday(
  habit: Pick<Habit, "frequency" | "schedule" | "endDate" | "createdAt">,
  date: Date | string = new Date()
): boolean {
  return isHabitDueOnDate(habit, date);
}

export function isTaskDueOnDate(
  task: Pick<Task, "dueDate" | "recurrence" | "createdAt">,
  date: Date | string
): boolean {
  const day = coerceDate(date);
  const rule = parseRecurrenceJson(task.recurrence);
  if (rule.preset === "none") {
    return task.dueDate ? isSameDay(task.dueDate, day) : false;
  }
  return isDueOnDate(rule, day, getRecurrenceAnchor(task));
}

export function isTaskCompletedOnDate(
  task: Pick<Task, "dueDate" | "recurrence" | "status" | "createdAt">,
  logs: TaskLogPick[],
  date: Date | string
): boolean {
  const day = startOfDay(coerceDate(date));
  const rule = parseRecurrenceJson(task.recurrence);

  if (rule.preset !== "none") {
    return logs.some(
      (l) => l.completed && startOfDay(l.date).getTime() === day.getTime()
    );
  }

  return task.status === "COMPLETED" && task.dueDate
    ? isSameDay(task.dueDate, day)
    : false;
}

/** Задачи на экране «Сегодня» для выбранной даты */
export function isTaskOnTodayList(
  task: Pick<Task, "dueDate" | "recurrence" | "status" | "createdAt">,
  date: Date | string = new Date()
): boolean {
  return isTaskDueOnDate(task, date);
}

type HabitForProgress = Pick<
  Habit,
  "frequency" | "schedule" | "isActive" | "endDate" | "createdAt"
> & {
  logs: Pick<HabitLog, "date" | "completed">[];
};

type TaskForProgress = Pick<Task, "status" | "dueDate" | "recurrence" | "createdAt"> & {
  logs?: TaskLogPick[];
};

export function getTodayProgress(
  habits: HabitForProgress[],
  tasks: TaskForProgress[],
  today: Date | string = new Date()
): { completed: number; total: number; percent: number } {
  const day = coerceDate(today);
  const dueHabits = habits.filter(
    (h) => h.isActive && isHabitDueOnDate(h, day)
  );
  const habitDone = dueHabits.filter((h) =>
    h.logs.some((l) => l.completed && isSameDay(l.date, day))
  ).length;

  const todayTasks = tasks.filter((t) => isTaskDueOnDate(t, day));
  const taskDone = todayTasks.filter((t) =>
    isTaskCompletedOnDate(t, t.logs ?? [], day)
  ).length;

  const total = dueHabits.length + todayTasks.length;
  const completed = habitDone + taskDone;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export { formatRecurrenceLabel, parseRecurrenceJson } from "@/lib/recurrence";
