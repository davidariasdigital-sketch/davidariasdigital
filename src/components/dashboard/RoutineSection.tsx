import { Dumbbell, BookOpen, Film } from "lucide-react";

const ROUTINES = [
  { icon: Dumbbell, title: "GYM", detail: "4 días a la semana" },
  { icon: BookOpen, title: "LEER", detail: "30 minutos al día" },
  { icon: Film, title: "CINE", detail: "1 película a la semana" },
];

const RoutineSection = () => {
  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-6 bg-yellow-50 border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm uppercase tracking-wide text-black">
          Rutina
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-black/50">
          Hábitos
        </span>
      </div>
      <div className="space-y-2">
        {ROUTINES.map(({ icon: Icon, title, detail }) => (
          <div
            key={title}
            className="flex items-center gap-3 bg-yellow-100/70 border border-yellow-200 rounded-xl px-3 py-2.5 transition-shadow hover:shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
              <Icon size={15} className="text-yellow-400" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-black leading-tight">
                {title}
              </p>
              <p className="text-[10px] font-medium text-black/60 leading-tight truncate">
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
