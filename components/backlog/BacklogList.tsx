"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toggleTask } from "@/actions/goals";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { sectionLabel } from "@/lib/ui-classes";
import { Inbox, Sparkles } from "lucide-react";

type BacklogTask = {
  id: string;
  title: string;
  goalId: string;
  goalTitle: string;
};

type BacklogSphere = {
  id: string;
  name: string;
  color: string;
  isPriority: boolean;
  tasks: BacklogTask[];
};

function BacklogTaskRow({
  task,
  pending,
  onToggle,
}: {
  task: BacklogTask;
  pending: boolean;
  onToggle: (completed: boolean) => void;
}) {
  return (
    <div className="interactive-surface flex items-start gap-3 border border-[var(--border)] bg-[var(--surface)] p-4">
      <Checkbox
        className="mt-0.5"
        checked={false}
        disabled={pending}
        onCheckedChange={(checked) => {
          if (checked) onToggle(true);
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{task.title}</p>
        <Link
          href={`/goals/${task.goalId}`}
          className="mt-0.5 inline-block text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
        >
          {task.goalTitle}
        </Link>
      </div>
    </div>
  );
}

export function BacklogList({ spheres }: { spheres: BacklogSphere[] }) {
  const router = useRouter();
  const [items, setItems] = useState(spheres);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(spheres);
  }, [spheres]);

  const total = items.reduce((n, s) => n + s.tasks.length, 0);

  const completeTask = (sphereId: string, taskId: string) => {
    setItems((prev) =>
      prev
        .map((s) =>
          s.id === sphereId
            ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
            : s
        )
        .filter((s) => s.tasks.length > 0)
    );
    startTransition(async () => {
      try {
        await toggleTask(taskId, true);
        router.refresh();
      } catch {
        setItems(spheres);
      }
    });
  };

  if (total === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Всё с датой"
        description="Задачи без срока появятся здесь — добавьте их в цели и оставьте поле даты пустым"
      />
    );
  }

  return (
    <div className="space-y-8">
      {items.map((sphere) => (
        <section key={sphere.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: sphere.color }}
            />
            <h2 className={cn(sectionLabel, "mb-0")}>{sphere.name}</h2>
            {sphere.isPriority ? (
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            ) : null}
            <span className="text-xs tabular-nums text-[var(--muted)]">
              {sphere.tasks.length}
            </span>
          </div>
          {sphere.tasks.map((task) => (
            <BacklogTaskRow
              key={task.id}
              task={task}
              pending={pending}
              onToggle={() => completeTask(sphere.id, task.id)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
