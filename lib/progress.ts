import { startOfDay, subDays, isSameDay } from "date-fns";
import type { Habit, HabitLog, Task } from "@prisma/client";

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
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function getGoalProgress(tasks: Pick<Task, "status">[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "COMPLETED").length;
  return Math.round((done / tasks.length) * 100);
}

export function isHabitDueToday(
  habit: Pick<Habit, "frequency" | "schedule">,
  date = new Date()
): boolean {
  if (habit.frequency === "DAILY") return true;
  if (habit.frequency === "WEEKLY") {
    const schedule = habit.schedule as { days?: number[] } | null;
    const day = date.getDay();
    return schedule?.days?.includes(day) ?? day === 1;
  }
  return true;
}

type HabitForProgress = Pick<Habit, "frequency" | "schedule" | "isActive"> & {
  logs: Pick<HabitLog, "date" | "completed">[];
};

type TaskForProgress = Pick<Task, "status" | "dueDate">;

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

  const todayTasks = tasks.filter(
    (t) => t.dueDate && isSameDay(t.dueDate, today)
  );
  const taskDone = todayTasks.filter((t) => t.status === "COMPLETED").length;

  const total = dueHabits.length + todayTasks.length;
  const completed = habitDone + taskDone;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
