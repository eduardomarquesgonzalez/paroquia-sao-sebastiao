"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft, Save, Upload, X, Link as LinkIcon, Plus, Trash2,
  ClipboardList, ChevronRight, ToggleLeft, ToggleRight, Users,
  Calendar, ExternalLink,
} from "lucide-react"
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

interface FormularioResumo {
  id: string
  slug: string
  titulo: string
  ativo: boolean
  vagas: number | null
  dataInicio: string | null
  dataFim: string | null
  _count: { inscricoes: number }
}

export default function EditarAtividadePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload")
  const [imagePreview, setImagePreview] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [formularios, setFormularios] = useState<FormularioResumo[]>([])

  const [form, setForm] = useState({
    nome: "", tipo: "MOVIMENTO", descricao: "", descricaoCompleta: "",
    cor: "", textoBotao: "", linkExterno: "", local: "", responsavel: "",
    contato: "", aceitaInscricoes: false, showInNavbar: false, navbarOrder: 0,
    active: true, order: 0, imagem: "",
  })
  const [horarios, setHorarios] = useState<string[]>([])

  const loadAtividade = useCallback(async () => {
    try {
      const [atRes, formRes] = await Promise.all([
        fetch(`/api/atividades/${id}`),
        fetch(`/api/atividades/${id}/formularios`),
      ])
      if (!atRes.ok) throw new Error()
      const data = await atRes.json()

      setForm({
        nome: data.nome ?? "",
        tipo: data.tipo ?? "MOVIMENTO",
        descricao: data.descricao ?? "",
        descricaoCompleta: data.descricaoCompleta ?? "",
        cor: data.cor ?? "",
        textoBotao: data.textoBotao ?? "",
        linkExterno: data.linkExterno ?? "",
        local: data.local ?? "",
        responsavel: data.responsavel ?? "",
        contato: data.contato ?? "",
        aceitaInscricoes: data.aceitaInscricoes ?? false,
        showInNavbar: data.showInNavbar ?? false,
        navbarOrder: data.navbarOrder ?? 0,
        active: data.active ?? true,
        order: data.order ?? 0,
        imagem: data.imagem ?? "",
      })
      setHorarios(data.horarios ?? [])
      if (data.imagem) {
        setImagePreview(data.imagem)
        if (data.imagem.startsWith("http")) {
          setImageMode("url")
          setImageUrl(data.imagem)
        } else {
          setImageMode("upload")
        }
      }

      if (formRes.ok) {
        const fData = await formRes.json()
        setFormularios(fData)
      }
    } catch {
      toast.error("Erro ao carregar atividade")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadAtividade() }, [loadAtividade])

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
    try {
      const compressed = await compressImage(file)
      setImagePreview(compressed)
      setForm((prev) => ({ ...prev, imagem: compressed }))
    } catch { toast.error("Erro ao processar imagem") }
  }

  const handleRemoveImage = () => {
    setImagePreview(""); setImageUrl("")
    setForm((prev) => ({ ...prev, imagem: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url); setImagePreview(url)
    setForm((prev) => ({ ...prev, imagem: url }))
  }

  const addHorario = () => setHorarios((prev) => [...prev, ""])
  const updateHorario = (i: number, val: string) =>
    setHorarios((prev) => prev.map((h, idx) => (idx === i ? val : h)))
  const removeHorario = (i: number) =>
    setHorarios((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.descricao) { toast.error("Preencha os campos obrigatórios"); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/atividades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, horarios: horarios.filter(Boolean), order: Number(form.order) }),
      })
      if (!res.ok) throw new Error()
      toast.success("Atividade salva!")
      router.push("/admin/atividades")
    } catch { toast.error("Erro ao salvar") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!confirm("Excluir esta atividade? Esta ação não pode ser desfeita.")) return
    try {
      await fetch(`/api/atividades/${id}`, { method: "DELETE" })
      toast.success("Atividade excluída")
      router.push("/admin/atividades")
    } catch { toast.error("Erro ao excluir") }
  }

  const handleToggleFormulario = async (formularioId: string, ativo: boolean) => {
    try {
      await fetch(`/api/atividades/${id}/formularios/${formularioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      })
      setFormularios((prev) =>
        prev.map((f) => (f.id === formularioId ? { ...f, ativo: !ativo } : f))
      )
    } catch { toast.error("Erro ao atualizar formulário") }
  }

  const handleDeleteFormulario = async (formularioId: string) => {
    if (!confirm("Excluir este formulário? Todas as inscrições vinculadas serão perdidas.")) return
    try {
      await fetch(`/api/atividades/${id}/formularios/${formularioId}`, { method: "DELETE" })
      setFormularios((prev) => prev.filter((f) => f.id !== formularioId))
      toast.success("Formulário excluído")
    } catch { toast.error("Erro ao excluir formulário") }
  }

  const inputClass = "w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-parish-text bg-white"
  const labelClass = "block text-sm font-medium text-parish-text-light mb-2"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/atividades" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Editar Atividade</h1>
            <p className="text-parish-text-light mt-1 text-sm">{form.nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/atividades/${id}`}
            target="_blank"
            className="px-4 py-2 border border-parish-border text-parish-text-light rounded-lg hover:bg-parish-background transition text-sm flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver no site
          </Link>
          <button onClick={handleDelete}
            className="px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition text-sm">
            Excluir
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="px-5 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2 font-semibold">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <div>
              <label className={labelClass}>Nome *</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className={inputClass}>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Descrição curta *</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Descrição completa</label>
              <textarea name="descricaoCompleta" value={form.descricaoCompleta} onChange={handleChange} rows={6} className={inputClass} />
            </div>
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Informações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Local</label>
                <input type="text" name="local" value={form.local} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Responsável</label>
                <input type="text" name="responsavel" value={form.responsavel} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Contato</label>
              <input type="text" name="contato" value={form.contato} onChange={handleChange} className={inputClass} />
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
            </div>
          </div>

          {/* Horários */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Horários</h3>
              <button type="button" onClick={addHorario}
                className="flex items-center gap-1.5 text-sm text-parish-gold hover:text-parish-gold-dark transition">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            {horarios.length === 0 && (
              <p className="text-sm text-parish-secondary text-center py-4">Nenhum horário adicionado.</p>
            )}
            <div className="space-y-2">
              {horarios.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={h} onChange={(e) => updateHorario(i, e.target.value)}
                    placeholder="Ex: Sábados às 19h"
                    className="flex-1 px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                  <button type="button" onClick={() => removeHorario(i)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Formulários de Inscrição */}
          {form.aceitaInscricoes && (
            <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden">
              <div className="bg-parish-navy px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-parish-gold" />
                  <div>
                    <h3 className="text-white font-semibold">Formulários de Inscrição</h3>
                    <p className="text-white/60 text-xs">{formularios.length} formulário(s) criado(s)</p>
                  </div>
                </div>
                <Link
                  href={`/admin/atividades/${id}/formularios/novo`}
                  className="flex items-center gap-2 px-4 py-1.5 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Novo formulário
                </Link>
              </div>

              <div className="p-6">
                {formularios.length === 0 ? (
                  <div className="text-center py-8 bg-parish-background rounded-lg border border-dashed border-parish-border">
                    <ClipboardList className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                    <p className="text-sm text-parish-secondary mb-3">
                      Nenhum formulário criado ainda.
                    </p>
                    <Link
                      href={`/admin/atividades/${id}/formularios/novo`}
                      className="inline-flex items-center gap-1.5 text-sm text-parish-gold hover:text-parish-gold-dark font-medium"
                    >
                      <Plus className="w-4 h-4" /> Criar primeiro formulário
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formularios.map((f) => (
                      <div key={f.id} className="flex items-center gap-4 p-4 border border-parish-border rounded-lg bg-white hover:border-parish-gold/30 transition">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-parish-text truncate">{f.titulo}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              f.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {f.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-parish-secondary">
                            <span className="font-mono">/{f.slug}</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {f._count.inscricoes} inscrito(s)
                            </span>
                            {f.vagas && (
                              <span>de {f.vagas} vagas</span>
                            )}
                            {f.dataFim && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                até {new Date(f.dataFim).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleFormulario(f.id, f.ativo)}
                            className={`p-1.5 rounded-lg transition ${f.ativo ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
                            title={f.ativo ? "Desativar" : "Ativar"}
                          >
                            {f.ativo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <Link
                            href={`/admin/atividades/${id}/formularios/${f.id}/editar`}
                            className="p-1.5 text-parish-text-light hover:text-parish-text hover:bg-parish-background rounded-lg transition"
                            title="Editar"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteFormulario(f.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Link
                      href={`/admin/atividades/${id}/formularios`}
                      className="flex items-center justify-center gap-2 py-2.5 border border-dashed border-parish-border rounded-lg text-sm text-parish-text-light hover:text-parish-gold hover:border-parish-gold transition"
                    >
                      <ClipboardList className="w-4 h-4" /> Gerenciar todos os formulários
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Imagem */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className={labelClass}>Imagem</label>
            <div className="flex rounded-lg border border-parish-border overflow-hidden mb-4 text-sm">
              <button type="button" onClick={() => { setImageMode("upload"); handleRemoveImage() }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${imageMode === "upload" ? "bg-parish-gold text-white" : "bg-parish-background text-parish-text-light"}`}>
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
              <button type="button" onClick={() => { setImageMode("url"); handleRemoveImage() }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${imageMode === "url" ? "bg-parish-gold text-white" : "bg-parish-background text-parish-text-light"}`}>
                <LinkIcon className="w-3.5 h-3.5" /> URL
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            {imageMode === "url" ? (
              <div className="space-y-3">
                <input type="url" value={imageUrl} onChange={handleUrlChange}
                  placeholder="https://..." className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="" className="w-full rounded-lg object-cover max-h-48"
                      onError={() => { setImagePreview(""); toast.error("URL inválida") }} />
                    <button type="button" onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ) : !imagePreview ? (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-parish-border rounded-lg p-6 text-center hover:border-parish-gold transition cursor-pointer">
                <Upload className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                <p className="text-sm text-parish-text-light">Clique para fazer upload</p>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="" className="w-full rounded-lg" />
                <button type="button" onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Configurações */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Configurações</h3>
            <div>
              <label className={labelClass}>Cor do card (hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.cor || "#1e3a5f"}
                  onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))}
                  className="w-10 h-10 rounded border border-parish-border cursor-pointer" />
                <input type="text" value={form.cor}
                  onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))}
                  placeholder="Deixe vazio para gradiente"
                  className="flex-1 px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                {form.cor && (
                  <button type="button" onClick={() => setForm((p) => ({ ...p, cor: "" }))}
                    className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Ordem de exibição</label>
              <input type="number" value={form.order} min={0}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                className={inputClass} />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="aceitaInscricoes" checked={form.aceitaInscricoes} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded" />
              <div>
                <p className="text-sm font-medium text-parish-text">Aceitar inscrições</p>
                <p className="text-xs text-parish-secondary">Habilita módulo de formulários</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded" />
              <div>
                <p className="text-sm font-medium text-parish-text">Ativo</p>
                <p className="text-xs text-parish-secondary">Exibir no site</p>
              </div>
            </label>
          </div>

          {/* Navbar */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">Menu de Navegação</h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="showInNavbar" checked={form.showInNavbar} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded" />
              <div>
                <p className="text-sm font-medium text-parish-text">Exibir na navbar</p>
                <p className="text-xs text-parish-secondary">Adiciona ao menu de navegação do site</p>
              </div>
            </label>

            {form.showInNavbar && (
              <div>
                <label className={labelClass}>Ordem na navbar</label>
                <input
                  type="number"
                  value={form.navbarOrder}
                  min={0}
                  onChange={(e) => setForm((p) => ({ ...p, navbarOrder: Number(e.target.value) }))}
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
