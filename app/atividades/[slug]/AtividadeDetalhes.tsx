"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, MapPin, Clock, Phone, User, Users, Heart, Church,
  BookOpen, HandHeart, Sparkles, ClipboardList, CheckCircle2,
  AlertCircle, Calendar, ChevronRight, Loader2,
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
  titulo: string
  descricao: string | null
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
  descricao: string
  descricaoCompleta: string | null
  tipo: string
  imagem: string | null
  cor: string | null
  textoBotao: string | null
  linkExterno: string | null
  local: string | null
  responsavel: string | null
  contato: string | null
  horarios: string[]
  aceitaInscricoes: boolean
  active: boolean
  formulario: Formulario | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  MOVIMENTO: "Movimento",
  PASTORAL: "Pastoral",
  MINISTERIO: "Ministério",
  CURSO: "Curso",
  CATEQUESE: "Catequese",
  PROJETO_SOCIAL: "Projeto Social",
  OUTRO: "Atividade",
}

const TIPO_GRADIENT: Record<string, string> = {
  MOVIMENTO: "from-blue-900 via-blue-800 to-blue-700",
  PASTORAL: "from-rose-900 via-rose-800 to-rose-700",
  MINISTERIO: "from-indigo-900 via-indigo-800 to-indigo-700",
  CURSO: "from-amber-900 via-amber-800 to-amber-700",
  CATEQUESE: "from-emerald-900 via-emerald-800 to-emerald-700",
  PROJETO_SOCIAL: "from-purple-900 via-purple-800 to-purple-700",
  OUTRO: "from-slate-900 via-slate-800 to-slate-700",
}

const TIPO_ICON: Record<string, React.ElementType> = {
  MOVIMENTO: Users,
  PASTORAL: Heart,
  MINISTERIO: Church,
  CURSO: BookOpen,
  CATEQUESE: BookOpen,
  PROJETO_SOCIAL: HandHeart,
  OUTRO: Sparkles,
}

function getVagasStatus(formulario: Formulario | null) {
  if (!formulario || !formulario.ativo) return null
  const inscritos = formulario._count.inscricoes
  const vagas = formulario.vagas
  if (vagas === null) return { tipo: "aberta" as const, texto: "Inscrições abertas", inscritos }
  const restantes = vagas - inscritos
  if (restantes <= 0) return { tipo: "esgotada" as const, texto: "Vagas esgotadas", inscritos, restantes: 0, vagas }
  if (restantes <= Math.ceil(vagas * 0.2)) return { tipo: "ultimas" as const, texto: `Últimas vagas (${restantes} restantes)`, inscritos, restantes, vagas }
  return { tipo: "aberta" as const, texto: `${restantes} vagas disponíveis`, inscritos, restantes, vagas }
}

function isInscricoesAbertas(formulario: Formulario | null): boolean {
  if (!formulario || !formulario.ativo) return false
  const now = new Date()
  if (formulario.dataInicio && now < new Date(formulario.dataInicio)) return false
  if (formulario.dataFim && now > new Date(formulario.dataFim)) return false
  const status = getVagasStatus(formulario)
  if (!status || status.tipo === "esgotada") return false
  return true
}

// ─── Campo Dinâmico ───────────────────────────────────────────────────────────

function CampoDinamico({
  campo,
  value,
  onChange,
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
        <textarea
          rows={4}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder ?? ""}
          required={campo.obrigatorio}
          className={`${base} resize-none`}
        />
      )
    case "SELECT":
      return (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          required={campo.obrigatorio}
          className={base}
        >
          <option value="">Selecione...</option>
          {campo.opcoes.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      )
    case "CHECKBOX":
      return (
        <div className="space-y-2">
          {campo.opcoes.map((op) => (
            <label key={op} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(value as string[]).includes(op)}
                onChange={(e) => {
                  const arr = value as string[]
                  onChange(e.target.checked ? [...arr, op] : arr.filter((v) => v !== op))
                }}
                className="w-4 h-4 accent-parish-gold"
              />
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
              <input
                type="radio"
                name={campo.id}
                value={op}
                checked={value === op}
                onChange={() => onChange(op)}
                required={campo.obrigatorio}
                className="w-4 h-4 accent-parish-gold"
              />
              <span className="text-sm text-gray-700">{op}</span>
            </label>
          ))}
        </div>
      )
    case "EMAIL":
      return (
        <input
          type="email"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder ?? "seu@email.com"}
          required={campo.obrigatorio}
          className={base}
        />
      )
    case "TELEFONE":
      return (
        <input
          type="tel"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder ?? "(00) 00000-0000"}
          required={campo.obrigatorio}
          className={base}
        />
      )
    case "DATA":
      return (
        <input
          type="date"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          required={campo.obrigatorio}
          className={base}
        />
      )
    case "CPF":
      return (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder ?? "000.000.000-00"}
          required={campo.obrigatorio}
          className={base}
          maxLength={14}
        />
      )
    default:
      return (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder ?? ""}
          required={campo.obrigatorio}
          className={base}
        />
      )
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AtividadeDetalhes({ atividade }: { atividade: Atividade }) {
  const router = useRouter()

  const [showForm, setShowForm] = useState(false)
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>(() => {
    if (!atividade.formulario?.campos) return {}
    const init: Record<string, string | string[]> = {}
    atividade.formulario.campos.forEach((c) => {
      init[c.id] = c.tipo === "CHECKBOX" ? [] : ""
    })
    return init
  })
  const [submitting, setSubmitting] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroEnvio, setErroEnvio] = useState("")
  const [vagasAtualizadas, setVagasAtualizadas] = useState(
    atividade.formulario?._count.inscricoes ?? 0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!atividade.formulario) return
    setSubmitting(true)
    setErroEnvio("")
    try {
      const campos = atividade.formulario.campos
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
          formularioId: atividade.formulario.id,
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
      setSucesso(true)
      setShowForm(false)
      setVagasAtualizadas((v) => v + 1)
    } catch {
      setErroEnvio("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const formularioComVagas: Formulario | null = atividade.formulario
    ? { ...atividade.formulario, _count: { inscricoes: vagasAtualizadas } }
    : null

  const IconComp = TIPO_ICON[atividade.tipo] ?? Sparkles
  const gradient = TIPO_GRADIENT[atividade.tipo] ?? TIPO_GRADIENT.OUTRO
  const vagasStatus = getVagasStatus(formularioComVagas)
  const inscricoesAbertas = isInscricoesAbertas(formularioComVagas)

  return (
    <>
      {/* ─── Hero ─── */}
      <div className={`relative h-80 md:h-96 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {atividade.imagem && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${atividade.imagem}')` }}
          />
        )}
        {!atividade.imagem && atividade.cor && (
          <div className="absolute inset-0" style={{ background: atividade.cor }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

        {/* Breadcrumb */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Link href="/" className="hover:text-white transition">Início</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white/50">Atividades</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white truncate">{atividade.nome}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-12">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/25">
                {TIPO_LABEL[atividade.tipo]}
              </span>
              {vagasStatus && (
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                  vagasStatus.tipo === "esgotada"
                    ? "bg-red-500/90 text-white"
                    : vagasStatus.tipo === "ultimas"
                    ? "bg-amber-500/90 text-white"
                    : "bg-green-500/90 text-white"
                }`}>
                  {vagasStatus.texto}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                <IconComp className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-xl">
                {atividade.nome}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descrição */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {atividade.descricao}
              </p>
              {atividade.descricaoCompleta && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {atividade.descricaoCompleta}
                  </div>
                </div>
              )}
            </div>

            {/* Horários */}
            {atividade.horarios.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="font-playfair text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-parish-gold" /> Horários
                </h2>
                <ul className="space-y-2">
                  {atividade.horarios.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-parish-gold flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulário de Inscrição */}
            {atividade.aceitaInscricoes && atividade.formulario && (
              <div id="inscricao" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-parish-navy to-parish-navy-dark px-6 py-5">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-parish-gold" />
                    <h2 className="font-playfair text-xl font-bold text-white">
                      {atividade.formulario.titulo}
                    </h2>
                  </div>
                  {atividade.formulario.descricao && (
                    <p className="text-white/70 text-sm mt-2">
                      {atividade.formulario.descricao}
                    </p>
                  )}
                </div>

                <div className="p-6 md:p-8">
                  {sucesso && (
                    <div className="flex items-start gap-4 bg-green-50 border border-green-200 text-green-800 rounded-xl p-5">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Inscrição realizada com sucesso!</p>
                        <p className="text-sm mt-1 text-green-700">
                          Sua inscrição foi recebida e está em análise. Aguarde o contato da paróquia.
                        </p>
                      </div>
                    </div>
                  )}

                  {!inscricoesAbertas && !sucesso && (
                    <div className="text-center py-6">
                      {vagasStatus?.tipo === "esgotada" ? (
                        <div className="flex flex-col items-center gap-3">
                          <AlertCircle className="w-12 h-12 text-red-400" />
                          <p className="font-semibold text-gray-700">Vagas esgotadas</p>
                          <p className="text-sm text-gray-500">Todas as vagas foram preenchidas.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Calendar className="w-12 h-12 text-gray-400" />
                          <p className="font-semibold text-gray-700">Inscrições encerradas</p>
                          <p className="text-sm text-gray-500">
                            {atividade.formulario.dataFim && new Date() > new Date(atividade.formulario.dataFim)
                              ? "O prazo de inscrições foi encerrado."
                              : "As inscrições ainda não foram abertas."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {inscricoesAbertas && !sucesso && (
                    <>
                      {!showForm ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm mb-6">
                            Preencha o formulário abaixo para se inscrever.
                          </p>
                          <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <ClipboardList className="w-5 h-5" />
                            {atividade.textoBotao || "Inscreva-se agora"}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {erroEnvio && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                              <AlertCircle className="w-5 h-5 flex-shrink-0" />
                              {erroEnvio}
                            </div>
                          )}

                          {atividade.formulario.campos.map((campo) => (
                            <div key={campo.id}>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {campo.label}
                                {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <CampoDinamico
                                campo={campo}
                                value={respostas[campo.id] ?? (campo.tipo === "CHECKBOX" ? [] : "")}
                                onChange={(val) =>
                                  setRespostas((prev) => ({ ...prev, [campo.id]: val }))
                                }
                              />
                              {campo.instrucao && (
                                <p className="text-xs text-gray-500 mt-1.5">{campo.instrucao}</p>
                              )}
                            </div>
                          ))}

                          <div className="flex items-center gap-4 pt-2">
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
                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className="px-5 py-3.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Informações
              </h3>

              {atividade.local && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-parish-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Local</p>
                    <p className="text-gray-700 text-sm mt-0.5">{atividade.local}</p>
                  </div>
                </div>
              )}

              {atividade.responsavel && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-parish-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Responsável</p>
                    <p className="text-gray-700 text-sm mt-0.5">{atividade.responsavel}</p>
                  </div>
                </div>
              )}

              {atividade.contato && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-parish-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Contato</p>
                    <p className="text-gray-700 text-sm mt-0.5">{atividade.contato}</p>
                  </div>
                </div>
              )}

              {atividade.horarios.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-parish-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Horários</p>
                    <div className="mt-0.5 space-y-1">
                      {atividade.horarios.map((h, i) => (
                        <p key={i} className="text-gray-700 text-sm">{h}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!atividade.local && !atividade.responsavel && !atividade.contato && atividade.horarios.length === 0 && (
                <p className="text-sm text-gray-400 italic">Nenhuma informação adicional disponível.</p>
              )}
            </div>

            {/* Status de vagas */}
            {atividade.aceitaInscricoes && formularioComVagas && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">
                  Status das Inscrições
                </h3>
                {vagasStatus ? (
                  <div className="space-y-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                      vagasStatus.tipo === "esgotada"
                        ? "bg-red-100 text-red-700"
                        : vagasStatus.tipo === "ultimas"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {vagasStatus.tipo === "esgotada" ? "Vagas esgotadas" :
                       vagasStatus.tipo === "ultimas" ? "Últimas vagas" : "Inscrições abertas"}
                    </div>

                    {vagasStatus.vagas !== undefined && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              vagasStatus.tipo === "esgotada" ? "bg-red-500" :
                              vagasStatus.tipo === "ultimas" ? "bg-amber-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(100, (vagasStatus.inscritos / vagasStatus.vagas) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{vagasStatus.inscritos} inscritos</span>
                          <span>{vagasStatus.vagas} vagas total</span>
                        </div>
                      </>
                    )}

                    {!vagasStatus.vagas && (
                      <p className="text-sm text-gray-500">{vagasStatus.inscritos} inscritos</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Inscrições não disponíveis no momento.</p>
                )}

                {inscricoesAbertas && !sucesso && (
                  <button
                    onClick={() => {
                      setShowForm(true)
                      document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="mt-4 w-full py-3 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition text-sm"
                  >
                    {atividade.textoBotao || "Inscreva-se"}
                  </button>
                )}
              </div>
            )}

            {/* Voltar */}
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
