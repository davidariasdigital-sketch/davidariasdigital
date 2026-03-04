import { motion } from "framer-motion";

const stats = [
  { value: "10+", label: "Años de Experiencia" },
  { value: "50+", label: "Comerciales Producidos" },
  { value: "20+", label: "Videoclips Dirigidos" },
];

const ReelSection = () => {
  return (
    <section id="reel" className="py-32 md:py-40 px-8 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-medium mb-3">
            Showreel 2026
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            El trabajo habla por sí mismo.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Letterbox effect */}
          <div className="relative letterbox">
            <div className="aspect-[2.35/1] w-full overflow-hidden bg-card">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-0 border border-foreground/8"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center py-10 px-6 ${
                i < stats.length - 1 ? "md:border-r border-b md:border-b-0 border-foreground/8" : ""
              }`}
            >
              <p className="text-5xl md:text-6xl font-black text-primary tracking-tight">
                {stat.value}
              </p>
              <p className="mt-3 text-muted-foreground text-[10px] tracking-[0.3em] uppercase font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ReelSection;
