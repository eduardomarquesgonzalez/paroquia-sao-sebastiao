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
      <header className="bg-parish-surface shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl text-parish-text-dark">Paróquia São Sebastião</h1>
              <p className="text-sm text-parish-text-light">Três Barras, Cuiabá-MT</p>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-parish-text-light hover:text-parish-gold transition">Início</Link>
              <Link href="/posts" className="text-parish-text-light hover:text-parish-gold transition">Notícias</Link>
              <Link href="/eventos" className="text-parish-text-light hover:text-parish-gold transition">Eventos</Link>
              <Link href="/missas" className="text-parish-text-light hover:text-parish-gold transition font-medium">Missas</Link>
              <Link href="/contato" className="text-parish-text-light hover:text-parish-gold transition">Contato</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition text-sm font-medium">
              Admin
            </Link>
          </div>
        </nav>
      </header>

      <section className="bg-gradient-gold text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Horários de Missas</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">Participe de nossas celebrações. Todos são bem-vindos!</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-parish-gold hover:text-parish-gold-dark mb-6 transition">
              <ArrowLeft className="w-4 h-4 mr-2" />Voltar para início
            </Link>

            {loading ? (
              <div className="bg-parish-surface rounded-lg shadow-sm p-12 border border-parish-primary">
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-parish-primary rounded w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-6 bg-parish-primary rounded"></div>
                    <div className="h-6 bg-parish-primary rounded"></div>
                    <div className="h-6 bg-parish-primary rounded"></div>
                  </div>
                </div>
              </div>
            ) : missas.length === 0 ? (
              <div className="bg-parish-surface rounded-lg shadow-sm p-12 border border-parish-primary text-center">
                <Clock className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-parish-text mb-2">Horários em Atualização</h3>
                <p className="text-parish-text-light">Em breve disponibilizaremos os horários das celebrações.</p>
              </div>
            ) : (
              <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden">
                <div className="bg-gradient-gold px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Horários das Celebrações</h3>
                      <p className="text-white opacity-80 text-sm mt-1">Confira todos os horários disponíveis</p>
                    </div>
                    <Calendar className="w-12 h-12 text-white opacity-50" />
                  </div>
                </div>

                <div className="divide-y divide-parish-border">
                  {Object.entries(groupedMissas).map(([day, dayMissas]) => (
                    <div key={day} className="p-6 hover:bg-parish-background transition">
                      <h4 className="font-bold text-xl text-parish-text mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-parish-gold" />
                        {DAYS_OF_WEEK[day]}
                      </h4>
                      <div className="space-y-4">
                        {dayMissas.map((missa) => (
                          <div key={missa.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-parish-background to-parish-surface border border-parish-border hover:border-parish-gold transition">
                            <div className="flex-shrink-0 bg-parish-gold-light/30 rounded-full p-3">
                              <Clock className="w-6 h-6 text-parish-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-2xl font-bold text-parish-text">{missa.time}</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${MASS_TYPES[missa.type]?.color || "bg-parish-primary text-parish-text"}`}>
                                  {MASS_TYPES[missa.type]?.label || missa.type}
                                </span>
                              </div>
                              {missa.location && (
                                <div className="flex items-center text-sm text-parish-text-light mb-2">
                                  <MapPin className="w-4 h-4 mr-2 text-parish-secondary" />
                                  <span className="font-medium">{missa.location}</span>
                                </div>
                              )}
                              {missa.observations && (
                                <div className="flex items-start text-sm mt-3 bg-parish-sky-light rounded-lg p-3 border border-parish-sky-light">
                                  <Info className="w-4 h-4 mr-2 text-parish-sky-dark flex-shrink-0 mt-0.5" />
                                  <span className="text-parish-text-dark">{missa.observations}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-parish-background to-parish-sky-light px-6 py-5 border-t border-parish-sky-light">
                  <div className="flex items-center justify-center space-x-2 text-center">
                    <span className="text-2xl">⛪</span>
                    <div>
                      <p className="font-semibold text-parish-text">Venha celebrar conosco!</p>
                      <p className="text-sm text-parish-text-light">Todos são bem-vindos em nossa comunidade</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
                <div className="bg-parish-gold-light/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-parish-gold" />
                </div>
                <h3 className="font-semibold text-parish-text mb-2">Pontualidade</h3>
                <p className="text-sm text-parish-text-light">Chegue 10 minutos antes para uma melhor acomodação.</p>
              </div>
              <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
                <div className="bg-parish-sky-light rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Info className="w-6 h-6 text-parish-sky-dark" />
                </div>
                <h3 className="font-semibold text-parish-text mb-2">Confissões</h3>
                <p className="text-sm text-parish-text-light">Disponível 30 minutos antes das missas ou agende com o padre.</p>
              </div>
              <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-parish-text mb-2">Localização</h3>
                <p className="text-sm text-parish-text-light">Bairro Três Barras, Cuiabá-MT. Estacionamento disponível.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-parish-text-dark text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Paróquia São Sebastião</h3>
              <p className="text-parish-secondary text-sm">Uma comunidade católica dedicada à fé, esperança e caridade.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="text-parish-secondary text-sm space-y-2">
                <li><Link href="/" className="hover:text-white transition">Início</Link></li>
                <li><Link href="/posts" className="hover:text-white transition">Notícias</Link></li>
                <li><Link href="/eventos" className="hover:text-white transition">Eventos</Link></li>
                <li><Link href="/contato" className="hover:text-white transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="text-parish-secondary text-sm space-y-2">
                <li>Bairro Três Barras</li>
                <li>Cuiabá-MT</li>
                <li>saosebastiaomt@outlook.com.br</li>
                <li>65 - 99277 1705</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-parish-text pt-8 text-center text-parish-secondary text-sm">
            <p>&copy; 2025 Paróquia São Sebastião. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
