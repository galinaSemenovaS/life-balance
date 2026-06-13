import { getCachedTodayData } from "@/lib/data/queries";
import { isHabitDueToday } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { TodayList } from "@/components/today/TodayList";

export default async function TodayPage() {
  const user = await getSessionUser();
  const { habits, tasks, today } = await getCachedTodayData(user.id);

  const dueHabits = habits.filter((h) => isHabitDueToday(h, today));

  return (
    <TodayList
      habits={dueHabits.map((h) => ({
        id: h.id,
        title: h.title,
        sphereName: h.sphere?.name,
        goalTitle: h.goal?.title,
        color: h.sphere?.color,
        completed: h.logs.some((l) => l.completed),
      }))}
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        goalTitle: t.goal.title,
        completed: t.status === "COMPLETED",
      }))}
    />
  );
}
