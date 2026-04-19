import { useState } from "react";
import { Dumbbell, BookOpen, Film, Plus, Minus } from "lucide-react";

interface Routine {
  icon: any;
  title: string;
  unit: string;
  goal: number;
}

const ROUTINES: Routine[] = [
  { icon: Dumbbell, title: "GYM", unit: "días / sem", goal: 4 },
  { icon: BookOpen, title: "LEER", unit: "min / día", goal: 30 },
  { icon: Film, title: "CINE", unit: "película / sem", goal: 1 },
];

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

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-5 bg-yellow-50 border-yellow-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base uppercase tracking-wide text-black">
          Rutina
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">
          Hábitos
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {ROUTINES.map(({ icon: Icon, title, unit, goal }) => {
          const current = progress[title] ?? 0;
          const pct = Math.round((current / goal) * 100);
          return (
            <div
              key={title}
              className="flex-1 bg-black rounded-2xl p-3 flex items-center gap-3 group hover:scale-[1.01] transition-transform shadow-sm"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-black" strokeWidth={2.5} />
              </div>

              {/* Title + unit */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black uppercase tracking-wide text-yellow-400 leading-tight">
                  {title}
                </p>
                <p className="text-[10px] font-medium text-white/60 leading-tight truncate">
                  {unit}
                </p>
              </div>

              {/* Big interactive number */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => dec(title)}
                  aria-label="Restar"
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-yellow-400 hover:text-black text-white flex items-center justify-center transition-colors"
                >
                  <Minus size={12} strokeWidth={3} />
                </button>
                <div className="relative px-1 min-w-[3.5rem] text-center">
                  <span className="font-display font-black text-yellow-400 text-3xl leading-none tabular-nums">
                    {current}
                  </span>
                  <span className="text-white/40 font-bold text-sm">/{goal}</span>
                  <div className="mt-1 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => inc(title, goal)}
                  aria-label="Sumar"
                  className="w-6 h-6 rounded-full bg-yellow-400 text-black hover:scale-110 flex items-center justify-center transition-transform"
                >
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoutineSection;
