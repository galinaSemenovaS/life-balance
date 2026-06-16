import { getCachedTodayData } from "@/lib/data/queries";
import {
  isHabitDueOnDate,
  isTaskCompletedOnDate,
  isTaskDueOnDate,
} from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { TodayList } from "@/components/today/TodayList";
import { formatRecurrenceLabel, parseRecurrenceJson } from "@/lib/recurrence";
import { startOfDay, subDays } from "date-fns";

function parseSelectedDate(raw?: string): Date {
  const today = startOfDay(new Date());
  if (!raw) return today;
  const parsed = startOfDay(new Date(raw));
  if (Number.isNaN(parsed.getTime())) return today;
  if (parsed > today) return today;
  const oldest = subDays(today, 60);
  if (parsed < oldest) return oldest;
  return parsed;
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getSessionUser();
  const { date: dateParam } = await searchParams;
  const selectedDate = parseSelectedDate(dateParam);
  const dateKey = selectedDate.toISOString();

  const { habits, tasks } = await getCachedTodayData(user.id, dateKey);

  const dueHabits = habits.filter((h) => isHabitDueOnDate(h, selectedDate));
  const dueTasks = tasks.filter((t) => isTaskDueOnDate(t, selectedDate));

  return (
    <TodayList
      selectedDate={dateKey}
      habits={dueHabits.map((h) => ({
        id: h.id,
        title: h.title,
        sphereName: h.sphere?.name,
        goalTitle: h.goal?.title,
        recurrenceLabel: formatRecurrenceLabel(parseRecurrenceJson(h.schedule)),
        color: h.sphere?.color,
        completed: h.logs.some((l) => l.completed),
      }))}
      tasks={dueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        goalTitle: t.goal.title,
        recurrenceLabel: formatRecurrenceLabel(parseRecurrenceJson(t.recurrence)),
        completed: isTaskCompletedOnDate(t, t.logs, selectedDate),
      }))}
    />
  );
}
