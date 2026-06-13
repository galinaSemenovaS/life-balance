import Link from "next/link";
import { getCachedDashboardData } from "@/lib/data/queries";
import { getGoalProgress, getHabitStreak, getTodayProgress, isHabitDueToday, isTaskOnTodayList } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { WheelChart } from "@/components/wheel/WheelChart";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { interactiveCard, sectionLabel } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Target, Flame } from "lucide-react";
import { isSameDay, startOfDay } from "date-fns";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const { scores, goals, habits, todayTasks } =
    await getCachedDashboardData(user.id);
  const today = startOfDay(new Date());

  const wheelData = scores.map((s) => ({
    name: s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name,
    score: s.score,
    color: s.color,
    sphereId: s.sphereId,
  }));

  const dueHabits = habits.filter((h) => isHabitDueToday(h, today));
  const dueTasks = todayTasks.filter((t) => isTaskOnTodayList(t, today));
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
    <div className="space-y-8">
      <PageHeader title="Дашборд" subtitle="Обзор баланса и прогресса" />

      <section className="space-y-3">
        <h2 className={sectionLabel}>Колесо баланса</h2>
        <div className="museum-frame bg-[var(--surface)] p-4">
          {wheelData.length > 0 ? (
            <WheelChart data={wheelData} size="md" hideFooter />
          ) : (
            <EmptyState
              icon={Target}
              title="Колесо пустое"
              description="Пройдите оценку сфер в онбординге"
            />
          )}
        </div>
      </section>

      <div className="space-y-3 border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className={sectionLabel}>Прогресс дня</span>
          <span className="font-display text-2xl tabular-nums">
            {dayProgress.percent}%
          </span>
        </div>
        <Progress value={dayProgress.percent} />
      </div>

      {priorities.length > 0 && (
        <section className="space-y-2">
          <h2 className={sectionLabel}>Приоритетные сферы</h2>
          {priorities.map((s) => (
            <Link key={s.sphereId} href={`/spheres/${s.sphereId}`} className="block">
              <div
                className={cn(
                  interactiveCard,
                  "flex items-center justify-between rounded-sm p-4"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-medium">{s.name}</span>
                </div>
                <span className="font-display tabular-nums">{s.score}/10</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className={sectionLabel}>Активные цели</h2>
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
              <Link key={goal.id} href={`/goals/${goal.id}`} className="block">
                <div className={cn(interactiveCard, "space-y-3 rounded-sm p-4")}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug">{goal.title}</p>
                    <span className="shrink-0 text-xs text-[var(--muted)]">
                      {goal.sphere.name}
                    </span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-[var(--muted)]">{progress}% выполнено</p>
                </div>
              </Link>
            );
          })
        )}
      </section>

      <section className="space-y-2">
        <h2 className={sectionLabel}>Streak привычек</h2>
        {habits.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="Нет привычек"
            description="Добавьте привычку внутри цели"
          />
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <span>{habit.title}</span>
              <span className="border border-[var(--border)] px-2 py-0.5 text-xs font-medium tabular-nums">
                {getHabitStreak(habit.logs)} дн.
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
