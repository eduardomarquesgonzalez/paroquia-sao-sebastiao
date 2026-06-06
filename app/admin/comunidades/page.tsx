"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Church,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  image: string | null;
  active: boolean;
  order: number;
  _count?: {
    masses: number;
  };
}

export default function ComunidadesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [comunidades, setComunidades] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComunidades();
  }, []);

  async function fetchComunidades() {
    try {
      setLoading(true);
      const response = await fetch("/api/comunidades");
      if (!response.ok) throw new Error("Erro ao carregar");

      const data = await response.json();
      setComunidades(data);
    } catch (error) {
      console.error("Erro ao carregar comunidades:", error);
      toast.error("Erro ao carregar comunidades");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/comunidades?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir");
      }

      toast.success("Comunidade excluída com sucesso!");
      setComunidades(comunidades.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Erro ao excluir comunidade:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir comunidade"
      );
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/comunidades`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentStatus }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      toast.success(
        `Comunidade ${!currentStatus ? "ativada" : "desativada"} com sucesso!`
      );
      setComunidades(
        comunidades.map((c) =>
          c.id === id ? { ...c, active: !currentStatus } : c
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredComunidades = comunidades.filter((comunidade) => {
    const matchesSearch =
      comunidade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comunidade.neighborhood &&
        comunidade.neighborhood
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (comunidade.address &&
        comunidade.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && comunidade.active) ||
      (filterStatus === "inactive" && !comunidade.active);

    return matchesSearch && matchesStatus;
  });

  const activeCommunities = comunidades.filter((c) => c.active).length;
  const inactiveCommunities = comunidades.filter((c) => !c.active).length;
  const totalMasses = comunidades.reduce(
    (acc, c) => acc + (c._count?.masses || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunidades</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as comunidades da paróquia
          </p>
        </div>
        <Link
          href="/admin/comunidades/nova"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Comunidade</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {comunidades.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Ativas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeCommunities}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Inativas</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {inactiveCommunities}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total de Missas</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalMasses}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar comunidades..."
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
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComunidades.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
            <Church className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nenhuma comunidade encontrada</p>
            <Link
              href="/admin/comunidades/nova"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Criar primeira comunidade
            </Link>
          </div>
        ) : (
          filteredComunidades.map((comunidade) => (
            <div
              key={comunidade.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              {comunidade.image ? (
                <div className="h-48 bg-gray-200">
                  <img
                    src={comunidade.image}
                    alt={comunidade.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Church className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() =>
                      toggleActive(comunidade.id, comunidade.active)
                    }
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition ${
                      comunidade.active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {comunidade.active ? "Ativa" : "Inativa"}
                  </button>
                  {comunidade._count && (
                    <span className="text-xs text-gray-500">
                      {comunidade._count.masses} missa(s)
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {comunidade.name}
                </h3>

                {/* Description */}
                {comunidade.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {comunidade.description}
                  </p>
                )}

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {comunidade.neighborhood && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {comunidade.neighborhood}
                      </span>
                    </div>
                  )}
                  {comunidade.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{comunidade.phone}</span>
                    </div>
                  )}
                  {comunidade.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{comunidade.email}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/comunidades/${comunidade.id}/editar`}
                    className="text-blue-600 hover:text-blue-800 transition flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(comunidade.id, comunidade.name)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
