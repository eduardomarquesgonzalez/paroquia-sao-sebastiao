"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Upload, X, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { toDatetimeLocalCuiaba, fromDatetimeLocalCuiaba } from "@/lib/utils";

const ROLES = ["Pároco", "Vigário", "Seminarista"] as const;

export default function NovoCleroPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "Seminarista",
    photo: "",
    birthDate: "",
    birthCity: "",
    ordinationDate: "",
    ordainer: "",
    currentRole: "",
    biography: "",
    instagram: "",
    facebook: "",
    youtube: "",
    whatsapp: "",
    tiktok: "",
    order: 0,
    active: true,
  });

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida"); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 15MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPhotoPreview(b64);
      set("photo", b64);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { setPhotoPreview(""); set("photo", ""); if (fileRef.current) fileRef.current.value = ""; };

  async function submit(publish: boolean) {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!form.role) { toast.error("Cargo é obrigatório"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        active: publish,
        birthDate: form.birthDate ? fromDatetimeLocalCuiaba(form.birthDate + "T00:00") : null,
        ordinationDate: form.ordinationDate ? fromDatetimeLocalCuiaba(form.ordinationDate + "T00:00") : null,
      };
      const r = await fetch("/api/clero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      toast.success(publish ? "Membro publicado com sucesso!" : "Rascunho salvo!");
      router.push("/admin/clero");
    } catch {
      toast.error("Erro ao salvar membro");
    } finally {
      setSaving(false);
    }
  }

  const isPadre = form.role === "Pároco" || form.role === "Vigário";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clero" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-parish-text">Novo Membro do Clero</h1>
            <p className="text-parish-text-light text-sm mt-0.5">Cadastre um padre, vigário ou seminarista</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => submit(false)} disabled={saving}
            className="px-4 py-2 border border-parish-border rounded-lg text-sm text-parish-text-light hover:bg-parish-background transition disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar rascunho
          </button>
          <button onClick={() => submit(true)} disabled={saving}
            className="px-4 py-2 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2">
            <Eye className="w-4 h-4" /> {saving ? "Salvando..." : "Publicar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dados básicos */}
          <div className="bg-parish-surface rounded-lg border border-parish-primary p-6 space-y-4">
            <h2 className="text-sm font-semibold text-parish-text">Dados Básicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-parish-text-light mb-1.5">Nome completo *</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Ex: Pe. João da Silva" className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
              </div>
              <div>
                <label className="block text-xs text-parish-text-light mb-1.5">Cargo / Função *</label>
                <select value={form.role} onChange={(e) => set("role", e.target.value)}
                  className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-parish-text-light mb-1.5">Função atual</label>
                <input type="text" value={form.currentRole} onChange={(e) => set("currentRole", e.target.value)}
                  placeholder="Ex: Pároco da Paróquia São Sebastião" className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
              </div>
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="bg-parish-surface rounded-lg border border-parish-primary p-6 space-y-4">
            <h2 className="text-sm font-semibold text-parish-text">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-parish-text-light mb-1.5">Data de nascimento</label>
                <input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)}
                  className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
              </div>
              <div>
                <label className="block text-xs text-parish-text-light mb-1.5">Cidade natal</label>
                <input type="text" value={form.birthCity} onChange={(e) => set("birthCity", e.target.value)}
                  placeholder="Ex: Cuiabá - MT" className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
              </div>
            </div>
          </div>

          {/* Informações religiosas (só para padres) */}
          {isPadre && (
            <div className="bg-parish-surface rounded-lg border border-parish-primary p-6 space-y-4">
              <h2 className="text-sm font-semibold text-parish-text">Vida Religiosa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-parish-text-light mb-1.5">Data de ordenação</label>
                  <input type="date" value={form.ordinationDate} onChange={(e) => set("ordinationDate", e.target.value)}
                    className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
                </div>
                <div>
                  <label className="block text-xs text-parish-text-light mb-1.5">Nome do Ordenante</label>
                  <input type="text" value={form.ordainer} onChange={(e) => set("ordainer", e.target.value)}
                    placeholder="Ex: Dom. Carlos" className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
                </div>
              </div>
            </div>
          )}

          {/* Biografia */}
          <div className="bg-parish-surface rounded-lg border border-parish-primary p-6">
            <label className="block text-sm font-semibold text-parish-text mb-3">
              {form.role === "Seminarista" ? "Vocação e Caminhada" : "Biografia"}
            </label>
            <textarea value={form.biography} onChange={(e) => set("biography", e.target.value)}
              rows={8} placeholder="Conte a história de vida e vocação..."
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold resize-none" />
          </div>

          {/* Redes sociais */}
          <div className="bg-parish-surface rounded-lg border border-parish-primary p-6 space-y-4">
            <h2 className="text-sm font-semibold text-parish-text">Redes Sociais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
                { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
                { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
                { key: "whatsapp", label: "WhatsApp", placeholder: "+55 65 9 0000-0000" },
                { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-parish-text-light mb-1.5">{label}</label>
                  <input type="text" value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Foto */}
          <div className="bg-parish-surface rounded-lg border border-parish-primary p-5">
            <h2 className="text-sm font-semibold text-parish-text mb-3">Foto</h2>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            {!photoPreview ? (
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-parish-border rounded-lg p-8 text-center hover:border-parish-gold transition cursor-pointer">
                <UserCircle2 className="w-10 h-10 text-parish-secondary mx-auto mb-2" />
                <p className="text-xs text-parish-text-light">Clique para fazer upload</p>
                <p className="text-xs text-parish-secondary mt-1">PNG, JPG até 15MB</p>
              </div>
            ) : (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full rounded-lg object-cover max-h-52" />
                <button type="button" onClick={removePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-parish-border rounded-lg text-xs text-parish-text-light hover:bg-parish-background transition">
              <Upload className="w-3.5 h-3.5" /> {photoPreview ? "Trocar foto" : "Fazer upload"}
            </button>
          </div>

          {/* Configurações */}
          <div className="bg-parish-surface rounded-lg border border-parish-primary p-5 space-y-4">
            <h2 className="text-sm font-semibold text-parish-text">Configurações</h2>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Ordem de exibição</label>
              <input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} min={0}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
              <p className="text-xs text-parish-secondary mt-1">Menor número = exibido primeiro</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)}
                className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-xs font-medium text-parish-text">Ativo / visível no site</p>
                <p className="text-xs text-parish-secondary">Exibir na seção do clero</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
