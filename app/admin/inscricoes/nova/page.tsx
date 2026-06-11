"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft, Save, Search, ClipboardList, ChevronRight,
  AlertCircle, CheckCircle2, Users, Loader2,
} from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormularioOpcao {
  id: string
  slug: string
  titulo: string
  ativo: boolean
  vagas: number | null
  _count: { inscricoes: number }
}

interface AtividadeOpcao {
  id: string
  nome: string
  slug: string
  formularios: FormularioOpcao[]
}

interface CampoFormulario {
  id: string
  label: string
  tipo: string
  obrigatorio: boolean
  placeholder: string | null
  instrucao: string | null
  opcoes: string[]
}

interface FormularioCompleto {
  id: string
  titulo: string
  descricao: string | null
  campos: CampoFormulario[]
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InscricaoManualPage() {
  const router = useRouter()

  const [atividades, setAtividades] = useState<AtividadeOpcao[]>([])
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<AtividadeOpcao | null>(null)
  const [formularioSelecionado, setFormularioSelecionado] = useState<FormularioCompleto | null>(null)
  const [loadingForm, setLoadingForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [buscaAtividade, setBuscaAtividade] = useState("")

  const [respostas, setRespostas] = useState<Record<string, string | string[]>>({})

  const inputClass = "w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-parish-text bg-white text-sm"
  const labelClass = "block text-sm font-medium text-parish-text-light mb-2"

  // Carregar atividades com formulários
  useEffect(() => {
    fetch("/api/atividades?includeFormularios=true")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.atividades ?? []
        setAtividades(list.filter((a: AtividadeOpcao) => a.formularios?.length > 0))
      })
      .catch(() => {})
  }, [])

  const handleSelectAtividade = (at: AtividadeOpcao) => {
    setAtividadeSelecionada(at)
    setFormularioSelecionado(null)
    setRespostas({})
  }

  const handleSelectFormulario = useCallback(async (formularioId: string) => {
    if (!atividadeSelecionada) return
    setLoadingForm(true)
    try {
      const res = await fetch(`/api/atividades/${atividadeSelecionada.id}/formularios/${formularioId}`)
      const data = await res.json()
      setFormularioSelecionado(data)
      const init: Record<string, string | string[]> = {}
      data.campos?.forEach((c: CampoFormulario) => { init[c.id] = c.tipo === "CHECKBOX" ? [] : "" })
      setRespostas(init)
    } catch { toast.error("Erro ao carregar formulário") }
    finally { setLoadingForm(false) }
  }, [atividadeSelecionada])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formularioSelecionado) return
    setSubmitting(true)
    try {
      const campos = formularioSelecionado.campos
      let nome = "", email = "", telefone = ""
      campos.forEach((c) => {
        const val = respostas[c.id]
        if (!nome && c.tipo === "TEXTO" && c.label.toLowerCase().includes("nome")) nome = val as string
        if (!email && c.tipo === "EMAIL") email = val as string
        if (!telefone && c.tipo === "TELEFONE") telefone = val as string
      })

      const res = await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formularioId: formularioSelecionado.id,
          respostas,
          nome: nome || null,
          email: email || null,
          telefone: telefone || null,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      toast.success(`Inscrição registrada! Protocolo: ${body.protocolo}`)
      router.push("/admin/inscricoes")
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar inscrição")
    } finally { setSubmitting(false) }
  }

  const atividadesFiltradas = atividades.filter((a) =>
    a.nome.toLowerCase().includes(buscaAtividade.toLowerCase())
  )

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/inscricoes" className="text-parish-text-light hover:text-parish-text transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-parish-text">Inscrição Manual</h1>
          <p className="text-parish-text-light mt-1 text-sm">
            Registre inscrições em nome de pessoas que não acessam o sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Atividade + Formulário */}
        <div className="lg:col-span-1 space-y-4">
          {/* Buscar atividade */}
          <div className="bg-parish-surface rounded-lg border border-parish-primary p-5">
            <h3 className="font-semibold text-parish-text mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-parish-navy text-white text-xs flex items-center justify-center font-bold">1</span>
              Selecionar atividade
            </h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parish-secondary" />
              <input
                type="text"
                value={buscaAtividade}
                onChange={(e) => setBuscaAtividade(e.target.value)}
                placeholder="Buscar atividade..."
                className="w-full pl-9 pr-4 py-2.5 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold outline-none text-sm"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {atividadesFiltradas.length === 0 && (
                <p className="text-center text-sm text-parish-secondary py-4">
                  Nenhuma atividade com formulários disponíveis.
                </p>
              )}
              {atividadesFiltradas.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleSelectAtividade(a)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition text-sm ${
                    atividadeSelecionada?.id === a.id
                      ? "border-parish-gold bg-parish-gold/5 text-parish-navy font-semibold"
                      : "border-parish-border hover:border-parish-gold/40 hover:bg-parish-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{a.nome}</span>
                    <span className="text-xs text-parish-secondary ml-2 flex-shrink-0">
                      {a.formularios.length} form.
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selecionar formulário */}
          {atividadeSelecionada && (
            <div className="bg-parish-surface rounded-lg border border-parish-primary p-5">
              <h3 className="font-semibold text-parish-text mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-parish-navy text-white text-xs flex items-center justify-center font-bold">2</span>
                Selecionar formulário
              </h3>
              <div className="space-y-2">
                {atividadeSelecionada.formularios.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFormulario(f.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition text-sm ${
                      formularioSelecionado?.id === f.id
                        ? "border-parish-gold bg-parish-gold/5 text-parish-navy font-semibold"
                        : "border-parish-border hover:border-parish-gold/40 hover:bg-parish-background"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{f.titulo}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 text-xs text-parish-secondary">
                          <Users className="w-3 h-3" />
                          {f._count.inscricoes}{f.vagas ? `/${f.vagas}` : ""}
                        </span>
                        {!f.ativo && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Inativo</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulário de inscrição */}
        <div className="lg:col-span-2">
          {!atividadeSelecionada && (
            <div className="bg-parish-surface rounded-lg border border-dashed border-parish-border p-12 text-center h-full flex flex-col items-center justify-center">
              <ClipboardList className="w-12 h-12 text-parish-secondary mb-3" />
              <p className="text-parish-secondary">Selecione uma atividade e um formulário para começar.</p>
            </div>
          )}

          {atividadeSelecionada && !formularioSelecionado && (
            <div className="bg-parish-surface rounded-lg border border-dashed border-parish-border p-12 text-center h-full flex flex-col items-center justify-center">
              {loadingForm ? (
                <Loader2 className="w-8 h-8 text-parish-gold animate-spin" />
              ) : (
                <>
                  <ChevronRight className="w-12 h-12 text-parish-secondary mb-3" />
                  <p className="text-parish-secondary">Selecione um formulário à esquerda.</p>
                </>
              )}
            </div>
          )}

          {formularioSelecionado && (
            <div className="bg-parish-surface rounded-lg border border-parish-primary overflow-hidden">
              <div className="bg-parish-navy px-6 py-5">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-parish-gold" />
                  <div>
                    <p className="text-white/60 text-xs">{atividadeSelecionada?.nome}</p>
                    <h2 className="font-semibold text-white">{formularioSelecionado.titulo}</h2>
                  </div>
                </div>
                {formularioSelecionado.descricao && (
                  <p className="text-white/60 text-sm mt-2">{formularioSelecionado.descricao}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <p className="text-amber-300 text-xs">Inscrição manual — registrada pelo administrador</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {formularioSelecionado.campos.length === 0 && (
                  <div className="text-center py-6 text-sm text-parish-secondary">
                    Este formulário não possui campos adicionais.
                  </div>
                )}

                {formularioSelecionado.campos.map((campo) => (
                  <div key={campo.id}>
                    <label className={labelClass}>
                      {campo.label}
                      {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {campo.tipo === "TEXTAREA" ? (
                      <textarea rows={3} value={respostas[campo.id] as string ?? ""}
                        onChange={(e) => setRespostas((p) => ({ ...p, [campo.id]: e.target.value }))}
                        placeholder={campo.placeholder ?? ""} required={campo.obrigatorio}
                        className={`${inputClass} resize-none`} />
                    ) : campo.tipo === "SELECT" ? (
                      <select value={respostas[campo.id] as string ?? ""}
                        onChange={(e) => setRespostas((p) => ({ ...p, [campo.id]: e.target.value }))}
                        required={campo.obrigatorio} className={inputClass}>
                        <option value="">Selecione...</option>
                        {campo.opcoes.map((op) => <option key={op} value={op}>{op}</option>)}
                      </select>
                    ) : campo.tipo === "CHECKBOX" ? (
                      <div className="space-y-2">
                        {campo.opcoes.map((op) => (
                          <label key={op} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox"
                              checked={(respostas[campo.id] as string[] ?? []).includes(op)}
                              onChange={(e) => {
                                const arr = (respostas[campo.id] as string[]) ?? []
                                setRespostas((p) => ({
                                  ...p,
                                  [campo.id]: e.target.checked ? [...arr, op] : arr.filter((v) => v !== op),
                                }))
                              }}
                              className="w-4 h-4 accent-parish-gold" />
                            <span className="text-sm">{op}</span>
                          </label>
                        ))}
                      </div>
                    ) : campo.tipo === "RADIO" ? (
                      <div className="space-y-2">
                        {campo.opcoes.map((op) => (
                          <label key={op} className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name={campo.id} value={op}
                              checked={respostas[campo.id] === op}
                              onChange={() => setRespostas((p) => ({ ...p, [campo.id]: op }))}
                              required={campo.obrigatorio}
                              className="w-4 h-4 accent-parish-gold" />
                            <span className="text-sm">{op}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={campo.tipo === "EMAIL" ? "email" : campo.tipo === "DATA" ? "date" : campo.tipo === "NUMERO" ? "number" : "text"}
                        value={respostas[campo.id] as string ?? ""}
                        onChange={(e) => setRespostas((p) => ({ ...p, [campo.id]: e.target.value }))}
                        placeholder={campo.placeholder ?? ""}
                        required={campo.obrigatorio}
                        className={inputClass}
                      />
                    )}

                    {campo.instrucao && (
                      <p className="text-xs text-parish-secondary mt-1">{campo.instrucao}</p>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-4 pt-4 border-t border-parish-border">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-parish-gold text-white rounded-lg font-semibold hover:bg-parish-gold-dark transition disabled:opacity-60"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Registrar inscrição</>
                    )}
                  </button>
                  <Link
                    href="/admin/inscricoes"
                    className="px-5 py-3 border border-parish-border text-parish-text-light rounded-lg hover:bg-parish-background transition text-sm"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
