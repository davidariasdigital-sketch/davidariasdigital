import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="#inicio" className="text-2xl font-black tracking-tight text-foreground">
          DA®
        </a>

        <div className="hidden md:flex items-center gap-10">
          {["Sobre Mí", "Reel", "Contacto"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <a
          href="#contacto"
          className="hidden md:inline-flex text-sm font-medium tracking-wider uppercase border border-foreground/30 rounded-full px-6 py-2.5 text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
        >
          Hablemos
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-md border-t border-foreground/10 px-6 py-6 flex flex-col gap-4"
        >
          {["Sobre Mí", "Reel", "Contacto"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => setOpen(false)}
              className="text-sm font-medium tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="text-sm font-medium tracking-wider uppercase border border-foreground/30 rounded-full px-6 py-2.5 text-foreground text-center hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Hablemos
          </a>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
