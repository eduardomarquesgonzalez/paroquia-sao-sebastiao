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
    <div
      className="flex-shrink-0 px-3"
      style={{ width: "var(--card-width)" }}
    >
      <Link
        href={`/comunidades/${community.slug}`}
        className="group flex flex-col bg-parish-surface border border-parish-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-parish-gold/40 transition-all duration-300 h-full"
      >
        {/* Image */}
        <div className="h-44 flex-shrink-0 overflow-hidden">
          {community.image ? (
            <img
              src={community.image}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-parish-sky to-parish-gold flex items-center justify-center">
              <Church className="w-14 h-14 text-white opacity-60" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-5 flex flex-col gap-2">
          <h3 className="font-bold text-parish-text group-hover:text-parish-gold transition leading-snug line-clamp-2">
            {community.name}
          </h3>

          {community.description && (
            <p className="text-sm text-parish-text-light line-clamp-2">
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

          <div className="flex items-center justify-end pt-2 border-t border-parish-border mt-1">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-parish-gold group-hover:gap-2 transition-all">
              Ver comunidade <ArrowRight className="w-3.5 h-3.5" />
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
  const [trackIndex, setTrackIndex] = useState(1); // 1 = real first group
  const [transition, setTransition] = useState(true);
  const [paused, setPaused] = useState(false);
  const jumping = useRef(false);

  // Build groups of `visibleCount` communities
  const groups = useMemo<(Community | null)[][]>(() => {
    const result: (Community | null)[][] = [];
    for (let i = 0; i < comunidades.length; i += visibleCount) {
      const group = comunidades.slice(i, i + visibleCount) as (Community | null)[];
      while (group.length < visibleCount) group.push(null);
      result.push(group);
    }
    return result;
  }, [comunidades, visibleCount]);

  // Extended for infinite loop: [lastGroup, ...groups, firstGroup]
  const extendedGroups = useMemo(
    () => (groups.length > 0 ? [groups[groups.length - 1], ...groups, groups[0]] : []),
    [groups]
  );

  const totalReal = groups.length;
  const totalExtended = extendedGroups.length; // totalReal + 2

  // CSS: translate by -(trackIndex / totalExtended * 100)% of the track
  const translatePercent = totalExtended > 0 ? -(trackIndex / totalExtended) * 100 : 0;

  // Dot index: trackIndex - 1 (0-based over real groups)
  const activeDot = trackIndex - 1;

  // Responsive visible count via ResizeObserver
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Reset position when groups rebuild (visibleCount changes)
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

  const goTo = useCallback(
    (index: number) => {
      if (jumping.current) return;
      setTransition(true);
      setTrackIndex(index);
    },
    []
  );

  const next = useCallback(() => goTo(trackIndex + 1), [goTo, trackIndex]);
  const prev = useCallback(() => goTo(trackIndex - 1), [goTo, trackIndex]);

  // Infinite loop: jump after transition ends
  const handleTransitionEnd = useCallback(() => {
    if (trackIndex >= totalExtended - 1) {
      // At clone of first group → jump to real first
      jumping.current = true;
      setTransition(false);
      setTrackIndex(1);
      setTimeout(() => {
        jumping.current = false;
        setTransition(true);
      }, 50);
    } else if (trackIndex <= 0) {
      // At clone of last group → jump to real last
      jumping.current = true;
      setTransition(false);
      setTrackIndex(totalReal);
      setTimeout(() => {
        jumping.current = false;
        setTransition(true);
      }, 50);
    }
  }, [trackIndex, totalExtended, totalReal]);

  // Autoplay
  useEffect(() => {
    if (paused || totalReal <= 1) return;
    const timer = setInterval(next, 3000);
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
      {/* Track wrapper */}
      <div className="overflow-hidden mx-8">
        <div
          className="flex"
          style={{
            width: `${totalExtended * 100}%`,
            transform: `translateX(${translatePercent}%)`,
            transition: transition ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedGroups.map((group, gi) => (
            <div
              key={gi}
              className="flex"
              style={{ width: `${100 / totalExtended}%` }}
            >
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
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-parish-surface border border-parish-border shadow-sm hover:bg-parish-gold hover:text-white hover:border-parish-gold transition-colors z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Next arrow */}
      {totalReal > 1 && (
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-parish-surface border border-parish-border shadow-sm hover:bg-parish-gold hover:text-white hover:border-parish-gold transition-colors z-10"
          aria-label="Próximo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Dots */}
      {totalReal > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {groups.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i + 1)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeDot
                  ? "w-6 h-2.5 bg-parish-gold"
                  : "w-2.5 h-2.5 bg-parish-border hover:bg-parish-secondary"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
