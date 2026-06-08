"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from "lucide-react";
import { formatDateFull, formatTime, isDatePast } from "@/lib/utils";

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

  useEffect(() => { fetchEvento(); }, [eventoId]);

  async function fetchEvento() {
    try {
      setLoading(true);
      const response = await fetch(`/api/eventos/${eventoId}/public`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Evento não encontrado");
        throw new Error("Erro ao carregar evento");
      }
      const data = await response.json();
      setEvento(data);
    } catch (error) {
      console.error("Erro ao carregar evento:", error);
      setError(error instanceof Error ? error.message : "Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parish-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold"></div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="min-h-screen bg-parish-background flex items-center justify-center p-4">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-parish-text mb-4">Evento não encontrado</h1>
          <p className="text-parish-text-light mb-8">O evento que você está procurando não existe ou foi removido.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition">
            <ArrowLeft className="w-4 h-4 mr-2" />Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = formatDateFull;
  const isEventPast = () => isDatePast(evento.date);

  return (
    <div className="min-h-screen bg-parish-background">
      <header className="bg-parish-surface shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div>
                <h1 className="font-bold text-xl text-parish-text-dark">Paróquia São Sebastião</h1>
                <p className="text-xs text-parish-text-light">Três Barras, Cuiabá-MT</p>
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="text-parish-text-light hover:text-parish-gold transition">Início</Link>
              <Link href="/eventos" className="text-parish-text-light hover:text-parish-gold transition">Eventos</Link>
            </div>
          </div>
        </nav>
      </header>

      {evento.image ? (
        <div className="w-full h-96 bg-parish-primary">
          <img src={evento.image} alt={evento.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-96 bg-gradient-to-br from-parish-sky to-parish-gold flex items-center justify-center">
          <Calendar className="w-24 h-24 text-white opacity-50" />
        </div>
      )}

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {isEventPast() && (
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-parish-primary text-parish-text rounded-full text-sm font-medium">
              Evento Realizado
            </span>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-parish-text mb-6 leading-tight">{evento.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-border">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-parish-gold mt-1" />
              <div>
                <p className="text-sm text-parish-text-light mb-1">Data</p>
                <p className="font-semibold text-parish-text">{formatDate(evento.date)}</p>
              </div>
            </div>
          </div>
          <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-border">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-parish-gold mt-1" />
              <div>
                <p className="text-sm text-parish-text-light mb-1">Horário</p>
                <p className="font-semibold text-parish-text">
                  {formatTime(evento.date)}{evento.endDate && ` - ${formatTime(evento.endDate)}`}
                </p>
              </div>
            </div>
          </div>
          {evento.location && (
            <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-border">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-parish-gold mt-1" />
                <div>
                  <p className="text-sm text-parish-text-light mb-1">Local</p>
                  <p className="font-semibold text-parish-text">{evento.location}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 pb-8 border-b border-parish-border">
          <button className="flex items-center space-x-2 text-parish-gold hover:text-parish-gold-dark transition">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Compartilhar evento</span>
          </button>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="text-2xl font-bold text-parish-text mb-4">Sobre o Evento</h2>
          <div className="text-parish-text leading-relaxed whitespace-pre-wrap">{evento.description}</div>
        </div>

        {evento.endDate && (
          <div className="bg-parish-sky-light border-l-4 border-parish-gold p-6 mb-8">
            <h3 className="font-semibold text-parish-text mb-2">Duração do Evento</h3>
            <p className="text-parish-text-light">
              De {formatDate(evento.date)} às {formatTime(evento.date)} <br />
              até {formatDate(evento.endDate)} às {formatTime(evento.endDate)}
            </p>
          </div>
        )}

        {!isEventPast() && (
          <div className="bg-gradient-gold rounded-lg p-8 text-center text-white mb-8">
            <h3 className="text-2xl font-bold mb-4">Participe deste Evento!</h3>
            <p className="mb-6 opacity-90">Sua presença é muito importante para nós. Venha participar!</p>
            <button className="bg-white text-parish-gold-dark px-8 py-3 rounded-lg font-semibold hover:bg-parish-background transition">
              Adicionar à Agenda
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-parish-border">
          <Link href="/" className="inline-flex items-center text-parish-gold hover:text-parish-gold-dark transition font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />Voltar para o início
          </Link>
        </div>
      </article>

      <footer className="bg-parish-text-dark text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-bold text-lg mb-2">Paróquia São Sebastião</h3>
          <p className="text-parish-secondary text-sm">Bairro Três Barras, Cuiabá-MT</p>
          <p className="text-parish-secondary text-sm mt-4">&copy; 2025 Paróquia São Sebastião. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
