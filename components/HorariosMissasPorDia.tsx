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
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const MASS_TYPES: { [key: string]: { label: string; color: string } } = {
  DOMINICAL: { label: "Dominical", color: "bg-parish-sky-light text-parish-sky-dark" },
  SEMANAL: { label: "Semanal", color: "bg-parish-primary text-parish-text" },
  ESPECIAL: { label: "Especial", color: "bg-parish-gold-light/40 text-parish-gold-dark" },
};

export default function HorariosMissasPorDia() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  async function fetchCommunities() {
    try {
      const response = await fetch("/api/comunidades/public");
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      }
    } catch (error) {
      console.error("Erro ao carregar comunidades:", error);
    } finally {
      setLoading(false);
    }
  }

  const massesByDay: {
    [key: string]: { community: Community; mass: Mass }[];
  } = {};

  communities.forEach((community) => {
    community.masses.forEach((mass) => {
      if (!massesByDay[mass.dayOfWeek]) {
        massesByDay[mass.dayOfWeek] = [];
      }
      massesByDay[mass.dayOfWeek].push({ community, mass });
    });
  });

  Object.keys(massesByDay).forEach((day) => {
    massesByDay[day].sort((a, b) => a.mass.time.localeCompare(b.mass.time));
  });

  if (loading) {
    return (
      <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-parish-primary rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-parish-primary rounded"></div>
            <div className="h-4 bg-parish-primary rounded"></div>
            <div className="h-4 bg-parish-primary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (communities.length === 0 || Object.keys(massesByDay).length === 0) {
    return (
      <div className="bg-parish-surface rounded-lg shadow-sm p-12 border border-parish-primary text-center">
        <Clock className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-parish-text mb-2">
          Horários em Atualização
        </h3>
        <p className="text-parish-text-light">
          Em breve disponibilizaremos os horários das celebrações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro por dia (mobile) */}
      <div className="lg:hidden bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
        <label className="block text-sm font-medium text-parish-text-light mb-2">
          Filtrar por dia:
        </label>
        <select
          value={selectedDay || "all"}
          onChange={(e) =>
            setSelectedDay(e.target.value === "all" ? null : e.target.value)
          }
          className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
        >
          <option value="all">Todos os dias</option>
          {DAY_ORDER.filter((day) => massesByDay[day]).map((day) => (
            <option key={day} value={day}>
              {DAYS_OF_WEEK[day].label}
            </option>
          ))}
        </select>
      </div>

      {/* Cards por dia da semana */}
      {DAY_ORDER.filter(
        (day) => massesByDay[day] && (!selectedDay || selectedDay === day)
      ).map((day) => (
        <div
          key={day}
          className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden"
        >
          {/* Header do dia */}
          <div className="bg-gradient-gold px-6 py-4">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Clock className="w-6 h-6 mr-3" />
              {DAYS_OF_WEEK[day].label}
            </h3>
            <p className="text-parish-background text-sm mt-1">
              {massesByDay[day].length} missa
              {massesByDay[day].length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Missas do dia */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {massesByDay[day].map(({ community, mass }, index) => (
                <div
                  key={`${mass.id}-${index}`}
                  className="group relative bg-gradient-to-br from-parish-background to-parish-surface border border-parish-border rounded-lg overflow-hidden hover:shadow-lg hover:border-parish-gold transition-all duration-300"
                >
                  {/* Imagem da comunidade */}
                  <div className="relative h-32 bg-parish-primary overflow-hidden">
                    {community.image ? (
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-parish-sky to-parish-gold flex items-center justify-center">
                        <Church className="w-12 h-12 text-white opacity-60" />
                      </div>
                    )}
                    {/* Badge de horário sobreposto */}
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      <span className="text-xl font-bold text-parish-gold">
                        {mass.time}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    {/* Nome da comunidade */}
                    <Link
                      href={`/comunidades/${community.slug}`}
                      className="block group/link"
                    >
                      <h4 className="font-bold text-parish-text mb-1 line-clamp-2 group-hover/link:text-parish-gold transition">
                        {community.name}
                      </h4>
                    </Link>

                    {/* Tipo de missa */}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                        MASS_TYPES[mass.type]?.color ||
                        "bg-parish-primary text-parish-text"
                      }`}
                    >
                      {MASS_TYPES[mass.type]?.label || mass.type}
                    </span>

                    {/* Localização */}
                    {community.neighborhood && (
                      <div className="flex items-start text-sm text-parish-text-light mb-2">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {community.neighborhood}
                        </span>
                      </div>
                    )}

                    {/* Telefone */}
                    {community.phone && (
                      <div className="flex items-center text-sm text-parish-text-light mb-3">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{community.phone}</span>
                      </div>
                    )}

                    {/* Observações */}
                    {mass.observations && (
                      <div className="mt-3 pt-3 border-t border-parish-border">
                        <div className="flex items-start text-xs text-parish-text-dark bg-parish-sky-light rounded-lg p-2">
                          <Info className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {mass.observations}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Link para página da comunidade */}
                    <Link
                      href={`/comunidades/${community.slug}`}
                      className="mt-3 text-xs text-parish-gold hover:text-parish-gold-dark font-medium flex items-center group/link"
                    >
                      <span>Ver mais informações</span>
                      <span className="ml-1 group-hover/link:translate-x-1 transition-transform">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Footer informativo */}
      <div className="bg-gradient-to-r from-parish-background to-parish-sky-light rounded-lg p-6 border border-parish-sky-light">
        <div className="flex items-center justify-center space-x-3 text-center">
          <Church className="w-8 h-8 text-parish-gold flex-shrink-0" />
          <div>
            <p className="font-semibold text-parish-text text-lg">
              Venha celebrar conosco!
            </p>
            <p className="text-sm text-parish-text-light mt-1">
              Todos são bem-vindos em nossas comunidades
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
