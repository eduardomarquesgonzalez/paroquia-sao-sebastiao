"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Upload, X, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NovoProjetoSocialPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objective: "",
    location: "",
    audience: "",
    responsible: "",
    phone: "",
    whatsapp: "",
    email: "",
    mapUrl: "",
    published: false,
    active: true,
    order: 0,
  });

  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<string[]>([""]);

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

  const handleImageFile = (file: File, callback: (b64: string) => void) => {
    if (!file.type.startsWith("image/")) { toast.error("Arquivo inválido"); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("Máximo 15MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageFile(file, (b64) => { setImage(b64); setImagePreview(b64); });
  };

  const handleGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (gallery.length + files.length > 10) { toast.error("Máximo 10 fotos na galeria"); return; }
    files.forEach((file) => {
      handleImageFile(file, (b64) => setGallery((prev) => [...prev, b64]));
    });
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryImage = (index: number) =>
    setGallery((prev) => prev.filter((_, i) => i !== index));

  const addSchedule = () => setSchedules((prev) => [...prev, ""]);
  const updateSchedule = (i: number, val: string) =>
    setSchedules((prev) => prev.map((s, idx) => (idx === i ? val : s)));
  const removeSchedule = (i: number) =>
    setSchedules((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (shouldPublish: boolean) => {
    if (!formData.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!formData.description.trim()) { toast.error("Descrição é obrigatória"); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projetos-sociais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          published: shouldPublish,
          image: image || null,
          gallery,
          schedules: schedules.filter((s) => s.trim()),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar projeto");
      }
      toast.success(shouldPublish ? "Projeto publicado!" : "Rascunho salvo!");
      router.push("/admin/projetos-sociais");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/projetos-sociais" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Novo Projeto Social</h1>
            <p className="text-parish-text-light mt-1">Cadastre um novo projeto social</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-4 py-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar Rascunho
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> {isSubmitting ? "Salvando..." : "Publicar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-4">
            <h2 className="font-semibold text-parish-text">Informações Básicas</h2>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Nome do Projeto *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Projeto Esperança" className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Descrição *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Descreva o projeto, sua história e como funciona..." className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Objetivo Social</label>
              <textarea name="objective" value={formData.objective} onChange={handleChange} rows={4} placeholder="Qual o impacto social que este projeto busca gerar?" className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none" />
            </div>
          </div>

          {/* Details */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-4">
            <h2 className="font-semibold text-parish-text">Detalhes Operacionais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">Local</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Salão Paroquial" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">Público Atendido</label>
                <input type="text" name="audience" value={formData.audience} onChange={handleChange} placeholder="Ex: Crianças de 6 a 12 anos" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">Responsável</label>
                <input type="text" name="responsible" value={formData.responsible} onChange={handleChange} placeholder="Nome do responsável" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">Ordem de Exibição</label>
                <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          {/* Schedules */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-parish-text">Dias e Horários</h2>
              <button type="button" onClick={addSchedule} className="text-parish-gold hover:text-parish-gold-dark text-sm flex items-center gap-1 font-medium transition">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {schedules.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => updateSchedule(i, e.target.value)}
                    placeholder={`Ex: Segunda a Sexta, 14h às 17h`}
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

          {/* Contact */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-4">
            <h2 className="font-semibold text-parish-text">Contato</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">Telefone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(65) 99999-9999" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">WhatsApp</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="65 99999-9999" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-parish-text-light mb-2">E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="projeto@paroquia.com" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Link do Google Maps (embed)</label>
              <input type="url" name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="https://maps.google.com/maps/embed?..." className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-parish-text">Galeria de Fotos</h2>
              <span className="text-xs text-parish-text-light">{gallery.length}/10</span>
            </div>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryImages} className="hidden" />
            {gallery.length < 10 && (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="border-2 border-dashed border-parish-border rounded-lg p-6 text-center hover:border-parish-gold transition cursor-pointer mb-4"
              >
                <ImageIcon className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                <p className="text-sm text-parish-text-light">Adicionar fotos à galeria</p>
                <p className="text-xs text-parish-secondary mt-1">Múltiplas imagens, até 15MB cada</p>
              </div>
            )}
            {gallery.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <div key={i} className="relative group h-24 rounded-lg overflow-hidden">
                    <img src={img} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Main image */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <h2 className="font-semibold text-parish-text mb-3">Foto Principal</h2>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover max-h-52" />
                <button
                  type="button"
                  onClick={() => { setImage(""); setImagePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-parish-gold hover:text-parish-gold-dark font-medium">
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
            <h2 className="font-semibold text-parish-text">Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text-light">Publicado</p>
                <p className="text-xs text-parish-secondary">Visível no site</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text-light">Ativo</p>
                <p className="text-xs text-parish-secondary">Projeto em andamento</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
