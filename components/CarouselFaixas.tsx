"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";

interface Slide {
  id: string;
  image: string;
}

const FALLBACK: Slide[] = [
  { id: "f1", image: "/faixa-1.png" },
  { id: "f2", image: "/faixa-2.png" },
  { id: "f3", image: "/faixa-3.png" },
];

export default function CarouselFaixas({ children }: { children?: ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/banner-slides")
      .then((r) => r.json())
      .then((data: Slide[]) => {
        if (Array.isArray(data) && data.length > 0) setSlides(data);
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-black/50 z-10" />

      {children && <div className="relative z-20">{children}</div>}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
