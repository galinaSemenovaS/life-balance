import { startOfDay, isSameDay } from "date-fns";
import type { Habit, HabitLog, Task } from "@prisma/client";
import { coerceDate } from "@/lib/utils";
import {
  isDueOnDate,
  parseRecurrenceJson,
  type RecurrenceRule,
} from "@/lib/recurrence";

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

export function isHabitDueToday(
  habit: Pick<Habit, "frequency" | "schedule" | "endDate">,
  date: Date | string = new Date()
): boolean {
  const day = coerceDate(date);
  if (habit.endDate && startOfDay(day) > startOfDay(habit.endDate)) return false;
  const rule = habitRecurrence(habit);
  if (rule.endType === "onDate" && rule.endDate) {
    if (startOfDay(day) > startOfDay(new Date(rule.endDate))) return false;
  }
  return isDueOnDate(rule, day);
}

export function isTaskDueToday(
  task: Pick<Task, "dueDate" | "recurrence" | "status">,
  date = new Date()
): boolean {
  return isTaskOnTodayList(task, date);
}

/** Задачи на экране «Сегодня» — включая выполненные за сегодня */
export function isTaskOnTodayList(
  task: Pick<Task, "dueDate" | "recurrence" | "status">,
  date: Date | string = new Date()
): boolean {
  const day = coerceDate(date);
  const rule = parseRecurrenceJson(task.recurrence);
  if (rule.preset === "none") {
    return task.dueDate ? isSameDay(task.dueDate, day) : false;
  }
  return isDueOnDate(rule, day, task.dueDate ?? day);
}

type HabitForProgress = Pick<
  Habit,
  "frequency" | "schedule" | "isActive" | "endDate"
> & {
  logs: Pick<HabitLog, "date" | "completed">[];
};

type TaskForProgress = Pick<Task, "status" | "dueDate" | "recurrence">;

export function getTodayProgress(
  habits: HabitForProgress[],
  tasks: TaskForProgress[],
  today = new Date()
): { completed: number; total: number; percent: number } {
  const dueHabits = habits.filter(
    (h) => h.isActive && isHabitDueToday(h, today)
  );
  const habitDone = dueHabits.filter((h) =>
    h.logs.some((l) => l.completed && isSameDay(l.date, today))
  ).length;

  const todayTasks = tasks.filter((t) => isTaskOnTodayList(t, today));
  const taskDone = todayTasks.filter((t) => t.status === "COMPLETED").length;

  const total = dueHabits.length + todayTasks.length;
  const completed = habitDone + taskDone;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export { formatRecurrenceLabel, parseRecurrenceJson } from "@/lib/recurrence";
