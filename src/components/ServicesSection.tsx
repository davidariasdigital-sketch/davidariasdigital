import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv, Music, CalendarDays, Palette, Aperture, Smartphone, Handshake,
  Plus, Minus, ArrowUpRight,
} from "lucide-react";

const services = [
  { icon: Tv, title: "Producción Comercial", price: "Desde $2.5M COP", description: "Producción integral de comerciales publicitarios con calidad cinematográfica para marcas que buscan destacar." },
  { icon: Music, title: "Dirección de Videos Musicales", price: "Desde $3M COP", description: "Creación de universos visuales únicos que potencian la identidad artística de cada proyecto musical." },
  { icon: CalendarDays, title: "Cubrimiento de Eventos", price: "Desde $1.5M COP", description: "Cobertura audiovisual profesional de eventos corporativos, conciertos y activaciones de marca." },
  { icon: Palette, title: "Color Grading", price: "Desde $800K COP", description: "Corrección y etalonaje de color profesional para darle la estética cinematográfica a tu proyecto." },
  { icon: Aperture, title: "Sesión Fotográfica", price: "Desde $1.2M COP", description: "Fotografía publicitaria y editorial con dirección de arte, iluminación profesional y retoque." },
  { icon: Smartphone, title: "Pack Redes Sociales", price: "Desde $2M COP", description: "Creación de contenido audiovisual optimizado para redes sociales con estrategia visual." },
  { icon: Handshake, title: "Colaboración / Alianzas", price: "A convenir", description: "Proyectos colaborativos y alianzas estratégicas con marcas y creadores afines." },
];

const ServicesSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="sobre-mí" className="py-32 md:py-40 px-8 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-medium mb-3">
            Haz clic para ver la inversión
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Servicios e Inversión
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/8">
          {services.map((service, i) => {
            const isOpen = openIndex === i;
            const Icon = service.icon;
            const whatsappMsg = encodeURIComponent(`Hola David, me interesa el servicio de ${service.title}. ¿Podemos hablar?`);

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-background"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-7 text-left group hover:bg-card transition-colors duration-500"
                >
                  <div className="flex items-center gap-4">
                    <Icon size={18} className="text-primary/70 shrink-0" />
                    <span className="font-medium text-[13px] text-foreground/80 group-hover:text-foreground transition-colors tracking-wide">
                      {service.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <Minus size={16} className="text-primary shrink-0" />
                  ) : (
                    <Plus size={16} className="text-foreground/30 group-hover:text-foreground/60 shrink-0 transition-colors" />
                  )}
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
                      <div className="px-7 pb-7 border-t border-foreground/5 pt-5">
                        <p className="text-2xl font-black text-primary tracking-tight">
                          {service.price}
                        </p>
                        <p className="mt-3 text-muted-foreground text-[13px] leading-[1.7]">
                          {service.description}
                        </p>
                        <a
                          href={`https://wa.me/573108781633?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center gap-2 text-primary text-[11px] tracking-[0.2em] uppercase font-semibold hover:gap-3 transition-all duration-300"
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
