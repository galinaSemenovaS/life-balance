"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ScoreHistory = {
  date: string;
  [sphereName: string]: string | number;
};

type HabitStats = {
  name: string;
  rate: number;
};

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ec4899", "#f97316", "#a855f7", "#06b6d4", "#64748b"];

export function AnalyticsCharts({
  scoreHistory,
  sphereNames,
  habitStats,
}: {
  scoreHistory: ScoreHistory[];
  sphereNames: string[];
  habitStats: HabitStats[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>История оценок сфер</CardTitle>
        </CardHeader>
        <CardContent className="h-64 min-w-0">
          {scoreHistory.length === 0 ? (
            <p className="text-sm text-slate-500">Пока нет данных для графика</p>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height={256} minWidth={0}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip />
                {sphereNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Выполнение привычек (7 дней)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 min-w-0">
          {habitStats.length === 0 ? (
            <p className="text-sm text-slate-500">Добавьте привычки для статистики</p>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height={256} minWidth={0}>
              <BarChart data={habitStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}%`, "Выполнено"]} />
                <Bar dataKey="rate" fill="#10b981" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
