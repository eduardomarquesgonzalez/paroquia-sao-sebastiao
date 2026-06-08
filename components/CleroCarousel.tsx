"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, UserCircle2, ArrowRight } from "lucide-react";

interface CleroMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  currentRole: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  "Pároco": "bg-parish-gold/15 text-parish-gold border-parish-gold/30",
  "Vigário": "bg-parish-navy/10 text-parish-navy border-parish-navy/20",
  "Seminarista": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-64 bg-parish-surface rounded-2xl overflow-hidden border border-parish-border animate-pulse">
      <div className="h-60 bg-parish-primary/30" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-parish-primary/40 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-parish-primary/25 rounded w-1/2 mx-auto" />
        <div className="h-8 bg-parish-primary/20 rounded-lg mt-4" />
      </div>
    </div>
  );
}

export default function CleroCarousel({ members }: { members: CleroMember[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const CARD_W = 272; // 256 + 16 gap

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  const scrollTo = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const maxIndex = Math.max(0, members.length - 1);
    const safe = Math.max(0, Math.min(index, maxIndex));
    el.scrollTo({ left: safe * CARD_W, behavior: "smooth" });
    setCurrent(safe);
  }, [members.length]);

  const prev = useCallback(() => scrollTo(current - 1), [current, scrollTo]);
  const next = useCallback(() => scrollTo(current + 1), [current, scrollTo]);

  /* Auto-advance */
  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent((c) => {
        const el = trackRef.current;
        if (!el) return c;
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8;
        const next = atEnd ? 0 : c + 1;
        el.scrollTo({ left: next * CARD_W, behavior: "smooth" });
        return next;
      });
    }, 4000);
  }, []);

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [resetAuto]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows]);

  return (
    <div className="relative group/carousel">
      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onMouseEnter={() => { if (autoRef.current) clearInterval(autoRef.current); }}
        onMouseLeave={resetAuto}
      >
        {members.map((m) => (
          <div
            key={m.id}
            className="flex-shrink-0 w-64 snap-start group/card bg-parish-surface rounded-2xl overflow-hidden border border-parish-border/70 hover:border-parish-gold/40 hover:shadow-[0_8px_32px_rgba(174,142,60,0.12)] hover:-translate-y-1.5 transition-all duration-300"
          >
            {/* Photo */}
            <div className="relative h-60 overflow-hidden bg-gradient-to-br from-parish-navy/10 to-parish-gold/10 flex items-center justify-center">
              {m.photo ? (
                <img
                  src={m.photo}
                  alt={m.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              ) : (
                <UserCircle2 className="w-24 h-24 text-parish-navy/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-parish-navy-dark/50 via-transparent to-transparent" />

              {/* Role badge */}
              <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm ${ROLE_COLORS[m.role] ?? "bg-white/80 text-parish-text border-parish-border"}`}>
                {m.role}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-3">
              <div className="text-center">
                <h3 className="font-playfair text-base font-bold text-parish-navy-dark leading-snug line-clamp-2">
                  {m.name}
                </h3>
                {m.currentRole && (
                  <p className="text-xs text-parish-text-light mt-1 line-clamp-1">{m.currentRole}</p>
                )}
              </div>

              <Link
                href={`/clero/${m.id}`}
                className="group/btn flex items-center justify-center gap-1.5 w-full py-2 bg-parish-navy text-white text-xs font-semibold rounded-lg hover:bg-parish-gold transition-colors duration-200 mt-auto"
              >
                Ver mais
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Prev arrow */}
      <button
        onClick={() => { prev(); resetAuto(); }}
        disabled={!canPrev}
        aria-label="Anterior"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border border-parish-border shadow-md flex items-center justify-center text-parish-navy hover:text-parish-gold hover:border-parish-gold transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Next arrow */}
      <button
        onClick={() => { next(); resetAuto(); }}
        disabled={!canNext}
        aria-label="Próximo"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border border-parish-border shadow-md flex items-center justify-center text-parish-navy hover:text-parish-gold hover:border-parish-gold transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      {members.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {members.map((_, i) => (
            <button
              key={i}
              onClick={() => { scrollTo(i); resetAuto(); }}
              aria-label={`Ir para card ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-2 bg-parish-gold" : "w-2 h-2 bg-parish-border hover:bg-parish-gold/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { SkeletonCard as CleroSkeletonCard };
