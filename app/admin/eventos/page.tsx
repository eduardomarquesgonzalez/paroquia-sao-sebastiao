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
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    (e) => e.published && !isEventPast(e.date)
  ).length;
  const pastEvents = eventos.filter((e) => isEventPast(e.date)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-600 mt-1">Gerencie os eventos da paróquia</p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Evento</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total de Eventos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {eventos.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Próximos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {upcomingEvents}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Realizados</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{pastEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Rascunhos</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {eventos.filter((e) => !e.published).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
          <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nenhum evento encontrado</p>
            <Link
              href="/admin/eventos/novo"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Criar seu primeiro evento
            </Link>
          </div>
        ) : (
          filteredEventos.map((evento) => (
            <div
              key={evento.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              {evento.image ? (
                <div className="h-48 bg-gray-200">
                  <img
                    src={evento.image}
                    alt={evento.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  {evento.published ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Rascunho
                    </span>
                  )}
                  {isEventPast(evento.date) && (
                    <span className="text-xs text-gray-500">Realizado</span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {evento.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {evento.description}
                </p>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatDate(evento.date)}</span>
                </div>

                {/* Location */}
                {evento.location && (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="line-clamp-1">{evento.location}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/eventos/${evento.id}/editar`}
                    className="text-blue-600 hover:text-blue-800 transition flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                  </Link>

                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/eventos/${evento.id}`}
                      className="text-gray-600 hover:text-gray-800 transition"
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
          ))
        )}
      </div>
    </div>
  );
}
