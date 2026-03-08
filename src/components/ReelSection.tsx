import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "5+", label: "Años de Experiencia", icon: "🎬" },
];

const brandNames = [
  "Nike", "Adidas", "Samsung", "Coca-Cola", "Bavaria", "Rappi",
  "Grupo Éxito", "Corona", "Claro", "Movistar", "Alpina", "Colgate",
  "Nutresa", "Avianca", "Juan Valdez", "Bancolombia", "EPM", "Sura",
  "Postobón", "Totto",
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

  const duplicatedBrands = [...brandNames, ...brandNames];

  return (
    <section id="reel" ref={ref} className="py-28 md:py-40 px-6 md:px-12 relative">
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
          <div className="liquid-glass-rainbow rounded-[var(--radius)] p-3 md:p-4 glow-soft">
            <div className="aspect-video w-full rounded-[calc(var(--radius)-8px)] overflow-hidden bg-muted">
              {isInView && (
                <iframe
                  src="https://www.youtube.com/embed/D3ZueneGbbA?autoplay=1&mute=1&loop=1&playlist=D3ZueneGbbA"
                  title="Reel David Arias"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
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

          {/* Brands marquee card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="liquid-glass rounded-[var(--radius)] p-7 text-center hover:scale-[1.03] transition-transform duration-300 overflow-hidden"
          >
            <span className="text-2xl mb-3 block">🏢</span>
            <p className="text-3xl md:text-4xl font-black text-primary tracking-tight">40+</p>
            <p className="mt-2 mb-4 text-muted-foreground text-[11px] tracking-wider uppercase font-semibold">
              Marcas
            </p>
            <div className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/80 to-transparent z-10 pointer-events-none" />
              <div className="flex animate-marquee whitespace-nowrap">
                {duplicatedBrands.map((brand, i) => (
                  <span
                    key={`${brand}-${i}`}
                    className="mx-3 text-[11px] font-semibold text-foreground/40 tracking-wide"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ReelSection;
