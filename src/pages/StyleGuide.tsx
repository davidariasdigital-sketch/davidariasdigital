import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Palette, Type, Square, Circle, Layout, Layers } from "lucide-react";

const StyleGuide = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const colors = [
    { name: "Background", var: "--background", value: "0 0% 4%" },
    { name: "Foreground", var: "--foreground", value: "0 0% 96%" },
    { name: "Primary", var: "--primary", value: "44 90% 48%" },
    { name: "Primary Foreground", var: "--primary-foreground", value: "0 0% 100%" },
    { name: "Secondary", var: "--secondary", value: "0 0% 12%" },
    { name: "Muted", var: "--muted", value: "0 0% 14%" },
    { name: "Muted Foreground", var: "--muted-foreground", value: "0 0% 55%" },
    { name: "Accent", var: "--accent", value: "44 90% 48%" },
    { name: "Border", var: "--border", value: "0 0% 16%" },
    { name: "Destructive", var: "--destructive", value: "0 84.2% 60.2%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 liquid-glass px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 className="text-sm font-bold text-foreground">Guía de Estilo</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground text-sm hover:text-destructive transition-colors">
          <LogOut size={16} /> Salir
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Colors */}
        <Section icon={Palette} title="Paleta de Colores">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {colors.map((color) => (
              <div key={color.var} className="space-y-2">
                <div
                  className="w-full aspect-square rounded-2xl border border-border"
                  style={{ backgroundColor: `hsl(${color.value})` }}
                />
                <p className="text-xs font-bold text-foreground">{color.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{color.var}</p>
                <p className="text-[10px] text-muted-foreground font-mono">hsl({color.value})</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section icon={Type} title="Tipografía">
          <div className="space-y-6">
            <div className="liquid-glass rounded-[var(--radius)] p-6">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Display — Maderon</p>
              <p className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'Maderon', serif" }}>
                David Arias
              </p>
            </div>
            <div className="liquid-glass rounded-[var(--radius)] p-6">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Body — Montserrat</p>
              <p className="text-4xl font-bold tracking-tight mb-2">Heading 1 — 36px Bold</p>
              <p className="text-2xl font-bold mb-2">Heading 2 — 24px Bold</p>
              <p className="text-lg font-semibold mb-2">Heading 3 — 18px Semibold</p>
              <p className="text-base mb-2">Body — 16px Regular</p>
              <p className="text-sm text-muted-foreground mb-2">Small — 14px Muted</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Caption — 11px Uppercase</p>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section icon={Square} title="Botones">
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-full hover:shadow-lg transition-all">
              Primary CTA
            </button>
            <button className="liquid-btn rounded-full px-6 py-3 text-sm font-semibold text-foreground">
              Glass Button
            </button>
            <button className="liquid-glass rounded-full px-6 py-3 text-sm font-semibold text-foreground hover:scale-105 transition-transform">
              Liquid Glass
            </button>
            <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2">
              Badge / Tag
            </span>
            <span className="pill-badge">
              Pill Badge
            </span>
          </div>
        </Section>

        {/* Cards */}
        <Section icon={Layers} title="Cards y Contenedores">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="liquid-glass rounded-[var(--radius)] p-6">
              <p className="text-sm font-bold text-foreground mb-2">Liquid Glass</p>
              <p className="text-xs text-muted-foreground">.liquid-glass</p>
            </div>
            <div className="liquid-glass-rainbow rounded-[var(--radius)] p-6 glow-soft">
              <p className="text-sm font-bold text-foreground mb-2">Liquid Glass Rainbow</p>
              <p className="text-xs text-muted-foreground">.liquid-glass-rainbow .glow-soft</p>
            </div>
            <div className="neu-card p-6">
              <p className="text-sm font-bold text-foreground mb-2">Neumorphic Card</p>
              <p className="text-xs text-muted-foreground">.neu-card</p>
            </div>
          </div>
        </Section>

        {/* Effects */}
        <Section icon={Circle} title="Efectos y Tokens">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="liquid-glass rounded-[var(--radius)] p-6">
              <p className="text-sm font-bold text-foreground mb-3">Border Radius</p>
              <p className="text-muted-foreground text-xs font-mono">--radius: 1.5rem</p>
              <div className="mt-3 flex gap-3">
                <div className="w-16 h-16 bg-primary/20 rounded-[var(--radius)]" />
                <div className="w-16 h-16 bg-primary/20 rounded-xl" />
                <div className="w-16 h-16 bg-primary/20 rounded-full" />
              </div>
            </div>
            <div className="liquid-glass rounded-[var(--radius)] p-6">
              <p className="text-sm font-bold text-foreground mb-3">Glow Effect</p>
              <p className="text-muted-foreground text-xs font-mono">.glow-soft</p>
              <div className="mt-3 w-full h-16 bg-primary/10 rounded-[var(--radius)] glow-soft" />
            </div>
            <div className="liquid-glass rounded-[var(--radius)] p-6">
              <p className="text-sm font-bold text-foreground mb-3">Blobs Ambientales</p>
              <p className="text-muted-foreground text-xs font-mono">.blob .float-slow .float-slower</p>
              <div className="mt-3 relative h-24 overflow-hidden rounded-xl">
                <div className="blob w-24 h-24 bg-primary/30 top-0 left-4 float-slow" />
                <div className="blob w-20 h-20 bg-pink-300/20 top-2 right-4 float-slower" />
              </div>
            </div>
            <div className="liquid-glass rounded-[var(--radius)] p-6">
              <p className="text-sm font-bold text-foreground mb-3">Marquee</p>
              <p className="text-muted-foreground text-xs font-mono">.animate-marquee</p>
              <div className="mt-3 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap">
                  {["ELEMENT", "ELEMENT", "ELEMENT", "ELEMENT", "ELEMENT", "ELEMENT"].map((t, i) => (
                    <span key={i} className="mx-4 text-xs font-bold text-foreground/20 tracking-widest">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Layout */}
        <Section icon={Layout} title="Layout y Espaciado">
          <div className="liquid-glass rounded-[var(--radius)] p-6 space-y-4">
            <p className="text-sm font-bold text-foreground">Contenedores</p>
            <p className="text-xs text-muted-foreground">max-w-5xl mx-auto — Ancho máximo de contenido</p>
            <p className="text-xs text-muted-foreground">px-6 md:px-12 — Padding horizontal responsive</p>
            <p className="text-xs text-muted-foreground">py-16 md:py-24 — Padding vertical de secciones</p>
            <p className="text-xs text-muted-foreground">gap-4 — Espacio entre grid items</p>
            <p className="text-xs text-muted-foreground">mb-12 — Margen inferior de headers de sección</p>
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon size={18} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.section>
);

export default StyleGuide;
