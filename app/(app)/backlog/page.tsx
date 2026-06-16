import Link from "next/link";
import { getCachedBacklogData } from "@/lib/data/queries";
import { getSessionUser } from "@/lib/session";
import { BacklogList } from "@/components/backlog/BacklogList";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BacklogPage() {
  const user = await getSessionUser();
  const spheres = await getCachedBacklogData(user.id);
  const total = spheres.reduce((n, s) => n + s.tasks.length, 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="h-auto gap-1 px-0" asChild>
        <Link href="/today">
          <ArrowLeft className="h-4 w-4" />
          Сегодня
        </Link>
      </Button>

      <PageHeader
        title="Без срока"
        subtitle={
          total > 0
            ? `${total} ${total === 1 ? "задача" : total < 5 ? "задачи" : "задач"} без даты — по сферам жизни`
            : "Задачи без даты выполнения"
        }
      />

      <BacklogList spheres={spheres} />
    </div>
  );
}
