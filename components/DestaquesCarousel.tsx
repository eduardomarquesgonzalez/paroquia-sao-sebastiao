"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, Calendar, ExternalLink } from "lucide-react"

interface Destaque {
  id:       string
  title:    string
  image:    string | null
  date:     string
  endDate:  string | null
  location: string | null
  siteUrl:  string | null
}

interface Props {
  destaques: Destaque[]
}

const AUTOPLAY_MS = 5000

/** Retorna a URL limpa se for http/https válida; senão null */
function safeUrl(raw: string | null): string | null {
  if (!raw?.trim()) return null
  try {
    const u = new URL(raw.trim())
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null
  } catch {
    return null
  }
}

// ─── SlideClickable ────────────────────────────────────────────────────────────
// Wrapper para slide com link — usa "group" para habilitar hover nos filhos
function SlideClickable({
  href, isActive, isLoaded, title, location, image, tabIndex, onClickIfSwipe,
}: {
  href: string
  isActive: boolean
  isLoaded: boolean
  title: string
  location: string | null
  image: string | null
  tabIndex: number
  onClickIfSwipe: (e: React.MouseEvent) => void
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      draggable={false}
      onClick={onClickIfSwipe}
      aria-label={`Acessar ${title}`}
      className="group relative w-full h-full shrink-0 overflow-hidden block cursor-pointer"
    >
      {/* Imagem com zoom no hover */}
      {image && isLoaded ? (
        <img
          src={image}
          alt={title}
          draggable={false}
          className={`w-full h-full object-cover transition-transform duration-700
            ${isActive ? "scale-[1.04]" : "scale-100"}
            group-hover:scale-[1.09]`}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-parish-navy to-parish-navy-dark flex items-center justify-center">
          <Calendar className="w-16 h-16 text-white/20" />
        </div>
      )}

      {/* Overlay de escurecimento suave no hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent
                      transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15
                      transition-colors duration-300 pointer-events-none" />

      {/* Ícone "Abrir link" — aparece no canto superior direito ao hover */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none
                      opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                      transition-all duration-300">
        <div className="flex items-center gap-1.5 bg-black/55 backdrop-blur-sm
                        border border-white/25 rounded-lg px-3 py-1.5 shadow-lg">
          <ExternalLink className="w-3.5 h-3.5 text-white" />
          <span className="text-[11px] font-semibold text-white whitespace-nowrap tracking-wide">
            Abrir link
          </span>
        </div>
      </div>

      {/* Barra inferior */}
      <SlideCaption title={title} location={location} hasLink />
    </a>
  )
}

// ─── SlideStatic ───────────────────────────────────────────────────────────────
// Wrapper para slide sem link — apenas visual, sem interação
function SlideStatic({
  isActive, isLoaded, title, location, image,
}: {
  isActive: boolean
  isLoaded: boolean
  title: string
  location: string | null
  image: string | null
}) {
  return (
    <div
      draggable={false}
      aria-label={title}
      className="relative w-full h-full shrink-0 overflow-hidden block cursor-default"
    >
      {image && isLoaded ? (
        <img
          src={image}
          alt={title}
          draggable={false}
          className={`w-full h-full object-cover transition-transform duration-700
            ${isActive ? "scale-[1.04]" : "scale-100"}`}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-parish-navy to-parish-navy-dark flex items-center justify-center">
          <Calendar className="w-16 h-16 text-white/20" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent
                      pointer-events-none" />

      <SlideCaption title={title} location={location} hasLink={false} />
    </div>
  )
}

// ─── SlideCaption ─────────────────────────────────────────────────────────────
function SlideCaption({
  title, location, hasLink,
}: {
  title: string; location: string | null; hasLink: boolean
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 pointer-events-none">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-parish-gold/90 mb-1">
            Destaque
          </p>
          <h3 className="font-playfair text-lg md:text-2xl font-bold text-white
                         leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
          {location && (
            <p className="text-white/65 text-xs mt-1 line-clamp-1">{location}</p>
          )}
        </div>

        {hasLink && (
          <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg
                          bg-parish-gold text-white text-xs font-semibold whitespace-nowrap
                          shadow-lg">
            <ExternalLink className="w-3.5 h-3.5" />
            Saiba mais
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DestaquesCarousel ────────────────────────────────────────────────────────
export default function DestaquesCarousel({ destaques }: Props) {
  const [current,  setCurrent]  = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [loaded,   setLoaded]   = useState<Record<number, boolean>>({})
  const total = destaques.length

  const touchStartX = useRef<number | null>(null)
  const didSwipe    = useRef(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (total <= 1 || isPaused) return
    const id = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [isPaused, total, next])

  useEffect(() => {
    setLoaded((prev) => ({
      ...prev,
      [current]:                       true,
      [(current + 1) % total]:         true,
      [(current - 1 + total) % total]: true,
    }))
  }, [current, total])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    didSwipe.current = false
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current !== null && Math.abs(e.touches[0].clientX - touchStartX.current) > 8)
      didSwipe.current = true
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  function blockIfSwipe(e: React.MouseEvent) {
    if (didSwipe.current) { e.preventDefault(); didSwipe.current = false }
  }

  return (
    <div
      className="group relative overflow-hidden select-none h-[320px] md:h-[440px] lg:h-[540px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Track ── */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {destaques.map((d, i) => {
          const href = safeUrl(d.siteUrl)
          return href ? (
            <SlideClickable
              key={d.id}
              href={href}
              isActive={i === current}
              isLoaded={!!loaded[i]}
              title={d.title}
              location={d.location}
              image={d.image}
              tabIndex={i === current ? 0 : -1}
              onClickIfSwipe={blockIfSwipe}
            />
          ) : (
            <SlideStatic
              key={d.id}
              isActive={i === current}
              isLoaded={!!loaded[i]}
              title={d.title}
              location={d.location}
              image={d.image}
            />
          )
        })}
      </div>

      {/* ── Setas ── */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev() }}
            aria-label="Slide anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                       w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 border border-white/20
                       flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 focus:opacity-100
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-parish-gold/60
                       md:opacity-60 md:hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next() }}
            aria-label="Próximo slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                       w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 border border-white/20
                       flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 focus:opacity-100
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-parish-gold/60
                       md:opacity-60 md:hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Dots ── */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {destaques.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i) }}
              aria-label={`Ir para slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 focus:outline-none ${
                i === current
                  ? "w-5 h-2 bg-parish-gold shadow-[0_0_6px_rgba(201,168,76,0.7)]"
                  : "w-2 h-2 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
