"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Info, Calendar, ChevronRight, ArrowRight } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

interface Mass {
  id: string;
  dayOfWeek: string;
  time: string;
  type: string;
  location: string | null;
  observations: string | null;
}

const DAYS_OF_WEEK: { [key: string]: string } = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
};

const MASS_TYPES: { [key: string]: { label: string; color: string } } = {
  DOMINICAL: { label: "Dominical", color: "bg-parish-sky-light text-parish-sky-dark" },
  SEMANAL: { label: "Semanal", color: "bg-parish-primary text-parish-text" },
  ESPECIAL: { label: "Especial", color: "bg-parish-gold-light/40 text-parish-gold-dark" },
};

export default function MissasPage() {
  const [missas, setMissas] = useState<Mass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMissas(); }, []);

  async function fetchMissas() {
    try {
      const response = await fetch("/api/missas/public");
      if (response.ok) {
        const data = await response.json();
        setMissas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar missas:", error);
    } finally {
      setLoading(false);
    }
  }

  const groupedMissas = missas.reduce((acc, missa) => {
    if (!acc[missa.dayOfWeek]) acc[missa.dayOfWeek] = [];
    acc[missa.dayOfWeek].push(missa);
    return acc;
  }, {} as { [key: string]: Mass[] });

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
            <span className="text-white/70">Missas</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-parish-gold/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-parish-gold" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-parish-gold">
                Agenda Litúrgica
              </span>
            </div>
            <h1 className="font-playfair text-5xl font-bold text-white mb-6 leading-tight">
              Horários de Missas
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Participe de nossas celebrações eucarísticas. Todos são bem-vindos
              à mesa do Senhor.
            </p>
          </div>

          {!loading && missas.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{missas.length}</p>
                <p className="text-xs text-white/60 mt-0.5">Celebrações semanais</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{Object.keys(groupedMissas).length}</p>
                <p className="text-xs text-white/60 mt-0.5">Dias de celebração</p>
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
              &ldquo;A Eucaristia é a fonte e o cume de toda a vida cristã. Todos são chamados
              a reunir-se ao redor da mesa do Senhor para celebrar juntos o mistério da fé.&rdquo;
            </p>
            <p className="text-sm text-parish-gold font-semibold mt-4">— Paróquia São Sebastião</p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="pb-20 bg-parish-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
            </div>
          ) : missas.length === 0 ? (
            <div className="text-center py-20 bg-parish-surface rounded-3xl border border-parish-border">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-parish-gold" />
              </div>
              <p className="font-semibold text-parish-text mb-1">Horários em atualização</p>
              <p className="text-sm text-parish-text-light">Em breve disponibilizaremos os horários das celebrações.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMissas).map(([day, dayMissas]) => (
                <div key={day} className="bg-parish-surface rounded-2xl border border-parish-border overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-parish-border bg-parish-background">
                    <div className="w-8 h-8 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-parish-gold" />
                    </div>
                    <h3 className="font-playfair font-bold text-lg text-parish-text">
                      {DAYS_OF_WEEK[day] || day}
                    </h3>
                  </div>
                  <div className="divide-y divide-parish-border">
                    {dayMissas.map((missa) => (
                      <div key={missa.id} className="flex items-start gap-4 p-5 hover:bg-parish-background/60 transition">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-parish-gold/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-parish-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-xl font-bold text-parish-text">{missa.time}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${MASS_TYPES[missa.type]?.color || "bg-parish-primary text-parish-text"}`}>
                              {MASS_TYPES[missa.type]?.label || missa.type}
                            </span>
                          </div>
                          {missa.location && (
                            <div className="flex items-center gap-2 text-sm text-parish-text-light mb-1.5">
                              <MapPin className="w-3.5 h-3.5 text-parish-gold flex-shrink-0" />
                              <span>{missa.location}</span>
                            </div>
                          )}
                          {missa.observations && (
                            <div className="flex items-start gap-2 mt-2 bg-parish-gold/5 rounded-lg p-2.5 border border-parish-gold/15">
                              <Info className="w-3.5 h-3.5 text-parish-gold flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-parish-text-light">{missa.observations}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: Clock,
                title: "Pontualidade",
                text: "Chegue 10 minutos antes para uma melhor acomodação.",
                bg: "bg-parish-gold/10",
                color: "text-parish-gold",
              },
              {
                icon: Info,
                title: "Confissões",
                text: "Disponível 30 minutos antes das missas ou agende com o padre.",
                bg: "bg-parish-sky/10",
                color: "text-parish-sky-dark",
              },
              {
                icon: MapPin,
                title: "Localização",
                text: "Bairro Três Barras, Cuiabá-MT. Estacionamento disponível.",
                bg: "bg-green-50",
                color: "text-green-600",
              },
            ].map(({ icon: Icon, title, text, bg, color }) => (
              <div key={title} className="bg-parish-surface rounded-2xl border border-parish-border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-parish-text mb-2">{title}</h3>
                <p className="text-sm text-parish-text-light leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-parish-surface border-t border-parish-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-2xl font-bold text-parish-text mb-3">
            Venha celebrar conosco!
          </h2>
          <p className="text-parish-text-light mb-6 max-w-md mx-auto">
            Todos são bem-vindos. Entre em contato para mais informações sobre
            nossas celebrações.
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
