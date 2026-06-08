"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  Church,
  Sparkles,
  Users,
} from "lucide-react";
import CarouselFaixas from "@/components/CarouselFaixas";
import ComunidadesCarousel from "@/components/ComunidadesCarousel";
import CleroCarousel, { CleroSkeletonCard } from "@/components/CleroCarousel";
import Image from "next/image";
import logoImg from "@/public/logo.png";
import { formatDay, formatMonthShort, formatTime, formatWeekday, isEventEnded } from "@/lib/utils";

interface CommunityPreview {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  neighborhood: string | null;
  city: string | null;
  image: string | null;
  masses: { id: string; dayOfWeek: string; time: string }[];
}

interface HomeHero {
  heading: string | null;
  subtitle: string | null;
  btn1Text: string | null;
  btn1Link: string | null;
  btn2Text: string | null;
  btn2Link: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string | null;
  image: string | null;
}

interface CleroMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  currentRole: string | null;
}

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Eventos" },
  { href: "/comunidades", label: "Comunidades" },
  { href: "/projetos-sociais", label: "Projetos Sociais" },
  { href: "/missas", label: "Missas" },
  { href: "/contato", label: "Contato" },
];

function InstagramIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="gold-divider" />
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold">
        {children}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-parish-surface rounded-2xl overflow-hidden border border-parish-border animate-pulse">
      <div className="h-52 bg-parish-primary/40" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-parish-primary/50 rounded w-3/4" />
        <div className="h-3 bg-parish-primary/30 rounded" />
        <div className="h-3 bg-parish-primary/30 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [comunidades, setComunidades] = useState<CommunityPreview[]>([]);
  const [eventos, setEventos] = useState<Event[]>([]);
  const [clero, setClero] = useState<CleroMember[]>([]);
  const [loadingComunidades, setLoadingComunidades] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingClero, setLoadingClero] = useState(true);
  const [hero, setHero] = useState<HomeHero | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoje, setHoje] = useState("");

  /* Data local de Cuiabá para exibição no hero */
  useEffect(() => {
    setHoje(
      new Date().toLocaleDateString("pt-BR", {
        timeZone: "America/Cuiaba",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  /* Scroll observer for section animations */
  useEffect(() => {
    const els = document.querySelectorAll(".animate-on-scroll");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loadingEventos, loadingComunidades]);

  /* Data fetching */
  useEffect(() => {
    fetch("/api/comunidades/public")
      .then((r) => r.json())
      .then((d) => setComunidades(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {})
      .finally(() => setLoadingComunidades(false));

    fetch("/api/eventos/public")
      .then((r) => r.json())
      .then((d: Event[]) => setEventos(d.filter((e) => !isEventEnded(e)).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingEventos(false));

    fetch("/api/home-hero")
      .then((r) => r.json())
      .then((d: HomeHero) => setHero(d))
      .catch(() => {});

    fetch("/api/clero/public")
      .then((r) => r.json())
      .then((d) => setClero(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingClero(false));
  }, []);

  const getEventDay = formatDay;
  const getEventMonth = formatMonthShort;
  const getEventTime = formatTime;
  const getEventWeekday = formatWeekday;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-parish-background">
      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-parish-border">
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src={logoImg}
                alt="Logo da Paróquia"
                width={42}
                height={42}
                className="object-contain"
              />
              <div>
                <span className="block font-playfair font-bold text-base md:text-lg text-parish-navy-dark leading-tight">
                  Paróquia São Sebastião
                </span>
                <span className="block text-[11px] text-parish-text-light tracking-wide hidden sm:block">
                  Três Barras · Cuiabá-MT
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-parish-text rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold bg-parish-navy text-white rounded-lg hover:bg-parish-navy-dark transition-colors duration-200"
              >
                Área Admin
              </Link>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden p-2 text-parish-text hover:text-parish-gold rounded-lg hover:bg-parish-gold/6 transition-colors"
                aria-label="Abrir menu"
              >
                {menuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              menuOpen ? "max-h-96 pb-4" : "max-h-0"
            }`}
          >
            <div className="border-t border-parish-border/40 pt-3 space-y-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block px-4 py-2.5 text-sm font-medium text-parish-text rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-parish-border/40">
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="block px-4 py-2.5 text-sm font-semibold bg-parish-navy text-white rounded-lg text-center hover:bg-parish-navy-dark transition-colors mt-2"
                >
                  Área Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── HERO ─── */}
      <section className="text-white relative">
        <CarouselFaixas>
          {hero &&
            (hero.heading ||
              hero.subtitle ||
              hero.btn1Text ||
              hero.btn2Text) && (
              <div className="container mx-auto px-4 lg:px-8 py-32 md:py-44 lg:py-52">
                <div className="max-w-2xl">
                  {/* Label com linha dourada à esquerda */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-10 rounded-full bg-gradient-to-b from-parish-gold to-parish-gold-dark flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-parish-gold/80 block mb-0.5">
                        Cuiabá-MT
                      </span>
                      {hoje && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-white/75 capitalize">
                          <Clock className="w-3 h-3 text-parish-gold/70 flex-shrink-0" />
                          {hoje}
                        </span>
                      )}
                    </div>
                  </div>

                  {hero.heading && (
                    <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.12] mb-5 text-balance drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]">
                      {hero.heading}
                    </h2>
                  )}

                  {/* Divisor dourado */}
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-px bg-parish-gold" />
                    <div className="w-2 h-2 rounded-full bg-parish-gold/60" />
                    <div className="w-5 h-px bg-parish-gold/40" />
                  </div>

                  {hero.subtitle && (
                    <p className="text-base md:text-lg text-white/72 leading-relaxed mb-10 max-w-lg drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                      {hero.subtitle}
                    </p>
                  )}

                  {(hero.btn1Text || hero.btn2Text) && (
                    <div className="flex flex-wrap gap-4">
                      {hero.btn1Text && hero.btn1Link && (
                        <Link
                          href={hero.btn1Link}
                          className="group inline-flex items-center gap-2.5 bg-parish-gold text-white px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-parish-gold-dark transition-all duration-300 shadow-gold hover:shadow-[0_6px_28px_rgba(201,168,76,0.50)] hover:-translate-y-0.5"
                        >
                          {hero.btn1Text}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      )}
                      {hero.btn2Text && hero.btn2Link && (
                        <Link
                          href={hero.btn2Link}
                          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-white/18 hover:border-white/35 transition-all duration-300 hover:-translate-y-0.5"
                        >
                          {hero.btn2Text}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
        </CarouselFaixas>
      </section>

      {/* ─── PRÓXIMOS EVENTOS ─── */}
      <section
        id="eventos"
        className="py-24 bg-parish-background relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-parish-gold/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-parish-navy/4 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 animate-on-scroll">
            <div>
              <SectionLabel>Agenda da Paróquia</SectionLabel>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-parish-navy-dark leading-tight">
                Próximos Eventos
              </h2>
              <p className="text-parish-text-light mt-2 text-sm md:text-base max-w-md">
                Participe das celebrações e atividades da nossa comunidade
              </p>
            </div>
            <Link
              href="/eventos"
              className="group inline-flex items-center gap-2 px-5 py-2.5 border border-parish-navy/20 text-parish-navy rounded-lg text-sm font-semibold hover:bg-parish-navy hover:text-white hover:border-parish-navy transition-all duration-200 flex-shrink-0"
            >
              Ver todos os eventos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Cards */}
          {loadingEventos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-20 bg-parish-surface rounded-3xl border border-parish-border">
              <div className="w-16 h-16 rounded-2xl bg-parish-navy/8 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-parish-navy" />
              </div>
              <p className="font-semibold text-parish-text mb-1">
                Nenhum evento próximo
              </p>
              <p className="text-sm text-parish-text-light">
                Em breve novas atividades serão divulgadas
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento, index) => (
                <Link
                  key={evento.id}
                  href={`/eventos/${evento.id}`}
                  className={`group flex flex-col bg-parish-surface rounded-2xl overflow-hidden border border-parish-border/70 hover:shadow-navy hover:-translate-y-2 transition-all duration-300 animate-on-scroll ${
                    index === 1 ? "stagger-1" : index === 2 ? "stagger-2" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden flex-shrink-0">
                    {evento.image ? (
                      <img
                        src={evento.image}
                        alt={evento.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-navy flex items-center justify-center">
                        <Calendar className="w-14 h-14 text-white/25" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-parish-navy-dark/55 via-transparent to-transparent" />

                    {/* Date badge */}
                    <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                      <span className="block text-xl font-bold text-parish-navy-dark leading-none">
                        {getEventDay(evento.date)}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-parish-text-light mt-0.5">
                        {getEventMonth(evento.date)}
                      </span>
                    </div>

                    {index === 0 && (
                      <div className="absolute top-4 right-4 bg-parish-gold text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                        Próximo
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6">
                    <h3 className="font-playfair text-lg font-bold text-parish-navy-dark group-hover:text-parish-gold transition-colors duration-200 line-clamp-2 mb-2 leading-snug">
                      {evento.title}
                    </h3>
                    <p className="text-sm text-parish-text-light line-clamp-2 mb-4 leading-relaxed">
                      {evento.description}
                    </p>

                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-parish-text-light">
                        <div className="w-6 h-6 rounded-md bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-parish-gold" />
                        </div>
                        <span className="capitalize">
                          {getEventWeekday(evento.date)},{" "}
                          {getEventTime(evento.date)}
                        </span>
                      </div>
                      {evento.location && (
                        <div className="flex items-center gap-2 text-xs text-parish-text-light">
                          <div className="w-6 h-6 rounded-md bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-parish-gold" />
                          </div>
                          <span className="line-clamp-1">
                            {evento.location}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-parish-border flex items-center justify-between">
                      <span className="text-sm font-semibold text-parish-gold flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200">
                        Saiba mais
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs text-parish-text-light bg-parish-background px-2.5 py-1 rounded-full">
                        {getEventMonth(evento.date)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CLERO ─── */}
      {(loadingClero || clero.length > 0) && (
        <section className="py-24 bg-parish-navy relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="absolute top-0 left-0 w-96 h-96 bg-parish-gold/8 rounded-full -translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/4 rounded-full translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            {/* Header */}
            <div className="text-center mb-14 animate-on-scroll">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-px bg-parish-gold" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold">
                  Nossa Família Paroquial
                </span>
                <div className="w-8 h-px bg-parish-gold" />
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">
                Nosso Clero
              </h2>
              <p className="text-white/55 mt-3 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                Conheça os padres e seminaristas que servem à nossa comunidade
                com dedicação e fé
              </p>
            </div>

            {/* Carousel / skeleton */}
            {loadingClero ? (
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <CleroSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <CleroCarousel members={clero} />
            )}
          </div>
        </section>
      )}

      {/* ─── NOSSA PARÓQUIA ─── */}
      <section className="py-24 bg-parish-navy relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-parish-gold/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-14 animate-on-scroll">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-px bg-parish-gold" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold">
                Nossa Paróquia
              </span>
              <div className="w-8 h-px bg-parish-gold" />
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">
              Explore Nossa Paróquia
            </h2>
            <p className="text-white/55 mt-3 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Conheça os serviços e atividades que formam a vida da nossa
              paróquia
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-on-scroll">
            {/* Card Missas */}
            <Link
              href="/missas"
              className="group relative h-80 rounded-2xl overflow-hidden block shadow-navy hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-parish-navy-dark via-parish-navy to-parish-navy-light" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20 z-10 group-hover:from-black/65 transition-all duration-500" />
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-out"
                style={{ backgroundImage: "url('/santamissa.jpg')" }}
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-parish-gold/30 transition-all duration-300">
                  <Church className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-white mb-2 leading-tight">
                  Missas
                </h3>
                <p className="text-white/65 text-sm leading-relaxed max-w-[200px]">
                  Horários de celebrações da semana
                </p>
                <div className="mt-5 flex items-center gap-2 text-parish-gold text-sm font-semibold">
                  <span>Ver horários</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-parish-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            </Link>

            {/* Card Sacramentos */}
            <Link
              href="/sacramentos"
              className="group relative h-80 rounded-2xl overflow-hidden block shadow-navy hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-parish-navy-dark via-parish-navy to-parish-navy-light" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20 z-10 group-hover:from-black/65 transition-all duration-500" />
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-out"
                style={{ backgroundImage: "url('/sacramentos.jpg')" }}
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-parish-gold/30 transition-all duration-300">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-white mb-2 leading-tight">
                  Sacramentos
                </h3>
                <p className="text-white/65 text-sm leading-relaxed max-w-[200px]">
                  Batismo, casamento e demais sacramentos
                </p>
                <div className="mt-5 flex items-center gap-2 text-parish-gold text-sm font-semibold">
                  <span>Saiba mais</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-parish-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            </Link>

            {/* Card Movimentos / Pastorais */}
            <Link
              href="/movimentos"
              className="group relative h-80 rounded-2xl overflow-hidden block shadow-navy hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-parish-navy-dark via-parish-navy to-parish-navy-light" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20 z-10 group-hover:from-black/65 transition-all duration-500" />
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-out"
                style={{ backgroundImage: "url('/pastorais.jpg')" }}
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-parish-gold/30 transition-all duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-white mb-2 leading-tight">
                  Pastorais e Movimentos
                </h3>
                <p className="text-white/65 text-sm leading-relaxed max-w-[200px]">
                  Pastorais e movimentos da paróquia
                </p>
                <div className="mt-5 flex items-center gap-2 text-parish-gold text-sm font-semibold">
                  <span>Conheça</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-parish-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── NOSSAS COMUNIDADES ─── */}
      <section
        id="comunidades"
        className="py-24 bg-parish-surface relative overflow-hidden"
      >
        {/* Subtle dot grid */}
        <div className="absolute inset-0 dot-pattern opacity-[0.018] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 animate-on-scroll">
            <div>
              <SectionLabel>Nossa Diocese</SectionLabel>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-parish-navy-dark leading-tight">
                Nossas Comunidades
              </h2>
              <p className="text-parish-text-light mt-2 text-sm md:text-base max-w-md">
                Conheça as comunidades da Paróquia São Sebastião
              </p>
            </div>
            <Link
              href="/comunidades"
              className="group inline-flex items-center gap-2 px-5 py-2.5 border border-parish-navy/20 text-parish-navy rounded-lg text-sm font-semibold hover:bg-parish-navy hover:text-white hover:border-parish-navy transition-all duration-200 flex-shrink-0"
            >
              Ver todas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loadingComunidades ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : comunidades.length === 0 ? (
            <div className="text-center py-12 bg-parish-background rounded-2xl border border-parish-border">
              <p className="text-parish-text-light">
                As comunidades serão cadastradas em breve
              </p>
            </div>
          ) : (
            <ComunidadesCarousel comunidades={comunidades} />
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-parish-navy-dark text-white">
        {/* Main footer */}
        <div className="border-b border-white/8">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
              {/* Brand */}
              <div className="lg:col-span-5">
                <Link href="/" className="flex items-center gap-3 mb-5">
                  <Image
                    src={logoImg}
                    alt="Logo da Paróquia"
                    width={44}
                    height={44}
                    className="object-contain brightness-0 invert opacity-90"
                  />
                  <div>
                    <span className="block font-playfair font-bold text-xl text-white leading-tight">
                      Paróquia São Sebastião
                    </span>
                    <span className="block text-[11px] text-white/45 tracking-widest uppercase mt-0.5">
                      Três Barras · Cuiabá-MT
                    </span>
                  </div>
                </Link>
                <p className="text-white/55 text-sm leading-relaxed max-w-xs">
                  Uma comunidade católica dedicada à fé, esperança e caridade.
                  Bem-vindo à nossa família paroquial em Três Barras.
                </p>

                {/* Social */}
                <div className="flex items-center gap-3 mt-6">
                  <a
                    href="https://www.instagram.com/sebastiao.tresbarras/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-parish-gold border border-white/10 hover:border-parish-gold flex items-center justify-center transition-all duration-200"
                    aria-label="Instagram da Paróquia"
                  >
                    <InstagramIcon />
                  </a>
                </div>
              </div>

              {/* Links rápidos */}
              <div className="lg:col-span-3">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold mb-5">
                  Links Rápidos
                </h4>
                <ul className="space-y-3">
                  {[
                    { href: "/missas", label: "Horários de Missas" },
                    { href: "/comunidades", label: "Comunidades" },
                    { href: "/eventos", label: "Eventos" },
                    { href: "/projetos-sociais", label: "Projetos Sociais" },
                    { href: "/contato", label: "Contato" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-2.5 text-white/55 hover:text-white text-sm transition-colors duration-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-parish-gold/40 group-hover:bg-parish-gold transition-colors flex-shrink-0" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contato */}
              <div className="lg:col-span-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold mb-5">
                  Contato
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-parish-gold flex-shrink-0 mt-0.5" />
                    <div className="text-white/55 text-sm leading-relaxed">
                      Av. A, 332 – Três Barras
                      <br />
                      Cuiabá-MT, 78058-531
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-parish-gold flex-shrink-0">
                      <PhoneIcon />
                    </span>
                    <a
                      href="tel:+5565992771705"
                      className="text-white/55 hover:text-white text-sm transition-colors duration-200"
                    >
                      (65) 9 9277-1705
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-parish-gold flex-shrink-0">
                      <MailIcon />
                    </span>
                    <a
                      href="mailto:saosebastiaomt@outlook.com.br"
                      className="text-white/55 hover:text-white text-sm transition-colors duration-200 break-all"
                    >
                      saosebastiaomt@outlook.com.br
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-parish-gold flex-shrink-0">
                      <InstagramIcon />
                    </span>
                    <a
                      href="https://www.instagram.com/sebastiao.tresbarras/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/55 hover:text-white text-sm transition-colors duration-200"
                    >
                      @sebastiao.tresbarras
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="container mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-xs">
              &copy; 2026 Paróquia São Sebastião. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-parish-gold/40 text-xs">✦</span>
              <span className="text-white/25 text-xs">
                Três Barras, Cuiabá-MT
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
