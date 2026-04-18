import { useRef, useEffect } from "react";
import { useInView } from "framer-motion";

const ReelSection = () => {
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(iframeContainerRef, { margin: "-100px", once: true });
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    if (isInView && !hasAutoPlayed.current && iframeContainerRef.current) {
      hasAutoPlayed.current = true;
      iframeContainerRef.current.innerHTML = `<iframe 
        src="https://www.youtube.com/embed/D3ZueneGbbA?autoplay=1&mute=1&rel=0&modestbranding=1" 
        title="Reel David Arias"
        class="w-full h-full absolute inset-0"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>`;
    }
  }, [isInView]);

  return (
    <section id="reel" className="pt-8 md:pt-12 pb-2 md:pb-4 px-6 md:px-12 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <span className="liquid-glass rounded-full px-5 py-2 text-[11px] font-semibold text-primary inline-flex items-center gap-2 mb-6">
            Showreel 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            El trabajo habla
            <br />
            <span className="text-primary">por sí mismo.</span>
          </h2>
        </div>

        <div className="liquid-glass-rainbow rounded-[var(--radius)] p-3 md:p-4 glow-soft block">
          <div className="aspect-video w-full rounded-[calc(var(--radius)-8px)] overflow-hidden bg-muted relative" ref={iframeContainerRef}>
            <img
              src="https://img.youtube.com/vi/D3ZueneGbbA/maxresdefault.jpg"
              alt="Reel David Arias"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReelSection;
