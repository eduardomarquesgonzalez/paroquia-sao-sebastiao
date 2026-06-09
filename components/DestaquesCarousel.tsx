"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon } from "lucide-react"

interface Destaque {
  id:      string
  title:   string | null
  image:   string | null
  linkUrl: string | null
}

interface Props {
  destaques: Destaque[]
}

const AUTOPLAY_MS = 5000

function safeUrl(raw: string | null): string | null {
  if (!raw?.trim()) return null
  try {
    const u = new URL(raw.trim())
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null
  } catch {
    return null
  }
}

function SlideClickable({
  href, isActive, isLoaded, title, image, tabIndex, onClickIfSwipe,
}: {
  href: string; isActive: boolean; isLoaded: boolean
  title: string | null; image: string | null
  tabIndex: number; onClickIfSwipe: (e: React.MouseEvent) => void
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      draggable={false}
      onClick={onClickIfSwipe}
      aria-label={title ? `Acessar ${title}` : "Abrir link"}
      className="group relative w-full h-full shrink-0 overflow-hidden block cursor-pointer"
    >
      {image && isLoaded ? (
        <img
          src={image}
          alt={title ?? "Destaque"}
          draggable={false}
          className={`w-full h-full object-cover transition-transform duration-700
            ${isActive ? "scale-[1.04]" : "scale-100"}
            group-hover:scale-[1.08]`}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-parish-navy to-parish-navy-dark flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-white/20" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent
                      transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15
                      transition-colors duration-300 pointer-events-none" />

      <div className="absolute top-3 right-3 z-10 pointer-events-none
                      opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                      transition-all duration-300">
        <div className="flex items-center gap-1 bg-black/55 backdrop-blur-sm
                        border border-white/25 rounded-md px-2.5 py-1 shadow">
          <ExternalLink className="w-3 h-3 text-white" />
          <span className="text-[10px] font-semibold text-white whitespace-nowrap tracking-wide">
            Abrir link
          </span>
        </div>
      </div>

      {title && (
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 pointer-events-none">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-parish-gold/90 mb-0.5">
            Destaque
          </p>
          <h3 className="font-playfair text-sm md:text-base font-bold text-white
                         leading-tight line-clamp-1 drop-shadow-lg">
            {title}
          </h3>
        </div>
      )}
    </a>
  )
}

function SlideStatic({
  isActive, isLoaded, title, image,
}: {
  isActive: boolean; isLoaded: boolean; title: string | null; image: string | null
}) {
  return (
    <div
      draggable={false}
      aria-label={title ?? "Destaque"}
      className="relative w-full h-full shrink-0 overflow-hidden block cursor-default"
    >
      {image && isLoaded ? (
        <img
          src={image}
          alt={title ?? "Destaque"}
          draggable={false}
          className={`w-full h-full object-cover transition-transform duration-700
            ${isActive ? "scale-[1.04]" : "scale-100"}`}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-parish-navy to-parish-navy-dark flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-white/20" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent
                      pointer-events-none" />

      {title && (
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 pointer-events-none">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-parish-gold/90 mb-0.5">
            Destaque
          </p>
          <h3 className="font-playfair text-sm md:text-base font-bold text-white
                         leading-tight line-clamp-1 drop-shadow-lg">
            {title}
          </h3>
        </div>
      )}
    </div>
  )
}

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
      className="group relative overflow-hidden rounded-2xl select-none h-[180px] md:h-[240px] lg:h-[280px] shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {destaques.map((d, i) => {
          const href = safeUrl(d.linkUrl)
          return href ? (
            <SlideClickable
              key={d.id}
              href={href}
              isActive={i === current}
              isLoaded={!!loaded[i]}
              title={d.title}
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
              image={d.image}
            />
          )
        })}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev() }}
            aria-label="Slide anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                       w-7 h-7 rounded-full bg-black/40 hover:bg-black/65 border border-white/20
                       flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 focus:opacity-100
                       transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next() }}
            aria-label="Próximo slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                       w-7 h-7 rounded-full bg-black/40 hover:bg-black/65 border border-white/20
                       flex items-center justify-center text-white
                       opacity-0 group-hover:opacity-100 focus:opacity-100
                       transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {destaques.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i) }}
              aria-label={`Ir para slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 focus:outline-none ${
                i === current
                  ? "w-4 h-1.5 bg-parish-gold shadow-[0_0_5px_rgba(201,168,76,0.7)]"
                  : "w-1.5 h-1.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
