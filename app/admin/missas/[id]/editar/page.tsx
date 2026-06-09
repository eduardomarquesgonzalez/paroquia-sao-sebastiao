"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Clock, Calendar, Church, FileText, Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { value: "SUNDAY",    label: "Domingo" },
  { value: "MONDAY",    label: "Segunda-feira" },
  { value: "TUESDAY",   label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY",  label: "Quinta-feira" },
  { value: "FRIDAY",    label: "Sexta-feira" },
  { value: "SATURDAY",  label: "Sábado" },
];

const MASS_TYPES = [
  { value: "DOMINICAL", label: "Dominical", description: "Missa de domingo" },
  { value: "SEMANAL",   label: "Semanal",   description: "Missa de dia de semana" },
  { value: "ESPECIAL",  label: "Especial",  description: "Celebração especial" },
];

interface Community {
  id: string;
  name: string;
  neighborhood: string | null;
  active: boolean;
}

interface EditarMissaPageProps {
  params: { id: string };
}

export default function EditarMissaPage({ params }: EditarMissaPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [formData, setFormData] = useState({
    communityId: "",
    dayOfWeek: "SUNDAY",
    time: "19:00",
    type: "DOMINICAL",
    observations: "",
    active: true,
  });

  useEffect(() => {
    Promise.all([fetchMissa(), fetchCommunities()]);
  }, []);

  async function fetchMissa() {
    try {
      const res = await fetch(`/api/missas?id=${params.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFormData({
        communityId: data.communityId ?? "",
        dayOfWeek: data.dayOfWeek,
        time: data.time,
        type: data.type,
        observations: data.observations ?? "",
        active: data.active,
      });
    } catch {
      toast.error("Erro ao carregar missa");
      router.push("/admin/missas");
    } finally {
      setLoadingData(false);
    }
  }

  async function fetchCommunities() {
    try {
      const res = await fetch("/api/comunidades");
      if (res.ok) {
        const data: Community[] = await res.json();
        setCommunities(data.filter((c) => c.active));
      }
    } catch {
      toast.error("Erro ao carregar comunidades");
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.communityId) { toast.error("Selecione uma comunidade"); return; }
    if (!formData.dayOfWeek || !formData.time || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/missas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          ...formData,
          observations: formData.observations.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao atualizar missa");
      }
      toast.success("Missa atualizada com sucesso!");
      router.push("/admin/missas");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar missa");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta missa?")) return;
    try {
      const res = await fetch(`/api/missas?id=${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Missa excluída com sucesso!");
      router.push("/admin/missas");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir missa");
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/missas" className="p-2 hover:bg-parish-primary rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Editar Missa</h1>
            <p className="text-parish-text-light mt-1">Atualize as informações da celebração</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" /><span>Excluir</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Comunidade + Dia + Horário + Tipo */}
        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4">Informações da Missa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comunidade */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                <div className="flex items-center space-x-2">
                  <Church className="w-4 h-4" /><span>Comunidade *</span>
                </div>
              </label>
              <select
                name="communityId"
                value={formData.communityId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
              >
                <option value="">Selecione uma comunidade</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.neighborhood ? ` — ${c.neighborhood}` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-parish-secondary mt-1">
                Igreja ou comunidade onde a missa é celebrada
              </p>
            </div>

            {/* Dia da Semana */}
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" /><span>Dia da Semana *</span>
                </div>
              </label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" /><span>Horário *</span>
                </div>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
              />
            </div>

            {/* Tipo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                Tipo de Missa *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
              >
                {MASS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} — {t.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" /><span>Observações</span>
            </div>
          </h2>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            rows={4}
            placeholder="Ex: Confissões 30 minutos antes, Com canto da Pastoral..."
            className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none"
          />
          <p className="text-xs text-parish-secondary mt-1">
            Informações adicionais que serão exibidas no site
          </p>
        </div>

        {/* Status */}
        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4">Status</h2>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold"
            />
            <span className="text-sm text-parish-text-light">
              Ativar este horário de missa
            </span>
          </label>
          <p className="text-xs text-parish-secondary mt-2">
            Apenas missas ativas são exibidas no site público
          </p>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/missas"
            className="px-6 py-2 border border-parish-border text-parish-text-light rounded-lg hover:bg-parish-background transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
