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
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary text-sm tracking-widest uppercase font-semibold">
            Destacados Visuales
          </p>
          <h2 className="text-4xl md:text-5xl font-black mt-2 text-foreground">
            Frames Seleccionados
          </h2>
        </motion.div>
      </div>

      <div className="animate-marquee flex gap-4 w-max">
        {doubled.map((src, i) => (
          <div
            key={i}
            className="w-[360px] md:w-[480px] aspect-video rounded-lg overflow-hidden shrink-0 group"
          >
            <img
              src={src}
              alt={`Frame ${(i % frames.length) + 1}`}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FramesCarousel;
