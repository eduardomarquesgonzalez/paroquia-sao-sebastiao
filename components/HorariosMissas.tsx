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
  DOMINICAL: { label: "Dominical", color: "bg-blue-100 text-blue-800" },
  SEMANAL: { label: "Semanal", color: "bg-gray-100 text-gray-800" },
  ESPECIAL: { label: "Especial", color: "bg-purple-100 text-purple-800" },
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

  if (missas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Horários em atualização</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Horários de Missas</h2>
        <p className="text-blue-100 text-sm mt-1">
          Confira os horários de celebrações
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {Object.entries(groupedMissas).map(([day, dayMissas]) => (
          <div key={day} className="p-6 hover:bg-gray-50 transition">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              {DAYS_OF_WEEK[day]}
            </h3>

            <div className="space-y-3">
              {dayMissas.map((missa) => (
                <div
                  key={missa.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {missa.time}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          MASS_TYPES[missa.type]?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {MASS_TYPES[missa.type]?.label || missa.type}
                      </span>
                    </div>

                    {missa.location && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{missa.location}</span>
                      </div>
                    )}

                    {missa.observations && (
                      <div className="flex items-start text-sm text-gray-600 mt-2 bg-blue-50 rounded p-2">
                        <Info className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-900">
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

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          💒 Venha participar de nossas celebrações! Todos são bem-vindos.
        </p>
      </div>
    </div>
  );
}
