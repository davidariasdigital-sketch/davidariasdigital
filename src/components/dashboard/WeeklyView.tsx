import { useEffect, useState, useRef, DragEvent, MouseEvent as ReactMouseEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, X, Trash2, Copy, CalendarOff, Calendar as CalendarIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_time: string | null;
  color: string;
  show_in_monthly?: boolean;
}

const colorTile: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  primary: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300", ring: "ring-amber-400" },
  blue: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300", ring: "ring-blue-400" },
  green: { bg: "bg-green-100", text: "text-green-900", border: "border-green-300", ring: "ring-green-400" },
  red: { bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-300", ring: "ring-pink-400" },
  purple: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300", ring: "ring-purple-400" },
};

const COLORS = ["primary", "blue", "green", "red", "purple"];
const colorDots: Record<string, string> = {
  primary: "bg-amber-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  red: "bg-pink-400",
  purple: "bg-purple-400",
};

const DAY_NAMES = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

// Hour grid 7:00 → 22:00 (last slot = 21-22). 15 slots of 1h.
const START_HOUR = 7;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const SLOT_HEIGHT_DESKTOP = 48; // px per hour
const SLOT_HEIGHT_MOBILE = 56; // px per hour on mobile (single day view)

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getMonday = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
};

// "HH:MM[:SS]" → decimal hours (e.g. "08:30" → 8.5)
const timeToHours = (t: string | null): number | null => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h + (m || 0) / 60;
};

const formatHourLabel = (h: number) => {
  const period = h >= 12 ? "pm" : "am";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}${period}`;
};

const padTime = (h: number, m: number) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

const WeeklyView = () => {
  const isMobile = useIsMobile();
  const SLOT_HEIGHT = isMobile ? SLOT_HEIGHT_MOBILE : SLOT_HEIGHT_DESKTOP;
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    event_date: "",
    event_time: "",
    end_time: "",
    color: "primary",
    show_in_monthly: true,
  });
  const popupRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekEnd = days[6];
  const todayISO = toISO(new Date());

  // Mobile: which day is selected (0-6 within current week)
  const todayInWeek = days.findIndex(d => toISO(d) === todayISO);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayInWeek >= 0 ? todayInWeek : 0);

  // When week changes, reset selected day to today (if in week) or first day
  useEffect(() => {
    const idx = days.findIndex(d => toISO(d) === todayISO);
    setSelectedDayIndex(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", toISO(weekStart))
      .lte("event_date", toISO(weekEnd))
      .order("event_time", { ascending: true });
    if (data) setEvents(data as EventItem[]);
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) closePopup();
    };
    if (popupOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popupOpen]);

  const closePopup = () => {
    setPopupOpen(false);
    setEditing(null);
    setForm({ title: "", event_date: "", event_time: "", end_time: "", color: "primary", show_in_monthly: true });
  };

  const openCreate = (dayISO: string, hour: number) => {
    setEditing(null);
    setForm({
      title: "",
      event_date: dayISO,
      event_time: padTime(hour, 0),
      end_time: padTime(hour + 1, 0),
      color: "primary",
      show_in_monthly: true,
    });
    setPopupOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      event_date: ev.event_date,
      event_time: ev.event_time ? ev.event_time.slice(0, 5) : "",
      end_time: ev.end_time ? ev.end_time.slice(0, 5) : "",
      color: ev.color || "primary",
      show_in_monthly: ev.show_in_monthly !== false,
    });
    setPopupOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.event_date) return;
    const payload = {
      title: form.title.trim(),
      event_date: form.event_date,
      event_time: form.event_time || null,
      end_time: form.end_time || null,
      color: form.color,
      show_in_monthly: form.show_in_monthly,
    };
    if (editing) {
      await supabase.from("events").update(payload as any).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("events").insert({ ...payload, user_id: user.id } as any);
    }
    closePopup();
    fetchEvents();
  };

  const duplicateEvent = async (ev: EventItem, e?: ReactMouseEvent) => {
    e?.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("events").insert({
      title: ev.title,
      description: ev.description,
      event_date: ev.event_date,
      event_time: ev.event_time,
      end_time: ev.end_time,
      color: ev.color,
      show_in_monthly: ev.show_in_monthly !== false,
      user_id: user.id,
    } as any);
    fetchEvents();
  };

  const duplicateFromPopup = async () => {
    if (!editing) return;
    await duplicateEvent(editing);
    closePopup();
  };

  const deleteEvent = async () => {
    if (!editing) return;
    await supabase.from("events").delete().eq("id", editing.id);
    closePopup();
    fetchEvents();
  };

  const onDragStartEvent = (e: DragEvent, ev: EventItem) => {
    e.stopPropagation();
    e.dataTransfer.setData("eventDrag", ev.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onSlotDrop = async (e: DragEvent, dayISO: string, hour: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    const eventId = e.dataTransfer.getData("eventDrag");
    const taskRaw = e.dataTransfer.getData("taskDrag");

    const newStart = padTime(hour, 0);
    const newEnd = padTime(hour + 1, 0);

    if (eventId) {
      const ev = events.find(x => x.id === eventId);
      // Preserve duration when moving
      let endTime: string | null = newEnd;
      if (ev?.event_time && ev?.end_time) {
        const dur = (timeToHours(ev.end_time)! - timeToHours(ev.event_time)!);
        endTime = padTime(Math.min(END_HOUR, hour + Math.max(1, Math.round(dur))), 0);
      }
      await supabase.from("events").update({
        event_date: dayISO,
        event_time: newStart,
        end_time: endTime,
      } as any).eq("id", eventId);
      fetchEvents();
    } else if (taskRaw) {
      try {
        const task = JSON.parse(taskRaw);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const durHours = task.estimated_time
          ? Math.max(1, Math.round(task.estimated_time / 60))
          : 1;
        await supabase.from("events").insert({
          title: task.title,
          event_date: dayISO,
          event_time: newStart,
          end_time: padTime(Math.min(END_HOUR, hour + durHours), 0),
          color: task.color || "primary",
          user_id: user.id,
        } as any);
        fetchEvents();
      } catch {}
    }
  };

  const shiftWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getMonday(new Date()));

  const monthLabel = weekStart.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  // Compute pixel position of an event within the day column
  const getEventGeometry = (ev: EventItem) => {
    const startH = timeToHours(ev.event_time) ?? START_HOUR;
    const endH = timeToHours(ev.end_time) ?? startH + 1;
    const clampedStart = Math.max(START_HOUR, Math.min(END_HOUR, startH));
    const clampedEnd = Math.max(clampedStart + 0.5, Math.min(END_HOUR, endH));
    const top = (clampedStart - START_HOUR) * SLOT_HEIGHT;
    const height = (clampedEnd - clampedStart) * SLOT_HEIGHT;
    return { top, height };
  };

  // Mobile: navigate single day (rolls week when crossing edges)
  const shiftDay = (delta: number) => {
    const next = selectedDayIndex + delta;
    if (next < 0) {
      shiftWeek(-1);
      setSelectedDayIndex(6);
    } else if (next > 6) {
      shiftWeek(1);
      setSelectedDayIndex(0);
    } else {
      setSelectedDayIndex(next);
    }
  };

  // Days to render in the grid
  const renderedDays = isMobile ? [days[selectedDayIndex]] : days;
  const gridCols = isMobile ? "grid-cols-[52px_1fr]" : "grid-cols-[44px_repeat(7,1fr)]";

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[hsl(var(--dash-text-muted))] capitalize">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => (isMobile ? shiftDay(-1) : shiftWeek(-1))} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={goToday} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
            Hoy
          </button>
          <button onClick={() => (isMobile ? shiftDay(1) : shiftWeek(1))} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Mobile: day pills selector */}
      {isMobile && (
        <div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar -mx-1 px-1">
          {days.map((d, i) => {
            const dayISO = toISO(d);
            const isToday = dayISO === todayISO;
            const isSelected = selectedDayIndex === i;
            return (
              <button
                key={dayISO}
                onClick={() => setSelectedDayIndex(i)}
                className={`flex-1 min-w-[40px] flex flex-col items-center py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? "bg-[hsl(var(--dash-text))] text-[hsl(var(--dash-card-bg))]"
                    : isToday
                    ? "bg-amber-50 text-amber-700"
                    : "text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(0,0%,96%)]"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                  {DAY_NAMES[i].charAt(0)}
                </span>
                <span className="text-sm font-bold leading-none mt-1">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Day headers (desktop only) */}
      {!isMobile && (
        <div className={`grid ${gridCols} gap-1 mb-1`}>
          <div />
          {days.map((d, i) => {
            const dayISO = toISO(d);
            const isToday = dayISO === todayISO;
            return (
              <div key={dayISO} className={`text-center py-1 rounded-lg ${isToday ? "bg-amber-50" : ""}`}>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isToday ? "text-amber-600" : "text-[hsl(var(--dash-text-muted))]"}`}>
                  {DAY_NAMES[i]}
                </p>
                <p className={`text-sm font-bold leading-none mt-0.5 ${isToday ? "text-amber-700" : "text-[hsl(var(--dash-text))]"}`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Hour grid */}
      <div className={`grid ${gridCols} gap-1`}>
        {/* Hour labels column */}
        <div className="flex flex-col">
          {HOURS.map((h) => (
            <div
              key={h}
              style={{ height: SLOT_HEIGHT }}
              className={`${isMobile ? "text-[11px]" : "text-[9px]"} font-semibold text-[hsl(var(--dash-text-muted))] text-right pr-1.5 flex items-start justify-end pt-0 leading-none`}
            >
              {formatHourLabel(h)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {renderedDays.map((d) => {
          const dayISO = toISO(d);
          const isToday = dayISO === todayISO;
          const dayEvents = events.filter(ev => ev.event_date === dayISO);

          return (
            <div
              key={dayISO}
              className={`relative rounded-lg border ${isToday ? "border-amber-300 bg-amber-50/30" : "border-[hsl(var(--dash-card-border))] bg-white/30"}`}
              style={{ height: HOURS.length * SLOT_HEIGHT }}
            >
              {/* Slot drop targets */}
              {HOURS.map((h, idx) => {
                const slotKey = `${dayISO}-${h}`;
                const isOver = dragOverSlot === slotKey;
                return (
                  <div
                    key={h}
                    onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slotKey); }}
                    onDragLeave={() => setDragOverSlot(null)}
                    onDrop={(e) => onSlotDrop(e, dayISO, h)}
                    onClick={() => openCreate(dayISO, h)}
                    style={{ height: SLOT_HEIGHT, top: idx * SLOT_HEIGHT }}
                    className={`absolute left-0 right-0 cursor-pointer transition-colors ${
                      idx > 0 ? "border-t border-dashed border-[hsl(var(--dash-card-border))]" : ""
                    } ${isOver ? "bg-amber-200/50" : "hover:bg-amber-50/50"}`}
                  />
                );
              })}

              {/* Events overlay */}
              {dayEvents.map(ev => {
                const c = colorTile[ev.color] ?? colorTile.primary;
                const { top, height } = getEventGeometry(ev);
                return (
                  <div
                    key={ev.id}
                    draggable
                    onDragStart={(e) => onDragStartEvent(e, ev)}
                    onClick={(e: ReactMouseEvent) => { e.stopPropagation(); openEdit(ev); }}
                    style={{ top, height: Math.max(height - 2, 18), left: 2, right: 2 }}
                    className={`${c.bg} ${c.border} ${c.text} border-l-4 absolute rounded-md ${isMobile ? "px-2 py-1.5" : "px-1.5 py-1"} cursor-grab active:cursor-grabbing hover:shadow-md hover:ring-2 hover:${c.ring} transition-all overflow-hidden z-10`}
                    title={ev.title}
                  >
                    {ev.event_time && (
                      <p className={`${isMobile ? "text-[10px]" : "text-[8px]"} font-bold opacity-70 leading-tight`}>
                        {ev.event_time.slice(0, 5)}{ev.end_time ? `–${ev.end_time.slice(0, 5)}` : ""}
                      </p>
                    )}
                    <p className={`${isMobile ? "text-xs" : "text-[10px]"} font-semibold leading-tight line-clamp-2`}>{ev.title}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div ref={popupRef} className="bg-[hsl(var(--dash-card-bg))] rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--dash-card-border))]">
              <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">{editing ? "Editar Actividad" : "Nueva Actividad"}</h3>
              <button onClick={closePopup} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <input
                autoFocus
                placeholder="Título *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full dash-input rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full dash-input rounded-lg px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Inicio</label>
                  <input
                    type="time"
                    value={form.event_time}
                    onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                    className="w-full dash-input rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Fin</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full dash-input rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--dash-text-muted))]">Color:</span>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full ${colorDots[c]} transition-transform ${form.color === c ? "ring-2 ring-[hsl(var(--dash-text))] scale-110" : "opacity-40 hover:opacity-70"}`}
                  />
                ))}
              </div>

              {/* Toggle: show in monthly calendar */}
              <button
                type="button"
                onClick={() => setForm({ ...form, show_in_monthly: !form.show_in_monthly })}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                  form.show_in_monthly
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-[hsl(0,0%,97%)] border-[hsl(var(--dash-card-border))] text-[hsl(var(--dash-text-muted))]"
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  {form.show_in_monthly ? <CalendarIcon size={14} /> : <CalendarOff size={14} />}
                  Mostrar en calendario mensual
                </span>
                <span
                  className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                    form.show_in_monthly ? "bg-amber-400" : "bg-[hsl(var(--dash-card-border))]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      form.show_in_monthly ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleSubmit} disabled={!form.title.trim()} className="btn-dark text-sm px-5 py-2.5 disabled:opacity-40">
                  {editing ? "Guardar" : "Crear"}
                </button>
                <button onClick={closePopup} className="text-sm px-4 py-2.5 rounded-full text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(0,0%,96%)] transition-colors">
                  Cancelar
                </button>
                {editing && (
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={duplicateFromPopup} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Duplicar">
                      <Copy size={16} />
                    </button>
                    <button onClick={deleteEvent} className="p-2 rounded-lg text-pink-600 hover:bg-pink-50 transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyView;
