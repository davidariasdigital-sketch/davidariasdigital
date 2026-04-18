import { useEffect, useState, useRef, DragEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  color: string;
}

const colorTile: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-200" },
  green: { bg: "bg-green-100", text: "text-green-900", border: "border-green-200" },
  red: { bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-200" },
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

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getMonday = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
};

const WeeklyView = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [popupDay, setPopupDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState({ title: "", event_time: "", color: "primary" });
  const popupRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekEnd = days[6];
  const todayISO = toISO(new Date());

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
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) closePopup();
    };
    if (popupDay) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popupDay]);

  const closePopup = () => {
    setPopupDay(null);
    setEditing(null);
    setForm({ title: "", event_time: "", color: "primary" });
  };

  const openCreate = (dayISO: string) => {
    setEditing(null);
    setForm({ title: "", event_time: "", color: "primary" });
    setPopupDay(dayISO);
  };

  const openEdit = (ev: EventItem) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      event_time: ev.event_time ? ev.event_time.slice(0, 5) : "",
      color: ev.color || "primary",
    });
    setPopupDay(ev.event_date);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !popupDay) return;
    if (editing) {
      await supabase.from("events").update({
        title: form.title.trim(),
        event_time: form.event_time || null,
        color: form.color,
        event_date: popupDay,
      } as any).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("events").insert({
        title: form.title.trim(),
        event_date: popupDay,
        event_time: form.event_time || null,
        color: form.color,
        user_id: user.id,
      } as any);
    }
    closePopup();
    fetchEvents();
  };

  const deleteEvent = async () => {
    if (!editing) return;
    await supabase.from("events").delete().eq("id", editing.id);
    closePopup();
    fetchEvents();
  };

  const onDragStartEvent = (e: DragEvent, ev: EventItem) => {
    e.dataTransfer.setData("eventDrag", ev.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDayDrop = async (e: DragEvent, dayISO: string) => {
    e.preventDefault();
    setDragOverDay(null);
    const eventId = e.dataTransfer.getData("eventDrag");
    const taskRaw = e.dataTransfer.getData("taskDrag");

    if (eventId) {
      await supabase.from("events").update({ event_date: dayISO } as any).eq("id", eventId);
      fetchEvents();
    } else if (taskRaw) {
      try {
        const task = JSON.parse(taskRaw);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("events").insert({
          title: task.title,
          event_date: dayISO,
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

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Esta Semana</p>
          <p className="text-xs text-[hsl(var(--dash-text-muted))] capitalize mt-0.5">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => shiftWeek(-1)} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={goToday} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
            Hoy
          </button>
          <button onClick={() => shiftWeek(1)} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const dayISO = toISO(d);
          const isToday = dayISO === todayISO;
          const dayEvents = events.filter(ev => ev.event_date === dayISO);
          const isOver = dragOverDay === dayISO;

          return (
            <div
              key={dayISO}
              onDragOver={(e) => { e.preventDefault(); setDragOverDay(dayISO); }}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => onDayDrop(e, dayISO)}
              className={`rounded-xl border min-h-[120px] p-2 flex flex-col gap-1.5 transition-all ${
                isToday ? "border-amber-400 bg-amber-50/40" : "border-[hsl(var(--dash-card-border))] bg-white/40"
              } ${isOver ? "ring-2 ring-amber-400 bg-amber-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isToday ? "text-amber-600" : "text-[hsl(var(--dash-text-muted))]"}`}>
                    {DAY_NAMES[i]}
                  </p>
                  <p className={`text-base font-bold leading-none ${isToday ? "text-amber-700" : "text-[hsl(var(--dash-text))]"}`}>
                    {d.getDate()}
                  </p>
                </div>
                <button
                  onClick={() => openCreate(dayISO)}
                  className="p-1 rounded-md hover:bg-white text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors"
                  title="Añadir"
                >
                  <Plus size={11} />
                </button>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                {dayEvents.map(ev => {
                  const c = colorTile[ev.color] ?? colorTile.primary;
                  return (
                    <div
                      key={ev.id}
                      draggable
                      onDragStart={(e) => onDragStartEvent(e, ev)}
                      onClick={() => openEdit(ev)}
                      className={`${c.bg} ${c.border} ${c.text} border rounded-lg px-1.5 py-1 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow`}
                      title={ev.title}
                    >
                      {ev.event_time && (
                        <p className="text-[8px] font-bold opacity-70 leading-tight">
                          {ev.event_time.slice(0, 5)}
                        </p>
                      )}
                      <p className="text-[10px] font-semibold leading-tight line-clamp-2">{ev.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {popupDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div ref={popupRef} className="bg-[hsl(var(--dash-card-bg))] rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--dash-card-border))]">
              <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">{editing ? "Editar Evento" : "Nuevo Evento"}</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={form.event_time}
                  onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                  className="w-full dash-input rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={popupDay}
                  onChange={(e) => setPopupDay(e.target.value)}
                  className="w-full dash-input rounded-lg px-3 py-2 text-sm"
                />
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
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleSubmit} disabled={!form.title.trim()} className="btn-dark text-sm px-5 py-2.5 disabled:opacity-40">
                  {editing ? "Guardar" : "Crear"}
                </button>
                <button onClick={closePopup} className="text-sm px-4 py-2.5 rounded-full text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(0,0%,96%)] transition-colors">
                  Cancelar
                </button>
                {editing && (
                  <button onClick={deleteEvent} className="ml-auto p-2 rounded-lg text-pink-600 hover:bg-pink-50 transition-colors" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
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
