import { getCachedSpheresPageData } from "@/lib/data/queries";
import { getSessionUser } from "@/lib/session";
import { SphereCard } from "@/components/spheres/SphereCard";
import { ReassessForm } from "@/components/spheres/ReassessForm";

export default async function SpheresPage() {
  const user = await getSessionUser();
  const { spheres, reassessSpheres } = await getCachedSpheresPageData(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Сферы жизни</h1>
        <p className="text-sm text-slate-500">8 областей вашего баланса</p>
      </div>

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
