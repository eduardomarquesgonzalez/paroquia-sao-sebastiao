"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight, ChevronRight, Globe } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string | null;
  image: string | null;
  siteUrl: string | null;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/eventos/public")
      .then((r) => r.json())
      .then((data) => setEventos(Array.isArray(data) ? data : []))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const getDay = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit" });

  const getMonth = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();

  const getWeekday = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { weekday: "long" });

  const isUpcoming = (d: string) => new Date(d) >= new Date();

  const upcomingCount = eventos.filter((e) => isUpcoming(e.date)).length;

  return (
    <div className="min-h-screen bg-parish-background">

      {/* ─── HERO ─── */}
      <section className="relative bg-parish-text-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parish-gold/20 via-transparent to-parish-sky/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-parish-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-parish-sky/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 py-24 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
            <Link href="/" className="hover:text-white/80 transition">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">Eventos</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-parish-gold/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-parish-gold" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-parish-gold">
                Agenda Paroquial
              </span>
            </div>
            <h1 className="font-playfair text-5xl font-bold text-white mb-6 leading-tight">
              Próximos Eventos
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Participe das celebrações, encontros e atividades que fortalecem
              a fé e os laços da nossa comunidade paroquial.
            </p>
          </div>

          {/* Stats bar */}
          {!loading && eventos.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{eventos.length}</p>
                <p className="text-xs text-white/60 mt-0.5">Eventos cadastrados</p>
              </div>
              {upcomingCount > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                  <p className="text-2xl font-bold text-white">{upcomingCount}</p>
                  <p className="text-xs text-white/60 mt-0.5">Próximos eventos</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-parish-background"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      {/* ─── INTRO ─── */}
      <section className="py-16 bg-parish-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-1 bg-parish-gold mx-auto mb-6 rounded-full" />
            <p className="text-lg text-parish-text-light leading-relaxed">
              "A comunidade paroquial se fortalece quando seus membros se encontram, celebram
              e crescem juntos na fé. Cada evento é uma oportunidade de aprofundar os laços
              de fraternidade e de viver o Evangelho em comunidade."
            </p>
            <p className="text-sm text-parish-gold font-semibold mt-4">— Paróquia São Sebastião</p>
          </div>
        </div>
      </section>

      {/* ─── LISTAGEM ─── */}
      <section className="pb-20 bg-parish-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-20 bg-parish-surface rounded-3xl border border-parish-border">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-parish-gold" />
              </div>
              <p className="font-semibold text-parish-text mb-1">Nenhum evento cadastrado ainda</p>
              <p className="text-sm text-parish-text-light">Em breve novos eventos serão divulgados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos.map((evento, index) => (
                <article
                  key={evento.id}
                  className="group bg-parish-surface rounded-2xl overflow-hidden border border-parish-border/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden flex-shrink-0">
                    {evento.image ? (
                      <img
                        src={evento.image}
                        alt={evento.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-parish-gold/30 to-parish-sky/30 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-parish-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    {/* Date badge */}
                    <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                      <span className="block text-xl font-bold text-parish-navy-dark leading-none">
                        {getDay(evento.date)}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-parish-text-light mt-0.5">
                        {getMonth(evento.date)}
                      </span>
                    </div>

                    {index === 0 && isUpcoming(evento.date) ? (
                      <div className="absolute top-4 right-4 bg-parish-gold text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                        Próximo
                      </div>
                    ) : !isUpcoming(evento.date) ? (
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        Realizado
                      </div>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6">
                    <h2 className="font-playfair text-xl font-bold text-parish-text group-hover:text-parish-gold transition-colors duration-200 mb-2 leading-snug line-clamp-2">
                      {evento.title}
                    </h2>

                    <p className="text-sm text-parish-text-light line-clamp-3 mb-4 leading-relaxed">
                      {evento.description}
                    </p>

                    <div className="space-y-2 mt-auto mb-5">
                      <div className="flex items-center gap-2 text-xs text-parish-text-light">
                        <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3 h-3 text-parish-gold" />
                        </div>
                        <span className="capitalize line-clamp-1">
                          {getWeekday(evento.date)}, {formatTime(evento.date)}
                          {evento.endDate && ` – ${formatTime(evento.endDate)}`}
                        </span>
                      </div>
                      {evento.location && (
                        <div className="flex items-center gap-2 text-xs text-parish-text-light">
                          <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-3 h-3 text-parish-gold" />
                          </div>
                          <span className="line-clamp-1">{evento.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-parish-text-light">
                        <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-3 h-3 text-parish-gold" />
                        </div>
                        <span>{formatDate(evento.date)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/eventos/${evento.id}`}
                        className="group/btn flex items-center justify-center gap-2 w-full py-2.5 bg-parish-gold hover:bg-parish-gold-dark text-white text-sm font-semibold rounded-xl transition-all duration-200"
                      >
                        Ver Detalhes
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                      {evento.siteUrl && (
                        <a
                          href={evento.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 border border-parish-border text-parish-text-light text-sm font-medium rounded-xl hover:border-parish-gold hover:text-parish-gold transition-all duration-200"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Site do Evento
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-parish-surface border-t border-parish-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-2xl font-bold text-parish-text mb-3">
            Fique por dentro da nossa agenda
          </h2>
          <p className="text-parish-text-light mb-6 max-w-md mx-auto">
            Entre em contato e saiba como participar ativamente dos eventos e
            celebrações da nossa paróquia.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-6 py-3 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition"
          >
            Fale Conosco
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
