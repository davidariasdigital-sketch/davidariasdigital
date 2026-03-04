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
    <section className="py-32 md:py-40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-medium mb-3">
            Destacados Visuales
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Frames Seleccionados
          </h2>
        </motion.div>
      </div>

      <div className="animate-marquee flex gap-3 w-max">
        {doubled.map((src, i) => (
          <div
            key={i}
            className="w-[400px] md:w-[560px] aspect-[2.35/1] overflow-hidden shrink-0 group relative"
          >
            <img
              src={src}
              alt={`Frame ${(i % frames.length) + 1}`}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
              loading="lazy"
            />
            {/* Film frame number */}
            <div className="absolute bottom-3 right-4 text-[9px] tracking-[0.2em] text-foreground/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              FR-{String((i % frames.length) + 1).padStart(3, "0")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FramesCarousel;
