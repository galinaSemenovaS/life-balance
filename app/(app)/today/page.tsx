import { getCachedTodayData } from "@/lib/data/queries";
import {
  isHabitDueOnDate,
  isRecurringTask,
  isTaskBacklog,
  isTaskCompletedOnDate,
  isTaskDueOnDate,
  isTaskOverdue,
} from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { TodayList } from "@/components/today/TodayList";
import { formatRecurrenceLabel, parseRecurrenceJson } from "@/lib/recurrence";
import { parseDateKey, toDateKey } from "@/lib/date-key";
import { isSameDay, startOfDay, subDays } from "date-fns";

function parseSelectedDate(raw?: string): Date {
  const today = startOfDay(new Date());
  const parsed = parseDateKey(raw);
  if (!parsed) return today;
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
  const dateKey = toDateKey(selectedDate);
  const today = startOfDay(new Date());
  const isTodayView = isSameDay(selectedDate, today);

  const { habits, tasks } = await getCachedTodayData(user.id, dateKey);

  const dueHabits = habits.filter((h) => isHabitDueOnDate(h, selectedDate));

  const overdueTasks = isTodayView
    ? tasks.filter((t) => isTaskOverdue(t, t.logs, today))
    : [];

  const dueTasks = tasks.filter((t) => {
    if (isTodayView && isTaskOverdue(t, t.logs, today)) return false;
    return isTaskDueOnDate(t, selectedDate);
  });

  const backlogCount = isTodayView
    ? tasks.filter((t) => isTaskBacklog(t)).length
    : 0;

  return (
    <TodayList
      selectedDate={dateKey}
      backlogCount={backlogCount}
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
      overdueTasks={overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        goalTitle: t.goal.title,
        recurrenceLabel: formatRecurrenceLabel(parseRecurrenceJson(t.recurrence)),
        overdueDate: t.dueDate!.toISOString(),
        isRecurring: isRecurringTask(t),
      }))}
    />
  );
}
