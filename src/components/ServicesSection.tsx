import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv, Music, CalendarDays, Palette, Aperture, Smartphone, Handshake,
  ArrowUpRight, X,
} from "lucide-react";

const services = [
  {
    icon: Tv, title: "Producción Comercial", price: "Desde $2.5M COP",
    description: "Producción integral de comerciales publicitarios con calidad cinematográfica para marcas que buscan destacar.",
    steps: ["Briefing y concepto creativo", "Pre-producción y planning", "Rodaje con equipo profesional", "Post-producción y entrega final"],
  },
  {
    icon: Music, title: "Videos Musicales", price: "Desde $3M COP",
    description: "Creación de universos visuales únicos que potencian la identidad artística de cada proyecto musical.",
    steps: ["Escucha del track y propuesta visual", "Diseño de arte y locaciones", "Rodaje cinematográfico", "Edición, color y VFX"],
  },
  {
    icon: CalendarDays, title: "Cubrimiento de Eventos", price: "Desde $1.5M COP",
    description: "Cobertura audiovisual profesional de eventos corporativos, conciertos y activaciones de marca.",
    steps: ["Reunión de necesidades", "Planificación de cobertura", "Grabación multicámara en vivo", "Edición y entrega express"],
  },
  {
    icon: Palette, title: "Color Grading", price: "Desde $800K COP",
    description: "Corrección y etalonaje de color profesional para darle la estética cinematográfica a tu proyecto.",
    steps: ["Análisis del material", "Corrección primaria", "Look cinematográfico personalizado", "Revisiones y entrega"],
  },
  {
    icon: Aperture, title: "Sesión Fotográfica", price: "Desde $1.2M COP",
    description: "Fotografía publicitaria y editorial con dirección de arte e iluminación profesional.",
    steps: ["Concepto y moodboard", "Dirección de arte", "Sesión con iluminación profesional", "Retoque y entrega digital"],
  },
  {
    icon: Smartphone, title: "Pack Redes Sociales", price: "Desde $2M COP",
    description: "Creación de contenido audiovisual optimizado para redes sociales con estrategia visual.",
    steps: ["Estrategia de contenido", "Producción de piezas", "Edición optimizada por plataforma", "Entrega con calendario"],
  },
  {
    icon: Handshake, title: "Colaboración / Alianzas", price: "A convenir",
    description: "Proyectos colaborativos y alianzas estratégicas con marcas y creadores afines.",
    steps: ["Propuesta de colaboración", "Alineación de objetivos", "Desarrollo conjunto", "Lanzamiento y difusión"],
  },
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  return (
    <>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.button
                  key={service.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  onClick={() => setSelectedService(i)}
                  className="liquid-glass rounded-[var(--radius)] p-5 flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-[13px] text-foreground leading-tight">
                    {service.title}
                  </h3>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal / Pop-up */}
      <AnimatePresence>
        {selectedService !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedService(null)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md liquid-glass-rainbow rounded-[var(--radius)] p-7 md:p-8 glow-soft"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>

              {(() => {
                const service = services[selectedService];
                const Icon = service.icon;
                const whatsappMsg = encodeURIComponent(`Hola David, me interesa el servicio de ${service.title}. ¿Podemos hablar?`);

                return (
                  <>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{service.title}</h3>
                        <p className="text-primary font-black text-sm">{service.price}</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-[13px] leading-relaxed mb-6">
                      {service.description}
                    </p>

                    <div className="mb-6">
                      <p className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-3">
                        Proceso paso a paso
                      </p>
                      <div className="space-y-3">
                        {service.steps.map((step, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[11px] font-bold text-primary">{j + 1}</span>
                            </div>
                            <p className="text-[13px] text-foreground/80">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/573108781633?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[13px] font-bold px-5 py-3 rounded-full hover:shadow-lg transition-all duration-300"
                    >
                      Solicitar este servicio <ArrowUpRight size={14} />
                    </a>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ServicesSection;
