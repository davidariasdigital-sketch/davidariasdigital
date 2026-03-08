import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv, Music, CalendarDays, Palette, Aperture, Smartphone, Handshake,
  ChevronDown, ArrowUpRight,
} from "lucide-react";

const services = [
  { icon: Tv, title: "Producción Comercial", price: "Desde $2.5M COP", description: "Producción integral de comerciales publicitarios con calidad cinematográfica para marcas que buscan destacar." },
  { icon: Music, title: "Videos Musicales", price: "Desde $3M COP", description: "Creación de universos visuales únicos que potencian la identidad artística de cada proyecto musical." },
  { icon: CalendarDays, title: "Cubrimiento de Eventos", price: "Desde $1.5M COP", description: "Cobertura audiovisual profesional de eventos corporativos, conciertos y activaciones de marca." },
  { icon: Palette, title: "Color Grading", price: "Desde $800K COP", description: "Corrección y etalonaje de color profesional para darle la estética cinematográfica a tu proyecto." },
  { icon: Aperture, title: "Sesión Fotográfica", price: "Desde $1.2M COP", description: "Fotografía publicitaria y editorial con dirección de arte e iluminación profesional." },
  { icon: Smartphone, title: "Pack Redes Sociales", price: "Desde $2M COP", description: "Creación de contenido audiovisual optimizado para redes sociales con estrategia visual." },
  { icon: Handshake, title: "Colaboración / Alianzas", price: "A convenir", description: "Proyectos colaborativos y alianzas estratégicas con marcas y creadores afines." },
];

const ServicesSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="servicios" className="py-28 md:py-40 px-6 md:px-12 relative">
      <div className="blob w-[500px] h-[500px] bg-pink-300/15 bottom-0 left-0 float-slower" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
            Inversión aproximada
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Servicios e Inversión
          </h2>
        </motion.div>

        <div className="space-y-4">
          {services.map((service, i) => {
            const isOpen = openIndex === i;
            const Icon = service.icon;
            const whatsappMsg = encodeURIComponent(`Hola David, me interesa el servicio de ${service.title}. ¿Podemos hablar?`);

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="liquid-glass rounded-[var(--radius)] overflow-hidden hover:scale-[1.005] transition-transform duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="font-semibold text-[14px] text-foreground/80 group-hover:text-foreground transition-colors">
                      {service.title}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} className="text-muted-foreground" />
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
                      <div className="px-5 md:px-6 pb-6 pt-1 ml-[60px]">
                        <p className="text-2xl font-black text-primary tracking-tight">
                          {service.price}
                        </p>
                        <p className="mt-2 text-muted-foreground text-[13px] leading-relaxed">
                          {service.description}
                        </p>
                        <a
                          href={`https://wa.me/573108781633?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:shadow-lg text-[12px] font-bold px-5 py-2.5 rounded-full transition-all duration-300"
                        >
                          Reservar Ahora <ArrowUpRight size={13} />
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
