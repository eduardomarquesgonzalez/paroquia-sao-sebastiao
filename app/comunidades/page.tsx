"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Church, ArrowRight, ChevronRight } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

interface Mass {
  id: string;
  dayOfWeek: string;
  time: string;
  type: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  image: string | null;
  masses: Mass[];
}

const DAY_ORDER: Record<string, number> = {
  domingo: 0, segunda: 1, "segunda-feira": 1,
  terca: 2, "terça": 2, "terça-feira": 2,
  quarta: 3, "quarta-feira": 3,
  quinta: 4, "quinta-feira": 4,
  sexta: 5, "sexta-feira": 5,
  sabado: 6, "sábado": 6,
};

function getFirstMasses(masses: Mass[], max = 2): string {
  if (!masses.length) return "";
  const sorted = [...masses].sort(
    (a, b) =>
      (DAY_ORDER[a.dayOfWeek.toLowerCase()] ?? 9) -
      (DAY_ORDER[b.dayOfWeek.toLowerCase()] ?? 9)
  );
  const formatted = sorted.slice(0, max).map((m) => `${capitalize(m.dayOfWeek)} ${m.time}`);
  const extra = masses.length - max;
  return formatted.join(" · ") + (extra > 0 ? ` +${extra}` : "");
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ComunidadesPage() {
  const [comunidades, setComunidades] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/comunidades/public")
      .then((r) => r.json())
      .then((data) => setComunidades(Array.isArray(data) ? data : []))
      .catch(() => setComunidades([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-parish-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative bg-parish-text-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parish-gold/20 via-transparent to-parish-sky/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-parish-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-parish-sky/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 py-24 relative">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
            <Link href="/" className="hover:text-white/80 transition">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">Comunidades</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-parish-gold/20 flex items-center justify-center">
                <Church className="w-5 h-5 text-parish-gold" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-parish-gold">
                Rede Paroquial
              </span>
            </div>
            <h1 className="font-playfair text-5xl font-bold text-white mb-6 leading-tight">
              Nossas Comunidades
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Conheça as comunidades que fazem parte da Paróquia São Sebastião
              em Cuiabá-MT e encontre a mais próxima de você.
            </p>
          </div>

          {!loading && comunidades.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{comunidades.length}</p>
                <p className="text-xs text-white/60 mt-0.5">Comunidades ativas</p>
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-parish-background"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      {/* Intro */}
      <section className="py-16 bg-parish-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-1 bg-parish-gold mx-auto mb-6 rounded-full" />
            <p className="text-lg text-parish-text-light leading-relaxed">
              &ldquo;A paróquia é a comunidade de fiéis constituída de modo estável na Igreja
              particular, cujo cuidado pastoral é confiado ao pároco como seu pastor próprio.&rdquo;
            </p>
            <p className="text-sm text-parish-gold font-semibold mt-4">— Cânon 515 do Direito Canônico</p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20 bg-parish-background">
        <div className="container mx-auto px-4 max-w-6xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
            </div>
          ) : comunidades.length === 0 ? (
            <div className="text-center py-20 bg-parish-surface rounded-3xl border border-parish-border">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mx-auto mb-4">
                <Church className="w-8 h-8 text-parish-gold" />
              </div>
              <p className="font-semibold text-parish-text mb-1">Nenhuma comunidade cadastrada</p>
              <p className="text-sm text-parish-text-light">Em breve as comunidades estarão disponíveis.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comunidades.map((c) => (
                <Link
                  key={c.id}
                  href={`/comunidades/${c.slug}`}
                  className="group bg-parish-surface rounded-2xl border border-parish-border/60 overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-parish-gold/40 transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 flex-shrink-0 overflow-hidden relative">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-parish-navy/80 to-parish-navy-dark flex items-center justify-center">
                        <Church className="w-16 h-16 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  </div>

                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <h2 className="font-playfair font-bold text-lg text-parish-text group-hover:text-parish-gold transition-colors duration-200 leading-snug">
                      {c.name}
                    </h2>

                    {c.description && (
                      <p className="text-sm text-parish-text-light line-clamp-2 leading-relaxed">{c.description}</p>
                    )}

                    <div className="space-y-2 mt-auto">
                      {(c.neighborhood || c.address) && (
                        <div className="flex items-start gap-2 text-xs text-parish-text-light">
                          <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin className="w-3 h-3 text-parish-gold" />
                          </div>
                          <span className="line-clamp-1">
                            {c.neighborhood || c.address}
                            {c.city ? `, ${c.city}` : ""}
                          </span>
                        </div>
                      )}
                      {c.masses.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-parish-text-light">
                          <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-3 h-3 text-parish-gold" />
                          </div>
                          <span className="line-clamp-1">{getFirstMasses(c.masses)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-parish-border mt-2">
                      <span className="text-xs text-parish-text-light">
                        {c.masses.length > 0
                          ? `${c.masses.length} missa${c.masses.length > 1 ? "s" : ""}`
                          : "Horários em breve"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-parish-gold group-hover:gap-2 transition-all">
                        Ver <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-parish-surface border-t border-parish-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-2xl font-bold text-parish-text mb-3">
            Encontre sua comunidade
          </h2>
          <p className="text-parish-text-light mb-6 max-w-md mx-auto">
            Entre em contato para saber mais sobre as atividades e celebrações
            de cada comunidade.
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

      <PublicFooter />
    </div>
  );
}
