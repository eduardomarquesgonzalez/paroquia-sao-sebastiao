"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft, Save, Upload, X, Link as LinkIcon, Plus, Trash2,
  ChevronUp, ChevronDown, Edit2, Check, ClipboardList,
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

const TIPOS_CAMPO = [
  { value: "TEXTO", label: "Texto" },
  { value: "EMAIL", label: "E-mail" },
  { value: "TELEFONE", label: "Telefone" },
  { value: "CPF", label: "CPF" },
  { value: "DATA", label: "Data" },
  { value: "SELECT", label: "Lista suspensa" },
  { value: "CHECKBOX", label: "Caixas de seleção" },
  { value: "RADIO", label: "Botões de opção" },
  { value: "TEXTAREA", label: "Texto longo" },
  { value: "ARQUIVO", label: "Arquivo" },
]

interface Campo {
  id?: string
  label: string
  tipo: string
  obrigatorio: boolean
  placeholder: string
  instrucao: string
  opcoes: string[]
  order: number
  _editando?: boolean
}

interface Formulario {
  id?: string
  titulo: string
  descricao: string
  vagas: string
  dataInicio: string
  dataFim: string
  ativo: boolean
  campos: Campo[]
}

export default function EditarAtividadePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingForm, setIsSavingForm] = useState(false)
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload")
  const [imagePreview, setImagePreview] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const [form, setForm] = useState({
    nome: "", tipo: "MOVIMENTO", descricao: "", descricaoCompleta: "",
    cor: "", textoBotao: "", linkExterno: "", local: "", responsavel: "",
    contato: "", aceitaInscricoes: false, showInNavbar: false, navbarOrder: 0,
    active: true, order: 0, imagem: "",
  })
  const [horarios, setHorarios] = useState<string[]>([])
  const [formulario, setFormulario] = useState<Formulario>({
    titulo: "", descricao: "", vagas: "", dataInicio: "", dataFim: "",
    ativo: true, campos: [],
  })
  const [campoEditando, setCampoEditando] = useState<number | null>(null)

  const loadAtividade = useCallback(async () => {
    try {
      const res = await fetch(`/api/atividades/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()

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
      if (data.formulario) {
        const f = data.formulario
        setFormulario({
          titulo: f.titulo ?? "",
          descricao: f.descricao ?? "",
          vagas: f.vagas != null ? String(f.vagas) : "",
          dataInicio: f.dataInicio ? f.dataInicio.slice(0, 16) : "",
          dataFim: f.dataFim ? f.dataFim.slice(0, 16) : "",
          ativo: f.ativo ?? true,
          campos: (f.campos ?? []).map((c: Campo) => ({
            id: c.id,
            label: c.label,
            tipo: c.tipo,
            obrigatorio: c.obrigatorio,
            placeholder: c.placeholder ?? "",
            instrucao: c.instrucao ?? "",
            opcoes: c.opcoes ?? [],
            order: c.order,
            _editando: false,
          })),
        })
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

  // ─── Form Builder ─────────────────────────────────────────────────────────────

  const addCampo = () => {
    setFormulario((prev) => ({
      ...prev,
      campos: [
        ...prev.campos,
        {
          label: "", tipo: "TEXTO", obrigatorio: false,
          placeholder: "", instrucao: "", opcoes: [],
          order: prev.campos.length, _editando: true,
        },
      ],
    }))
    setCampoEditando(formulario.campos.length)
  }

  const updateCampo = (i: number, field: string, value: unknown) => {
    setFormulario((prev) => ({
      ...prev,
      campos: prev.campos.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }))
  }

  const removeCampo = (i: number) => {
    setFormulario((prev) => ({
      ...prev,
      campos: prev.campos.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, order: idx })),
    }))
    if (campoEditando === i) setCampoEditando(null)
  }

  const moveCampo = (i: number, dir: "up" | "down") => {
    const campos = [...formulario.campos]
    const j = dir === "up" ? i - 1 : i + 1
    if (j < 0 || j >= campos.length) return;
    [campos[i], campos[j]] = [campos[j], campos[i]]
    setFormulario((prev) => ({ ...prev, campos: campos.map((c, idx) => ({ ...c, order: idx })) }))
  }

  const handleSaveFormulario = async () => {
    if (!formulario.titulo) { toast.error("Título do formulário é obrigatório"); return }
    setIsSavingForm(true)
    try {
      const res = await fetch(`/api/atividades/${id}/formulario`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formulario.titulo,
          descricao: formulario.descricao || null,
          vagas: formulario.vagas ? Number(formulario.vagas) : null,
          dataInicio: formulario.dataInicio || null,
          dataFim: formulario.dataFim || null,
          ativo: formulario.ativo,
          campos: formulario.campos.map((c, i) => ({
            label: c.label, tipo: c.tipo, obrigatorio: c.obrigatorio,
            placeholder: c.placeholder || null, instrucao: c.instrucao || null,
            opcoes: c.opcoes, order: i,
          })),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Formulário salvo!")
      setCampoEditando(null)
    } catch { toast.error("Erro ao salvar formulário") }
    finally { setIsSavingForm(false) }
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

  const tiposComOpcoes = ["SELECT", "CHECKBOX", "RADIO"]

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

          {/* Formulário de Inscrições */}
          {form.aceitaInscricoes && (
            <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden">
              <div className="bg-parish-navy px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-parish-gold" />
                  <h3 className="text-white font-semibold">Formulário de Inscrições</h3>
                </div>
                <button
                  type="button"
                  onClick={handleSaveFormulario}
                  disabled={isSavingForm}
                  className="flex items-center gap-2 px-4 py-1.5 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingForm ? "Salvando..." : "Salvar Formulário"}
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Dados do formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Título do formulário *</label>
                    <input type="text" value={formulario.titulo}
                      onChange={(e) => setFormulario((p) => ({ ...p, titulo: e.target.value }))}
                      placeholder="Ex: Inscrição para o Grupo de Jovens" className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Descrição do formulário</label>
                    <textarea value={formulario.descricao}
                      onChange={(e) => setFormulario((p) => ({ ...p, descricao: e.target.value }))}
                      rows={2} placeholder="Instruções para o inscrito..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Vagas máximas (vazio = ilimitado)</label>
                    <input type="number" value={formulario.vagas} min={0}
                      onChange={(e) => setFormulario((p) => ({ ...p, vagas: e.target.value }))}
                      placeholder="Ex: 30" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Formulário ativo</label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input type="checkbox" checked={formulario.ativo}
                        onChange={(e) => setFormulario((p) => ({ ...p, ativo: e.target.checked }))}
                        className="w-4 h-4 text-parish-gold border-parish-border rounded" />
                      <span className="text-sm text-parish-text">Aceitar inscrições agora</span>
                    </label>
                  </div>
                  <div>
                    <label className={labelClass}>Data de início</label>
                    <input type="datetime-local" value={formulario.dataInicio}
                      onChange={(e) => setFormulario((p) => ({ ...p, dataInicio: e.target.value }))}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Data de encerramento</label>
                    <input type="datetime-local" value={formulario.dataFim}
                      onChange={(e) => setFormulario((p) => ({ ...p, dataFim: e.target.value }))}
                      className={inputClass} />
                  </div>
                </div>

                {/* Form Builder */}
                <div className="border-t border-parish-border pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-parish-text">Campos do formulário</h4>
                    <button type="button" onClick={addCampo}
                      className="flex items-center gap-1.5 text-sm text-parish-gold hover:text-parish-gold-dark transition font-medium">
                      <Plus className="w-4 h-4" /> Adicionar campo
                    </button>
                  </div>

                  {formulario.campos.length === 0 && (
                    <div className="text-center py-8 bg-parish-background rounded-lg border border-dashed border-parish-border">
                      <ClipboardList className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                      <p className="text-sm text-parish-secondary">Nenhum campo adicionado</p>
                      <button type="button" onClick={addCampo}
                        className="mt-2 text-sm text-parish-gold hover:underline">
                        Adicionar primeiro campo
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {formulario.campos.map((campo, i) => (
                      <div key={i} className="border border-parish-border rounded-lg overflow-hidden bg-white">
                        {/* Campo header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-parish-background">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-parish-secondary font-mono bg-white border border-parish-border px-2 py-0.5 rounded">{i + 1}</span>
                            <span className="text-sm font-medium text-parish-text truncate">
                              {campo.label || "(sem label)"}
                            </span>
                            {campo.obrigatorio && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                                Obrigatório
                              </span>
                            )}
                            <span className="text-[10px] text-parish-secondary bg-white border border-parish-border px-2 py-0.5 rounded">
                              {TIPOS_CAMPO.find((t) => t.value === campo.tipo)?.label ?? campo.tipo}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button type="button" onClick={() => moveCampo(i, "up")} disabled={i === 0}
                              className="p-1 text-parish-secondary hover:text-parish-text disabled:opacity-30 transition">
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => moveCampo(i, "down")} disabled={i === formulario.campos.length - 1}
                              className="p-1 text-parish-secondary hover:text-parish-text disabled:opacity-30 transition">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setCampoEditando(campoEditando === i ? null : i)}
                              className={`p-1 rounded transition ${campoEditando === i ? "text-parish-gold" : "text-parish-secondary hover:text-parish-text"}`}>
                              {campoEditando === i ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                            </button>
                            <button type="button" onClick={() => removeCampo(i)}
                              className="p-1 text-red-400 hover:text-red-600 transition">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Campo editor (inline) */}
                        {campoEditando === i && (
                          <div className="p-4 space-y-4 border-t border-parish-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>Label *</label>
                                <input type="text" value={campo.label}
                                  onChange={(e) => updateCampo(i, "label", e.target.value)}
                                  placeholder="Ex: Nome completo"
                                  className="w-full px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                              </div>
                              <div>
                                <label className={labelClass}>Tipo *</label>
                                <select value={campo.tipo}
                                  onChange={(e) => updateCampo(i, "tipo", e.target.value)}
                                  className="w-full px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm">
                                  {TIPOS_CAMPO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={labelClass}>Placeholder</label>
                                <input type="text" value={campo.placeholder}
                                  onChange={(e) => updateCampo(i, "placeholder", e.target.value)}
                                  placeholder="Texto de exemplo..."
                                  className="w-full px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                              </div>
                              <div>
                                <label className={labelClass}>Instrução / dica</label>
                                <input type="text" value={campo.instrucao}
                                  onChange={(e) => updateCampo(i, "instrucao", e.target.value)}
                                  placeholder="Ajuda ao usuário..."
                                  className="w-full px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                              </div>
                            </div>

                            {tiposComOpcoes.includes(campo.tipo) && (
                              <div>
                                <label className={labelClass}>Opções (uma por linha)</label>
                                <textarea
                                  value={campo.opcoes.join("\n")}
                                  onChange={(e) => updateCampo(i, "opcoes", e.target.value.split("\n"))}
                                  rows={4}
                                  placeholder={"Opção 1\nOpção 2\nOpção 3"}
                                  className="w-full px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm font-mono"
                                />
                              </div>
                            )}

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={campo.obrigatorio}
                                onChange={(e) => updateCampo(i, "obrigatorio", e.target.checked)}
                                className="w-4 h-4 text-parish-gold border-parish-border rounded" />
                              <span className="text-sm text-parish-text">Campo obrigatório</span>
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
                <p className="text-xs text-parish-secondary">Habilita formulário de inscrição</p>
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
