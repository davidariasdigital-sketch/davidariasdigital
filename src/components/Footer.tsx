import { Mail, Phone, Instagram, Globe, Heart } from "lucide-react";

const links = [
  { icon: Mail, label: "davidariasdigital@gmail.com", href: "mailto:davidariasdigital@gmail.com" },
  { icon: Phone, label: "+57 310 878 1633", href: "tel:+573108781633" },
  { icon: Instagram, label: "@davidariasdigital", href: "https://instagram.com/davidariasdigital" },
  { icon: Globe, label: "davidarias.co", href: "#" },
];

const Footer = () => {
  return (
    <footer id="contacto" className="py-24 md:py-32 px-6 border-t border-foreground/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.85] tracking-tighter text-foreground">
              DIGITAL
            </h2>
            <h2 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.85] tracking-tighter text-primary">
              CRAFTSMAN
            </h2>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Creemos algo icónico.
            </h3>
            <div className="flex flex-col gap-4">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 text-foreground/60 hover:text-primary transition-colors duration-300 text-sm font-mono"
                  >
                    <Icon size={16} />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-foreground/10 text-center text-foreground/40 text-xs tracking-wider">
          <p>
            © 2026 David Arias Digital. Todos los derechos reservados. Diseñado
            con <Heart size={12} className="inline text-primary" /> en Colombia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
