import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Phone, MessageCircle, Play } from "lucide-react";
import { useRef } from "react";
import davidPortrait from "@/assets/david-portrait.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section id="inicio" ref={ref} className="relative min-h-screen overflow-hidden flex items-center">
      {/* Soft ambient blobs */}
      <div className="blob w-[500px] h-[500px] bg-primary/40 -top-32 -left-32 float-slow" />
      <div className="blob w-[400px] h-[400px] bg-blue-300/30 top-1/3 -right-32 float-slower" />
      <div className="blob w-[350px] h-[350px] bg-pink-300/20 bottom-10 left-1/4 float-slow" />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-6xl mx-auto px-5 md:px-12 w-full pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-8 items-center">
          {/* Left content */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="liquid-glass rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8 inline-flex items-center gap-2">
                
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-foreground/70">Disponible para proyectos</span>
              </motion.div>

              <h1 className="leading-[0.9] tracking-[-0.03em]">
                <span className="block text-foreground font-medium text-xl md:text-2xl">David Arias</span>
                <span className="block font-normal text-primary drop-shadow-sm text-6xl sm:text-7xl md:text-9xl" style={{ fontFamily: "'Maderon', sans-serif" }}>
                  DIGITAL
                </span>
              </h1>

              <p className="mt-4 md:mt-6 text-muted-foreground text-sm md:text-lg max-w-md leading-relaxed font-light">
                Creativo Audiovisual y Director de Fotografía radicado en Colombia.
                Creando contenido publicitario digital cinematográfico.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-col gap-1.5 md:gap-2">
              
              <a href="mailto:davidariasdigital@gmail.com" className="flex items-center gap-3 text-muted-foreground text-xs md:text-sm hover:text-primary transition-colors duration-300">
                <Mail size={14} className="text-primary/60" /> davidariasdigital@gmail.com
              </a>
              <a href="tel:+573108781633" className="flex items-center gap-3 text-muted-foreground text-xs md:text-sm hover:text-primary transition-colors duration-300">
                <Phone size={14} className="text-primary/60" /> +57 310 878 1633
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="flex flex-wrap gap-2.5 md:gap-3 pt-1 md:pt-2">
              
              <a
                href="https://wa.me/573108781633"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-[12px] md:text-[13px] px-5 md:px-7 py-3 md:py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300">
                
                Chatea en WhatsApp
                <MessageCircle size={14} className="group-hover:rotate-12 transition-transform duration-300" />
              </a>
              <a
                href="#reel"
                className="group inline-flex items-center gap-2 liquid-btn font-semibold text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground px-5 md:px-7 py-3 md:py-3.5 rounded-full">
                
                Ver Reel
                <Play size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </a>
            </motion.div>
          </div>

          {/* Right — portrait */}
          <motion.div
            style={{ y: imgY }}
            className="lg:col-span-2 flex justify-center lg:justify-end">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative">
              
              <div className="liquid-glass-rainbow rounded-[var(--radius)] p-2.5 md:p-3 w-[220px] sm:w-[280px] md:w-[340px] lg:w-[380px]">
                <div className="rounded-[calc(var(--radius)-8px)] overflow-hidden">
                  <img
                    src={davidPortrait}
                    alt="David Arias — Director de Fotografía"
                    className="w-full h-auto" />
                  
                </div>
                <div className="flex items-center justify-between px-3 py-3">
                  <div>
                    <p className="text-[12px] font-bold text-foreground">David Arias</p>
                    <p className="text-[10px] text-muted-foreground">Director of Photography</p>
                  </div>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 rounded-full px-3 py-1">Filmmaker</span>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -right-5 top-12 liquid-glass rounded-2xl px-4 py-2.5 hidden lg:block">
                
                <p className="text-[10px] font-extrabold text-primary">5+ Años</p>
                <p className="text-[9px] text-muted-foreground">Experiencia</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -left-5 bottom-24 liquid-glass rounded-2xl px-4 py-2.5 hidden lg:block">
                
                <p className="text-[10px] font-extrabold text-primary">40+</p>
                <p className="text-[9px] text-muted-foreground">Marcas</p>
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        
        <div className="liquid-glass rounded-full px-5 py-2.5 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1 h-3 rounded-full bg-primary/50" />
          
        </div>
      </motion.div>
    </section>);

};

export default HeroSection;