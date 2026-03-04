import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster=""
      >
        <source
          src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/80" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-[clamp(4rem,12vw,10rem)] font-black leading-[0.9] tracking-tighter">
            <span className="block text-foreground">DAVID</span>
            <span className="block text-primary">ARIAS</span>
          </h1>

          <div className="mt-8 flex items-start gap-4">
            <div className="w-12 h-[2px] bg-primary mt-3 shrink-0" />
            <p className="text-foreground/70 text-lg md:text-xl max-w-md leading-relaxed">
              Productor Audiovisual y Director de Fotografía radicado en Colombia.
              Creando contenido publicitario digital cinematográfico.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-2 text-foreground/60 text-sm font-mono">
            <a href="mailto:davidariasdigital@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail size={14} /> davidariasdigital@gmail.com
            </a>
            <a href="tel:+573108781633" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone size={14} /> +57 310 878 1633
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="https://wa.me/573108781633"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase px-8 py-4 rounded-full hover:brightness-110 transition-all duration-300"
            >
              Chatea en WhatsApp <MessageCircle size={16} />
            </a>
            <a
              href="#reel"
              className="inline-flex items-center gap-2 border border-foreground/30 text-foreground font-semibold text-sm tracking-wider uppercase px-8 py-4 rounded-full hover:bg-foreground/10 transition-all duration-300"
            >
              Ver Reel <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
