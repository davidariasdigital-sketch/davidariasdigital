import { motion } from "framer-motion";
import {
  Tv, Music, CalendarDays, Palette, Aperture, Smartphone, Handshake,
  ArrowUpRight,
} from "lucide-react";

const services = [
  { icon: Tv, title: "Producción Comercial", description: "Comerciales publicitarios con calidad cinematográfica." },
  { icon: Music, title: "Videos Musicales", description: "Universos visuales únicos para proyectos musicales." },
  { icon: CalendarDays, title: "Cubrimiento de Eventos", description: "Cobertura audiovisual profesional de eventos." },
  { icon: Palette, title: "Color Grading", description: "Corrección y etalonaje de color cinematográfico." },
  { icon: Aperture, title: "Sesión Fotográfica", description: "Fotografía publicitaria y editorial profesional." },
  { icon: Smartphone, title: "Pack Redes Sociales", description: "Contenido audiovisual optimizado para redes." },
  { icon: Handshake, title: "Colaboración / Alianzas", description: "Proyectos colaborativos con marcas y creadores." },
];

const ServicesSection = () => {
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
            const whatsappMsg = encodeURIComponent(`Hola David, me interesa el servicio de ${service.title}. ¿Podemos hablar?`);

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="liquid-glass rounded-[var(--radius)] p-5 flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-bold text-[13px] text-foreground mb-2 leading-tight">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed mb-4 flex-1">
                  {service.description}
                </p>
                <a
                  href={`https://wa.me/573108781633?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Solicitar <ArrowUpRight size={12} />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
