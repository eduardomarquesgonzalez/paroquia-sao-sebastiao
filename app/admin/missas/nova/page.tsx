"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Clock,
  Calendar,
  Church,
  FileText,
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

interface Community {
  active: any;
  id: string;
  name: string;
  neighborhood: string | null;
}

export default function NovaMissaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [formData, setFormData] = useState({
    dayOfWeek: "SUNDAY",
    time: "19:00",
    type: "DOMINICAL",
    communityId: "",
    observations: "",
    active: true,
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  async function fetchCommunities() {
    try {
      const response = await fetch("/api/comunidades");
      if (response.ok) {
        const data = await response.json();
        const activeCommunities = data.filter((c: Community) => c.active);
        setCommunities(activeCommunities);

        // Selecionar a primeira comunidade por padrão
        if (activeCommunities.length > 0) {
          setFormData((prev) => ({
            ...prev,
            communityId: activeCommunities[0].id,
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar comunidades:", error);
      toast.error("Erro ao carregar comunidades");
    } finally {
      setLoadingCommunities(false);
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

    if (!formData.communityId) {
      toast.error("Selecione uma comunidade");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/missas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          observations: formData.observations.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar missa");
      }

      toast.success("Missa criada com sucesso!");
      router.push("/admin/missas");
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar missa:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar missa"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingCommunities) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/missas"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nova Missa</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Church className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma comunidade cadastrada
          </h3>
          <p className="text-gray-600 mb-4">
            Você precisa cadastrar pelo menos uma comunidade antes de criar
            missas.
          </p>
          <Link
            href="/admin/comunidades/nova"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Church className="w-4 h-4 mr-2" />
            Cadastrar Comunidade
          </Link>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Nova Missa</h1>
            <p className="text-gray-600 mt-1">
              Adicione um novo horário de celebração
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações da Missa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comunidade */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Church className="w-4 h-4" />
                  <span>Comunidade *</span>
                </div>
              </label>
              <select
                name="communityId"
                value={formData.communityId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Selecione uma comunidade</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                    {community.neighborhood && ` - ${community.neighborhood}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecione a igreja/comunidade onde a missa será celebrada
              </p>
            </div>

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
            <div className="md:col-span-2">
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
          </div>
        </div>

        {/* Observações */}
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

        {/* Status */}
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
                <span>Criar Missa</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
