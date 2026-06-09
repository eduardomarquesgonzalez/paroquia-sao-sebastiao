"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight,
  Church,
  Calendar,
  Info,
  ExternalLink,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

interface Mass {
  id: string;
  dayOfWeek: string;
  time: string;
  type: string;
  observations: string | null;
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
  mapUrl: string | null;
  masses: Mass[];
}

const DAY_ORDER: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
};

const DAY_LABELS_FULL: Record<string, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
};

const TYPE_STYLES: Record<string, string> = {
  DOMINICAL: "bg-parish-sky-light text-parish-sky-dark",
  SEMANAL: "bg-parish-primary text-parish-text",
  ESPECIAL: "bg-parish-gold/15 text-parish-gold-dark",
};

const TYPE_LABELS: Record<string, string> = {
  DOMINICAL: "Dominical",
  SEMANAL: "Semanal",
  ESPECIAL: "Especial",
};

function groupMassesByDay(masses: Mass[]): [string, Mass[]][] {
  const map: Record<string, Mass[]> = {};
  for (const m of masses) {
    if (!map[m.dayOfWeek]) map[m.dayOfWeek] = [];
    map[m.dayOfWeek].push(m);
  }
  return Object.entries(map).sort(
    ([a], [b]) => (DAY_ORDER[a] ?? 7) - (DAY_ORDER[b] ?? 7),
  );
}

function allDaysWithMasses(communities: Community[]): string[] {
  const days = new Set<string>();
  communities.forEach((c) => c.masses.forEach((m) => days.add(m.dayOfWeek)));
  return [...days].sort((a, b) => (DAY_ORDER[a] ?? 7) - (DAY_ORDER[b] ?? 7));
}

export default function MissasPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string>("all");

  useEffect(() => {
    fetch("/api/missas/public")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCommunities)
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, []);

  const availableDays = allDaysWithMasses(communities);

  const filtered =
    activeDay === "all"
      ? communities
      : communities.filter((c) =>
          c.masses.some((m) => m.dayOfWeek === activeDay),
        );

  const totalMasses = communities.reduce((s, c) => s + c.masses.length, 0);

  return (
    <div className="min-h-screen bg-parish-background">
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-parish-text-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parish-gold/20 via-transparent to-parish-sky/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-parish-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-parish-sky/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 py-24 relative">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
            <Link href="/" className="hover:text-white/80 transition">
              Início
            </Link>
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
              Encontre a celebração mais próxima de você. Todos são bem-vindos à
              mesa do Senhor.
            </p>
          </div>

          {!loading && communities.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">
                  {communities.length}
                </p>
                <p className="text-xs text-white/60 mt-0.5">Comunidades</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{totalMasses}</p>
                <p className="text-xs text-white/60 mt-0.5">
                  Celebrações semanais
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">
                  {availableDays.length}
                </p>
                <p className="text-xs text-white/60 mt-0.5">
                  Dias de celebração
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-parish-background"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      {/* ── Citação ──────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-parish-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-1 bg-parish-gold mx-auto mb-6 rounded-full" />
            <p className="text-lg text-parish-text-light leading-relaxed">
              &ldquo;A Eucaristia é a fonte e o cume de toda a vida cristã.
              Todos são chamados a reunir-se ao redor da mesa do Senhor para
              celebrar juntos o mistério da fé.&rdquo;
            </p>
            <p className="text-sm text-parish-gold font-semibold mt-4">
              — Paróquia São Sebastião
            </p>
          </div>
        </div>
      </section>

      {/* ── Filtro por dia ───────────────────────────────────────────────────── */}
      {!loading && availableDays.length > 1 && (
        <section className="pb-6 bg-parish-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveDay("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeDay === "all"
                    ? "bg-parish-navy text-white shadow-md"
                    : "bg-parish-surface border border-parish-border text-parish-text-light hover:border-parish-navy hover:text-parish-navy"
                }`}
              >
                Todos os dias
              </button>
              {availableDays.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(activeDay === day ? "all" : day)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeDay === day
                      ? "bg-parish-gold text-white shadow-md"
                      : "bg-parish-surface border border-parish-border text-parish-text-light hover:border-parish-gold hover:text-parish-gold-dark"
                  }`}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Grid de comunidades ──────────────────────────────────────────────── */}
      <section className="pb-20 bg-parish-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-20 bg-parish-surface rounded-3xl border border-parish-border max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-parish-gold" />
              </div>
              <p className="font-semibold text-parish-text mb-1">
                Horários em atualização
              </p>
              <p className="text-sm text-parish-text-light">
                Em breve disponibilizaremos os horários das celebrações.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-parish-text-light">
                Nenhuma comunidade possui missa na{" "}
                <span className="font-semibold text-parish-text">
                  {DAY_LABELS_FULL[activeDay]}
                </span>
                .
              </p>
              <button
                onClick={() => setActiveDay("all")}
                className="mt-3 text-sm text-parish-gold hover:text-parish-gold-dark transition underline underline-offset-2"
              >
                Ver todos os dias
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  activeDay={activeDay}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Dicas ────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-parish-surface border-t border-parish-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div
                key={title}
                className="bg-parish-background rounded-2xl border border-parish-border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-parish-text mb-2">{title}</h3>
                <p className="text-sm text-parish-text-light leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-parish-background border-t border-parish-border">
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

// ── Componente do card ─────────────────────────────────────────────────────────

function CommunityCard({
  community,
  activeDay,
}: {
  community: Community;
  activeDay: string;
}) {
  const massesToShow =
    activeDay === "all"
      ? community.masses
      : community.masses.filter((m) => m.dayOfWeek === activeDay);

  const grouped = groupMassesByDay(massesToShow);

  const fullAddress = [
    community.address,
    community.neighborhood,
    community.city,
    community.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="group bg-parish-surface rounded-2xl border border-parish-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      {/* Imagem */}
      <div className="relative aspect-video overflow-hidden bg-parish-navy/10">
        {community.image ? (
          <img
            src={community.image}
            alt={community.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-parish-navy to-parish-navy-dark">
            <Church className="w-12 h-12 text-parish-gold/60 mb-2" />
            <span className="text-xs text-white/40 font-medium">
              Comunidade
            </span>
          </div>
        )}
        {/* Badge de missas */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {community.masses.length} missa
          {community.masses.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Corpo */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Nome */}
        <div>
          <h2 className="font-playfair text-xl font-bold text-parish-text group-hover:text-parish-navy transition-colors leading-snug">
            {community.name}
          </h2>
          {fullAddress && (
            <div className="flex items-start gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-parish-gold flex-shrink-0 mt-0.5" />
              <span className="text-xs text-parish-text-light leading-relaxed">
                {fullAddress}
              </span>
            </div>
          )}
        </div>

        {/* Horários */}
        <div className="flex-1 space-y-2.5">
          {grouped.map(([day, masses]) => (
            <div key={day}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-parish-gold" />
                <span className="text-xs font-semibold text-parish-text uppercase tracking-wide">
                  {DAY_LABELS_FULL[day]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-5">
                {masses.map((m) => (
                  <div key={m.id} className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 bg-parish-background border border-parish-border rounded-lg px-2.5 py-1 text-xs font-semibold text-parish-text">
                      <Clock className="w-3 h-3 text-parish-gold" />
                      {m.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé do card */}
        <div className="flex items-center justify-between pt-2 border-t border-parish-border mt-auto">
          <Link
            href={`/comunidades/${community.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-parish-gold hover:text-parish-gold-dark transition-colors"
          >
            Ver detalhes
            <ChevronRight className="w-4 h-4" />
          </Link>
          {community.mapUrl && (
            <a
              href={community.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-parish-text-light hover:text-parish-navy transition-colors"
              title="Ver no mapa"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Mapa
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
