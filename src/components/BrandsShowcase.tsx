import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const brandNames = [
  "Nike", "Adidas", "Samsung", "Coca-Cola", "Bavaria", "Rappi",
  "Grupo Éxito", "Corona", "Claro", "Movistar", "Alpina", "Colgate",
  "Nutresa", "Avianca", "Juan Valdez", "Bancolombia", "EPM", "Sura",
  "Postobón", "Totto",
];

const BrandsShowcase = () => {
  const videoRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(videoRef, { margin: "-100px", once: true });
  const duplicatedBrands = [...brandNames, ...brandNames];

  return (
    <section id="marcas" className="py-28 md:py-40 px-6 md:px-12 relative">
      <div className="blob w-[450px] h-[450px] bg-primary/15 top-1/3 -left-20 float-slower" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
            Portafolio
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Marcas que han
            <br />
            <span className="text-primary">confiado en mí.</span>
          </h2>
        </motion.div>

        {/* Brands marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 relative overflow-hidden py-4"
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {duplicatedBrands.map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="mx-5 text-sm font-bold text-foreground/20 tracking-widest uppercase"
              >
                {brand}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Video */}
        <motion.div
          ref={videoRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="liquid-glass-rainbow rounded-[var(--radius)] p-3 md:p-4 glow-soft">
            <div className="aspect-video w-full rounded-[calc(var(--radius)-8px)] overflow-hidden bg-muted">
              {isInView && (
                <iframe
                  src="https://www.youtube.com/embed/vqayenZYeNo?autoplay=1&mute=1&loop=1&playlist=vqayenZYeNo"
                  title="Marcas — David Arias"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandsShowcase;
