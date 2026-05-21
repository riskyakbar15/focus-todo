import Svg, { Circle } from "react-native-svg";

// ─── Konstanta ukuran lingkaran ────────────────────────────────────────────
export const RADIUS = 110;
export const STROKE = 10;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
export const SIZE = (RADIUS + STROKE) * 2;

// ─── Props ─────────────────────────────────────────────────────────────────
interface TimerCircleProps {
  secondsLeft: number;
  totalSeconds: number;
  mode: "focus" | "short_break" | "long_break";
}

// ─── Warna berdasarkan mode ────────────────────────────────────────────────
const ARC_COLORS: Record<TimerCircleProps["mode"], string> = {
  focus: "#534AB7",
  short_break: "#1D9E75",
  long_break: "#185FA5",
};

// ─── Komponen ──────────────────────────────────────────────────────────────
export default function TimerCircle({
  secondsLeft,
  totalSeconds,
  mode,
}: TimerCircleProps) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const arcColor = ARC_COLORS[mode];

  return (
    <Svg width={SIZE} height={SIZE}>
      {/* Track — latar lingkaran */}
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        stroke="#F0EEF8"
        strokeWidth={STROKE}
        fill="none"
      />
      {/* Arc — progres countdown */}
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        stroke={arcColor}
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${SIZE / 2}, ${SIZE / 2}`}
      />
    </Svg>
  );
}
