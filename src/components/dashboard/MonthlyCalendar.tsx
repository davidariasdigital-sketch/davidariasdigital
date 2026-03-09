import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar } from "lucide-react";

interface CalendarEvent {
  id: string; title: string; description: string | null; event_date: string;
  event_time: string | null; color: string; client_id: string | null;
  clients?: { name: string } | null;
}

interface Client { id: string; name: string; }

const COLORS = [
  { value: "primary", label: "Mostaza", class: "bg-primary" },
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "red", label: "Rojo", class: "bg-red-500" },
  { value: "purple", label: "Morado", class: "bg-purple-500" },
];

const colorClasses: Record<string, string> = {
  primary: "bg-primary/15 text-[hsl(var(--dash-text))] border-primary/30",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const MonthlyCalendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_time: "", color: "primary", client_id: "" });
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    const [ev, cl] = await Promise.all([
      supabase.from("events").select("*, clients(name)").gte("event_date", startDate).lte("event_date", endStr).order("event_date"),
      supabase.from("clients").select("id, name").order("name"),
    ]);
    setEvents((ev.data as any) ?? []);
    setClients(cl.data ?? []);
  };

  useEffect(() => { fetchEvents(); }, [year, month]);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    if (showPopup) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPopup]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const eventsForDay = (day: number) => events.filter((e) => e.event_date === getDateStr(day));
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const openDayPopup = (dateStr: string) => {
    setSelectedDate(dateStr);
    setForm({ title: "", description: "", event_time: "", color: "primary", client_id: "" });
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !selectedDate) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("events").insert({
      title: form.title, description: form.description || null, event_date: selectedDate,
      event_time: form.event_time || null, color: form.color, client_id: form.client_id || null, user_id: user.id,
    } as any);
    setForm({ title: "", description: "", event_time: "", color: "primary", client_id: "" });
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  const selectedDayEvents = selectedDate ? events.filter((e) => e.event_date === selectedDate) : [];
  const inputCls = "w-full dash-input rounded-lg px-3 py-2 text-sm";

  return (
    <>
      <div className="dash-tile rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-[hsl(var(--dash-text))]" />
            <div>
              <h2 className="text-lg font-display font-bold text-[hsl(var(--dash-text))]">{MONTHS[month]} {year}</h2>
              <p className="text-xs text-[hsl(var(--dash-text-muted))]">Calendario de actividades</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="text-[10px] font-bold text-primary hover:underline mr-2">HOY</button>
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors"><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Grid */}
        <div className="border border-[hsl(var(--dash-card-border))] rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[hsl(var(--dash-card-border))]">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-[hsl(var(--dash-text-muted))] py-2.5 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayEvents = day ? eventsForDay(day) : [];
              const dateStr = day ? getDateStr(day) : "";
              return (
                <button
                  key={i}
                  onClick={() => day && openDayPopup(dateStr)}
                  disabled={!day}
                  className={`relative min-h-[72px] p-1.5 border-b border-r border-[hsl(var(--dash-card-border))] text-left transition-colors ${day ? "hover:bg-[hsl(0,0%,97%)] cursor-pointer" : ""}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday(day) ? "bg-primary text-primary-foreground font-bold" : "text-[hsl(var(--dash-text))]"}`}>{day}</span>
                      <div className="flex flex-col gap-0.5 mt-0.5 w-full overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div key={ev.id} className={`text-[8px] leading-tight font-medium truncate rounded px-1 py-px ${colorClasses[ev.color] ?? colorClasses.primary}`}>
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <span className="text-[8px] text-[hsl(var(--dash-text-muted))]">+{dayEvents.length - 2}</span>}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== Popup Modal ===== */}
      {showPopup && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div ref={popupRef} className="bg-[hsl(var(--dash-card-bg))] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Popup header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--dash-card-border))]">
              <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <button onClick={() => setShowPopup(false)} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Events list */}
            <div className="px-6 py-4 space-y-2 max-h-48 overflow-auto">
              {selectedDayEvents.length === 0 && (
                <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-3">Sin actividades este día</p>
              )}
              {selectedDayEvents.map((ev) => (
                <div key={ev.id} className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${colorClasses[ev.color] ?? colorClasses.primary}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ev.event_time && <span className="text-xs opacity-75">{ev.event_time.slice(0, 5)}</span>}
                      {(ev as any).clients?.name && <span className="text-xs opacity-75">• {(ev as any).clients.name}</span>}
                    </div>
                    {ev.description && <p className="text-xs opacity-60 mt-1">{ev.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            {/* Add event form */}
            <div className="px-6 py-4 border-t border-[hsl(var(--dash-card-border))] space-y-3">
              <p className="text-xs font-bold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Añadir actividad</p>
              <input
                placeholder="Título *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputCls}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} className={inputCls} />
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={inputCls}>
                  <option value="">Sin cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <input
                placeholder="Descripción (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputCls}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--dash-text-muted))]">Color:</span>
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => setForm({ ...form, color: c.value })} className={`w-6 h-6 rounded-full ${c.class} transition-transform ${form.color === c.value ? "ring-2 ring-[hsl(var(--dash-text))] scale-110" : "opacity-40 hover:opacity-70"}`} title={c.label} />
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSubmit} disabled={!form.title} className="btn-dark text-sm px-5 py-2.5 disabled:opacity-40">
                  Agendar
                </button>
                <button onClick={() => setShowPopup(false)} className="text-sm px-4 py-2.5 rounded-full text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(0,0%,96%)] transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthlyCalendar;