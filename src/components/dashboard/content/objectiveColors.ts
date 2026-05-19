// Shared helpers for content objective colors

export interface Objective {
  id: string;
  label: string;
  color: string;
}

export const OBJECTIVES_STORAGE_KEY = "content_objectives_v1";
export const ITEM_COLORS_STORAGE_KEY = "content_item_colors_v1";

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

export const DEFAULT_OBJECTIVES: Objective[] = [
  { id: "1", label: "Marca personal", color: "#ec4899" },
  { id: "2", label: "Engagement", color: "#f59e0b" },
  { id: "3", label: "Ventas", color: "#10b981" },
  { id: "4", label: "Educación", color: "#3b82f6" },
];

export const readObjectives = (): Objective[] => {
  try {
    const raw = localStorage.getItem(OBJECTIVES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_OBJECTIVES;
};

export const readItemColors = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(ITEM_COLORS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const writeItemColor = (itemId: string, color: string | null) => {
  const map = readItemColors();
  if (color === null) delete map[itemId];
  else map[itemId] = color;
  try {
    localStorage.setItem(ITEM_COLORS_STORAGE_KEY, JSON.stringify(map));
  } catch {}
  window.dispatchEvent(new CustomEvent("content-item-colors-changed"));
};
