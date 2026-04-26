import { BriefcaseBusiness, GraduationCap } from "lucide-react";

const schedules = [
  {
    icon: BriefcaseBusiness,
    title: "Colombina",
    description: "Lun–Jue · 8:00 am – 5:00 pm",
    note: "Vie · 8:00 am – 1:00 pm",
    color: "bg-pink-50 border-pink-200 text-pink-900",
    iconColor: "text-pink-500",
  },
  {
    icon: GraduationCap,
    title: "Inglés",
    description: "Viernes · 5:00 pm – 6:00 pm",
    note: "Solo calendario semanal",
    color: "bg-blue-50 border-blue-200 text-blue-900",
    iconColor: "text-blue-500",
  },
];

const ScheduleSection = () => {
  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base uppercase tracking-wide text-[hsl(var(--dash-text))]">
          Horarios
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">
          Auto
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {schedules.map(({ icon: Icon, title, description, note, color, iconColor }) => (
          <div key={title} className={`${color} border rounded-xl p-3 flex items-start gap-3`}>
            <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-wide leading-none">{title}</p>
              <p className="text-[11px] font-semibold mt-1.5 leading-tight opacity-80">{description}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-1 leading-tight opacity-55">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection;