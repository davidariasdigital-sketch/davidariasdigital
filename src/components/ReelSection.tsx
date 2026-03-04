import { motion } from "framer-motion";

const stats = [
  { value: "10+", label: "Años de Experiencia" },
  { value: "50+", label: "Comerciales" },
  { value: "20+", label: "Videoclips" },
];

const ReelSection = () => {
  return (
    <section id="reel" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-foreground/10">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Reel David Arias"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center border border-foreground/10 rounded-lg p-8"
            >
              <p className="text-4xl md:text-5xl font-black text-primary">{stat.value}</p>
              <p className="mt-2 text-foreground/60 text-sm tracking-wider uppercase">
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
