"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Church, MapPin, Phone, Mail, Image as ImageIcon, FileText, Globe, Trash2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EditarComunidadePageProps {
  params: { id: string };
}

export default function EditarComunidadePage({ params }: EditarComunidadePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    neighborhood: "",
    city: "Cuiabá",
    state: "MT",
    zipCode: "",
    phone: "",
    email: "",
    image: "",
    mapUrl: "",
    active: true,
    order: 0,
  });

  useEffect(() => { fetchComunidade(); }, []);

  async function fetchComunidade() {
    try {
      const response = await fetch(`/api/comunidades?id=${params.id}`);
      if (!response.ok) throw new Error("Erro ao carregar comunidade");
      const data = await response.json();
      setFormData({
        name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "Cuiabá",
        state: data.state || "MT",
        zipCode: data.zipCode || "",
        phone: data.phone || "",
        email: data.email || "",
        image: data.image || "",
        mapUrl: data.mapUrl || "",
        active: data.active,
        order: data.order || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar comunidade:", error);
      toast.error("Erro ao carregar comunidade");
      router.push("/admin/comunidades");
    } finally {
      setLoadingData(false);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 15MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Nome da comunidade é obrigatório"); return; }
    try {
      setLoading(true);
      const response = await fetch("/api/comunidades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id, ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          address: formData.address.trim() || null,
          neighborhood: formData.neighborhood.trim() || null,
          zipCode: formData.zipCode.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          image: formData.image.trim() || null,
          mapUrl: formData.mapUrl.trim() || null,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar comunidade");
      }
      toast.success("Comunidade atualizada com sucesso!");
      router.push("/admin/comunidades");
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar comunidade:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar comunidade");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta comunidade?")) return;
    try {
      const response = await fetch(`/api/comunidades?id=${params.id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir");
      }
      toast.success("Comunidade excluída com sucesso!");
      router.push("/admin/comunidades");
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir comunidade:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao excluir comunidade");
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/comunidades" className="p-2 hover:bg-parish-primary rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Editar Comunidade</h1>
            <p className="text-parish-text-light mt-1">Atualize as informações da comunidade</p>
          </div>
        </div>
        <button onClick={handleDelete} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center space-x-2">
          <Trash2 className="w-4 h-4" /><span>Excluir</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4 flex items-center">
            <Church className="w-5 h-5 mr-2" />Informações Básicas
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Nome da Comunidade *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                <div className="flex items-center space-x-2"><FileText className="w-4 h-4" /><span>Descrição</span></div>
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Ordem de Exibição</label>
              <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />Localização
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-parish-text-light mb-2">Endereço Completo</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Bairro</label>
              <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">CEP</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Cidade</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">Estado</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} maxLength={2} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none uppercase" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                <div className="flex items-center space-x-2"><Globe className="w-4 h-4" /><span>Link do Google Maps</span></div>
              </label>
              <input type="url" name="mapUrl" value={formData.mapUrl} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4">Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                <div className="flex items-center space-x-2"><Phone className="w-4 h-4" /><span>Telefone</span></div>
              </label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                <div className="flex items-center space-x-2"><Mail className="w-4 h-4" /><span>Email</span></div>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />Imagem
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

          {formData.image ? (
            <div className="relative w-full max-w-md">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-56 object-cover rounded-lg border border-parish-border"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: "" }));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                title="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-sm text-parish-gold hover:text-parish-gold-dark font-medium transition"
              >
                Trocar imagem
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-parish-border rounded-lg p-10 text-center cursor-pointer hover:border-parish-gold transition group"
            >
              <ImageIcon className="w-10 h-10 text-parish-secondary mx-auto mb-3 group-hover:text-parish-gold transition" />
              <p className="text-sm text-parish-text-light font-medium">
                Clique para selecionar uma imagem
              </p>
              <p className="text-xs text-parish-secondary mt-1">PNG, JPG ou WebP — até 15MB</p>
            </div>
          )}
        </div>

        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-6">
          <h2 className="text-lg font-semibold text-parish-text mb-4">Status</h2>
          <div className="flex items-center space-x-3">
            <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
            <label htmlFor="active" className="text-sm text-parish-text-light">Ativar esta comunidade</label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link href="/admin/comunidades" className="px-6 py-2 border border-parish-border text-parish-text-light rounded-lg hover:bg-parish-background transition">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Salvando...</span></>
            ) : (
              <><Save className="w-4 h-4" /><span>Salvar Alterações</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
