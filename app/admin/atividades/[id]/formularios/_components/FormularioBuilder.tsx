"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown,
  Edit2, Check, X, GripVertical,
} from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export const TIPOS_CAMPO = [
  { value: "TEXTO", label: "Texto curto" },
  { value: "TEXTAREA", label: "Texto longo" },
  { value: "EMAIL", label: "E-mail" },
  { value: "TELEFONE", label: "Telefone" },
  { value: "CPF", label: "CPF" },
  { value: "NUMERO", label: "Número" },
  { value: "DATA", label: "Data" },
  { value: "SELECT", label: "Lista suspensa" },
  { value: "CHECKBOX", label: "Caixas de seleção" },
  { value: "RADIO", label: "Botões de opção" },
  { value: "ARQUIVO", label: "Upload de arquivo" },
]

export interface Campo {
  id?: string
  label: string
  tipo: string
  obrigatorio: boolean
  placeholder: string
  instrucao: string
  opcoes: string[]
  order: number
}

export interface FormularioForm {
  titulo: string
  slug: string
  descricao: string
  mensagemConfirmacao: string
  vagas: string
  dataInicio: string
  dataFim: string
  aceitaArquivos: boolean
  ativo: boolean
  order: number
  campos: Campo[]
}

const TIPOSCOM_OPCOES = ["SELECT", "CHECKBOX", "RADIO"]

const inputClass = "w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-parish-text bg-white text-sm"
const labelClass = "block text-sm font-medium text-parish-text-light mb-2"

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  atividadeId: string
  atividadeNome: string
  formularioId?: string
  initialData?: Partial<FormularioForm>
  mode: "criar" | "editar"
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FormularioBuilder({
  atividadeId,
  atividadeNome,
  formularioId,
  initialData,
  mode,
}: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [campoEditando, setCampoEditando] = useState<number | null>(null)

  const [form, setForm] = useState<FormularioForm>({
    titulo: initialData?.titulo ?? "",
    slug: initialData?.slug ?? "",
    descricao: initialData?.descricao ?? "",
    mensagemConfirmacao: initialData?.mensagemConfirmacao ?? "",
    vagas: initialData?.vagas ?? "",
    dataInicio: initialData?.dataInicio ?? "",
    dataFim: initialData?.dataFim ?? "",
    aceitaArquivos: initialData?.aceitaArquivos ?? false,
    ativo: initialData?.ativo ?? true,
    order: initialData?.order ?? 0,
    campos: initialData?.campos ?? [],
  })

  // ─── Slug automático ────────────────────────────────────────────────────────

  const handleTituloChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      titulo: val,
      slug: prev.slug || mode === "criar"
        ? val.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
            .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
        : prev.slug,
    }))
  }

  // ─── Form handler ───────────────────────────────────────────────────────────

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

  // ─── Campos ─────────────────────────────────────────────────────────────────

  const addCampo = () => {
    const idx = form.campos.length
    setForm((prev) => ({
      ...prev,
      campos: [
        ...prev.campos,
        { label: "", tipo: "TEXTO", obrigatorio: false, placeholder: "", instrucao: "", opcoes: [], order: idx },
      ],
    }))
    setCampoEditando(idx)
  }

  const updateCampo = (i: number, field: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      campos: prev.campos.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }))
  }

  const removeCampo = (i: number) => {
    setForm((prev) => ({
      ...prev,
      campos: prev.campos.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, order: idx })),
    }))
    if (campoEditando === i) setCampoEditando(null)
    else if (campoEditando !== null && campoEditando > i) setCampoEditando(campoEditando - 1)
  }

  const moveCampo = (i: number, dir: "up" | "down") => {
    const campos = [...form.campos]
    const j = dir === "up" ? i - 1 : i + 1
    if (j < 0 || j >= campos.length) return;
    [campos[i], campos[j]] = [campos[j], campos[i]]
    setForm((prev) => ({ ...prev, campos: campos.map((c, idx) => ({ ...c, order: idx })) }))
    if (campoEditando === i) setCampoEditando(j)
    else if (campoEditando === j) setCampoEditando(i)
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo) { toast.error("Título é obrigatório"); return }

    setIsSaving(true)
    try {
      const payload = {
        titulo: form.titulo,
        slug: form.slug || undefined,
        descricao: form.descricao || null,
        mensagemConfirmacao: form.mensagemConfirmacao || null,
        vagas: form.vagas ? Number(form.vagas) : null,
        dataInicio: form.dataInicio || null,
        dataFim: form.dataFim || null,
        aceitaArquivos: form.aceitaArquivos,
        ativo: form.ativo,
        order: Number(form.order),
        campos: form.campos.map((c, i) => ({
          ...(c.id ? { id: c.id } : {}),
          label: c.label,
          tipo: c.tipo,
          obrigatorio: c.obrigatorio,
          placeholder: c.placeholder || null,
          instrucao: c.instrucao || null,
          opcoes: c.opcoes.filter(Boolean),
          order: i,
        })),
      }

      const url = mode === "criar"
        ? `/api/atividades/${atividadeId}/formularios`
        : `/api/atividades/${atividadeId}/formularios/${formularioId}`

      const res = await fetch(url, {
        method: mode === "criar" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Erro ao salvar")
      }

      toast.success(mode === "criar" ? "Formulário criado!" : "Formulário salvo!")
      router.push(`/admin/atividades/${atividadeId}/editar`)
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar formulário")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/atividades/${atividadeId}/editar`}
            className="text-parish-text-light hover:text-parish-text transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">
              {mode === "criar" ? "Novo Formulário" : "Editar Formulário"}
            </h1>
            <p className="text-parish-text-light mt-1 text-sm flex items-center gap-1">
              {atividadeNome}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-5 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2 font-semibold"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar formulário"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados básicos */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">
              Identificação
            </h3>
            <div>
              <label className={labelClass}>Título *</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => handleTituloChange(e.target.value)}
                placeholder="Ex: 1ª Comunhão"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-parish-secondary bg-parish-background px-3 py-3 border border-parish-border border-r-0 rounded-l-lg">
                  /atividades/.../
                </span>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="primeira-comunhao"
                  className="flex-1 px-4 py-3 border border-parish-border rounded-r-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm"
                />
              </div>
              <p className="text-xs text-parish-secondary mt-1">Gerado automaticamente a partir do título.</p>
            </div>
            <div>
              <label className={labelClass}>Descrição</label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows={3}
                placeholder="Breve descrição para os usuários..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mensagem após envio</label>
              <textarea
                name="mensagemConfirmacao"
                value={form.mensagemConfirmacao}
                onChange={handleChange}
                rows={3}
                placeholder="Sua inscrição foi recebida com sucesso. Aguarde o contato da paróquia."
                className={inputClass}
              />
              <p className="text-xs text-parish-secondary mt-1">Exibida na tela de confirmação após a inscrição.</p>
            </div>
          </div>

          {/* Campos dinâmicos */}
          <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden">
            <div className="px-6 py-4 border-b border-parish-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-parish-text">Campos do formulário</h3>
                <p className="text-xs text-parish-secondary mt-0.5">{form.campos.length} campo(s)</p>
              </div>
              <button
                type="button"
                onClick={addCampo}
                className="flex items-center gap-1.5 px-4 py-2 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition"
              >
                <Plus className="w-4 h-4" /> Adicionar campo
              </button>
            </div>

            <div className="p-6">
              {form.campos.length === 0 ? (
                <div className="text-center py-10 bg-parish-background rounded-lg border border-dashed border-parish-border">
                  <GripVertical className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                  <p className="text-sm text-parish-secondary mb-3">Nenhum campo criado.</p>
                  <button
                    type="button"
                    onClick={addCampo}
                    className="text-sm text-parish-gold hover:underline font-medium"
                  >
                    + Adicionar primeiro campo
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.campos.map((campo, i) => (
                    <div key={i} className="border border-parish-border rounded-xl overflow-hidden bg-white">
                      {/* Campo header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-parish-background">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-parish-secondary font-mono bg-white border border-parish-border px-2 py-0.5 rounded">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-parish-text truncate">
                            {campo.label || <span className="italic text-parish-secondary">(sem label)</span>}
                          </span>
                          {campo.obrigatorio && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                              Obrigatório
                            </span>
                          )}
                          <span className="text-[10px] text-parish-secondary bg-white border border-parish-border px-2 py-0.5 rounded hidden sm:inline">
                            {TIPOS_CAMPO.find((t) => t.value === campo.tipo)?.label ?? campo.tipo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button type="button" onClick={() => moveCampo(i, "up")} disabled={i === 0}
                            className="p-1 text-parish-secondary hover:text-parish-text disabled:opacity-30 transition">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => moveCampo(i, "down")} disabled={i === form.campos.length - 1}
                            className="p-1 text-parish-secondary hover:text-parish-text disabled:opacity-30 transition">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCampoEditando(campoEditando === i ? null : i)}
                            className={`p-1 rounded transition ${campoEditando === i ? "text-parish-gold" : "text-parish-secondary hover:text-parish-text"}`}
                          >
                            {campoEditando === i ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                          </button>
                          <button type="button" onClick={() => removeCampo(i)}
                            className="p-1 text-red-400 hover:text-red-600 transition">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Campo editor */}
                      {campoEditando === i && (
                        <div className="p-5 space-y-4 border-t border-parish-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Label *</label>
                              <input type="text" value={campo.label}
                                onChange={(e) => updateCampo(i, "label", e.target.value)}
                                placeholder="Ex: Nome completo"
                                className="w-full px-3 py-2.5 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                            </div>
                            <div>
                              <label className={labelClass}>Tipo *</label>
                              <select value={campo.tipo}
                                onChange={(e) => updateCampo(i, "tipo", e.target.value)}
                                className="w-full px-3 py-2.5 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm">
                                {TIPOS_CAMPO.map((t) => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Placeholder</label>
                              <input type="text" value={campo.placeholder}
                                onChange={(e) => updateCampo(i, "placeholder", e.target.value)}
                                placeholder="Texto de exemplo..."
                                className="w-full px-3 py-2.5 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                            </div>
                            <div>
                              <label className={labelClass}>Instrução / dica</label>
                              <input type="text" value={campo.instrucao}
                                onChange={(e) => updateCampo(i, "instrucao", e.target.value)}
                                placeholder="Ajuda ao usuário..."
                                className="w-full px-3 py-2.5 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm" />
                            </div>
                          </div>

                          {TIPOSCOM_OPCOES.includes(campo.tipo) && (
                            <div>
                              <label className={labelClass}>Opções (uma por linha)</label>
                              <textarea
                                value={campo.opcoes.join("\n")}
                                onChange={(e) => updateCampo(i, "opcoes", e.target.value.split("\n"))}
                                rows={4}
                                placeholder={"Opção 1\nOpção 2\nOpção 3"}
                                className="w-full px-3 py-2.5 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm font-mono"
                              />
                            </div>
                          )}

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={campo.obrigatorio}
                              onChange={(e) => updateCampo(i, "obrigatorio", e.target.checked)}
                              className="w-4 h-4 text-parish-gold border-parish-border rounded" />
                            <span className="text-sm text-parish-text font-medium">Campo obrigatório</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Configurações de vagas e datas */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-5">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">
              Vagas e Datas
            </h3>
            <div>
              <label className={labelClass}>Vagas máximas</label>
              <input type="number" name="vagas" value={form.vagas} min={0}
                onChange={handleChange} placeholder="Ilimitado" className={inputClass} />
              <p className="text-xs text-parish-secondary mt-1">Vazio = sem limite</p>
            </div>
            <div>
              <label className={labelClass}>Início das inscrições</label>
              <input type="datetime-local" name="dataInicio" value={form.dataInicio}
                onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Encerramento</label>
              <input type="datetime-local" name="dataFim" value={form.dataFim}
                onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ordem de exibição</label>
              <input type="number" name="order" value={form.order} min={0}
                onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Configurações extras */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-4">
            <h3 className="text-sm font-semibold text-parish-text-light uppercase tracking-wide">
              Configurações
            </h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded" />
              <div>
                <p className="text-sm font-medium text-parish-text">Formulário ativo</p>
                <p className="text-xs text-parish-secondary">Aceitar novas inscrições</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="aceitaArquivos" checked={form.aceitaArquivos} onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-parish-gold border-parish-border rounded" />
              <div>
                <p className="text-sm font-medium text-parish-text">Aceitar documentos</p>
                <p className="text-xs text-parish-secondary">Habilita upload de arquivos</p>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  )
}
