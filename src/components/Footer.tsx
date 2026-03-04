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
    <footer id="contacto" className="pt-32 md:pt-40 pb-12 px-8 md:px-12 border-t border-foreground/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.85] tracking-[-0.04em]">
              <span className="block text-foreground/15">DIGITAL</span>
              <span className="block text-primary/80">CRAFTSMAN</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:pt-4"
          >
            <h3 className="text-xl font-semibold text-foreground tracking-tight mb-10">
              Creemos algo icónico.
            </h3>
            <div className="flex flex-col gap-5">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors duration-500 text-[12px] tracking-[0.15em] group"
                  >
                    <Icon size={14} className="text-foreground/20 group-hover:text-primary transition-colors duration-500" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="mt-28 pt-8 border-t border-foreground/5 text-center">
          <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase">
            © 2026 David Arias Digital. Todos los derechos reservados. Diseñado
            con <Heart size={10} className="inline text-primary/60 mx-0.5" /> en Colombia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
