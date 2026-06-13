import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCachedSphereScores } from "@/lib/data/queries";
import { getSessionUser } from "@/lib/session";
import { CreateGoalForm, CreateHabitForm } from "@/components/goals/GoalForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      },
      habits: { where: { isActive: true, goalId: null } },
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
        <h2 className="font-semibold">Цели</h2>
        {sphere.goals.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">Пока нет целей в этой сфере</p>
          </Card>
        ) : (
          sphere.goals.map((goal) => (
            <Link key={goal.id} href={`/goals/${goal.id}`}>
              <Card className="py-3 hover:bg-slate-50 dark:hover:bg-slate-900">
                <p className="font-medium">{goal.title}</p>
                <p className="text-xs text-slate-500">{goal.status}</p>
              </Card>
            </Link>
          ))
        )}
      </section>

      <CreateGoalForm sphereId={sphere.id} />
      <CreateHabitForm sphereId={sphere.id} />
    </div>
  );
}
