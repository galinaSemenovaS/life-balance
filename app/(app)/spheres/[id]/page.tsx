import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getCachedSphereDetailData } from "@/lib/data/queries";
import { SphereAssessForm } from "@/components/spheres/SphereAssessForm";
import { SphereJournal } from "@/components/spheres/SphereJournal";
import { SpherePlanSection } from "@/components/spheres/SpherePlanSection";
import { ArrowLeft } from "lucide-react";

export default async function SphereDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const data = await getCachedSphereDetailData(user.id, id);
  if (!data) notFound();

  const { sphere, journal, blocks } = data;
  const currentScore = journal[0]?.score ?? null;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="px-6 pt-10 pb-6">
        <Link
          href="/wheel"
          className="flex items-center gap-2 text-[var(--muted)] text-sm mb-6 hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Колесо баланса
        </Link>

        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: sphere.color }}
          />
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {sphere.name}
          </h1>
          {currentScore !== null && (
            <span
              className="ml-auto text-2xl font-bold tabular-nums"
              style={{ color: sphere.color }}
            >
              {currentScore}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 space-y-8">
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--muted)] mb-4">
            Текущее состояние
          </h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <SphereAssessForm sphereId={sphere.id} currentScore={currentScore} />
          </div>
        </section>

        {journal.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--muted)] mb-4">
              История
            </h2>
            <SphereJournal entries={journal} sphereColor={sphere.color} />
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--muted)] mb-4">
            План улучшений
          </h2>
          <SpherePlanSection
            sphereId={sphere.id}
            sphereName={sphere.name}
            blocks={blocks}
          />
        </section>
      </div>
    </div>
  );
}
