import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Smartphone, Play, MessageCircle, X } from "lucide-react";
import brandSolar from "@/assets/brand-solar.jpg";
import brandInhub from "@/assets/brand-inhub.jpg";

const BrandsSection = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-foreground">
              Mis Marcas
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SOLAR */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={brandSolar}
                alt="SOLAR Productora"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.3] group-hover:brightness-[0.4] transition-all duration-500"
              />
              <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end h-full">
                <Film size={32} className="text-primary mb-4" />
                <h3 className="text-4xl md:text-5xl font-black text-foreground">SOLAR</h3>
                <p className="mt-3 text-foreground/60 text-sm leading-relaxed max-w-sm">
                  Productora de videoclips musicales. Creamos universos visuales únicos para artistas.
                </p>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase px-6 py-3 rounded-full w-fit hover:brightness-110 transition-all duration-300"
                >
                  Ver Reel <Play size={14} />
                </button>
              </div>
            </motion.div>

            {/* InHub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={brandInhub}
                alt="InHub Agencia"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.3] group-hover:brightness-[0.4] transition-all duration-500"
              />
              <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end h-full">
                <Smartphone size={32} className="text-primary mb-4" />
                <h3 className="text-4xl md:text-5xl font-black text-foreground">InHub</h3>
                <p className="mt-3 text-foreground/60 text-sm leading-relaxed max-w-sm">
                  Agencia de creación de contenido publicitario potenciado con Inteligencia Artificial.
                </p>
                <a
                  href="https://wa.me/573108781633?text=Hola%2C%20me%20interesa%20cotizar%20un%20proyecto%20con%20InHub."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 border border-foreground/30 text-foreground font-semibold text-sm tracking-wider uppercase px-6 py-3 rounded-full w-fit hover:bg-foreground/10 transition-all duration-300"
                >
                  Cotizar Proyecto <MessageCircle size={14} />
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
            className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center p-6"
            onClick={() => setVideoOpen(false)}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-6 right-6 text-foreground/60 hover:text-foreground transition-colors"
            >
              <X size={32} />
            </button>
            <div
              className="w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="SOLAR Reel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandsSection;
