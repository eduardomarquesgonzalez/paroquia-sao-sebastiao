"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Clock,
  Calendar,
  MapPin,
  FileText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  { value: "DOMINICAL", label: "Dominical", description: "Missa de domingo" },
  { value: "SEMANAL", label: "Semanal", description: "Missa de dia de semana" },
  { value: "ESPECIAL", label: "Especial", description: "Celebração especial" },
];

interface EditarMissaPageProps {
  params: {
    id: string;
  };
}

export default function EditarMissaPage({ params }: EditarMissaPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    dayOfWeek: "SUNDAY",
    time: "19:00",
    type: "DOMINICAL",
    location: "",
    observations: "",
    active: true,
  });

  useEffect(() => {
    fetchMissa();
  }, []);

  async function fetchMissa() {
    try {
      const response = await fetch(`/api/missas?id=${params.id}`);
      if (!response.ok) throw new Error("Erro ao carregar missa");

      const data = await response.json();
      setFormData({
        dayOfWeek: data.dayOfWeek,
        time: data.time,
        type: data.type,
        location: data.location || "",
        observations: data.observations || "",
        active: data.active,
      });
    } catch (error) {
      console.error("Erro ao carregar missa:", error);
      toast.error("Erro ao carregar missa");
      router.push("/admin/missas");
    } finally {
      setLoadingData(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dayOfWeek || !formData.time || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/missas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          ...formData,
          location: formData.location.trim() || null,
          observations: formData.observations.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar missa");
      }

      toast.success("Missa atualizada com sucesso!");
      router.push("/admin/missas");
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar missa:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar missa"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta missa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/missas?id=${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Missa excluída com sucesso!");
      router.push("/admin/missas");
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir missa:", error);
      toast.error("Erro ao excluir missa");
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/missas"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Missa</h1>
            <p className="text-gray-600 mt-1">
              Atualize as informações da celebração
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Excluir</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dia da Semana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Dia da Semana *</span>
                </div>
              </label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Horário *</span>
                </div>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Missa *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {MASS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Local */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Local</span>
                </div>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Igreja Matriz, Capela..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco se for o local padrão
              </p>
            </div>
          </div>
        </div>

        {/* Observações Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Observações</span>
            </div>
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações ou Avisos
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={4}
              placeholder="Ex: Confissões 30 minutos antes, Com canto da Pastoral..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Informações adicionais que serão exibidas no site
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Ativar este horário de missa
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Apenas missas ativas serão exibidas no site público
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/missas"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
