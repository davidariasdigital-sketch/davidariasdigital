import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Phone, MessageCircle, Play } from "lucide-react";
import { useRef } from "react";
import davidPortrait from "@/assets/david-portrait.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section id="inicio" ref={ref} className="relative min-h-screen overflow-hidden flex items-center">
      {/* Ambient gradient orbs */}
      <div className="orb w-[600px] h-[600px] bg-primary/40 -top-40 -left-40 float-slow" />
      <div className="orb w-[500px] h-[500px] bg-blue-500/20 top-1/3 -right-40 float-slower" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/15 bottom-0 left-1/3 float-slow" />

      {/* Video background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      >
        <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      <motion.div style={{ y, opacity, scale }} className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center">
          {/* Left content — 3 cols */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 mb-8"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-medium tracking-wider text-foreground/60">
                  Disponible para proyectos
                </span>
              </motion.div>

              <h1 className="leading-[0.9] tracking-[-0.03em]">
                <span className="block text-[clamp(3.5rem,9vw,7.5rem)] font-black text-foreground">
                  DAVID
                </span>
                <span className="block text-[clamp(3.5rem,9vw,7.5rem)] font-black text-primary">
                  ARIAS
                </span>
              </h1>

              <p className="mt-6 text-foreground/50 text-base md:text-lg max-w-md leading-relaxed font-light">
                Productor Audiovisual y Director de Fotografía radicado en Colombia.
                Creando contenido publicitario digital cinematográfico.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-col gap-2"
            >
              <a href="mailto:davidariasdigital@gmail.com" className="flex items-center gap-3 text-foreground/40 text-sm hover:text-primary transition-colors duration-400">
                <Mail size={14} className="text-primary/50" /> davidariasdigital@gmail.com
              </a>
              <a href="tel:+573108781633" className="flex items-center gap-3 text-foreground/40 text-sm hover:text-primary transition-colors duration-400">
                <Phone size={14} className="text-primary/50" /> +57 310 878 1633
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <a
                href="https://wa.me/573108781633"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 bg-primary text-primary-foreground font-semibold text-[13px] px-7 py-3.5 rounded-2xl hover:shadow-[0_0_40px_-8px_hsl(var(--primary)/0.5)] hover:scale-[1.02] transition-all duration-300"
              >
                Chatea en WhatsApp
                <MessageCircle size={15} className="group-hover:rotate-12 transition-transform duration-300" />
              </a>
              <a
                href="#reel"
                className="group inline-flex items-center gap-2.5 glass font-medium text-[13px] text-foreground/70 hover:text-foreground px-7 py-3.5 rounded-2xl hover:scale-[1.02] transition-all duration-300"
              >
                Ver Reel
                <Play size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </a>
            </motion.div>
          </div>

          {/* Right — portrait with glass frame */}
          <motion.div
            style={{ y: imgY }}
            className="lg:col-span-2 flex justify-center lg:justify-end"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="glass-card p-2 w-[280px] md:w-[340px] lg:w-[380px]">
                <div className="rounded-[calc(var(--radius)-0.5rem)] overflow-hidden">
                  <img
                    src={davidPortrait}
                    alt="David Arias — Director de Fotografía"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-3">
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/80">David Arias</p>
                    <p className="text-[10px] text-foreground/40">Director of Photography</p>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-[9px] font-medium text-primary/80 glass-subtle rounded-full px-2.5 py-1">Filmmaker</span>
                  </div>
                </div>
              </div>

              {/* Floating glass badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -right-4 top-12 glass-subtle rounded-xl px-3 py-2 hidden lg:block"
              >
                <p className="text-[9px] font-semibold text-primary">10+ Años</p>
                <p className="text-[8px] text-foreground/40">Experiencia</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -left-4 bottom-24 glass-subtle rounded-xl px-3 py-2 hidden lg:block"
              >
                <p className="text-[9px] font-semibold text-primary">50+</p>
                <p className="text-[8px] text-foreground/40">Comerciales</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="glass-subtle rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-[10px] text-foreground/40 font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1 h-3 rounded-full bg-primary/40"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
