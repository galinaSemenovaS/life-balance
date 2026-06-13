import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SphereCard({
  id,
  name,
  color,
  score,
  isPriority,
  goalCount,
  progress,
}: {
  id: string;
  name: string;
  color: string;
  score?: number;
  isPriority: boolean;
  goalCount: number;
  progress: number;
}) {
  return (
    <Link href={`/spheres/${id}`}>
      <Card className="space-y-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-medium">{name}</span>
            {isPriority && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                приоритет
              </span>
            )}
          </div>
          {score !== undefined && (
            <span className="text-sm font-semibold text-emerald-600">{score}/10</span>
          )}
        </div>
        <Progress value={progress} indicatorClassName="bg-[var(--sphere-color)]" style={{ ["--sphere-color" as string]: color }} />
        <p className="text-xs text-slate-500">
          {goalCount} {goalCount === 1 ? "цель" : goalCount < 5 ? "цели" : "целей"} · {progress}% прогресс
        </p>
      </Card>
    </Link>
  );
}
