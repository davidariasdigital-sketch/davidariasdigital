const brandNames = [
  "La Pescadería", "Uva de lujo", "Palmetto", "El Cortijo", "Comité Olímpico",
  "Hunts", "Coloriss", "TQ", "Yanko", "Satillos", "La Cava",
  "Nutricionista Natalia Valencia", "Hair Beauty", "Kimeline", "Angus Burguer",
  "Michelangelo", "Restaurante 1975", "Epioné", "Rombo Quadrado", "Jazz Café",
  "Joykeys", "Salon IN", "Iluminata", "Impocali", "Self", "Nize", "Atavico",
  "Vitane", "Shibumi", "Luminance", "Tanga", "Suarez Abogados", "Dermocorea",
  "Resonance", "Aromasense", "Greencode", "Deopies", "Muss", "Follies",
  "Recamier Corp", "Ruuts", "Whitman", "Sra Buenaventura",
];

const BrandsShowcase = () => {
  const duplicatedBrands = [...brandNames, ...brandNames];

  return (
    <section id="marcas" className="py-10 md:py-24 px-4 md:px-12 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
            Portafolio
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Marcas que han
            <br />
            <span className="text-primary">confiado en mí.</span>
          </h2>
        </div>

        {/* Brands marquee */}
        <div className="mb-12 relative overflow-hidden py-4">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {duplicatedBrands.map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="mx-5 text-sm font-bold text-foreground/20 tracking-widest uppercase"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Video */}
        <a
          href="https://www.youtube.com/watch?v=vqayenZYeNo"
          target="_blank"
          rel="noopener noreferrer"
          className="liquid-glass-rainbow rounded-[var(--radius)] p-3 md:p-4 glow-soft block group"
        >
          <div className="aspect-video w-full rounded-[calc(var(--radius)-8px)] overflow-hidden bg-muted relative">
            <img
              src="https://img.youtube.com/vi/vqayenZYeNo/maxresdefault.jpg"
              alt="Marcas — David Arias"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
};

export default BrandsShowcase;
