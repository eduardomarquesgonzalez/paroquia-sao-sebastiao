"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, ClipboardList, CheckCircle2, AlertCircle,
  Calendar, Users, Loader2, ChevronRight, Upload, FileText,
  BookOpen, Heart, Church, HandHeart, Sparkles,
} from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CampoFormulario {
  id: string
  label: string
  tipo: string
  obrigatorio: boolean
  placeholder: string | null
  instrucao: string | null
  opcoes: string[]
  order: number
}

interface Formulario {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  mensagemConfirmacao: string | null
  aceitaArquivos: boolean
  vagas: number | null
  dataInicio: string | null
  dataFim: string | null
  ativo: boolean
  campos: CampoFormulario[]
  _count: { inscricoes: number }
}

interface Atividade {
  id: string
  nome: string
  slug: string
  tipo: string
  imagem: string | null
  cor: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_GRADIENT: Record<string, string> = {
  MOVIMENTO: "from-blue-900 via-blue-800 to-blue-700",
  PASTORAL: "from-rose-900 via-rose-800 to-rose-700",
  MINISTERIO: "from-indigo-900 via-indigo-800 to-indigo-700",
  CURSO: "from-amber-900 via-amber-800 to-amber-700",
  CATEQUESE: "from-emerald-900 via-emerald-800 to-emerald-700",
  PROJETO_SOCIAL: "from-purple-900 via-purple-800 to-purple-700",
  OUTRO: "from-slate-900 via-slate-800 to-slate-700",
}

const TIPO_LABEL: Record<string, string> = {
  MOVIMENTO: "Movimento", PASTORAL: "Pastoral", MINISTERIO: "Ministério",
  CURSO: "Curso", CATEQUESE: "Catequese", PROJETO_SOCIAL: "Projeto Social", OUTRO: "Atividade",
}

const TIPO_ICON: Record<string, React.ElementType> = {
  MOVIMENTO: Users, PASTORAL: Heart, MINISTERIO: Church,
  CURSO: BookOpen, CATEQUESE: BookOpen, PROJETO_SOCIAL: HandHeart, OUTRO: Sparkles,
}

function getVagasStatus(formulario: Formulario) {
  const inscritos = formulario._count.inscricoes
  if (!formulario.vagas) return { tipo: "aberta" as const, inscritos }
  const restantes = formulario.vagas - inscritos
  if (restantes <= 0) return { tipo: "esgotada" as const, inscritos, total: formulario.vagas }
  if (restantes <= Math.ceil(formulario.vagas * 0.2))
    return { tipo: "ultimas" as const, inscritos, restantes, total: formulario.vagas }
  return { tipo: "aberta" as const, inscritos, restantes, total: formulario.vagas }
}

function isAberto(formulario: Formulario): boolean {
  if (!formulario.ativo) return false
  const now = new Date()
  if (formulario.dataInicio && now < new Date(formulario.dataInicio)) return false
  if (formulario.dataFim && now > new Date(formulario.dataFim)) return false
  return getVagasStatus(formulario).tipo !== "esgotada"
}

// ─── Campo Dinâmico ───────────────────────────────────────────────────────────

function CampoDinamico({
  campo, value, onChange,
}: {
  campo: CampoFormulario
  value: string | string[]
  onChange: (v: string | string[]) => void
}) {
  const base =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-parish-gold/40 focus:border-parish-gold transition bg-white"

  switch (campo.tipo) {
    case "TEXTAREA":
      return (
        <textarea rows={4} value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder ?? ""} required={campo.obrigatorio}
          className={`${base} resize-none`} />
      )
    case "SELECT":
      return (
        <select value={value as string} onChange={(e) => onChange(e.target.value)}
          required={campo.obrigatorio} className={base}>
          <option value="">Selecione...</option>
          {campo.opcoes.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
      )
    case "CHECKBOX":
      return (
        <div className="space-y-2">
          {campo.opcoes.map((op) => (
            <label key={op} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={(value as string[]).includes(op)}
                onChange={(e) => {
                  const arr = value as string[]
                  onChange(e.target.checked ? [...arr, op] : arr.filter((v) => v !== op))
                }}
                className="w-4 h-4 accent-parish-gold" />
              <span className="text-sm text-gray-700">{op}</span>
            </label>
          ))}
        </div>
      )
    case "RADIO":
      return (
        <div className="space-y-2">
          {campo.opcoes.map((op) => (
            <label key={op} className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name={campo.id} value={op} checked={value === op}
                onChange={() => onChange(op)} required={campo.obrigatorio}
                className="w-4 h-4 accent-parish-gold" />
              <span className="text-sm text-gray-700">{op}</span>
            </label>
          ))}
        </div>
      )
    case "EMAIL":
      return <input type="email" value={value as string} onChange={(e) => onChange(e.target.value)}
        placeholder={campo.placeholder ?? "seu@email.com"} required={campo.obrigatorio} className={base} />
    case "TELEFONE":
      return <input type="tel" value={value as string} onChange={(e) => onChange(e.target.value)}
        placeholder={campo.placeholder ?? "(00) 00000-0000"} required={campo.obrigatorio} className={base} />
    case "DATA":
      return <input type="date" value={value as string} onChange={(e) => onChange(e.target.value)}
        required={campo.obrigatorio} className={base} />
    case "CPF":
      return <input type="text" value={value as string} onChange={(e) => onChange(e.target.value)}
        placeholder={campo.placeholder ?? "000.000.000-00"} required={campo.obrigatorio}
        className={base} maxLength={14} />
    case "NUMERO":
      return <input type="number" value={value as string} onChange={(e) => onChange(e.target.value)}
        placeholder={campo.placeholder ?? ""} required={campo.obrigatorio} className={base} />
    default:
      return <input type="text" value={value as string} onChange={(e) => onChange(e.target.value)}
        placeholder={campo.placeholder ?? ""} required={campo.obrigatorio} className={base} />
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function InscricaoFormulario({
  atividade,
  formulario,
}: {
  atividade: Atividade
  formulario: Formulario
}) {
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>(() => {
    const init: Record<string, string | string[]> = {}
    formulario.campos.forEach((c) => { init[c.id] = c.tipo === "CHECKBOX" ? [] : "" })
    return init
  })
  const [submitting, setSubmitting] = useState(false)
  const [resultado, setResultado] = useState<{ protocolo: string } | null>(null)
  const [erroEnvio, setErroEnvio] = useState("")

  const gradient = TIPO_GRADIENT[atividade.tipo] ?? TIPO_GRADIENT.OUTRO
  const IconComp = TIPO_ICON[atividade.tipo] ?? Sparkles
  const vagasStatus = getVagasStatus(formulario)
  const aberto = isAberto(formulario)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErroEnvio("")
    try {
      const campos = formulario.campos
      let nome = ""
      let email = ""
      let telefone = ""
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
          formularioId: formulario.id,
          respostas,
          nome: nome || null,
          email: email || null,
          telefone: telefone || null,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setErroEnvio(body.error || "Erro ao enviar inscrição")
        return
      }
      setResultado({ protocolo: body.protocolo })
    } catch {
      setErroEnvio("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero compacto */}
      <div className={`relative h-48 md:h-56 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {atividade.imagem && (
          <div className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url('${atividade.imagem}')` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute top-0 left-0 right-0 p-4 md:p-6">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Link href="/" className="hover:text-white transition">Início</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/atividades/${atividade.slug}`} className="hover:text-white transition truncate max-w-[120px]">
                {atividade.nome}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white truncate">{formulario.titulo}</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-8 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/25">
                {TIPO_LABEL[atividade.tipo]}
              </span>
              <span className="text-white/70 text-sm">→</span>
              <span className="text-white font-medium text-sm">{atividade.nome}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <IconComp className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
                {formulario.titulo}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-3xl flex-1">

        {/* Confirmação de sucesso */}
        {resultado && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-playfair text-3xl font-bold text-white mb-2">
                Inscrição realizada!
              </h2>
              <p className="text-green-100">
                {formulario.mensagemConfirmacao ||
                  "Sua inscrição foi recebida com sucesso. Aguarde o contato da paróquia."}
              </p>
            </div>
            <div className="p-8 text-center">
              <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 mb-6">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Protocolo de inscrição
                </p>
                <p className="text-2xl font-bold text-parish-navy font-mono tracking-wider">
                  {resultado.protocolo}
                </p>
                <p className="text-xs text-gray-400 mt-1">Guarde este número para consultas</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/atividades/${atividade.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para {atividade.nome}
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-parish-navy text-white rounded-xl hover:bg-parish-navy-dark transition text-sm"
                >
                  Ir para o início
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Formulário ou status */}
        {!resultado && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header do formulário */}
            <div className="bg-gradient-to-r from-parish-navy to-parish-navy-dark px-6 py-5">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-parish-gold flex-shrink-0" />
                <div>
                  <h2 className="font-playfair text-xl font-bold text-white">{formulario.titulo}</h2>
                  {formulario.descricao && (
                    <p className="text-white/70 text-sm mt-1">{formulario.descricao}</p>
                  )}
                </div>
              </div>

              {/* Status de vagas */}
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                {formulario.dataInicio && (
                  <span className="flex items-center gap-1.5 text-white/60 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(formulario.dataInicio).toLocaleDateString("pt-BR")}
                    {formulario.dataFim && ` — ${new Date(formulario.dataFim).toLocaleDateString("pt-BR")}`}
                  </span>
                )}
                {formulario.vagas && (
                  <span className="flex items-center gap-1.5 text-white/60 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    {vagasStatus.inscritos}/{formulario.vagas} inscritos
                  </span>
                )}
              </div>

              {/* Barra de vagas */}
              {formulario.vagas && vagasStatus.total && (
                <div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      vagasStatus.tipo === "esgotada" ? "bg-red-400" :
                      vagasStatus.tipo === "ultimas" ? "bg-amber-400" : "bg-green-400"
                    }`}
                    style={{ width: `${Math.min(100, (vagasStatus.inscritos / vagasStatus.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              {/* Inscrições encerradas */}
              {!aberto && (
                <div className="text-center py-8">
                  {vagasStatus.tipo === "esgotada" ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="font-semibold text-gray-700 text-lg">Vagas esgotadas</p>
                      <p className="text-sm text-gray-500">Todas as vagas foram preenchidas para esta inscrição.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-700 text-lg">Inscrições encerradas</p>
                      <p className="text-sm text-gray-500">
                        {!formulario.ativo
                          ? "Este formulário está desativado no momento."
                          : formulario.dataFim && new Date() > new Date(formulario.dataFim)
                          ? "O prazo de inscrições foi encerrado."
                          : "As inscrições ainda não foram abertas."}
                      </p>
                    </div>
                  )}
                  <Link
                    href={`/atividades/${atividade.slug}`}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Link>
                </div>
              )}

              {/* Formulário ativo */}
              {aberto && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {erroEnvio && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {erroEnvio}
                    </div>
                  )}

                  {formulario.campos.map((campo) => (
                    <div key={campo.id}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {campo.label}
                        {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <CampoDinamico
                        campo={campo}
                        value={respostas[campo.id] ?? (campo.tipo === "CHECKBOX" ? [] : "")}
                        onChange={(val) => setRespostas((prev) => ({ ...prev, [campo.id]: val }))}
                      />
                      {campo.instrucao && (
                        <p className="text-xs text-gray-500 mt-1.5">{campo.instrucao}</p>
                      )}
                    </div>
                  ))}

                  {formulario.aceitaArquivos && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Documentos <span className="text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 hover:border-parish-gold/50 transition cursor-pointer">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">Clique ou arraste arquivos aqui</p>
                        <p className="text-xs mt-1">PDF, JPG ou PNG até 5MB</p>
                      </div>
                    </div>
                  )}

                  {formulario.campos.length === 0 && (
                    <div className="text-center py-4">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        Este formulário não possui campos adicionais. Clique em confirmar para se inscrever.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition disabled:opacity-60 shadow-md"
                    >
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                      ) : (
                        <><CheckCircle2 className="w-5 h-5" /> Confirmar inscrição</>
                      )}
                    </button>
                    <Link
                      href={`/atividades/${atividade.slug}`}
                      className="px-5 py-3.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm"
                    >
                      Cancelar
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
