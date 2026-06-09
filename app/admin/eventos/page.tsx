"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDateTimeShort, isEventEnded } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string | null;
  image: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

export default function EventosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventos();
  }, []);

  async function fetchEventos() {
    try {
      setLoading(true);
      const response = await fetch("/api/eventos");
      if (!response.ok) throw new Error("Erro ao carregar");

      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
      return;
    }

    try {
      const response = await fetch(`/api/eventos?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Evento excluído com sucesso!");
      setEventos(eventos.filter((evento) => evento.id !== id));
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir evento");
    }
  };

  const formatDate = formatDateTimeShort;
  const isEnded = isEventEnded;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold"></div>
      </div>
    );
  }

  const filteredEventos = eventos.filter((evento) => {
    const matchesSearch =
      evento.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && evento.published) ||
      (filterStatus === "draft" && !evento.published);
    return matchesSearch && matchesStatus;
  });

  const upcomingEvents = eventos.filter(
    (e) => e.published && !isEnded(e)
  ).length;
  const endedEvents = eventos.filter((e) => isEnded(e)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-parish-text">Eventos</h1>
          <p className="text-parish-text-light mt-1">Gerencie os eventos da paróquia</p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="bg-parish-gold text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-parish-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Evento</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Total</p>
          <p className="text-2xl font-bold text-parish-text mt-1">{eventos.length}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Próximos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{upcomingEvents}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Encerrados</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{endedEvents}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Rascunhos</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{eventos.filter((e) => !e.published).length}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-gold/40">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-parish-gold fill-parish-gold" />
            <p className="text-sm text-parish-text-light">Em Destaque</p>
          </div>
          <p className="text-2xl font-bold text-parish-gold mt-1">
            {eventos.filter((e) => e.featured && e.published && !isEnded(e)).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-parish-secondary w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEventos.length === 0 ? (
          <div className="col-span-full bg-parish-surface rounded-lg shadow-sm p-8 text-center border border-parish-primary">
            <Calendar className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
            <p className="text-parish-text-light mb-2">Nenhum evento encontrado</p>
            <Link
              href="/admin/eventos/novo"
              className="text-parish-gold hover:text-parish-gold-dark text-sm"
            >
              Criar seu primeiro evento
            </Link>
          </div>
        ) : (
          filteredEventos.map((evento) => {
            const eventEnded = isEnded(evento);
            return (
            <div
              key={evento.id}
              className={`rounded-lg shadow-sm border overflow-hidden transition ${
                eventEnded
                  ? "bg-gray-50 border-gray-200 opacity-80 hover:opacity-100 hover:shadow-sm"
                  : "bg-parish-surface border-parish-primary hover:shadow-md"
              }`}
            >
              {/* Image */}
              {evento.image ? (
                <div className="h-48 bg-parish-primary relative overflow-hidden">
                  <img
                    src={evento.image}
                    alt={evento.title}
                    className={`w-full h-full object-cover ${eventEnded ? "grayscale" : ""}`}
                  />
                  {eventEnded && <div className="absolute inset-0 bg-black/20" />}
                </div>
              ) : (
                <div className={`h-48 flex items-center justify-center ${eventEnded ? "bg-gradient-to-br from-gray-300 to-gray-400" : "bg-gradient-to-br from-parish-sky to-parish-gold"}`}>
                  <Calendar className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {evento.published ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Rascunho
                      </span>
                    )}
                    {eventEnded && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                        Encerrado
                      </span>
                    )}
                  </div>
                  {evento.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-parish-gold/10 text-parish-gold border border-parish-gold/30">
                      <Star className="w-3 h-3 fill-parish-gold" /> Destaque
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-parish-text mb-2 line-clamp-2">
                  {evento.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-parish-text-light mb-3 line-clamp-2">
                  {evento.description}
                </p>

                {/* Date */}
                <div className="flex items-center text-sm text-parish-text-light mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatDate(evento.date)}</span>
                </div>

                {/* Location */}
                {evento.location && (
                  <div className="flex items-center text-sm text-parish-text-light mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="line-clamp-1">{evento.location}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-parish-primary">
                  <Link
                    href={`/admin/eventos/${evento.id}/editar`}
                    className="text-parish-gold hover:text-parish-gold-dark transition flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                  </Link>

                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/eventos/${evento.id}`}
                      className="text-parish-text-light hover:text-parish-text transition"
                      title="Visualizar"
                      target="_blank"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(evento.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
