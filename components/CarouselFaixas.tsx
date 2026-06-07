"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";

interface Slide {
  id: string;
  image: string;
}

export default function CarouselFaixas({ children }: { children?: ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/banner-slides")
      .then((r) => r.json())
      .then((data: Slide[]) => {
        if (Array.isArray(data)) setSlides(data);
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  /* Fallback when no slides */
  if (slides.length === 0) {
    return (
      <div className="relative w-full min-h-[520px] md:min-h-[620px] bg-gradient-navy flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-parish-navy-dark/90 via-parish-navy-dark/60 to-parish-navy-dark/30" />
        {children && <div className="relative z-20 w-full">{children}</div>}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden min-h-[520px] md:min-h-[620px]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
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

      {/* Cinematic directional overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-parish-navy-dark/82 via-parish-navy-dark/50 to-parish-navy-dark/15 z-10" />
      {/* Bottom fade for depth */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-parish-navy-dark/40 to-transparent z-10" />

      {/* Content */}
      {children && (
        <div className="relative z-20 w-full h-full">{children}</div>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
              className={`rounded-full transition-all duration-400 ${
                index === current
                  ? "w-7 h-2 bg-parish-gold"
                  : "w-2 h-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
