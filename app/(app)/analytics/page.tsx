import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { getCachedAnalyticsData } from "@/lib/data/queries";
import { getSessionUser } from "@/lib/session";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  const { assessments, habits, weekAgo, today } =
    await getCachedAnalyticsData(user.id);

  const sphereNames = [
    ...new Set(
      assessments.flatMap((a) => a.scores.map((s) => s.sphere.name))
    ),
  ];

  const scoreHistory: { date: string; [key: string]: string | number }[] =
    assessments.map((a) => {
      const point: { date: string; [key: string]: string | number } = {
        date: format(a.createdAt, "d MMM", { locale: ru }),
      };
      for (const s of a.scores) {
        point[s.sphere.name] = s.score;
      }
      return point;
    });

  const days = eachDayOfInterval({ start: weekAgo, end: today });

  const habitStats = habits.map((habit) => {
    const completedDays = days.filter((day) =>
      habit.logs.some((l) => l.completed && isSameDay(l.date, day))
    ).length;
    return {
      name:
        habit.title.length > 18 ? `${habit.title.slice(0, 18)}…` : habit.title,
      rate: Math.round((completedDays / days.length) * 100),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <p className="text-sm text-slate-500">Динамика баланса и привычек</p>
      </div>
      <AnalyticsCharts
        scoreHistory={scoreHistory}
        sphereNames={sphereNames}
        habitStats={habitStats}
      />
    </div>
  );
}
