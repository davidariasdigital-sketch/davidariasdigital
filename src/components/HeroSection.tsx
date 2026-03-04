import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, Play } from "lucide-react";
import davidPortrait from "@/assets/david-portrait.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source
          src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-12 w-full min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center w-full pt-24 pb-16">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-medium mb-8"
            >
              Productor Audiovisual &bull; Director de Fotografía
            </motion.p>

            <h1 className="leading-[0.85] tracking-[-0.04em]">
              <span className="block text-[clamp(4.5rem,11vw,9rem)] font-black text-foreground">
                DAVID
              </span>
              <span className="block text-[clamp(4.5rem,11vw,9rem)] font-black text-primary">
                ARIAS
              </span>
            </h1>

            <div className="mt-10 flex items-start gap-5">
              <div className="w-10 h-px bg-primary mt-3 shrink-0" />
              <p className="text-muted-foreground text-[15px] max-w-sm leading-[1.8] font-light">
                Radicado en Colombia. Creando contenido publicitario digital con
                estética cinematográfica de alto impacto.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <a
                href="mailto:davidariasdigital@gmail.com"
                className="flex items-center gap-3 text-muted-foreground text-[12px] tracking-[0.15em] hover:text-primary transition-colors duration-500"
              >
                <Mail size={13} className="text-primary/60" />
                davidariasdigital@gmail.com
              </a>
              <a
                href="tel:+573108781633"
                className="flex items-center gap-3 text-muted-foreground text-[12px] tracking-[0.15em] hover:text-primary transition-colors duration-500"
              >
                <Phone size={13} className="text-primary/60" />
                +57 310 878 1633
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="https://wa.me/573108781633"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-primary text-primary-foreground font-semibold text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:brightness-110 transition-all duration-500"
              >
                Chatea en WhatsApp
                <MessageCircle size={14} className="group-hover:rotate-12 transition-transform" />
              </a>
              <a
                href="#reel"
                className="group inline-flex items-center gap-3 border border-foreground/15 text-foreground/70 hover:text-foreground hover:border-foreground/40 font-medium text-[11px] tracking-[0.2em] uppercase px-8 py-4 transition-all duration-500"
              >
                Ver Reel
                <Play size={12} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Right: Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-[320px] md:w-[400px] lg:w-[440px]">
              {/* Golden accent frame */}
              <div className="absolute -top-4 -right-4 w-full h-full border border-primary/20" />
              <div className="relative overflow-hidden">
                <img
                  src={davidPortrait}
                  alt="David Arias — Director de Fotografía"
                  className="w-full h-auto grayscale-[30%] contrast-[1.1]"
                />
                {/* Film grain on photo */}
                <div className="absolute inset-0 film-grain pointer-events-none" />
              </div>
              {/* Caption */}
              <div className="absolute -bottom-6 left-0 flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                  Director of Photography
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
