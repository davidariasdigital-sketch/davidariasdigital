import { supabase } from "@/integrations/supabase/client";

type ScheduleRule = {
  key: string;
  title: string;
  color: string;
  showInMonthly: boolean;
  appliesTo: (day: number) => boolean;
  timesFor: (day: number) => { start: string; end: string } | null;
};

export const SCHEDULES: ScheduleRule[] = [
  {
    key: "colombina",
    title: "Colombina",
    color: "red",
    showInMonthly: false,
    appliesTo: (day) => day >= 1 && day <= 5,
    timesFor: (day) => (day === 5 ? { start: "08:00", end: "13:00" } : { start: "08:00", end: "17:00" }),
  },
  {
    key: "ingles",
    title: "Inglés",
    color: "blue",
    showInMonthly: false,
    appliesTo: (day) => day === 5,
    timesFor: () => ({ start: "17:00", end: "18:00" }),
  },
];

export const toISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const markerFor = (key: string, date: string) => `[horario:${key}:${date}]`;

export const ensureScheduledEvents = async (start: Date, end: Date) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const candidates: Array<{
    user_id: string;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    end_time: string;
    color: string;
    show_in_monthly: boolean;
  }> = [];

  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  while (cursor <= last) {
    const day = cursor.getDay();
    const date = toISODate(cursor);

    SCHEDULES.forEach((schedule) => {
      if (!schedule.appliesTo(day)) return;
      const times = schedule.timesFor(day);
      if (!times) return;
      candidates.push({
        user_id: user.id,
        title: schedule.title,
        description: markerFor(schedule.key, date),
        event_date: date,
        event_time: times.start,
        end_time: times.end,
        color: schedule.color,
        show_in_monthly: schedule.showInMonthly,
      });
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  if (!candidates.length) return;

  const markers = candidates.map((c) => c.description);
  const { data: existing } = await supabase
    .from("events")
    .select("description")
    .eq("user_id", user.id)
    .in("description", markers);

  const existingMarkers = new Set((existing ?? []).map((event) => event.description));
  const missing = candidates.filter((candidate) => !existingMarkers.has(candidate.description));
  const hiddenMarkers = candidates.filter((candidate) => !candidate.show_in_monthly).map((candidate) => candidate.description);

  if (hiddenMarkers.length) {
    await supabase
      .from("events")
      .update({ show_in_monthly: false } as any)
      .eq("user_id", user.id)
      .in("description", hiddenMarkers);
  }

  if (missing.length) await supabase.from("events").insert(missing as any);
};