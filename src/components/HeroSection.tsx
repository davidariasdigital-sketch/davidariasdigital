import { Mail, Phone, MessageCircle, Play } from "lucide-react";
import davidAvatar from "@/assets/david-avatar.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-[85vh] md:min-h-[90vh] overflow-hidden flex items-center">
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-12 w-full pt-20 md:pt-28 pb-10 md:pb-20">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12">
          {/* Mobile only: Avatar on top */}
          <div className="flex-shrink-0 md:hidden">
            <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl">
              <img src={davidAvatar} alt="David Arias" className="w-full h-full object-cover" loading="eager" />
            </div>
          </div>

          {/* Left: Text content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
            <h1 className="leading-none tracking-[-0.03em] flex flex-col items-center md:items-start gap-2">
              <span className="text-foreground font-medium text-lg md:text-2xl leading-none">David Arias</span>
              <img alt="DIGITAL" className="block w-full max-w-[260px] sm:max-w-[340px] md:max-w-[480px] h-auto" src="/lovable-uploads/ea292b88-743f-42b5-ae68-779729afb4a3.png" loading="eager" />
            </h1>

            <p className="text-muted-foreground text-sm md:text-xl max-w-md leading-relaxed font-light">Creativo Audiovisual</p>

            <div className="flex flex-col gap-1.5 md:gap-2 items-center md:items-start">
              <a href="mailto:davidariasdigital@gmail.com" className="flex items-center gap-3 text-muted-foreground text-xs md:text-sm hover:text-primary transition-colors duration-300">
                <Mail size={14} className="text-primary/60" /> davidariasdigital@gmail.com
              </a>
              <a href="tel:+573108781633" className="flex items-center gap-3 text-muted-foreground text-xs md:text-sm hover:text-primary transition-colors duration-300">
                <Phone size={14} className="text-primary/60" /> +57 310 878 1633
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5 md:gap-3 pt-1 md:pt-2 justify-center md:justify-start">
              <a
                href="https://wa.me/573108781633"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-[12px] md:text-[13px] px-5 md:px-7 py-3 md:py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300">
                Chatea en WhatsApp
                <MessageCircle size={14} className="group-hover:rotate-12 transition-transform duration-300" />
              </a>
              <a
                href="#reel"
                className="group inline-flex items-center gap-2 liquid-btn font-semibold text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground px-5 md:px-7 py-3 md:py-3.5 rounded-full">
                Ver Reel
                <Play size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* Right: Large avatar (desktop only) */}
          <div className="flex-shrink-0 hidden md:block">
            <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl">
              <img src={davidAvatar} alt="David Arias" className="w-full h-full object-cover" loading="eager" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
