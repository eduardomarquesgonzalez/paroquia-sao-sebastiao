"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Info, Calendar, ArrowLeft } from "lucide-react";

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

export default function MissasPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl text-blue-900">
                Paróquia São Sebastião
              </h1>
              <p className="text-sm text-gray-600">Três Barras, Cuiabá-MT</p>
            </div>

            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Início
              </Link>
              <Link
                href="/posts"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Notícias
              </Link>
              <Link
                href="/eventos"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Eventos
              </Link>
              <Link
                href="/missas"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Missas
              </Link>
              <Link
                href="/contato"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Contato
              </Link>
            </div>

            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Horários de Missas</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Participe de nossas celebrações. Todos são bem-vindos!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para início
            </Link>

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-100">
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : missas.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-100 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Horários em Atualização
                </h3>
                <p className="text-gray-600">
                  Em breve disponibilizaremos os horários das celebrações.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Horários das Celebrações
                      </h3>
                      <p className="text-blue-100 text-sm mt-1">
                        Confira todos os horários disponíveis
                      </p>
                    </div>
                    <Calendar className="w-12 h-12 text-white opacity-50" />
                  </div>
                </div>

                {/* Missas List */}
                <div className="divide-y divide-gray-200">
                  {Object.entries(groupedMissas).map(([day, dayMissas]) => (
                    <div key={day} className="p-6 hover:bg-gray-50 transition">
                      <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        {DAYS_OF_WEEK[day]}
                      </h4>

                      <div className="space-y-4">
                        {dayMissas.map((missa) => (
                          <div
                            key={missa.id}
                            className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-blue-300 transition"
                          >
                            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {missa.time}
                                </span>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    MASS_TYPES[missa.type]?.color ||
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {MASS_TYPES[missa.type]?.label || missa.type}
                                </span>
                              </div>

                              {missa.location && (
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="font-medium">
                                    {missa.location}
                                  </span>
                                </div>
                              )}

                              {missa.observations && (
                                <div className="flex items-start text-sm mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                  <Info className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
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

                {/* Footer */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-center">
                    <span className="text-2xl">⛪</span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Venha celebrar conosco!
                      </p>
                      <p className="text-sm text-gray-600">
                        Todos são bem-vindos em nossa comunidade
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Pontualidade
                </h3>
                <p className="text-sm text-gray-600">
                  Chegue 10 minutos antes para uma melhor acomodação.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Info className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Confissões</h3>
                <p className="text-sm text-gray-600">
                  Disponível 30 minutos antes das missas ou agende com o padre.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Localização
                </h3>
                <p className="text-sm text-gray-600">
                  Bairro Três Barras, Cuiabá-MT. Estacionamento disponível.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Paróquia São Sebastião</h3>
              <p className="text-gray-400 text-sm">
                Uma comunidade católica dedicada à fé, esperança e caridade.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <Link href="/" className="hover:text-white transition">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/posts" className="hover:text-white transition">
                    Notícias
                  </Link>
                </li>
                <li>
                  <Link href="/eventos" className="hover:text-white transition">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="hover:text-white transition">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Bairro Três Barras</li>
                <li>Cuiabá-MT</li>
                <li>saosebastiaomt@outlook.com.br</li>
                <li>65 - 99277 1705</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2025 Paróquia São Sebastião. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
