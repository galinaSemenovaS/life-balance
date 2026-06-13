import { getCachedSpheresPageData } from "@/lib/data/queries";
import { getSessionUser } from "@/lib/session";
import { SphereCard } from "@/components/spheres/SphereCard";
import { ReassessForm } from "@/components/spheres/ReassessForm";
import { PageHeader } from "@/components/ui/page-header";

export default async function SpheresPage() {
  const user = await getSessionUser();
  const { spheres, reassessSpheres } = await getCachedSpheresPageData(user.id);
  const priorityCount = spheres.filter((s) => s.isPriority).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Сферы жизни"
        subtitle={
          priorityCount > 0
            ? `${priorityCount} приоритетных · 8 областей баланса`
            : "8 областей вашего баланса"
        }
      />

      <div className="space-y-3">
        {spheres.map((sphere) => (
          <SphereCard
            key={sphere.id}
            id={sphere.id}
            name={sphere.name}
            color={sphere.color}
            score={sphere.score}
            isPriority={sphere.isPriority}
            goalCount={sphere.goalCount}
            progress={sphere.progress}
          />
        ))}
      </div>

      <ReassessForm spheres={reassessSpheres} />
    </div>
  );
}
