// Shared types and defaults for content objectives (Supabase-backed)

export interface Objective {
  id: string;
  label: string;
  sub_label?: string | null;
  color: string;
  position?: number;
}

export const DEFAULT_PALETTE = [
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ef4444",
];

export const DEFAULT_OBJECTIVES: Omit<Objective, "id">[] = [
  { label: "Marca personal", color: "#ec4899", position: 0 },
  { label: "Engagement", color: "#f59e0b", position: 1 },
  { label: "Ventas", color: "#10b981", position: 2 },
  { label: "Educación", color: "#3b82f6", position: 3 },
];
