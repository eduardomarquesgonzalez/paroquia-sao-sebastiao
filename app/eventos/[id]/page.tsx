"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string | null;
  image: string | null;
  published: boolean;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
}

export default function EventoPage() {
  const params = useParams();
  const eventoId = params.id as string;

  const [evento, setEvento] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvento();
  }, [eventoId]);

  async function fetchEvento() {
    try {
      setLoading(true);
      const response = await fetch(`/api/eventos/${eventoId}/public`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Evento não encontrado");
        }
        throw new Error("Erro ao carregar evento");
      }

      const data = await response.json();
      setEvento(data);
    } catch (error) {
      console.error("Erro ao carregar evento:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao carregar evento"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Evento não encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            O evento que você está procurando não existe ou foi removido.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEventPast = () => {
    return new Date(evento.date) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div>
                <h1 className="font-bold text-xl text-blue-900">
                  Paróquia São Sebastião
                </h1>
                <p className="text-xs text-gray-600">Três Barras, Cuiabá-MT</p>
              </div>
            </Link>

            <div className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Início
              </Link>
              <Link
                href="/eventos"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Eventos
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Image */}
      {evento.image ? (
        <div className="w-full h-96 bg-gray-200">
          <img
            src={evento.image}
            alt={evento.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Calendar className="w-24 h-24 text-white opacity-50" />
        </div>
      )}

      {/* Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Status Badge */}
        {isEventPast() && (
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Evento Realizado
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {evento.title}
        </h1>

        {/* Event Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Date */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Data</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(evento.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Horário</p>
                <p className="font-semibold text-gray-900">
                  {formatTime(evento.date)}
                  {evento.endDate && ` - ${formatTime(evento.endDate)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {evento.location && (
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Local</p>
                  <p className="font-semibold text-gray-900">
                    {evento.location}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Compartilhar evento</span>
          </button>
        </div>

        {/* Description */}
        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sobre o Evento
          </h2>
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {evento.description}
          </div>
        </div>

        {/* Event Duration */}
        {evento.endDate && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">
              Duração do Evento
            </h3>
            <p className="text-gray-700">
              De {formatDate(evento.date)} às {formatTime(evento.date)} <br />
              até {formatDate(evento.endDate)} às {formatTime(evento.endDate)}
            </p>
          </div>
        )}

        {/* CTA Section */}
        {!isEventPast() && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white mb-8">
            <h3 className="text-2xl font-bold mb-4">Participe deste Evento!</h3>
            <p className="mb-6 opacity-90">
              Sua presença é muito importante para nós. Venha participar!
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Adicionar à Agenda
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-bold text-lg mb-2">Paróquia São Sebastião</h3>
          <p className="text-gray-400 text-sm">Bairro Três Barras, Cuiabá-MT</p>
          <p className="text-gray-400 text-sm mt-4">
            &copy; Criado por j2z 2025 Paróquia São Sebastião. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
