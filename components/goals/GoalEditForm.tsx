"use client";

import { useState, useTransition } from "react";
import { deleteGoal, updateGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Pencil, Trash2, X, Check } from "lucide-react";

type Props = {
  goalId: string;
  sphereId: string;
  title: string;
  description: string | null;
  status: string;
};

export function GoalEditForm({ goalId, sphereId, title, description, status }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description ?? "");
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    startTransition(async () => {
      try {
        await updateGoal(goalId, {
          title: editTitle,
          description: editDesc || undefined,
          status: status as "ACTIVE" | "COMPLETED" | "PAUSED",
        });
        setEditing(false);
        toast.success("Блок обновлён");
      } catch {
        toast.error("Не удалось сохранить");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteGoal(goalId);
        toast.success("Блок удалён");
      } catch {
        toast.error("Не удалось удалить");
      }
    });
  }

  if (editing) {
    return (
      <div className="space-y-2 py-2">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Описание…"
          rows={2}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={pending}
            className="flex-1 rounded-xl bg-[var(--accent)] text-white py-2 text-sm font-semibold disabled:opacity-60"
          >
            <Check className="w-4 h-4 inline mr-1" />
            Сохранить
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setEditing(true)}
        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      {confirmDelete ? (
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDelete}
            disabled={pending}
            className="text-xs text-[var(--destructive)] font-semibold"
          >
            Удалить
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-[var(--muted)]"
          >
            Отмена
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--destructive)] hover:bg-[var(--background)] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
