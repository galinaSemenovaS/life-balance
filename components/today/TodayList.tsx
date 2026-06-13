"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleHabitLog } from "@/actions/habits";
import { toggleTask } from "@/actions/goals";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck } from "lucide-react";

type HabitItem = {
  id: string;
  title: string;
  sphereName?: string;
  color?: string;
  completed: boolean;
};

type TaskItem = {
  id: string;
  title: string;
  goalTitle: string;
  completed: boolean;
};

export function TodayList({
  habits: initialHabits,
  tasks: initialTasks,
}: {
  habits: HabitItem[];
  tasks: TaskItem[];
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [tasks, setTasks] = useState(initialTasks);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setHabits(initialHabits);
    setTasks(initialTasks);
  }, [initialHabits, initialTasks]);

  const completed =
    habits.filter((h) => h.completed).length +
    tasks.filter((t) => t.completed).length;
  const total = habits.length + tasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const isEmpty = habits.length === 0 && tasks.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Сегодня</h1>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <Card className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Прогресс дня</span>
          <span className="text-emerald-600">{percent}%</span>
        </div>
        <Progress value={percent} />
        <p className="text-xs text-slate-500">
          {completed} из {total} выполнено
        </p>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={CalendarCheck}
          title="На сегодня пусто"
          description="Добавьте привычки или задачи с дедлайном на сегодня"
        />
      ) : (
        <>
          {habits.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500">Привычки</h2>
              {habits.map((habit) => (
                <Card key={habit.id} className="flex items-center gap-3 py-3">
                  <Checkbox
                    checked={habit.completed}
                    disabled={pending}
                    onCheckedChange={(checked) => {
                      const completed = checked === true;
                      setHabits((prev) =>
                        prev.map((h) =>
                          h.id === habit.id ? { ...h, completed } : h
                        )
                      );
                      startTransition(async () => {
                        try {
                          await toggleHabitLog(habit.id, completed);
                        } catch {
                          setHabits(initialHabits);
                        }
                      });
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{habit.title}</p>
                    {habit.sphereName && (
                      <p className="text-xs text-slate-500">{habit.sphereName}</p>
                    )}
                  </div>
                  {habit.color && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                  )}
                </Card>
              ))}
            </section>
          )}

          {tasks.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500">Задачи</h2>
              {tasks.map((task) => (
                <Card key={task.id} className="flex items-center gap-3 py-3">
                  <Checkbox
                    checked={task.completed}
                    disabled={pending}
                    onCheckedChange={(checked) => {
                      const completed = checked === true;
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === task.id ? { ...t, completed } : t
                        )
                      );
                      startTransition(async () => {
                        try {
                          await toggleTask(task.id, completed);
                        } catch {
                          setTasks(initialTasks);
                        }
                      });
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.goalTitle}</p>
                  </div>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
