import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";
import davidNavbar from "@/assets/david-navbar.jpg";

const navItemsBefore = [
  { label: "Sobre Mí", href: "#inicio" },
  { label: "Reel", href: "#reel" },
];

const navItemsAfter = [
  { label: "Servicios", href: "#servicios" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-4xl rounded-full liquid-glass-rainbow"
      >
        <div className="px-4 md:px-6 py-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="hidden md:flex items-center gap-1">
            {navItemsBefore.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[12px] font-medium tracking-wide text-foreground/50 hover:text-foreground px-4 py-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="w-10 h-10 rounded-full overflow-hidden ring-[2.5px] ring-primary flex-shrink-0 pointer-events-none shadow-[0_4px_15px_-2px_rgba(0,0,0,0.3)]">
            <img src={davidNavbar} alt="David Arias" className="w-full h-full object-cover" />
          </div>

          <div className="hidden md:flex items-center justify-end gap-1">
            {navItemsAfter.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[12px] font-medium tracking-wide text-foreground/50 hover:text-foreground px-4 py-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              className="text-foreground/40 hover:text-foreground p-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
              aria-label="Iniciar sesión"
            >
              <User size={16} />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-foreground/60 p-2"
              aria-label="Menú"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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
                {[...navItemsBefore, ...navItemsAfter].map((item) => (
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
    </div>
  );
};

export default Navbar;
