import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  Music,
  CalendarDays,
  Palette,
  Aperture,
  Smartphone,
  Handshake,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Tv,
    title: "Producción Comercial",
    price: "Desde $2.5M COP",
    description: "Producción integral de comerciales publicitarios con calidad cinematográfica para marcas que buscan destacar.",
  },
  {
    icon: Music,
    title: "Dirección de Videos Musicales",
    price: "Desde $3M COP",
    description: "Creación de universos visuales únicos que potencian la identidad artística de cada proyecto musical.",
  },
  {
    icon: CalendarDays,
    title: "Cubrimiento de Eventos",
    price: "Desde $1.5M COP",
    description: "Cobertura audiovisual profesional de eventos corporativos, conciertos y activaciones de marca.",
  },
  {
    icon: Palette,
    title: "Color Grading",
    price: "Desde $800K COP",
    description: "Corrección y etalonaje de color profesional para darle la estética cinematográfica a tu proyecto.",
  },
  {
    icon: Aperture,
    title: "Sesión Fotográfica",
    price: "Desde $1.2M COP",
    description: "Fotografía publicitaria y editorial con dirección de arte, iluminación profesional y retoque.",
  },
  {
    icon: Smartphone,
    title: "Pack Redes Sociales",
    price: "Desde $2M COP",
    description: "Creación de contenido audiovisual optimizado para redes sociales con estrategia visual.",
  },
  {
    icon: Handshake,
    title: "Colaboración / Alianzas",
    price: "A convenir",
    description: "Proyectos colaborativos y alianzas estratégicas con marcas y creadores afines.",
  },
];

const ServicesSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="sobre-mí" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-primary text-sm tracking-widest uppercase font-semibold">
            Haz clic para ver la inversión aproximada
          </p>
          <h2 className="text-4xl md:text-5xl font-black mt-2 text-foreground">
            Servicios e Inversión
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => {
            const isOpen = openIndex === i;
            const Icon = service.icon;
            const whatsappMsg = encodeURIComponent(
              `Hola David, me interesa el servicio de ${service.title}. ¿Podemos hablar?`
            );

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-foreground/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-foreground/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-primary shrink-0" />
                    <span className="font-semibold text-sm text-foreground">
                      {service.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <Minus size={18} className="text-foreground/50 shrink-0" />
                  ) : (
                    <Plus size={18} className="text-foreground/50 shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-foreground/10 pt-4">
                        <p className="text-2xl font-black text-primary">
                          {service.price}
                        </p>
                        <p className="mt-2 text-foreground/60 text-sm leading-relaxed">
                          {service.description}
                        </p>
                        <a
                          href={`https://wa.me/573108781633?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
                        >
                          Reservar Ahora <ArrowRight size={14} />
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
