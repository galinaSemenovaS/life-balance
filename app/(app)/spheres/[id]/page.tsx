import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCachedSphereScores } from "@/lib/data/queries";
import { getSessionUser } from "@/lib/session";
import { CreateGoalForm } from "@/components/goals/GoalForm";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { interactiveCard } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function SphereDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  const sphere = await prisma.sphere.findFirst({
    where: { id, userId: user.id },
    include: {
      goals: {
        where: { status: { in: ["ACTIVE", "PAUSED"] } },
        orderBy: { createdAt: "desc" },
        include: {
          habits: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!sphere) notFound();

  const scores = await getCachedSphereScores(user.id);
  const score = scores.find((s) => s.sphereId === sphere.id)?.score;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/spheres">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: sphere.color }}
          />
          <div>
            <h1 className="text-xl font-bold">{sphere.name}</h1>
            {score !== undefined && (
              <p className="text-sm text-emerald-600">Оценка: {score}/10</p>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <div>
          <h2 className="font-semibold">Цели</h2>
          <p className="text-xs text-slate-500">
            Сначала цель, затем привычки внутри неё — так всё связано
          </p>
        </div>
        {sphere.goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Пока нет целей"
            description="Создайте первую цель ниже — к ней можно добавить привычки"
          />
        ) : (
          sphere.goals.map((goal) => (
            <Link key={goal.id} href={`/goals/${goal.id}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <Card className={cn("space-y-1 py-3 hover:bg-slate-50 dark:hover:bg-slate-900", interactiveCard)}>
                <p className="font-medium">{goal.title}</p>
                <p className="text-xs text-slate-500">
                  {goal.habits.length}{" "}
                  {goal.habits.length === 1
                    ? "привычка"
                    : goal.habits.length < 5
                      ? "привычки"
                      : "привычек"}
                  · {goal.status === "ACTIVE" ? "активна" : "на паузе"}
                </p>
              </Card>
            </Link>
          ))
        )}
      </section>

      <CreateGoalForm sphereId={sphere.id} />
    </div>
  );
}
