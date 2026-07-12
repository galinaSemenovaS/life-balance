import { cn } from "@/lib/utils";

const SEGMENTS = [
  "#30D158",
  "#FF9F0A",
  "#FF6B6B",
  "#007AFF",
  "#BF5AF2",
  "#5AC8FA",
  "#FF9500",
  "#64D2FF",
];

type AppLogoProps = {
  size?: number;
  className?: string;
  withBackground?: boolean;
};

export function AppLogo({ size = 80, className, withBackground = false }: AppLogoProps) {
  const cx = 48;
  const cy = 48;
  const outerR = 40;
  const innerR = 12;
  const count = SEGMENTS.length;
  const gap = 0.06;

  const wedges = SEGMENTS.map((fill, index) => {
    const start = (index / count) * Math.PI * 2 - Math.PI / 2 + gap;
    const end = ((index + 1) / count) * Math.PI * 2 - Math.PI / 2 - gap;
    const x1 = cx + outerR * Math.cos(start);
    const y1 = cy + outerR * Math.sin(start);
    const x2 = cx + outerR * Math.cos(end);
    const y2 = cy + outerR * Math.sin(end);
    const x3 = cx + innerR * Math.cos(end);
    const y3 = cy + innerR * Math.sin(end);
    const x4 = cx + innerR * Math.cos(start);
    const y4 = cy + innerR * Math.sin(start);
    const largeArc = end - start > Math.PI ? 1 : 0;

    return (
      <path
        key={index}
        d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`}
        fill={fill}
      />
    );
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label="Life Balance"
      className={cn("shrink-0", className)}
    >
      {withBackground ? (
        <rect width="96" height="96" rx="22" fill="#F5F5F7" />
      ) : null}
      {wedges}
      <circle cx={cx} cy={cy} r={6} fill="white" opacity="0.9" />
    </svg>
  );
}
