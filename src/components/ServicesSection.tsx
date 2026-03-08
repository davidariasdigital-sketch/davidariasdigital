import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv, Music, CalendarDays, Palette, Aperture, Smartphone, Handshake,
  ArrowUpRight, ChevronDown,
} from "lucide-react";

const services = [
  { icon: Tv, title: "Producción Comercial", price: "Desde $2.5M COP", description: "Comerciales publicitarios con calidad cinematográfica." },
  { icon: Music, title: "Videos Musicales", price: "Desde $3M COP", description: "Universos visuales únicos para proyectos musicales." },
  { icon: CalendarDays, title: "Cubrimiento de Eventos", price: "Desde $1.5M COP", description: "Cobertura audiovisual profesional de eventos." },
  { icon: Palette, title: "Color Grading", price: "Desde $800K COP", description: "Corrección y etalonaje de color cinematográfico." },
  { icon: Aperture, title: "Sesión Fotográfica", price: "Desde $1.2M COP", description: "Fotografía publicitaria y editorial profesional." },
  { icon: Smartphone, title: "Pack Redes Sociales", price: "Desde $2M COP", description: "Contenido audiovisual optimizado para redes." },
  { icon: Handshake, title: "Colaboración / Alianzas", price: "A convenir", description: "Proyectos colaborativos con marcas y creadores." },
];

const ServicesSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="servicios" className="py-16 md:py-24 px-6 md:px-12 relative">
      <div className="blob w-[500px] h-[500px] bg-pink-300/15 bottom-0 left-0 float-slower" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
            ¿Qué necesitas?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Menú de Servicios
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service, i) => {
            const Icon = service.icon;
            const isOpen = openIndex === i;
            const whatsappMsg = encodeURIComponent(`Hola David, me interesa el servicio de ${service.title}. ¿Podemos hablar?`);

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="liquid-glass rounded-[var(--radius)] overflow-hidden hover:scale-[1.03] transition-transform duration-300 group"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-[13px] text-foreground leading-tight mb-1">
                    {service.title}
                  </h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-1"
                  >
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 text-center">
                        <p className="text-xl font-black text-primary tracking-tight">
                          {service.price}
                        </p>
                        <p className="mt-1.5 text-muted-foreground text-[11px] leading-relaxed">
                          {service.description}
                        </p>
                        <a
                          href={`https://wa.me/573108781633?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                        >
                          Solicitar <ArrowUpRight size={12} />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
