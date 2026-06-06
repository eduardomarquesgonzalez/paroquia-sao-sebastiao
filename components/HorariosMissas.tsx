"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Info } from "lucide-react";

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

export default function HorariosMissas() {
  const [missas, setMissas] = useState<Mass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissas();
  }, []);

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
    if (!acc[missa.dayOfWeek]) {
      acc[missa.dayOfWeek] = [];
    }
    acc[missa.dayOfWeek].push(missa);
    return acc;
  }, {} as { [key: string]: Mass[] });

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

  if (missas.length === 0) {
    return (
      <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary text-center">
        <Clock className="w-12 h-12 text-parish-secondary mx-auto mb-3" />
        <p className="text-parish-text-light">Horários em atualização</p>
      </div>
    );
  }

  return (
    <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden">
      <div className="bg-gradient-gold px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Horários de Missas</h2>
        <p className="text-parish-background text-sm mt-1">
          Confira os horários de celebrações
        </p>
      </div>

      <div className="divide-y divide-parish-border">
        {Object.entries(groupedMissas).map(([day, dayMissas]) => (
          <div key={day} className="p-6 hover:bg-parish-background transition">
            <h3 className="font-bold text-lg text-parish-text mb-4">
              {DAYS_OF_WEEK[day]}
            </h3>

            <div className="space-y-3">
              {dayMissas.map((missa) => (
                <div
                  key={missa.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-parish-background border border-parish-primary"
                >
                  <Clock className="w-5 h-5 text-parish-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg font-semibold text-parish-text">
                        {missa.time}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          MASS_TYPES[missa.type]?.color ||
                          "bg-parish-primary text-parish-text"
                        }`}
                      >
                        {MASS_TYPES[missa.type]?.label || missa.type}
                      </span>
                    </div>

                    {missa.location && (
                      <div className="flex items-center text-sm text-parish-text-light mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{missa.location}</span>
                      </div>
                    )}

                    {missa.observations && (
                      <div className="flex items-start text-sm text-parish-text-light mt-2 bg-parish-sky-light rounded p-2">
                        <Info className="w-4 h-4 mr-1 text-parish-sky-dark flex-shrink-0 mt-0.5" />
                        <span className="text-parish-text-dark">
                          {missa.observations}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-parish-background px-6 py-4 border-t border-parish-border">
        <p className="text-sm text-parish-text-light text-center">
          Venha participar de nossas celebrações! Todos são bem-vindos.
        </p>
      </div>
    </div>
  );
}
