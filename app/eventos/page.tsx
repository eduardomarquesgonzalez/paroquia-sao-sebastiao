"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowLeft, ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string | null;
  image: string | null;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/eventos/public")
      .then((r) => r.json())
      .then((data) => setEventos(Array.isArray(data) ? data : []))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getDayMonth = (dateString: string) => {
    const d = new Date(dateString);
    return {
      day: d.toLocaleDateString("pt-BR", { day: "2-digit" }),
      month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    };
  };

  return (
    <div className="min-h-screen bg-parish-background">
      {/* Header */}
      <header className="bg-parish-surface shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div>
                <h1 className="font-bold text-xl text-parish-text-dark">
                  Paróquia São Sebastião
                </h1>
                <p className="text-xs text-parish-text-light">
                  Três Barras, Cuiabá-MT
                </p>
              </div>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-parish-text-light hover:text-parish-gold transition">
                Início
              </Link>
              <Link href="/posts" className="text-parish-text-light hover:text-parish-gold transition">
                Notícias
              </Link>
              <Link href="/eventos" className="text-parish-gold font-medium transition">
                Eventos
              </Link>
              <Link href="/missas" className="text-parish-text-light hover:text-parish-gold transition">
                Missas
              </Link>
              <Link href="/sobre" className="text-parish-text-light hover:text-parish-gold transition">
                Sobre
              </Link>
              <Link href="/contato" className="text-parish-text-light hover:text-parish-gold transition">
                Contato
              </Link>
            </div>
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition text-sm font-medium"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-parish-sky to-parish-gold py-16 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white text-sm mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o início
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Eventos</h1>
          <p className="text-white/80 text-lg">
            Confira os próximos eventos da nossa paróquia
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-20 bg-parish-surface rounded-2xl border border-parish-border">
            <Calendar className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-parish-text mb-2">
              Nenhum evento próximo
            </h2>
            <p className="text-parish-text-light">
              Volte em breve para conferir as próximas atividades.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {eventos.map((evento) => {
              const { day, month } = getDayMonth(evento.date);
              return (
                <Link
                  key={evento.id}
                  href={`/eventos/${evento.id}`}
                  className="flex flex-col sm:flex-row bg-parish-surface rounded-2xl border border-parish-border overflow-hidden hover:shadow-md hover:border-parish-gold/40 transition group"
                >
                  {/* Date badge */}
                  <div className="sm:w-28 flex-shrink-0 bg-gradient-to-b from-parish-gold to-parish-gold-dark flex flex-col items-center justify-center py-6 px-4 text-white">
                    <span className="text-4xl font-bold leading-none">{day}</span>
                    <span className="text-sm uppercase tracking-widest mt-1 opacity-90">
                      {month}
                    </span>
                  </div>

                  {/* Image */}
                  {evento.image && (
                    <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                      <img
                        src={evento.image}
                        alt={evento.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-parish-text group-hover:text-parish-gold transition mb-2 line-clamp-2">
                        {evento.title}
                      </h2>
                      <p className="text-parish-text-light text-sm line-clamp-2 mb-4">
                        {evento.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-parish-text-light">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-parish-gold flex-shrink-0" />
                        {formatTime(evento.date)}
                        {evento.endDate && ` – ${formatTime(evento.endDate)}`}
                      </span>
                      {evento.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-parish-gold flex-shrink-0" />
                          {evento.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-parish-gold flex-shrink-0" />
                        {formatDate(evento.date)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center pr-6 text-parish-secondary group-hover:text-parish-gold transition">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-parish-text-dark text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Paróquia São Sebastião</h3>
              <p className="text-parish-secondary text-sm">
                Uma comunidade católica dedicada à fé, esperança e caridade.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="text-parish-secondary text-sm space-y-2">
                <li><Link href="/missas" className="hover:text-white transition">Horários de Missas</Link></li>
                <li><Link href="/eventos" className="hover:text-white transition">Eventos</Link></li>
                <li><Link href="/posts" className="hover:text-white transition">Notícias</Link></li>
                <li><Link href="/contato" className="hover:text-white transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="text-parish-secondary text-sm space-y-2">
                <li>Bairro Três Barras</li>
                <li>Cuiabá-MT</li>
                <li>saosebastiaomt@outlook.com.br</li>
                <li>(65) 0000-0000</li>
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
