"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Save, Upload, X, Link as LinkIcon, Plus, Trash2 } from "lucide-react"
import { compressImage } from "@/lib/utils"

const TIPOS = [
  { value: "MOVIMENTO", label: "Movimento" },
  { value: "PASTORAL", label: "Pastoral" },
  { value: "MINISTERIO", label: "Ministério" },
  { value: "CURSO", label: "Curso" },
  { value: "CATEQUESE", label: "Catequese" },
  { value: "PROJETO_SOCIAL", label: "Projeto Social" },
  { value: "OUTRO", label: "Outro" },
]

export default function NovaAtividadePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload")
  const [imagePreview, setImagePreview] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const [form, setForm] = useState({
    nome: "",
    tipo: "MOVIMENTO",
    descricao: "",
    descricaoCompleta: "",
    cor: "",
    textoBotao: "",
    linkExterno: "",
    local: "",
    responsavel: "",
    contato: "",
    aceitaInscricoes: false,
    showInNavbar: false,
    navbarOrder: 0,
    active: true,
    order: 0,
    imagem: "",
  })

  const [horarios, setHorarios] = useState<string[]>([])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida"); return }
    if (file.size > 20 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 20MB"); return }
    try {
      const compressed = await compressImage(file)
      setImagePreview(compressed)
      setForm((prev) => ({ ...prev, imagem: compressed }))
    } catch {
      toast.error("Erro ao processar imagem")
    }
  }

  const handleRemoveImage = () => {
    setImagePreview("")
    setImageUrl("")
    setForm((prev) => ({ ...prev, imagem: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    setImagePreview(url)
    setForm((prev) => ({ ...prev, imagem: url }))
  }

  const addHorario = () => setHorarios((prev) => [...prev, ""])
  const updateHorario = (i: number, val: string) =>
    setHorarios((prev) => prev.map((h, idx) => (idx === i ? val : h)))
  const removeHorario = (i: number) =>
    setHorarios((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.descricao) {
      toast.error("Preencha os campos obrigatórios")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/atividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          horarios: horarios.filter(Boolean),
          cor: form.cor || null,
          order: Number(form.order),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao criar atividade")
      }
      toast.success("Atividade criada com sucesso!")
      router.push("/admin/atividades")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar atividade")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    "w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-parish-text bg-white"
  const labelClass = "block text-sm font-medium text-parish-text-light mb-2"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/atividades" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Nova Atividade</h1>
            <p className="text-parish-text-light mt-1">Cadastre uma nova atividade paroquial</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-5 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2 font-semibold"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <div>
              <label className={labelClass}>Nome *</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange}
                placeholder="Ex: Grupo de Jovens" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className={inputClass}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Descrição curta *</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange}
                placeholder="Breve descrição exibida nos cards..." rows={3} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Descrição completa</label>
              <textarea name="descricaoCompleta" value={form.descricaoCompleta} onChange={handleChange}
                placeholder="Descrição detalhada exibida na página da atividade..." rows={6} className={inputClass} />
            </div>
          </div>

          {/* Info */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Informações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Local</label>
                <input type="text" name="local" value={form.local} onChange={handleChange}
                  placeholder="Ex: Salão paroquial" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Responsável</label>
                <input type="text" name="responsavel" value={form.responsavel} onChange={handleChange}
                  placeholder="Nome do responsável" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Contato</label>
              <input type="text" name="contato" value={form.contato} onChange={handleChange}
                placeholder="Telefone ou e-mail de contato" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Texto do botão</label>
              <input type="text" name="textoBotao" value={form.textoBotao} onChange={handleChange}
                placeholder="Saiba mais" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Link externo (opcional)</label>
              <input type="url" name="linkExterno" value={form.linkExterno} onChange={handleChange}
                placeholder="https://" className={inputClass} />
              <p className="text-xs text-parish-secondary mt-1">
                Se preenchido, o card redirecionará para este link em vez da página interna.
              </p>
            </div>
          </div>

          {/* Horários */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Horários</h3>
              <button
                type="button"
                onClick={addHorario}
                className="flex items-center gap-1.5 text-sm text-parish-gold hover:text-parish-gold-dark transition"
              >
                <Plus className="w-4 h-4" /> Adicionar horário
              </button>
            </div>
            {horarios.length === 0 && (
              <p className="text-sm text-parish-secondary text-center py-4">
                Nenhum horário adicionado. Clique em &quot;Adicionar horário&quot;.
              </p>
            )}
            <div className="space-y-2">
              {horarios.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHorario(i, e.target.value)}
                    placeholder="Ex: Sábados às 19h"
                    className="flex-1 px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeHorario(i)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Imagem */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className={labelClass}>Imagem</label>
            <div className="flex rounded-lg border border-parish-border overflow-hidden mb-4 text-sm">
              <button type="button" onClick={() => { setImageMode("upload"); handleRemoveImage() }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${imageMode === "upload" ? "bg-parish-gold text-white" : "bg-parish-background text-parish-text-light hover:bg-parish-primary"}`}>
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
              <button type="button" onClick={() => { setImageMode("url"); handleRemoveImage() }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${imageMode === "url" ? "bg-parish-gold text-white" : "bg-parish-background text-parish-text-light hover:bg-parish-primary"}`}>
                <LinkIcon className="w-3.5 h-3.5" /> URL
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            {imageMode === "url" ? (
              <div className="space-y-3">
                <input type="url" value={imageUrl} onChange={handleUrlChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover max-h-48"
                      onError={() => { setImagePreview(""); toast.error("URL inválida") }} />
                    <button type="button" onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : !imagePreview ? (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-parish-border rounded-lg p-6 text-center hover:border-parish-gold transition cursor-pointer">
                <Upload className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                <p className="text-sm text-parish-text-light">Clique para fazer upload</p>
                <p className="text-xs text-parish-secondary mt-1">PNG, JPG até 20MB</p>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                <button type="button" onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Configurações */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Configurações</h3>

            <div>
              <label className={labelClass}>Cor do card (hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.cor || "#1e3a5f"} onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))}
                  className="w-10 h-10 rounded border border-parish-border cursor-pointer" />
                <input type="text" value={form.cor} onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))}
                  placeholder="Deixe vazio para gradiente automático"
                  className="flex-1 px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                {form.cor && (
                  <button type="button" onClick={() => setForm((p) => ({ ...p, cor: "" }))}
                    className="text-gray-400 hover:text-red-500 transition"><X className="w-4 h-4" /></button>
                )}
              </div>
              <p className="text-xs text-parish-secondary mt-1">Quando vazio, usa gradiente por tipo</p>
            </div>

            <div>
              <label className={labelClass}>Ordem de exibição</label>
              <input type="number" name="order" value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                min={0} className={inputClass} />
              <p className="text-xs text-parish-secondary mt-1">Menor número = exibido primeiro</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="aceitaInscricoes" checked={form.aceitaInscricoes} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text">Aceitar inscrições</p>
                <p className="text-xs text-parish-secondary">Habilita formulário de inscrição na página da atividade</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text">Ativo</p>
                <p className="text-xs text-parish-secondary">Exibir na área pública do site</p>
              </div>
            </label>
          </div>

          {/* Navbar */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Menu de Navegação</h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="showInNavbar" checked={form.showInNavbar} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
              <div>
                <p className="text-sm font-medium text-parish-text">Exibir na navbar</p>
                <p className="text-xs text-parish-secondary">Adiciona esta atividade ao menu de navegação do site</p>
              </div>
            </label>

            {form.showInNavbar && (
              <div>
                <label className={labelClass}>Ordem na navbar</label>
                <input
                  type="number"
                  value={form.navbarOrder}
                  onChange={(e) => setForm((p) => ({ ...p, navbarOrder: Number(e.target.value) }))}
                  min={0}
                  className={inputClass}
                />
                <p className="text-xs text-parish-secondary mt-1">Menor número = aparece primeiro no menu</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
