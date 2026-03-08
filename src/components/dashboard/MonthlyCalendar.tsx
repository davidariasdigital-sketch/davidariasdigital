import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  color: string;
  client_id: string | null;
  clients?: { name: string } | null;
}

interface Client {
  id: string;
  name: string;
}

const COLORS = [
  { value: "primary", label: "Mostaza", class: "bg-primary" },
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "red", label: "Rojo", class: "bg-red-500" },
  { value: "purple", label: "Morado", class: "bg-purple-500" },
];

const colorClasses: Record<string, string> = {
  primary: "bg-primary/20 text-primary border-primary/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const dotClasses: Record<string, string> = {
  primary: "bg-primary",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const MonthlyCalendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_time: "", color: "primary", client_id: "" });

  const fetchEvents = async () => {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const [ev, cl] = await Promise.all([
      supabase
        .from("events")
        .select("*, clients(name)")
        .gte("event_date", startDate)
        .lte("event_date", endStr)
        .order("event_date"),
      supabase.from("clients").select("id, name").order("name"),
    ]);
    setEvents((ev.data as any) ?? []);
    setClients(cl.data ?? []);
  };

  useEffect(() => { fetchEvents(); }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const eventsForDay = (day: number) =>
    events.filter((e) => e.event_date === getDateStr(day));

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleAddEvent = (dateStr: string) => {
    setSelectedDate(dateStr);
    setForm({ title: "", description: "", event_time: "", color: "primary", client_id: "" });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !selectedDate) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      event_date: selectedDate,
      event_time: form.event_time || null,
      color: form.color,
      client_id: form.client_id || null,
      user_id: user.id,
    } as any);

    setShowForm(false);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  const selectedDayEvents = selectedDate
    ? events.filter((e) => e.event_date === selectedDate)
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={goToday} className="text-[10px] font-bold text-primary hover:underline">
            HOY
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="liquid-glass rounded-[var(--radius)] overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-2 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayEvents = day ? eventsForDay(day) : [];
            const dateStr = day ? getDateStr(day) : "";
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={i}
                onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
                disabled={!day}
                className={`
                  relative min-h-[72px] p-1.5 border-b border-r border-border/50 text-left transition-colors
                  ${day ? "hover:bg-accent/30 cursor-pointer" : ""}
                  ${isSelected ? "bg-accent/40" : ""}
                `}
              >
                {day && (
                  <>
                    <span
                      className={`
                        text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
                        ${isToday(day) ? "bg-primary text-primary-foreground font-bold" : "text-foreground"}
                      `}
                    >
                      {day}
                    </span>
                    {/* Event dots */}
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${dotClasses[ev.color] ?? "bg-primary"}`}
                          title={ev.title}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="liquid-glass rounded-[var(--radius)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-CO", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </h3>
            <button
              onClick={() => handleAddEvent(selectedDate)}
              className="flex items-center gap-1 text-primary text-xs font-bold hover:underline"
            >
              <Plus size={12} /> Agendar
            </button>
          </div>

          {selectedDayEvents.length === 0 && !showForm && (
            <p className="text-xs text-muted-foreground text-center py-4">Sin actividades</p>
          )}

          {selectedDayEvents.map((ev) => (
            <div
              key={ev.id}
              className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 ${colorClasses[ev.color] ?? colorClasses.primary}`}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{ev.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {ev.event_time && (
                    <span className="text-[10px] opacity-75">
                      {ev.event_time.slice(0, 5)}
                    </span>
                  )}
                  {(ev as any).clients?.name && (
                    <span className="text-[10px] opacity-75">• {(ev as any).clients.name}</span>
                  )}
                </div>
                {ev.description && (
                  <p className="text-[10px] opacity-60 mt-1">{ev.description}</p>
                )}
              </div>
              <button onClick={() => handleDelete(ev.id)} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* Add event form */}
          {showForm && (
            <div className="space-y-3 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Nueva actividad</span>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
              <input
                placeholder="Título *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={form.event_time}
                  onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Sin cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <input
                placeholder="Descripción (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Color:</span>
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={`w-5 h-5 rounded-full ${c.class} transition-transform ${form.color === c.value ? "ring-2 ring-foreground scale-110" : "opacity-50 hover:opacity-75"}`}
                    title={c.label}
                  />
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Agendar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendar;
