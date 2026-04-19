import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ContentItem } from "./PlannerGrid";

const COLORS = ["hsl(340 80% 70%)", "hsl(40 90% 60%)", "hsl(20 90% 60%)", "hsl(200 70% 60%)", "hsl(150 50% 55%)", "hsl(280 60% 65%)", "hsl(0 0% 50%)", "hsl(60 70% 55%)", "hsl(180 50% 55%)", "hsl(240 50% 65%)"];

const FormatDistributionCard = ({ items }: { items: ContentItem[] }) => {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    items.filter((i) => i.published && i.format).forEach((i) => {
      counts.set(i.format!, (counts.get(i.format!) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [items]);

  return (
    <div className="dash-tile rounded-2xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))] mb-3">Distribución por formato</h3>
      {data.length === 0 ? (
        <div className="text-center text-xs text-[hsl(var(--dash-text-muted))] py-8">Aún no hay contenido publicado</div>
      ) : (
        <>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--dash-card-border))" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {data.map((d, idx) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--dash-text))]">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-[hsl(var(--dash-text-muted))]">{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FormatDistributionCard;
