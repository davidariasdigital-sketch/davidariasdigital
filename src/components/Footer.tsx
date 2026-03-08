import { motion } from "framer-motion";
import { Mail, Phone, Instagram, Globe, Heart } from "lucide-react";

const links = [
  { icon: Mail, label: "davidariasdigital@gmail.com", href: "mailto:davidariasdigital@gmail.com" },
  { icon: Phone, label: "+57 310 878 1633", href: "tel:+573108781633" },
  { icon: Instagram, label: "@davidariasdigital", href: "https://instagram.com/davidariasdigital" },
  { icon: Globe, label: "davidarias.co", href: "#" },
];

const Footer = () => {
  return (
    <footer id="contacto" className="pt-28 md:pt-40 pb-10 px-6 md:px-12 relative">
      <div className="blob w-[600px] h-[600px] bg-primary/10 bottom-20 left-1/2 -translate-x-1/2 float-slow" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="liquid-glass-rainbow rounded-[var(--radius)] p-10 md:p-16 text-center mb-20 glow-soft"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
            Creemos algo
            <br />
            <span className="text-primary">icónico.</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
            ¿Tienes un proyecto en mente? Hablemos y hagamos realidad tu visión con contenido cinematográfico de alto nivel.
          </p>
          <a
            href="https://wa.me/573108781633"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-[13px] px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
          >
            Iniciar conversación
            <Mail size={15} />
          </a>
        </motion.div>

        {/* Contact links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="liquid-btn rounded-full px-5 py-3 flex items-center gap-3 text-muted-foreground hover:text-primary text-[12px] font-medium"
              >
                <Icon size={14} />
                {link.label}
              </a>
            );
          })}
        </motion.div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border text-center">
          <p className="text-muted-foreground/60 text-[11px] tracking-wider">
            © 2026 David Arias Digital. Todos los derechos reservados. Diseñado
            con <Heart size={10} className="inline text-primary/50 mx-0.5" /> en Colombia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
