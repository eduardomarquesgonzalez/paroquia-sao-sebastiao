"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Calendar,
  MapPin,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Mass {
  id: string;
  dayOfWeek: string;
  time: string;
  type: string;
  location: string | null;
  observations: string | null;
  active: boolean;
  createdAt: string;
}

const DAYS_OF_WEEK = [
  { value: "SUNDAY", label: "Domingo" },
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
];

const MASS_TYPES = [
  { value: "DOMINICAL", label: "Dominical" },
  { value: "SEMANAL", label: "Semanal" },
  { value: "ESPECIAL", label: "Especial" },
];

export default function MissasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [missas, setMissas] = useState<Mass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissas();
  }, []);

  async function fetchMissas() {
    try {
      setLoading(true);
      const response = await fetch("/api/missas");
      if (!response.ok) throw new Error("Erro ao carregar");

      const data = await response.json();
      setMissas(data);
    } catch (error) {
      console.error("Erro ao carregar missas:", error);
      toast.error("Erro ao carregar missas");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta missa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/missas?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Missa excluída com sucesso!");
      setMissas(missas.filter((missa) => missa.id !== id));
    } catch (error) {
      console.error("Erro ao excluir missa:", error);
      toast.error("Erro ao excluir missa");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/missas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentStatus }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      toast.success(
        `Missa ${!currentStatus ? "ativada" : "desativada"} com sucesso!`
      );
      setMissas(
        missas.map((missa) =>
          missa.id === id ? { ...missa, active: !currentStatus } : missa
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const getDayLabel = (day: string) => {
    return DAYS_OF_WEEK.find((d) => d.value === day)?.label || day;
  };

  const getTypeLabel = (type: string) => {
    return MASS_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getDayOrder = (day: string) => {
    const order: { [key: string]: number } = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };
    return order[day] || 7;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredMissas = missas
    .filter((missa) => {
      const matchesSearch =
        missa.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDayLabel(missa.dayOfWeek)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (missa.location &&
          missa.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDay = filterDay === "all" || missa.dayOfWeek === filterDay;
      const matchesType = filterType === "all" || missa.type === filterType;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && missa.active) ||
        (filterStatus === "inactive" && !missa.active);

      return matchesSearch && matchesDay && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const dayDiff = getDayOrder(a.dayOfWeek) - getDayOrder(b.dayOfWeek);
      if (dayDiff !== 0) return dayDiff;
      return a.time.localeCompare(b.time);
    });

  const activeMissas = missas.filter((m) => m.active).length;
  const inactiveMissas = missas.filter((m) => !m.active).length;
  const dominicalMissas = missas.filter((m) => m.type === "DOMINICAL").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Horários de Missas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os horários de celebrações
          </p>
        </div>
        <Link
          href="/admin/missas/nova"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Missa</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total de Missas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {missas.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Ativas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeMissas}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Inativas</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {inactiveMissas}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Dominicais</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {dominicalMissas}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar missas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos os Dias</option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos os Tipos</option>
            {MASS_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

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

      {/* Missas List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {filteredMissas.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nenhuma missa encontrada</p>
            <Link
              href="/admin/missas/nova"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Criar primeiro horário de missa
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dia da Semana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMissas.map((missa) => (
                  <tr key={missa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {getDayLabel(missa.dayOfWeek)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {missa.time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          missa.type === "DOMINICAL"
                            ? "bg-blue-100 text-blue-800"
                            : missa.type === "ESPECIAL"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getTypeLabel(missa.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {missa.location ? (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {missa.location}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(missa.id, missa.active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          missa.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } transition cursor-pointer`}
                      >
                        {missa.active ? "Ativa" : "Inativa"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/admin/missas/${missa.id}/editar`}
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(missa.id)}
                          className="text-red-600 hover:text-red-900 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Observações */}
      {filteredMissas.some((m) => m.observations) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Observações:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            {filteredMissas
              .filter((m) => m.observations)
              .map((missa) => (
                <li key={missa.id}>
                  <strong>
                    {getDayLabel(missa.dayOfWeek)} - {missa.time}:
                  </strong>{" "}
                  {missa.observations}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
