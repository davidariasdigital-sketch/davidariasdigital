import { Instagram, Music2, Film } from "lucide-react";

const PLATFORMS = [
  {
    key: "instagram",
    name: "Instagram",
    icon: Instagram,
    accent: "text-pink-500",
    dot: "bg-pink-500",
    objective:
      "Marca personal y confianza. Mostrar el portafolio y los trabajos que he hecho.",
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: Music2,
    accent: "text-[hsl(var(--dash-text))]",
    dot: "bg-[hsl(var(--dash-text))]",
    objective: "Mostrar mi día a día sin filtros.",
  },
  {
    key: "solar",
    name: "Solar",
    icon: Film,
    accent: "text-orange-500",
    dot: "bg-orange-500",
    objective: "Hacer producciones cinematográficas.",
  },
];

const ContentGoalsCard = () => {
  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">
          Objetivo de contenido
        </h3>
        <p className="text-[11px] text-[hsl(var(--dash-text-muted))] mt-1">
          Propósito de cada plataforma.
        </p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.key}
              className="rounded-xl border border-[hsl(0,0%,92%)] bg-white/60 p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(0,0%,96%)] ${p.accent}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-semibold text-[hsl(var(--dash-text))]">
                  {p.name}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[hsl(var(--dash-text-muted))]">
                {p.objective}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentGoalsCard;
