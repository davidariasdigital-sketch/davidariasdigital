import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "10+", label: "Años de Experiencia", icon: "🎬" },
  { value: "50+", label: "Comerciales Producidos", icon: "📺" },
  { value: "20+", label: "Videoclips Dirigidos", icon: "🎵" },
];

const ReelSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const videoScale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section id="reel" ref={ref} className="py-28 md:py-40 px-6 md:px-12 relative">
      {/* Ambient orb */}
      <div className="orb w-[500px] h-[500px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 float-slower" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="glass-subtle rounded-full px-4 py-1.5 text-[11px] font-medium text-primary inline-block mb-6">
            Showreel 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            El trabajo habla
            <br />
            <span className="text-primary">por sí mismo.</span>
          </h2>
        </motion.div>

        <motion.div style={{ scale: videoScale, opacity: videoOpacity }}>
          <div className="glass-card p-2 md:p-3 glow-primary">
            <div className="aspect-video w-full rounded-[calc(var(--radius)-0.5rem)] overflow-hidden bg-card">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Reel David Arias"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card p-6 text-center hover:scale-[1.02] transition-transform duration-300"
            >
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <p className="text-3xl md:text-4xl font-black text-primary tracking-tight">{stat.value}</p>
              <p className="mt-1 text-foreground/40 text-[11px] tracking-wider uppercase font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReelSection;
