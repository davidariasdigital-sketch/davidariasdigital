import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Sobre Mí", href: "#inicio" },
  { label: "Reel", href: "#reel" },
  { label: "Servicios", href: "#servicios" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl transition-all duration-700 rounded-full ${
        scrolled ? "liquid-glass-rainbow" : "bg-transparent"
      }`}
    >
      <div className="px-6 py-3 flex items-center justify-between">
        <a href="#inicio" className="text-lg font-extrabold tracking-[0.08em] text-foreground">
          DA<span className="text-[10px] align-super text-primary">®</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[12px] font-medium tracking-wide text-foreground/50 hover:text-foreground px-4 py-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#contacto"
          className="hidden md:inline-flex text-[12px] font-bold tracking-wide bg-primary text-primary-foreground px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)] hover:scale-[1.03] transition-all duration-300"
        >
          Hablemos
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground/60"
          aria-label="Menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-6 pb-5 flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-[13px] font-medium text-foreground/50 hover:text-foreground px-4 py-3 rounded-2xl hover:bg-foreground/5 transition-all"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setOpen(false)}
                className="text-[13px] font-bold bg-primary text-primary-foreground px-4 py-3 rounded-2xl text-center mt-2"
              >
                Hablemos
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
