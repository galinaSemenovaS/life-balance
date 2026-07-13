"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Plus, Check, Trash2, Pencil } from "lucide-react";
import { createTask, deleteTask, toggleTaskStatus, deleteGoal, updateGoal } from "@/actions/goals";
import { CalendarExportModal } from "@/components/tasks/CalendarExportModal";
import { CreateGoalForm } from "@/components/goals/GoalForm";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  status: "PENDING" | "COMPLETED";
};

type Block = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  deadline: Date | null;
  tasks: Task[];
};

type Props = {
  sphereId: string;
  sphereName: string;
  blocks: Block[];
};

function TaskItem({ task, blockTitle, sphereName }: { task: Task; blockTitle: string; sphereName: string }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggle() {
    startTransition(async () => {
      await toggleTaskStatus(task.id, task.status !== "COMPLETED");
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await deleteTask(task.id);
      } catch {
        toast.error("Ошибка удаления");
      }
    });
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <button
        onClick={toggle}
        disabled={pending}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          task.status === "COMPLETED"
            ? "bg-[var(--success)] border-[var(--success)]"
            : "border-[var(--border)] hover:border-[var(--accent)]"
        }`}
      >
        {task.status === "COMPLETED" && <Check className="w-3 h-3 text-white" />}
      </button>
      <span
        className={`flex-1 text-sm min-w-0 ${
          task.status === "COMPLETED"
            ? "line-through text-[var(--muted)]"
            : "text-[var(--foreground)]"
        }`}
      >
        {task.title}
      </span>
      <div className="flex items-center gap-1">
        <CalendarExportModal
          taskTitle={task.title}
          blockTitle={blockTitle}
          sphereName={sphereName}
        />
        {confirmDelete ? (
          <div className="flex gap-1">
            <button onClick={remove} className="text-xs text-[var(--destructive)] font-semibold px-1">✕</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-[var(--muted)] px-1">–</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--destructive)] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function AddTaskInline({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    startTransition(async () => {
      await createTask({ goalId, title: value.trim() });
      setValue("");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors py-1"
      >
        <Plus className="w-3.5 h-3.5" />
        Добавить задачу
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2 mt-1">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Новая задача…"
        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
      />
      <button
        type="submit"
        disabled={pending || !value.trim()}
        className="rounded-xl bg-[var(--accent)] text-white px-3 py-2 text-sm font-semibold disabled:opacity-60"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)]"
      >
        ✕
      </button>
    </form>
  );
}

function BlockCard({ block, sphereId, sphereName }: { block: Block; sphereId: string; sphereName: string }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(block.title);
  const [editDesc, setEditDesc] = useState(block.description ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const doneCount = block.tasks.filter((t) => t.status === "COMPLETED").length;

  function handleSave() {
    startTransition(async () => {
      try {
        await updateGoal(block.id, { title: editTitle, description: editDesc || undefined, status: block.status as "ACTIVE" | "COMPLETED" | "PAUSED" });
        setEditing(false);
        toast.success("Блок обновлён");
      } catch { toast.error("Не удалось сохранить"); }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteGoal(block.id);
        toast.success("Блок удалён");
      } catch { toast.error("Не удалось удалить"); }
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {editing ? (
        <div className="px-4 py-3 space-y-2">
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
            <button onClick={handleSave} disabled={pending} className="flex-1 rounded-xl bg-[var(--accent)] text-white py-2 text-sm font-semibold disabled:opacity-60">
              Сохранить
            </button>
            <button onClick={() => setEditing(false)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]">
              Отмена
            </button>
          </div>
        </div>
      ) : (
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-[var(--foreground)] truncate">
              {block.title}
            </h4>
            {block.tasks.length > 0 && (
              <span className="text-xs text-[var(--muted)] shrink-0">
                {doneCount}/{block.tasks.length}
              </span>
            )}
          </div>
          {block.description && !expanded && (
            <p className="text-xs text-[var(--muted)] truncate mt-0.5">{block.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {confirmDelete ? (
            <div className="flex gap-1 items-center">
              <button onClick={handleDelete} disabled={pending} className="text-xs text-[var(--destructive)] font-semibold px-1">Удалить</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-[var(--muted)] px-1">Отмена</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--destructive)] hover:bg-[var(--background)] transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="p-1">
            {expanded ? <ChevronUp className="w-4 h-4 text-[var(--muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted)]" />}
          </button>
        </div>
      </div>
      )}

      {expanded && (
        <div className="px-4 pb-4">
          {block.description && (
            <p className="text-xs text-[var(--muted)] mb-3">{block.description}</p>
          )}
          {block.tasks.length > 0 && (
            <div className="divide-y divide-[var(--border)]">
              {block.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  blockTitle={block.title}
                  sphereName={sphereName}
                />
              ))}
            </div>
          )}
          <div className="mt-2">
            <AddTaskInline goalId={block.id} />
          </div>
        </div>
      )}
    </div>
  );
}

export function SpherePlanSection({ sphereId, sphereName, blocks }: Props) {
  const [showAddBlock, setShowAddBlock] = useState(false);

  return (
    <div className="space-y-3">
      {blocks.length === 0 && !showAddBlock && (
        <p className="text-sm text-[var(--muted)] text-center py-4">
          Здесь будут блоки вашего плана улучшений
        </p>
      )}

      {blocks.map((block) => (
        <BlockCard
          key={block.id}
          block={block}
          sphereId={sphereId}
          sphereName={sphereName}
        />
      ))}

      {showAddBlock ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <CreateGoalForm sphereId={sphereId} />
          <button
            onClick={() => setShowAddBlock(false)}
            className="mt-2 text-xs text-[var(--muted)] w-full text-center"
          >
            Отмена
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddBlock(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить блок плана
        </button>
      )}
    </div>
  );
}
