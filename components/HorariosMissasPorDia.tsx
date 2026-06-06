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
  DOMINICAL: { label: "Dominical", color: "bg-blue-100 text-blue-800" },
  SEMANAL: { label: "Semanal", color: "bg-gray-100 text-gray-800" },
  ESPECIAL: { label: "Especial", color: "bg-purple-100 text-purple-800" },
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

  // Agrupar missas por dia da semana
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

  // Ordenar missas dentro de cada dia por horário
  Object.keys(massesByDay).forEach((day) => {
    massesByDay[day].sort((a, b) => a.mass.time.localeCompare(b.mass.time));
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (communities.length === 0 || Object.keys(massesByDay).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-100 text-center">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Horários em Atualização
        </h3>
        <p className="text-gray-600">
          Em breve disponibilizaremos os horários das celebrações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro por dia (opcional para mobile) */}
      <div className="lg:hidden bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por dia:
        </label>
        <select
          value={selectedDay || "all"}
          onChange={(e) =>
            setSelectedDay(e.target.value === "all" ? null : e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Header do dia */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Clock className="w-6 h-6 mr-3" />
              {DAYS_OF_WEEK[day].label}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
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
                  className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                >
                  {/* Imagem da comunidade */}
                  <div className="relative h-32 bg-gray-200 overflow-hidden">
                    {community.image ? (
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Church className="w-12 h-12 text-white opacity-60" />
                      </div>
                    )}
                    {/* Badge de horário sobreposto */}
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      <span className="text-xl font-bold text-blue-600">
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
                      <h4 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover/link:text-blue-600 transition">
                        {community.name}
                      </h4>
                    </Link>

                    {/* Tipo de missa */}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                        MASS_TYPES[mass.type]?.color ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {MASS_TYPES[mass.type]?.label || mass.type}
                    </span>

                    {/* Localização */}
                    {community.neighborhood && (
                      <div className="flex items-start text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {community.neighborhood}
                        </span>
                      </div>
                    )}

                    {/* Telefone */}
                    {community.phone && (
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{community.phone}</span>
                      </div>
                    )}

                    {/* Observações */}
                    {mass.observations && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-start text-xs text-blue-900 bg-blue-50 rounded-lg p-2">
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
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center group/link"
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-center space-x-3 text-center">
          <Church className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-lg">
              Venha celebrar conosco!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Todos são bem-vindos em nossas comunidades
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
