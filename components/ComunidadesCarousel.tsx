"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { MapPin, Clock, Church, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Mass {
  id: string;
  dayOfWeek: string;
  time: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  neighborhood: string | null;
  city: string | null;
  image: string | null;
  masses: Mass[];
}

const DAY_ORDER: Record<string, number> = {
  domingo: 0, segunda: 1, "segunda-feira": 1,
  terça: 2, terca: 2, "terça-feira": 2,
  quarta: 3, "quarta-feira": 3,
  quinta: 4, "quinta-feira": 4,
  sexta: 5, "sexta-feira": 5,
  sábado: 6, sabado: 6,
};

function getFirstMasses(masses: Mass[], max = 2): string {
  if (!masses.length) return "";
  const sorted = [...masses].sort(
    (a, b) =>
      (DAY_ORDER[a.dayOfWeek.toLowerCase()] ?? 9) -
      (DAY_ORDER[b.dayOfWeek.toLowerCase()] ?? 9)
  );
  const formatted = sorted
    .slice(0, max)
    .map((m) => `${m.dayOfWeek.charAt(0).toUpperCase() + m.dayOfWeek.slice(1)} ${m.time}`);
  const extra = masses.length - max;
  return formatted.join(" · ") + (extra > 0 ? ` +${extra}` : "");
}

function CommunityCard({ community }: { community: Community | null }) {
  if (!community) {
    return <div className="flex-shrink-0 px-3" style={{ width: "var(--card-width)" }} />;
  }

  return (
    <div className="flex-shrink-0 px-3" style={{ width: "var(--card-width)" }}>
      <Link
        href={`/comunidades/${community.slug}`}
        className="group flex flex-col bg-parish-surface border border-parish-border rounded-2xl overflow-hidden hover:shadow-navy hover:-translate-y-1.5 hover:border-parish-navy/25 transition-all duration-300 h-full"
      >
        {/* Image */}
        <div className="h-44 flex-shrink-0 overflow-hidden relative">
          {community.image ? (
            <img
              src={community.image}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-navy flex items-center justify-center">
              <Church className="w-14 h-14 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-parish-navy-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Body */}
        <div className="flex-1 p-5 flex flex-col gap-2">
          <h3 className="font-playfair font-bold text-parish-navy-dark group-hover:text-parish-gold transition-colors duration-200 leading-snug line-clamp-2">
            {community.name}
          </h3>

          {community.description && (
            <p className="text-sm text-parish-text-light line-clamp-2 leading-relaxed">
              {community.description}
            </p>
          )}

          <div className="space-y-1.5 mt-auto pt-3">
            {(community.neighborhood || community.city) && (
              <div className="flex items-center gap-1.5 text-xs text-parish-text-light">
                <MapPin className="w-3.5 h-3.5 text-parish-gold flex-shrink-0" />
                <span className="line-clamp-1">
                  {[community.neighborhood, community.city].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            {community.masses.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-parish-text-light">
                <Clock className="w-3.5 h-3.5 text-parish-gold flex-shrink-0" />
                <span className="line-clamp-1">{getFirstMasses(community.masses)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-parish-border mt-1">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-parish-gold group-hover:gap-2 transition-all duration-200">
              Ver comunidade
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function ComunidadesCarousel({ comunidades }: { comunidades: Community[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [trackIndex, setTrackIndex] = useState(1);
  const [transition, setTransition] = useState(true);
  const [paused, setPaused] = useState(false);
  const jumping = useRef(false);

  const groups = useMemo<(Community | null)[][]>(() => {
    const result: (Community | null)[][] = [];
    for (let i = 0; i < comunidades.length; i += visibleCount) {
      const group = comunidades.slice(i, i + visibleCount) as (Community | null)[];
      while (group.length < visibleCount) group.push(null);
      result.push(group);
    }
    return result;
  }, [comunidades, visibleCount]);

  const extendedGroups = useMemo(
    () => (groups.length > 0 ? [groups[groups.length - 1], ...groups, groups[0]] : []),
    [groups]
  );

  const totalReal = groups.length;
  const totalExtended = extendedGroups.length;
  const translatePercent = totalExtended > 0 ? -(trackIndex / totalExtended) * 100 : 0;
  const activeDot = trackIndex - 1;

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      setVisibleCount(w < 640 ? 1 : w < 900 ? 2 : 3);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    jumping.current = true;
    setTransition(false);
    setTrackIndex(1);
    const t = setTimeout(() => {
      setTransition(true);
      jumping.current = false;
    }, 50);
    return () => clearTimeout(t);
  }, [visibleCount]);

  const goTo = useCallback((index: number) => {
    if (jumping.current) return;
    setTransition(true);
    setTrackIndex(index);
  }, []);

  const next = useCallback(() => goTo(trackIndex + 1), [goTo, trackIndex]);
  const prev = useCallback(() => goTo(trackIndex - 1), [goTo, trackIndex]);

  const handleTransitionEnd = useCallback(() => {
    if (trackIndex >= totalExtended - 1) {
      jumping.current = true;
      setTransition(false);
      setTrackIndex(1);
      setTimeout(() => { jumping.current = false; setTransition(true); }, 50);
    } else if (trackIndex <= 0) {
      jumping.current = true;
      setTransition(false);
      setTrackIndex(totalReal);
      setTimeout(() => { jumping.current = false; setTransition(true); }, 50);
    }
  }, [trackIndex, totalExtended, totalReal]);

  useEffect(() => {
    if (paused || totalReal <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next, totalReal]);

  if (comunidades.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ "--card-width": `${100 / visibleCount}%` } as React.CSSProperties}
    >
      {/* Track */}
      <div className="overflow-hidden mx-10">
        <div
          className="flex"
          style={{
            width: `${totalExtended * 100}%`,
            transform: `translateX(${translatePercent}%)`,
            transition: transition ? "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedGroups.map((group, gi) => (
            <div key={gi} className="flex" style={{ width: `${100 / totalExtended}%` }}>
              {group.map((community, ci) => (
                <CommunityCard key={community?.id ?? `empty-${gi}-${ci}`} community={community} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Prev arrow */}
      {totalReal > 1 && (
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-parish-surface border border-parish-border shadow-parish hover:bg-parish-navy hover:text-white hover:border-parish-navy transition-all duration-200 z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Next arrow */}
      {totalReal > 1 && (
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-parish-surface border border-parish-border shadow-parish hover:bg-parish-navy hover:text-white hover:border-parish-navy transition-all duration-200 z-10"
          aria-label="Próximo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Dots */}
      {totalReal > 1 && (
        <div className="flex justify-center gap-2 mt-7">
          {groups.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i + 1)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeDot
                  ? "w-7 h-2 bg-parish-gold"
                  : "w-2 h-2 bg-parish-border hover:bg-parish-secondary"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
