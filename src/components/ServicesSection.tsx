import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tv, Music, CalendarDays, Palette, Aperture, Smartphone, Handshake,
  ArrowUpRight, X,
} from "lucide-react";

const services = [
  {
    icon: Tv, title: "Producción Comercial",
    description: "Producción integral de comerciales publicitarios con calidad cinematográfica para marcas que buscan destacar.",
    steps: ["Briefing y concepto creativo", "Pre-producción y planning", "Rodaje con equipo profesional", "Post-producción y entrega final"],
  },
  {
    icon: Music, title: "Videos Musicales",
    description: "Creación de universos visuales únicos que potencian la identidad artística de cada proyecto musical.",
    steps: ["Escucha del track y propuesta visual", "Diseño de arte y locaciones", "Rodaje cinematográfico", "Edición, color y VFX"],
  },
  {
    icon: CalendarDays, title: "Cubrimiento de Eventos",
    description: "Cobertura audiovisual profesional de eventos corporativos, conciertos y activaciones de marca.",
    steps: ["Reunión de necesidades", "Planificación de cobertura", "Grabación multicámara en vivo", "Edición y entrega express"],
  },
  {
    icon: Palette, title: "Color Grading",
    description: "Corrección y etalonaje de color profesional para darle la estética cinematográfica a tu proyecto.",
    steps: ["Análisis del material", "Corrección primaria", "Look cinematográfico personalizado", "Revisiones y entrega"],
  },
  {
    icon: Aperture, title: "Sesión Fotográfica",
    description: "Fotografía publicitaria y editorial con dirección de arte e iluminación profesional.",
    steps: ["Concepto y moodboard", "Dirección de arte", "Sesión con iluminación profesional", "Retoque y entrega digital"],
  },
  {
    icon: Smartphone, title: "Pack Redes Sociales",
    description: "Creación de contenido audiovisual optimizado para redes sociales con estrategia visual.",
    steps: ["Estrategia de contenido", "Producción de piezas", "Edición optimizada por plataforma", "Entrega con calendario"],
  },
  {
    icon: Handshake, title: "Colaboración / Alianzas",
    description: "Proyectos colaborativos y alianzas estratégicas con marcas y creadores afines.",
    steps: ["Propuesta de colaboración", "Alineación de objetivos", "Desarrollo conjunto", "Lanzamiento y difusión"],
  },
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  return (
    <>
      <section id="servicios" className="py-10 md:py-24 px-4 md:px-12 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
              ¿Qué necesitas?
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
              Menú de Servicios
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.title}
                  onClick={() => setSelectedService(i)}
                  className="liquid-glass rounded-[var(--radius)] p-4 md:p-5 flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-300 group cursor-pointer"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2.5 md:mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon size={18} className="text-primary md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-bold text-[11px] md:text-[13px] text-foreground leading-tight">
                    {service.title}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedService !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedService(null)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
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
