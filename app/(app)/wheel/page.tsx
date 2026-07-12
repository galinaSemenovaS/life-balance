import { requireUser } from "@/lib/session";
import { getCachedWheelData } from "@/lib/data/queries";
import { WheelChart } from "@/components/wheel/WheelChart";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function WheelPage() {
  const user = await requireUser();
  const { sphereScores } = await getCachedWheelData(user.id);

  const avg =
    sphereScores.length > 0
      ? Math.round(
          sphereScores.reduce((s, x) => s + (x.score ?? 0), 0) /
            sphereScores.filter((x) => x.score !== null).length
        )
      : null;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="px-6 pt-12 pb-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--muted)] mb-1">
          Жизненный баланс
        </p>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Колесо баланса
        </h1>
        {avg !== null && (
          <p className="mt-1 text-[var(--muted)] text-sm">
            Средний балл: <span className="font-semibold text-[var(--foreground)]">{avg}</span> из 10
          </p>
        )}
      </div>

      <div className="flex justify-center px-6 py-4">
        <WheelChart sphereScores={sphereScores} size={320} />
      </div>

      <div className="px-6 mt-2 space-y-2">
        {sphereScores.map((sphere) => (
          <Link
            key={sphere.sphereId}
            href={`/spheres/${sphere.sphereId}`}
            className="flex items-center gap-3 bg-[var(--surface)] rounded-2xl px-4 py-3.5 shadow-sm border border-[var(--border)] hover:scale-[1.01] transition-transform duration-200"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: sphere.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--foreground)] text-sm truncate">
                {sphere.name}
              </p>
              {sphere.description && (
                <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                  {sphere.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {sphere.score !== null ? (
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: sphere.color }}
                >
                  {sphere.score}
                </span>
              ) : (
                <span className="text-xs text-[var(--muted)]">—</span>
              )}
              <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
