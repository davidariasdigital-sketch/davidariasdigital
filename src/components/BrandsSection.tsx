import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Smartphone, Play, MessageCircle, X } from "lucide-react";
import brandSolar from "@/assets/brand-solar.jpg";
import brandInhub from "@/assets/brand-inhub.jpg";

const BrandsSection = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section className="py-32 md:py-40 px-8 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-medium mb-3">
              Proyectos Propios
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Mis Marcas
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SOLAR */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] overflow-hidden group"
            >
              <img
                src={brandSolar}
                alt="SOLAR Productora"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.25] group-hover:brightness-[0.35] group-hover:scale-[1.03] transition-all duration-700"
              />
              <div className="relative z-10 p-10 md:p-14 flex flex-col justify-end h-full">
                <Film size={24} className="text-primary/70 mb-6" />
                <h3 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">
                  SOLAR
                </h3>
                <p className="mt-4 text-muted-foreground text-[13px] leading-[1.7] max-w-xs">
                  Productora de videoclips musicales. Creamos universos visuales
                  únicos para artistas.
                </p>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="mt-8 inline-flex items-center gap-3 bg-primary text-primary-foreground font-semibold text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 w-fit hover:brightness-110 transition-all duration-500"
                >
                  Ver Reel <Play size={12} />
                </button>
              </div>
            </motion.div>

            {/* InHub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative aspect-[4/5] overflow-hidden group"
            >
              <img
                src={brandInhub}
                alt="InHub Agencia"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.25] group-hover:brightness-[0.35] group-hover:scale-[1.03] transition-all duration-700"
              />
              <div className="relative z-10 p-10 md:p-14 flex flex-col justify-end h-full">
                <Smartphone size={24} className="text-primary/70 mb-6" />
                <h3 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">
                  InHub
                </h3>
                <p className="mt-4 text-muted-foreground text-[13px] leading-[1.7] max-w-xs">
                  Agencia de creación de contenido publicitario potenciado con
                  Inteligencia Artificial.
                </p>
                <a
                  href="https://wa.me/573108781633?text=Hola%2C%20me%20interesa%20cotizar%20un%20proyecto%20con%20InHub."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-3 border border-foreground/15 text-foreground/80 hover:text-foreground hover:border-foreground/40 font-medium text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 w-fit transition-all duration-500"
                >
                  Cotizar Proyecto <MessageCircle size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-background/97 flex items-center justify-center p-6"
            onClick={() => setVideoOpen(false)}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-8 right-8 text-foreground/40 hover:text-foreground transition-colors z-10"
            >
              <X size={28} />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="SOLAR Reel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandsSection;
