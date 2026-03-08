import { motion } from "framer-motion";
import frame1 from "@/assets/frame1.jpg";
import frame2 from "@/assets/frame2.jpg";
import frame3 from "@/assets/frame3.jpg";
import frame4 from "@/assets/frame4.jpg";
import frame5 from "@/assets/frame5.jpg";
import frame6 from "@/assets/frame6.jpg";

const frames = [frame1, frame2, frame3, frame4, frame5, frame6];

const FramesCarousel = () => {
  const doubled = [...frames, ...frames];

  return (
    <section className="py-16 md:py-24 overflow-hidden relative">
      <div className="blob w-[400px] h-[400px] bg-blue-300/20 top-0 right-0 float-slow" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
            Destacados Visuales
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Frames Seleccionados
          </h2>
        </motion.div>
      </div>

      <div className="animate-marquee flex gap-5 w-max px-4">
        {doubled.map((src, i) => (
          <div key={i} className="w-[340px] md:w-[480px] shrink-0 group">
            <div className="liquid-glass rounded-[var(--radius)] p-2 overflow-hidden hover:scale-[1.02] transition-transform duration-500">
              <div className="aspect-video rounded-[calc(var(--radius)-8px)] overflow-hidden">
                <img
                  src={src}
                  alt={`Frame ${(i % frames.length) + 1}`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FramesCarousel;
