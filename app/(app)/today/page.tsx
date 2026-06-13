import { getCachedTodayData } from "@/lib/data/queries";
import { isHabitDueToday, isTaskOnTodayList } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { TodayList } from "@/components/today/TodayList";
import { formatRecurrenceLabel, parseRecurrenceJson } from "@/lib/recurrence";
import { startOfDay } from "date-fns";

export default async function TodayPage() {
  const user = await getSessionUser();
  const { habits, tasks } = await getCachedTodayData(user.id);
  const today = startOfDay(new Date());

  const dueHabits = habits.filter((h) => isHabitDueToday(h, today));
  const dueTasks = tasks.filter((t) => isTaskOnTodayList(t, today));

  return (
    <TodayList
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
        completed: t.status === "COMPLETED",
      }))}
    />
  );
}
