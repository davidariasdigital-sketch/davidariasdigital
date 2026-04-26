import { useState } from "react";
import { BriefcaseBusiness, GraduationCap } from "lucide-react";
import { getScheduleColor, ScheduleColor, SCHEDULE_COLOR_OPTIONS, setScheduleColor } from "@/lib/scheduled-events";

const schedules = [
  {
    icon: BriefcaseBusiness,
    title: "Colombina",
    description: "Lun–Jue · 8:00 am – 5:00 pm",
    note: "Vie · 8:00 am – 1:00 pm",
    defaultColor: "red" as ScheduleColor,
    iconColor: "text-pink-500",
  },
  {
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

const dotClasses: Record<ScheduleColor, string> = {
  primary: "bg-amber-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  red: "bg-pink-400",
  purple: "bg-purple-400",
};

const ScheduleSection = () => {
  const [colors, setColors] = useState(() =>
    Object.fromEntries(schedules.map((schedule) => [schedule.title, getScheduleColor(schedule.key, schedule.defaultColor)])) as Record<string, ScheduleColor>
  );

  const updateColor = (key: string, title: string, color: ScheduleColor) => {
    setScheduleColor(key, color);
    setColors((current) => ({ ...current, [title]: color }));
  };

  return (
    <div className="dash-tile rounded-2xl p-3 flex flex-col">
      <div className="grid grid-cols-1 gap-1.5">
        {schedules.map(({ icon: Icon, key, title, description, note, iconColor }) => (
          <div key={title} className={`${tileColorClasses[colors[title]]} border rounded-xl p-2.5 flex items-start gap-2.5`}>
            <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-wide leading-none">{title}</p>
              <p className="text-[11px] font-semibold mt-1.5 leading-tight opacity-80">{description}</p>
              {note ? <p className="text-[10px] font-bold uppercase tracking-wider mt-1 leading-tight opacity-55">{note}</p> : null}
              <div className="mt-2 flex gap-1.5">
                {SCHEDULE_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateColor(key, title, color)}
                    className={`h-4 w-4 rounded-full ${dotClasses[color]} transition-transform ${colors[title] === color ? "ring-2 ring-[hsl(var(--dash-text))] scale-110" : "opacity-45 hover:opacity-80"}`}
                    aria-label={`Cambiar color de ${title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection;