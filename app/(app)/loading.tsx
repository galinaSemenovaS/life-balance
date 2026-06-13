import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className ?? "h-4"}`}
    />
  );
}

export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonBar className="h-8 w-40" />
        <SkeletonBar className="h-4 w-56" />
      </div>

      <Card className="space-y-3">
        <SkeletonBar className="h-5 w-32" />
        <SkeletonBar className="h-48 w-full rounded-2xl" />
      </Card>

      <Card className="space-y-2">
        <div className="flex justify-between">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-4 w-10" />
        </div>
        <Progress value={0} />
      </Card>

      <div className="space-y-2">
        <SkeletonBar className="h-4 w-24" />
        <Card className="py-4">
          <SkeletonBar className="h-5 w-full" />
        </Card>
        <Card className="py-4">
          <SkeletonBar className="h-5 w-3/4" />
        </Card>
      </div>
    </div>
  );
}
