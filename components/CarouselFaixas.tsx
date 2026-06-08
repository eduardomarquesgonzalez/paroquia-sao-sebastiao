"use client";

import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import Image from "next/image";

interface Slide {
  id: string;
  image: string;
}

export default function CarouselFaixas({ children }: { children?: ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/banner-slides")
      .then((r) => r.json())
      .then((data: Slide[]) => {
        if (Array.isArray(data)) setSlides(data);
      })
      .catch(() => {})
      .finally(() => setTimeout(() => setLoaded(true), 120));
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.8)));
      setParallaxY(ratio * 70);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Overlays = () => (
    <>
      {/* Camada 1: base dark azulado */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "rgba(4, 9, 20, 0.22)" }}
      />

      {/* Camada 2: gradiente direcional cinematográfico */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(108deg, rgba(4,10,24,0.72) 0%, rgba(7,16,38,0.50) 35%, rgba(4,9,20,0.15) 68%, rgba(4,9,20,0.04) 100%)",
        }}
      />

      {/* Camada 3: vignette inferior profundo */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: "45%",
          background:
            "linear-gradient(to top, rgba(4,9,20,0.75) 0%, rgba(4,9,20,0.40) 30%, rgba(4,9,20,0.10) 60%, transparent 100%)",
        }}
      />

      {/* Camada 4: vignette superior */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: "22%",
          background:
            "linear-gradient(to bottom, rgba(4,9,20,0.38) 0%, rgba(4,9,20,0.08) 50%, transparent 100%)",
        }}
      />

      {/* Camada 5: vignette lateral esquerda */}
      <div
        className="absolute inset-y-0 left-0 z-10 pointer-events-none hidden md:block"
        style={{
          width: "40%",
          background:
            "linear-gradient(to right, rgba(4,9,20,0.52) 0%, rgba(4,9,20,0.12) 60%, transparent 100%)",
        }}
      />

      {/* Camada 6: glow dourado ambiental — canto superior esquerdo */}
      <div
        className="absolute top-0 left-0 z-10 pointer-events-none"
        style={{
          width: "60%",
          height: "70%",
          background:
            "radial-gradient(ellipse at 15% 20%, rgba(201,168,76,0.11) 0%, transparent 60%)",
        }}
      />

      {/* Camada 7: glow azul profundo — canto inferior direito */}
      <div
        className="absolute bottom-0 right-0 z-10 pointer-events-none"
        style={{
          width: "70%",
          height: "60%",
          background:
            "radial-gradient(ellipse at 85% 90%, rgba(13,27,62,0.60) 0%, transparent 65%)",
        }}
      />

      {/* Camada 8: textura grain sutil para profundidade */}
      <div
        className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "300px 300px",
        }}
      />
    </>
  );

  /* ── FALLBACK sem slides ── */
  if (slides.length === 0) {
    return (
      <div
        ref={sectionRef}
        className="relative w-full min-h-[580px] md:min-h-[720px] overflow-hidden flex items-center"
        style={{ backgroundColor: "#040914" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #07122a 0%, #0d1b3e 50%, #040914 100%)",
          }}
        />
        <Overlays />
        {children && <div className="relative z-20 w-full">{children}</div>}
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden min-h-[580px] md:min-h-[720px]"
      style={{ backgroundColor: "#040914" }}
    >
      {/* Slides com parallax */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1200 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translateY(${parallaxY}px) scale(1.10)`,
            transformOrigin: "center center",
            willChange: "transform",
            transitionDuration: index === current ? "1200ms" : "1200ms",
          }}
        >
          <Image
            src={slide.image}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover object-center"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Sistema de overlays cinematográfico */}
      <Overlays />

      {/* Conteúdo */}
      {children && (
        <div
          className="relative z-20 w-full h-full"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          {children}
        </div>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
              className={`rounded-full transition-all duration-500 ${
                index === current
                  ? "w-8 h-2 bg-parish-gold shadow-gold"
                  : "w-2 h-2 bg-white/30 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
