import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Reel", href: "#reel" },
  { label: "Servicios", href: "#servicios" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-background/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-12">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo / Brand */}
          <a href="#inicio" className="flex items-center gap-2">
            <span className="text-sm md:text-base font-bold text-foreground tracking-tight">
              David<span className="text-primary">.</span>
            </span>
          </a>

          {/* Desktop links */}
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

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="text-foreground/40 hover:text-foreground p-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
              aria-label="Iniciar sesión"
            >
              <User size={16} />
            </Link>
            <a
              href="https://wa.me/573108781633"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold bg-primary text-primary-foreground px-5 py-2 rounded-full hover:scale-[1.03] transition-all duration-300"
            >
              Hablemos
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-foreground/60 p-2 -mr-2"
            aria-label="Menú"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-t border-foreground/5"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-[14px] font-medium text-foreground/60 hover:text-foreground px-4 py-3 rounded-xl hover:bg-foreground/5 transition-all"
                >
                  {item.label}
                </motion.a>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-[14px] font-medium text-foreground/60 hover:text-foreground px-4 py-3 rounded-xl hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <User size={15} /> Iniciar sesión
              </Link>
              <a
                href="https://wa.me/573108781633"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-[13px] font-bold bg-primary text-primary-foreground px-4 py-3 rounded-xl text-center mt-2"
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
