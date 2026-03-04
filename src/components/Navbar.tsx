import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Sobre Mí", href: "#sobre-mí" },
  { label: "Reel", href: "#reel" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 mix-blend-difference"
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-6 flex items-center justify-between">
        <a href="#inicio" className="text-xl font-bold tracking-[0.15em] text-foreground">
          DA<span className="text-xs align-super">®</span>
        </a>

        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[11px] font-medium tracking-[0.25em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-500"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#contacto"
          className="hidden md:inline-flex text-[11px] font-medium tracking-[0.25em] uppercase border border-foreground/20 px-7 py-2.5 text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-all duration-500"
        >
          Hablemos
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-t border-foreground/5"
          >
            <div className="px-8 py-10 flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-medium tracking-[0.25em] uppercase text-foreground/70 hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setOpen(false)}
                className="text-[11px] font-medium tracking-[0.25em] uppercase border border-foreground/20 px-7 py-3 text-foreground/70 text-center hover:text-foreground transition-all"
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
