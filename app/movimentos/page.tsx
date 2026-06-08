"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Clock, User, Phone, Star, ChevronRight, ArrowRight } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

interface Movement {
  id: string;
  name: string;
  description: string;
  coordinator: string | null;
  schedules: string[];
  contact: string | null;
  image: string | null;
  highlight: boolean;
}

export default function MovimentosPage() {
  const [items, setItems] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/movimentos")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const highlighted = items.filter((i) => i.highlight);
  const others = items.filter((i) => !i.highlight);

  return (
    <div className="min-h-screen bg-parish-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative bg-parish-navy-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parish-sky/15 via-transparent to-parish-navy/40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-parish-sky/8 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-parish-gold/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-24 relative">
          <nav className="flex items-center gap-2 text-xs text-white/45 mb-10">
            <Link href="/" className="hover:text-white/70 transition">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">Movimentos e Pastorais</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-parish-sky/20 border border-parish-sky/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-parish-sky" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-parish-sky">
                Comunhão e Missão
              </span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Movimentos e Pastorais
            </h1>
            <p className="text-lg text-white/65 leading-relaxed max-w-lg">
              Nossa paróquia abriga movimentos e pastorais que animam a vida comunitária
              e expressam a missão da Igreja no mundo. Faça parte!
            </p>
          </div>

          {!loading && items.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{items.length}</p>
                <p className="text-xs text-white/55 mt-0.5">Grupos ativos</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-parish-background"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      {/* Intro quote */}
      <section className="py-14 bg-parish-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-1 bg-parish-gold mx-auto mb-6 rounded-full" />
            <p className="text-lg text-parish-text-light leading-relaxed italic">
              &ldquo;Onde dois ou três estiverem reunidos em meu nome, ali estou no meio deles.&rdquo;
            </p>
            <p className="text-sm text-parish-gold font-semibold mt-4">— Mateus 18,20</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 bg-parish-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-parish-surface rounded-3xl border border-parish-border">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-parish-gold" />
              </div>
              <p className="font-semibold text-parish-text mb-1">Informações em breve</p>
              <p className="text-sm text-parish-text-light">Os movimentos serão cadastrados em breve</p>
            </div>
          ) : (
            <>
              {/* Highlighted */}
              {highlighted.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="w-4 h-4 text-parish-gold fill-parish-gold" />
                    <span className="text-xs font-bold uppercase tracking-widest text-parish-text-light">Em Destaque</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {highlighted.map((item) => (
                      <MovementCard key={item.id} item={item} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* Others */}
              {others.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {others.map((item) => (
                    <MovementCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-parish-surface border-t border-parish-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-2xl font-bold text-parish-navy-dark mb-3">Quer participar?</h2>
          <p className="text-parish-text-light mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Entre em contato e descubra como fazer parte de um dos nossos grupos e movimentos paroquiais.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-6 py-3 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition-all duration-200 shadow-gold"
          >
            Fale Conosco
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function MovementCard({ item, featured = false }: { item: Movement; featured?: boolean }) {
  return (
    <article className={`group bg-parish-surface rounded-2xl overflow-hidden border border-parish-border/60 shadow-sm hover:shadow-navy hover:-translate-y-2 transition-all duration-300 flex flex-col ${featured ? "ring-1 ring-parish-sky/40" : ""}`}>
      {/* Image */}
      <div className={`relative overflow-hidden flex-shrink-0 ${featured ? "h-60" : "h-48"}`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-parish-navy/80 to-parish-navy-dark flex items-center justify-center">
            <Users className="w-14 h-14 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {featured && (
          <div className="absolute top-4 right-4 bg-parish-gold text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" /> Destaque
          </div>
        )}

        <div className="absolute bottom-4 left-4">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
            Pastoral / Movimento
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <h2 className={`font-playfair font-bold text-parish-navy-dark group-hover:text-parish-gold transition-colors duration-200 mb-3 leading-snug ${featured ? "text-2xl" : "text-xl"}`}>
          {item.name}
        </h2>

        <p className="text-sm text-parish-text-light leading-relaxed mb-4 line-clamp-3">
          {item.description}
        </p>

        <div className="space-y-2.5 mt-auto mb-5">
          {item.schedules.length > 0 && (
            <div className="flex items-start gap-2.5 text-xs text-parish-text-light">
              <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-3 h-3 text-parish-gold" />
              </div>
              <div className="space-y-0.5">
                {item.schedules.slice(0, 2).map((s, i) => (
                  <p key={i}>{s}</p>
                ))}
                {item.schedules.length > 2 && (
                  <p className="text-parish-gold">+{item.schedules.length - 2} horários</p>
                )}
              </div>
            </div>
          )}

          {item.coordinator && (
            <div className="flex items-center gap-2.5 text-xs text-parish-text-light">
              <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-parish-gold" />
              </div>
              <span>Coord.: {item.coordinator}</span>
            </div>
          )}

          {item.contact && (
            <div className="flex items-center gap-2.5 text-xs text-parish-text-light">
              <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-3 h-3 text-parish-gold" />
              </div>
              <span>{item.contact}</span>
            </div>
          )}
        </div>

        <Link
          href="/contato"
          className="group/btn flex items-center justify-center gap-2 w-full py-2.5 bg-parish-gold hover:bg-parish-gold-dark text-white text-sm font-semibold rounded-xl transition-all duration-200"
        >
          Quero Participar
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
