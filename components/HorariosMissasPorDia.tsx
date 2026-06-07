"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Info, Church, Phone } from "lucide-react";
import Link from "next/link";

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
  image: string | null;
  phone: string | null;
  masses: Mass[];
}

const DAYS_OF_WEEK: { [key: string]: { label: string; short: string } } = {
  SUNDAY: { label: "Domingo", short: "Dom" },
  MONDAY: { label: "Segunda-feira", short: "Seg" },
  TUESDAY: { label: "Terça-feira", short: "Ter" },
  WEDNESDAY: { label: "Quarta-feira", short: "Qua" },
  THURSDAY: { label: "Quinta-feira", short: "Qui" },
  FRIDAY: { label: "Sexta-feira", short: "Sex" },
  SATURDAY: { label: "Sábado", short: "Sáb" },
};

const DAY_ORDER = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
];

const MASS_TYPES: { [key: string]: { label: string; color: string } } = {
  DOMINICAL: {
    label: "Dominical",
    color: "bg-parish-navy/10 text-parish-navy font-semibold",
  },
  SEMANAL: {
    label: "Semanal",
    color: "bg-parish-gold/10 text-parish-gold-dark font-semibold",
  },
  ESPECIAL: {
    label: "Especial",
    color: "bg-parish-gold/20 text-parish-gold-dark font-semibold",
  },
};

export default function HorariosMissasPorDia() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/comunidades/public")
      .then((r) => r.json())
      .then((d) => setCommunities(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const massesByDay: { [key: string]: { community: Community; mass: Mass }[] } = {};
  communities.forEach((community) => {
    community.masses.forEach((mass) => {
      if (!massesByDay[mass.dayOfWeek]) massesByDay[mass.dayOfWeek] = [];
      massesByDay[mass.dayOfWeek].push({ community, mass });
    });
  });
  Object.keys(massesByDay).forEach((day) => {
    massesByDay[day].sort((a, b) => a.mass.time.localeCompare(b.mass.time));
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-parish-surface rounded-2xl border border-parish-border animate-pulse overflow-hidden">
            <div className="h-14 bg-parish-primary/40" />
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((j) => (
                <div key={j} className="h-36 bg-parish-primary/30 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (communities.length === 0 || Object.keys(massesByDay).length === 0) {
    return (
      <div className="bg-parish-surface rounded-2xl border border-parish-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-parish-navy/8 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-parish-navy" />
        </div>
        <h3 className="font-playfair text-xl font-bold text-parish-navy-dark mb-2">
          Horários em Atualização
        </h3>
        <p className="text-parish-text-light text-sm">
          Em breve disponibilizaremos os horários das celebrações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Day filter — mobile */}
      <div className="lg:hidden bg-parish-surface rounded-xl border border-parish-border p-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-parish-text-light mb-2">
          Filtrar por dia
        </label>
        <select
          value={selectedDay || "all"}
          onChange={(e) => setSelectedDay(e.target.value === "all" ? null : e.target.value)}
          className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm text-parish-text bg-white focus:ring-2 focus:ring-parish-navy/20 focus:border-parish-navy outline-none transition-colors"
        >
          <option value="all">Todos os dias</option>
          {DAY_ORDER.filter((day) => massesByDay[day]).map((day) => (
            <option key={day} value={day}>
              {DAYS_OF_WEEK[day].label}
            </option>
          ))}
        </select>
      </div>

      {/* Day cards */}
      {DAY_ORDER.filter(
        (day) => massesByDay[day] && (!selectedDay || selectedDay === day)
      ).map((day) => (
        <div
          key={day}
          className="bg-parish-surface rounded-2xl border border-parish-border overflow-hidden shadow-parish"
        >
          {/* Day header */}
          <div className="bg-gradient-navy px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-playfair text-xl font-bold text-white">
                {DAYS_OF_WEEK[day].label}
              </h3>
              <p className="text-white/55 text-xs mt-0.5">
                {massesByDay[day].length} missa
                {massesByDay[day].length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Mass cards grid */}
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {massesByDay[day].map(({ community, mass }, index) => (
                <div
                  key={`${mass.id}-${index}`}
                  className="group relative bg-parish-background border border-parish-border rounded-xl overflow-hidden hover:shadow-navy hover:border-parish-navy/20 transition-all duration-300"
                >
                  {/* Community image */}
                  <div className="relative h-28 overflow-hidden">
                    {community.image ? (
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-navy flex items-center justify-center">
                        <Church className="w-10 h-10 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-parish-navy-dark/50 to-transparent" />
                    {/* Time badge */}
                    <div className="absolute bottom-2 right-2 bg-parish-gold text-white px-2.5 py-1 rounded-lg shadow-gold">
                      <span className="text-sm font-bold">{mass.time}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link
                      href={`/comunidades/${community.slug}`}
                      className="block group/link mb-2"
                    >
                      <h4 className="font-playfair font-bold text-parish-navy-dark text-sm line-clamp-2 group-hover/link:text-parish-gold transition-colors duration-200">
                        {community.name}
                      </h4>
                    </Link>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] mb-3 ${
                        MASS_TYPES[mass.type]?.color ?? "bg-parish-primary text-parish-text"
                      }`}
                    >
                      {MASS_TYPES[mass.type]?.label ?? mass.type}
                    </span>

                    {community.neighborhood && (
                      <div className="flex items-center gap-1.5 text-xs text-parish-text-light mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-parish-gold flex-shrink-0" />
                        <span className="line-clamp-1">{community.neighborhood}</span>
                      </div>
                    )}

                    {community.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-parish-text-light mb-1.5">
                        <Phone className="w-3.5 h-3.5 text-parish-gold flex-shrink-0" />
                        <span>{community.phone}</span>
                      </div>
                    )}

                    {mass.observations && (
                      <div className="mt-3 pt-3 border-t border-parish-border">
                        <div className="flex items-start gap-1.5 text-xs text-parish-text-light bg-parish-navy/5 rounded-lg p-2.5">
                          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-parish-navy" />
                          <span className="line-clamp-2">{mass.observations}</span>
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/comunidades/${community.slug}`}
                      className="mt-3 text-xs text-parish-gold hover:text-parish-gold-dark font-semibold flex items-center gap-1 group/lnk"
                    >
                      Ver mais
                      <span className="group-hover/lnk:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Footer informativo */}
      <div className="bg-gradient-to-r from-parish-navy/5 to-parish-gold/5 rounded-2xl p-6 border border-parish-border text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-parish-gold/10 flex items-center justify-center">
            <Church className="w-5 h-5 text-parish-gold" />
          </div>
          <div className="text-left">
            <p className="font-playfair font-bold text-parish-navy-dark">
              Venha celebrar conosco!
            </p>
            <p className="text-sm text-parish-text-light mt-0.5">
              Todos são bem-vindos em nossas comunidades
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
