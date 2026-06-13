import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { interactiveCard } from "@/lib/ui-classes";
import { Sparkles } from "lucide-react";

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
    <Link
      href={`/spheres/${id}`}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <Card
        className={cn(
          "relative overflow-hidden border-l-4 py-3 pl-3.5",
          interactiveCard,
          isPriority && "ring-1 ring-emerald-500/20"
        )}
        style={{ borderLeftColor: color }}
      >
        {isPriority ? (
          <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : null}
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: color }}
            />
            <span className="font-semibold">{name}</span>
            {isPriority ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                приоритет
              </span>
            ) : null}
          </div>
          {score !== undefined ? (
            <span className="text-sm font-bold tabular-nums text-emerald-600">
              {score}/10
            </span>
          ) : null}
        </div>
        <Progress
          value={progress}
          className="mt-3"
          indicatorClassName="bg-[var(--sphere-color)]"
          style={{ ["--sphere-color" as string]: color }}
        />
        <p className="mt-2 text-xs text-slate-500">
          {goalCount}{" "}
          {goalCount === 1 ? "цель" : goalCount < 5 ? "цели" : "целей"} ·{" "}
          {progress}% прогресс
        </p>
      </Card>
    </Link>
  );
}
