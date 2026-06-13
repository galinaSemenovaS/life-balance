import { cn } from "@/lib/utils";

const SEGMENTS = [
  "#0d9488",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#0f766e",
  "#115e59",
  "#134e4a",
  "#0f766e",
];

type AppLogoProps = {
  size?: number;
  className?: string;
};

/** Круглое колесо баланса без белого фона */
export function AppLogo({ size = 80, className }: AppLogoProps) {
  const cx = 48;
  const cy = 48;
  const outerR = 40;
  const innerR = 10;
  const count = SEGMENTS.length;

  const wedges = SEGMENTS.map((fill, index) => {
    const start = (index / count) * Math.PI * 2 - Math.PI / 2;
    const end = ((index + 1) / count) * Math.PI * 2 - Math.PI / 2;
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
        key={fill + index}
        d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`}
        fill={fill}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
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
      {wedges}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity="0.9"
      />
    </svg>
  );
}
