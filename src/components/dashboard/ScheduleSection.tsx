import { BriefcaseBusiness, GraduationCap } from "lucide-react";
import { ScheduleColor } from "@/lib/scheduled-events";

const schedules = [
  {
    key: "colombina",
    icon: BriefcaseBusiness,
    title: "Colombina",
    description: "Lun–Jue · 8:00 am – 5:00 pm",
    note: "Vie · 8:00 am – 1:00 pm",
    defaultColor: "red" as ScheduleColor,
    iconColor: "text-pink-500",
  },
  {
    key: "ingles",
    icon: GraduationCap,
    title: "Inglés",
    description: "Viernes · 5:00 pm – 6:00 pm",
    note: "",
    defaultColor: "blue" as ScheduleColor,
    iconColor: "text-blue-500",
  },
];

const tileColorClasses: Record<ScheduleColor, string> = {
  primary: "bg-amber-50 border-amber-200 text-amber-900",
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  green: "bg-green-50 border-green-200 text-green-900",
  red: "bg-pink-50 border-pink-200 text-pink-900",
  purple: "bg-purple-50 border-purple-200 text-purple-900",
};

const ScheduleSection = () => {
  return (
    <div className="dash-tile rounded-2xl p-3 flex flex-col">
      <div className="grid grid-cols-1 gap-1.5">
        {schedules.map(({ icon: Icon, title, description, note, defaultColor, iconColor }) => (
          <div key={title} className={`${tileColorClasses[defaultColor]} border rounded-xl p-2.5 flex items-start gap-2.5`}>
            <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-wide leading-none">{title}</p>
              <p className="text-[11px] font-semibold mt-1.5 leading-tight opacity-80">{description}</p>
              {note ? <p className="text-[10px] font-bold uppercase tracking-wider mt-1 leading-tight opacity-55">{note}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection;