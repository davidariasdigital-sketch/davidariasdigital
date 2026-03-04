import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Smartphone, Play, MessageCircle, X } from "lucide-react";
import brandSolar from "@/assets/brand-solar.jpg";
import brandInhub from "@/assets/brand-inhub.jpg";

const BrandsSection = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section className="py-28 md:py-40 px-6 md:px-12 relative">
        <div className="orb w-[400px] h-[400px] bg-primary/15 top-1/3 right-0 float-slow" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="glass-subtle rounded-full px-4 py-1.5 text-[11px] font-medium text-primary inline-block mb-6">
              Proyectos Propios
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Mis Marcas
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SOLAR */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="glass-card overflow-hidden group hover:scale-[1.01] transition-transform duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-[calc(var(--radius)-1px)]">
                <img
                  src={brandSolar}
                  alt="SOLAR Productora"
                  className="w-full h-full object-cover brightness-[0.4] group-hover:brightness-[0.55] group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Film size={20} className="text-primary mb-3" />
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">SOLAR</h3>
                </div>
              </div>
              <div className="p-6 pt-4">
                <p className="text-foreground/40 text-[13px] leading-relaxed">
                  Productora de videoclips musicales. Creamos universos visuales únicos para artistas.
                </p>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-[12px] px-5 py-2.5 rounded-xl hover:brightness-110 hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.4)] transition-all duration-300"
                >
                  Ver Reel <Play size={13} />
                </button>
              </div>
            </motion.div>

            {/* InHub */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="glass-card overflow-hidden group hover:scale-[1.01] transition-transform duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-[calc(var(--radius)-1px)]">
                <img
                  src={brandInhub}
                  alt="InHub Agencia"
                  className="w-full h-full object-cover brightness-[0.4] group-hover:brightness-[0.55] group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Smartphone size={20} className="text-primary mb-3" />
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">InHub</h3>
                </div>
              </div>
              <div className="p-6 pt-4">
                <p className="text-foreground/40 text-[13px] leading-relaxed">
                  Agencia de creación de contenido publicitario potenciado con Inteligencia Artificial.
                </p>
                <a
                  href="https://wa.me/573108781633?text=Hola%2C%20me%20interesa%20cotizar%20un%20proyecto%20con%20InHub."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 glass font-medium text-[12px] text-foreground/70 hover:text-foreground px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-all duration-300"
                >
                  Cotizar Proyecto <MessageCircle size={13} />
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
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setVideoOpen(false)}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-6 right-6 glass-subtle rounded-full p-2 text-foreground/40 hover:text-foreground transition-colors z-10"
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl glass-card p-2 md:p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video rounded-[calc(var(--radius)-0.5rem)] overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="SOLAR Reel"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandsSection;
