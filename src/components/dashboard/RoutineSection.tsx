import { useState } from "react";
import { Dumbbell, BookOpen, Film, Plus, Minus, Check } from "lucide-react";

interface Routine {
  icon: any;
  title: string;
  unit: string;
  goal: number;
  type: "counter" | "check";
}

const ROUTINES: Routine[] = [
  { icon: Dumbbell, title: "GYM", unit: "días / sem", goal: 4, type: "counter" },
  { icon: BookOpen, title: "LEER", unit: "30 min / día", goal: 1, type: "check" },
  { icon: Film, title: "CINE", unit: "película / sem", goal: 1, type: "counter" },
];

interface ProgressRingProps {
  value: number;
  goal: number;
}

const ProgressRing = ({ value, goal }: ProgressRingProps) => {
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / goal);
  const offset = circumference * (1 - pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(270 60% 90%)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(270 70% 45%)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display font-extrabold text-black text-lg tabular-nums">
          {value}
        </span>
        <span className="text-[8px] font-bold text-black/50 tabular-nums">
          / {goal}
        </span>
      </div>
    </div>
  );
};

interface CheckCircleProps {
  done: boolean;
  onToggle: () => void;
}

const CheckCircle = ({ done, onToggle }: CheckCircleProps) => (
  <button
    onClick={onToggle}
    aria-label={done ? "Desmarcar" : "Marcar como hecho"}
    className={`relative shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
      done
        ? "bg-purple-600 text-white scale-100"
        : "bg-purple-100 border-2 border-dashed border-purple-300 text-purple-400 hover:border-purple-500 hover:text-purple-600"
    }`}
  >
    <Check size={done ? 30 : 24} strokeWidth={3} className="transition-all" />
  </button>
);

const RoutineSection = () => {
  const [progress, setProgress] = useState<Record<string, number>>({
    GYM: 0,
    LEER: 0,
    CINE: 0,
  });

  const inc = (key: string, max: number) =>
    setProgress((p) => ({ ...p, [key]: Math.min(max, (p[key] ?? 0) + 1) }));
  const dec = (key: string) =>
    setProgress((p) => ({ ...p, [key]: Math.max(0, (p[key] ?? 0) - 1) }));
  const toggle = (key: string) =>
    setProgress((p) => ({ ...p, [key]: (p[key] ?? 0) > 0 ? 0 : 1 }));

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-5 bg-purple-50 border-purple-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base uppercase tracking-wide text-black">
          Rutina
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">
          Hábitos
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {ROUTINES.map(({ icon: Icon, title, unit, goal, type }) => {
          const current = progress[title] ?? 0;
          const done = current > 0;
          return (
            <div
              key={title}
              className="flex-1 bg-white border border-purple-200 rounded-2xl p-3 flex items-center gap-3 transition-shadow hover:shadow-md"
            >
              {type === "check" ? (
                <CheckCircle done={done} onToggle={() => toggle(title)} />
              ) : (
                <ProgressRing value={current} goal={goal} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon size={14} className="text-black shrink-0" strokeWidth={2.5} />
                  <p className="text-sm font-extrabold uppercase tracking-wide text-black leading-none">
                    {title}
                  </p>
                </div>
                <p className="text-[11px] font-medium text-black/60 leading-tight truncate">
                  {unit}
                </p>
              </div>

              {type === "counter" && (
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => inc(title, goal)}
                    aria-label="Sumar"
                    className="w-7 h-7 rounded-full bg-purple-600 text-white hover:scale-110 flex items-center justify-center transition-transform"
                  >
                    <Plus size={13} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => dec(title)}
                    aria-label="Restar"
                    className="w-7 h-7 rounded-full bg-purple-200 text-purple-700 hover:bg-purple-300 flex items-center justify-center transition-colors"
                  >
                    <Minus size={13} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoutineSection;
