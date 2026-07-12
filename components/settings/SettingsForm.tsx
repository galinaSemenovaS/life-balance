"use client";

import { useTransition } from "react";
import { renameSphere } from "@/actions/spheres";
import { resetLifeBalance } from "@/actions/settings";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useState } from "react";

type Sphere = { id: string; name: string; defaultName: string; color: string };

export function SettingsForm({ spheres }: { spheres: Sphere[] }) {
  const [pending, startTransition] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    startTransition(async () => {
      try {
        await resetLifeBalance();
        toast.success("Данные сброшены");
      } catch {
        toast.error("Ошибка сброса");
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--foreground)]">Внешний вид</h3>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-[var(--foreground)]">Тема</span>
          <ThemeToggle />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--foreground)]">Названия сфер</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {spheres.map((sphere) => (
            <form
              key={sphere.id}
              className="flex items-center gap-3 px-5 py-3"
              action={(formData) => {
                startTransition(async () => {
                  const name = formData.get("name") as string;
                  if (!name.trim()) return;
                  await renameSphere(sphere.id, name.trim());
                  toast.success("Переименовано");
                });
              }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: sphere.color }}
              />
              <input
                name="name"
                defaultValue={sphere.name}
                required
                className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
                placeholder={sphere.defaultName}
              />
              <button
                type="submit"
                disabled={pending}
                className="text-xs text-[var(--accent)] font-semibold shrink-0 disabled:opacity-50"
              >
                OK
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--foreground)]">Аккаунт</h3>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center px-5 py-4 text-sm text-[var(--destructive)] font-medium border-b border-[var(--border)]"
        >
          Выйти из аккаунта
        </button>
        {confirmReset ? (
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-[var(--foreground)]">
              Все данные (оценки, планы, задачи) будут удалены. Продолжить?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={pending}
                className="flex-1 rounded-xl bg-[var(--destructive)] text-white py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                Да, сбросить всё
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm text-[var(--muted)]"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center px-5 py-4 text-sm text-[var(--muted)]"
          >
            Сбросить все данные
          </button>
        )}
      </section>
    </div>
  );
}
