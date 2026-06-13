import Link from "next/link";
import { getCachedDashboardData } from "@/lib/data/queries";
import { getGoalProgress, getHabitStreak, getTodayProgress, isHabitDueToday, isTaskDueToday } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { WheelChart } from "@/components/wheel/WheelChart";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { interactiveCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Target, Flame } from "lucide-react";
import { isSameDay } from "date-fns";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const { scores, goals, habits, todayTasks, today } =
    await getCachedDashboardData(user.id);

  const wheelData = scores.map((s) => ({
    name: s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name,
    score: s.score,
    color: s.color,
    sphereId: s.sphereId,
  }));

  const dueHabits = habits.filter((h) => isHabitDueToday(h, today));
  const dueTasks = todayTasks.filter((t) => isTaskDueToday(t, today));
  const dayProgress = getTodayProgress(
    dueHabits.map((h) => ({
      ...h,
      logs: h.logs.filter((l) => isSameDay(l.date, today)),
    })),
    dueTasks,
    today
  );

  const priorities = scores.filter((s) => s.isPriority);

  return (
    <div className="space-y-6">
      <PageHeader title="Дашборд" subtitle="Обзор баланса и прогресса" />

      <Card>
        <CardHeader>
          <CardTitle>Колесо баланса</CardTitle>
        </CardHeader>
        <CardContent>
          {wheelData.length > 0 ? (
            <WheelChart data={wheelData} size="md" />
          ) : (
            <EmptyState
              icon={Target}
              title="Колесо пустое"
              description="Пройдите оценку сфер в онбординге"
            />
          )}
        </CardContent>
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Прогресс дня</CardTitle>
          <span className="text-sm font-semibold text-teal-600">
            {dayProgress.percent}%
          </span>
        </div>
        <Progress value={dayProgress.percent} />
      </Card>

      {priorities.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500">Приоритетные сферы</h2>
          {priorities.map((s) => (
            <Link key={s.sphereId} href={`/spheres/${s.sphereId}`} className="block rounded-2xl">
              <Card className={cn("flex items-center justify-between py-3", interactiveCard)}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-medium">{s.name}</span>
                </div>
                <span className="text-teal-600">{s.score}/10</span>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">Активные цели</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/spheres">Все сферы</Link>
          </Button>
        </div>
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Пока нет активных целей"
            description="Создайте цель в любой сфере"
          />
        ) : (
          goals.map((goal) => {
            const progress = getGoalProgress(goal.tasks);
            return (
              <Link key={goal.id} href={`/goals/${goal.id}`} className="block rounded-2xl">
                <Card className={cn("space-y-2 py-3", interactiveCard)}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{goal.title}</p>
                    <span className="text-xs text-slate-500">{goal.sphere.name}</span>
                  </div>
                  <Progress value={progress} indicatorClassName="bg-blue-500" />
                  <p className="text-xs text-slate-500">{progress}% выполнено</p>
                </Card>
              </Link>
            );
          })
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-500">Streak привычек</h2>
        {habits.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="Нет привычек"
            description="Добавьте привычку внутри цели"
          />
        ) : (
          habits.map((habit) => (
            <Card key={habit.id} className="flex items-center justify-between py-3">
              <span>{habit.title}</span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                {getHabitStreak(habit.logs)} дн.
              </span>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
