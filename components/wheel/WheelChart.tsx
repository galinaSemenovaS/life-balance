"use client";

import { useRouter } from "next/navigation";

type SphereScore = {
  sphereId: string;
  name: string;
  color: string;
  score: number | null;
};

type Props = {
  sphereScores: SphereScore[];
  size?: number;
  interactive?: boolean;
};

const CX = 160;
const CY = 160;
const MAX_R = 120;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const LABEL_R = 142;

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export function WheelChart({ sphereScores, size = 320, interactive = true }: Props) {
  const router = useRouter();
  const count = sphereScores.length;
  if (count === 0) return null;

  const angleStep = 360 / count;

  const gridPaths = GRID_LEVELS.map((level) => {
    const r = MAX_R * level;
    const points = sphereScores.map((_, i) => {
      const { x, y } = polarToXY(i * angleStep, r);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")} Z`;
  });

  const dataPoints = sphereScores.map((s, i) => {
    const r = MAX_R * ((s.score ?? 0) / 10);
    return polarToXY(i * angleStep, r);
  });
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";

  const axisLines = sphereScores.map((_, i) => {
    const end = polarToXY(i * angleStep, MAX_R);
    return { x1: CX, y1: CY, x2: end.x, y2: end.y };
  });

  const nonNull = sphereScores.filter((x) => x.score !== null);
  const avg = nonNull.length > 0
    ? Math.round(nonNull.reduce((s, x) => s + (x.score ?? 0), 0) / nonNull.length)
    : null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      style={{ overflow: "visible" }}
    >
      {gridPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--border)"
          strokeWidth={i === GRID_LEVELS.length - 1 ? 1.5 : 1}
          strokeOpacity={0.7}
        />
      ))}

      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="var(--border)"
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      ))}

      <path
        d={dataPath}
        fill="var(--accent)"
        fillOpacity={0.12}
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {sphereScores.map((s, i) => {
        const r = MAX_R * ((s.score ?? 0) / 10);
        const { x, y } = polarToXY(i * angleStep, r);
        return (
          <circle
            key={s.sphereId}
            cx={x}
            cy={y}
            r={5}
            fill={s.color}
            stroke="var(--surface)"
            strokeWidth={2}
          />
        );
      })}

      {sphereScores.map((s, i) => {
        const angle = i * angleStep;
        const { x, y } = polarToXY(angle, LABEL_R);
        const normalizedAngle = ((angle % 360) + 360) % 360;
        const textAnchor =
          normalizedAngle > 15 && normalizedAngle < 165
            ? "start"
            : normalizedAngle > 195 && normalizedAngle < 345
              ? "end"
              : "middle";

        const sectorCenter = polarToXY(angle, MAX_R * 0.5);

        return (
          <g key={s.sphereId}>
            {interactive && (
              <circle
                cx={sectorCenter.x}
                cy={sectorCenter.y}
                r={MAX_R * 0.42}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/spheres/${s.sphereId}`)}
              />
            )}
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize={9.5}
              fontWeight={600}
              fill="var(--foreground)"
              style={{
                pointerEvents: "none",
                fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
              }}
            >
              {s.name}
            </text>
          </g>
        );
      })}

      <circle
        cx={CX}
        cy={CY}
        r={24}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      <text
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={15}
        fontWeight={700}
        fill="var(--foreground)"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, system-ui" }}
      >
        {avg ?? "—"}
      </text>
    </svg>
  );
}
