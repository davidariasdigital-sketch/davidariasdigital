import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Phone, MessageCircle, Play } from "lucide-react";
import { useRef } from "react";
import davidAvatar from "@/assets/david-avatar.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="inicio" ref={ref} className="relative min-h-[85vh] md:min-h-[90vh] overflow-hidden flex items-center">
      {/* Soft ambient blobs */}
      <div className="blob w-[500px] h-[500px] bg-primary/40 -top-32 -left-32 float-slow" />
      <div className="blob w-[400px] h-[400px] bg-blue-300/30 top-1/3 -right-32 float-slower" />
      <div className="blob w-[350px] h-[350px] bg-pink-300/20 bottom-10 left-1/4 float-slow" />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-6xl mx-auto px-5 md:px-12 w-full pt-20 md:pt-28 pb-10 md:pb-20">
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>

             <h1 className="leading-none tracking-[-0.03em] flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <img src={davidAvatar} alt="David Arias" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-primary/30" />
                <span className="text-foreground font-medium text-lg md:text-2xl leading-none">David Arias</span>
              </div>
              <img alt="DIGITAL" className="block w-full max-w-[280px] sm:max-w-[380px] md:max-w-[700px] h-auto my-0 mx-auto" src="/lovable-uploads/ea292b88-743f-42b5-ae68-779729afb4a3.png" />
            </h1>

            <p className="text-muted-foreground text-sm md:text-lg max-w-md leading-relaxed font-light -mt-2 md:-mt-4 mx-auto">Creativo Audiovisual</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-col gap-1.5 md:gap-2 items-center">
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
            className="flex flex-wrap gap-2.5 md:gap-3 pt-1 md:pt-2 justify-center">
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
      </motion.div>
    </section>
  );
};

export default HeroSection;
