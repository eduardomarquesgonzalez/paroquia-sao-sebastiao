"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Upload, X, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NovoEventoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    location: "",
    image: "",
    published: false,
  });
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Por favor, selecione uma imagem válida"); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 15MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData((prev) => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date) { toast.error("Preencha os campos obrigatórios"); return; }
    setIsSubmitting(true);
    try {
      const dateTime = `${formData.date}T${formData.time || "00:00"}`;
      const endDateTime = formData.endDate && formData.endTime ? `${formData.endDate}T${formData.endTime}` : null;
      const response = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, description: formData.description, date: dateTime, endDate: endDateTime, location: formData.location, image: formData.image, published: shouldPublish }),
      });
      if (!response.ok) throw new Error("Erro ao criar evento");
      toast.success(shouldPublish ? "Evento publicado com sucesso!" : "Rascunho salvo!");
      router.push("/admin/eventos");
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      toast.error("Erro ao salvar o evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/eventos" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Novo Evento</h1>
            <p className="text-parish-text-light mt-1">Crie um novo evento da paróquia</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={(e) => handleSubmit(e, false)} disabled={isSubmitting} className="px-4 py-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition disabled:opacity-50 flex items-center space-x-2">
            <Save className="w-4 h-4" /><span>Salvar Rascunho</span>
          </button>
          <button onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting} className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center space-x-2">
            <Eye className="w-4 h-4" /><span>{isSubmitting ? "Publicando..." : "Publicar"}</span>
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Título do Evento *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Missa de São Sebastião" className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-lg" required />
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Descrição *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descreva os detalhes do evento..." rows={8} className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none" required />
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <h3 className="text-sm font-medium text-parish-text-light mb-4">Data e Horário</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-parish-secondary mb-2">Data de Início *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" required />
              </div>
              <div>
                <label className="block text-sm text-parish-secondary mb-2">Horário de Início</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-parish-secondary mb-2">Data de Término (opcional)</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm text-parish-secondary mb-2">Horário de Término</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Local</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Igreja Matriz - Três Barras" className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Imagem do Evento</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {!imagePreview ? (
              <div onClick={handleImageClick} className="border-2 border-dashed border-parish-border rounded-lg p-6 text-center hover:border-parish-gold transition cursor-pointer">
                <Upload className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                <p className="text-sm text-parish-text-light">Clique para fazer upload</p>
                <p className="text-xs text-parish-secondary mt-1">PNG, JPG até 15MB</p>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text-light">Publicar imediatamente</p>
                <p className="text-xs text-parish-secondary">Tornar o evento visível no site</p>
              </div>
            </label>
          </div>

          <div className="bg-parish-sky-light rounded-lg p-4 border border-parish-sky-light">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-parish-sky-dark mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-parish-text-dark mb-1">Dica</h4>
                <p className="text-xs text-parish-sky-dark">
                  Eventos publicados aparecerão automaticamente no calendário da paróquia e na página inicial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
