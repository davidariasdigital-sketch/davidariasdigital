import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "5+", label: "Años de Experiencia", icon: "🎬" },
  { value: "40+", label: "Marcas", icon: "🏢" },
];

const ReelSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const videoScale = useTransform(scrollYProgress, [0, 0.3], [0.92, 1]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const videoRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(videoRef, { margin: "-100px", once: true });

  

  return (
    <section id="reel" ref={ref} className="py-16 md:py-24 px-6 md:px-12 relative">
      <div className="blob w-[500px] h-[500px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 float-slower" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
            Showreel 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            El trabajo habla
            <br />
            <span className="text-primary">por sí mismo.</span>
          </h2>
        </motion.div>

        <motion.div ref={videoRef} style={{ scale: videoScale, opacity: videoOpacity }}>
          <a
            href="https://www.youtube.com/watch?v=D3ZueneGbbA"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-rainbow rounded-[var(--radius)] p-3 md:p-4 glow-soft block group"
          >
            <div className="aspect-video w-full rounded-[calc(var(--radius)-8px)] overflow-hidden bg-muted relative">
              <img
                src="https://img.youtube.com/vi/D3ZueneGbbA/maxresdefault.jpg"
                alt="Reel David Arias"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
          </a>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="liquid-glass rounded-[var(--radius)] p-7 text-center hover:scale-[1.03] transition-transform duration-300"
            >
              <span className="text-2xl mb-3 block">{stat.icon}</span>
              <p className="text-3xl md:text-4xl font-black text-primary tracking-tight">{stat.value}</p>
              <p className="mt-2 text-muted-foreground text-[11px] tracking-wider uppercase font-semibold">
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
