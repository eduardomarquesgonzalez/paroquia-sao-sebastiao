"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditarMovimentoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coordinator: "",
    contact: "",
    highlight: false,
    active: true,
    order: 0,
  });

  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [schedules, setSchedules] = useState<string[]>([""]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/movimentos?id=${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFormData({
          name: data.name || "",
          description: data.description || "",
          coordinator: data.coordinator || "",
          contact: data.contact || "",
          highlight: data.highlight || false,
          active: data.active ?? true,
          order: data.order || 0,
        });
        setImage(data.image || "");
        setImagePreview(data.image || "");
        setSchedules(data.schedules?.length ? data.schedules : [""]);
      } catch {
        toast.error("Erro ao carregar movimento");
        router.push("/admin/movimentos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Arquivo inválido"); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("Máximo 15MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setImage(b64);
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const addSchedule = () => setSchedules((prev) => [...prev, ""]);
  const updateSchedule = (i: number, val: string) =>
    setSchedules((prev) => prev.map((s, idx) => idx === i ? val : s));
  const removeSchedule = (i: number) =>
    setSchedules((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!formData.description.trim()) { toast.error("Descrição é obrigatória"); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/movimentos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...formData,
          image: image || null,
          schedules: schedules.filter((s) => s.trim()),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }
      toast.success("Movimento atualizado!");
      router.push("/admin/movimentos");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/movimentos" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Editar Movimento / Pastoral</h1>
            <p className="text-parish-text-light mt-1">{formData.name}</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" /> {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-4">
            <h2 className="font-semibold text-parish-text">Informações Básicas</h2>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Nome *</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Descrição *</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange} rows={6}
                className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">Coordenador / Responsável</label>
                <input
                  type="text" name="coordinator" value={formData.coordinator} onChange={handleChange}
                  className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">Contato</label>
                <input
                  type="text" name="contact" value={formData.contact} onChange={handleChange}
                  className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Schedules */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-parish-text">Dias e Horários de Reunião</h2>
              <button type="button" onClick={addSchedule} className="text-parish-gold hover:text-parish-gold-dark text-sm flex items-center gap-1 font-medium transition">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {schedules.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text" value={s} onChange={(e) => updateSchedule(i, e.target.value)}
                    placeholder="Ex: Terças-feiras às 19h30, no salão paroquial"
                    className="flex-1 px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-sm"
                  />
                  {schedules.length > 1 && (
                    <button type="button" onClick={() => removeSchedule(i)} className="text-red-400 hover:text-red-600 transition p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <h2 className="font-semibold text-parish-text mb-3">Imagem</h2>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} className="hidden" />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover max-h-48" />
                <button
                  type="button"
                  onClick={() => { setImage(""); setImagePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-parish-gold hover:text-parish-gold-dark font-medium block">
                  Trocar imagem
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-parish-border rounded-lg p-8 text-center hover:border-parish-gold transition cursor-pointer">
                <Upload className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                <p className="text-sm text-parish-text-light">Clique para fazer upload</p>
                <p className="text-xs text-parish-secondary mt-1">PNG, JPG até 15MB</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-3">
            <h2 className="font-semibold text-parish-text">Configurações</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="highlight" checked={formData.highlight} onChange={handleChange} className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text-light">Destaque</p>
                <p className="text-xs text-parish-secondary">Exibido em posição de destaque</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text-light">Ativo</p>
                <p className="text-xs text-parish-secondary">Visível na página pública</p>
              </div>
            </label>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Ordem de exibição</label>
              <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
