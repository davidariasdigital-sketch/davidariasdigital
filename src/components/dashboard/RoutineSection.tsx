import { Dumbbell, BookOpen, Film } from "lucide-react";

const ROUTINES = [
  { icon: Dumbbell, title: "GYM", detail: "4 días a la semana" },
  { icon: BookOpen, title: "LEER", detail: "30 minutos al día" },
  { icon: Film, title: "CINE", detail: "1 película a la semana" },
];

const RoutineSection = () => {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-yellow-400 border border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-black text-black uppercase tracking-wider text-sm">
          Rutina
        </h3>
        <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
          Hábitos
        </span>
      </div>
      <div className="space-y-2">
        {ROUTINES.map(({ icon: Icon, title, detail }) => (
          <div
            key={title}
            className="flex items-center gap-3 bg-black rounded-xl px-3 py-2.5 hover:translate-x-0.5 transition-transform"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-black" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-yellow-400 uppercase tracking-wide leading-tight">
                {title}
              </p>
              <p className="text-[10px] text-white/80 font-medium leading-tight truncate">
                {detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutineSection;
