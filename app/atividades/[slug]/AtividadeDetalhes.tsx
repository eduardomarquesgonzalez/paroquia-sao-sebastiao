"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, MapPin, Clock, Phone, User, Users, Heart, Church,
  BookOpen, HandHeart, Sparkles, ClipboardList, ChevronRight,
  AlertCircle, Calendar, CheckCircle2, ArrowRight,
} from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormularioResumo {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  vagas: number | null
  dataInicio: string | null
  dataFim: string | null
  ativo: boolean
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
  formularios: FormularioResumo[]
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

function getVagasInfo(f: FormularioResumo) {
  const inscritos = f._count.inscricoes
  if (!f.vagas) return { tipo: "aberta" as const, texto: "Inscrições abertas", inscritos }
  const restantes = f.vagas - inscritos
  if (restantes <= 0) return { tipo: "esgotada" as const, texto: "Vagas esgotadas", inscritos, restantes: 0, total: f.vagas }
  if (restantes <= Math.ceil(f.vagas * 0.2))
    return { tipo: "ultimas" as const, texto: `Últimas ${restantes} vagas`, inscritos, restantes, total: f.vagas }
  return { tipo: "aberta" as const, texto: `${restantes} vagas`, inscritos, restantes, total: f.vagas }
}

function isAberto(f: FormularioResumo): boolean {
  if (!f.ativo) return false
  const now = new Date()
  if (f.dataInicio && now < new Date(f.dataInicio)) return false
  if (f.dataFim && now > new Date(f.dataFim)) return false
  const info = getVagasInfo(f)
  return info.tipo !== "esgotada"
}

// ─── Card de Formulário ───────────────────────────────────────────────────────

function FormularioCard({ formulario, atividadeSlug }: { formulario: FormularioResumo; atividadeSlug: string }) {
  const aberto = isAberto(formulario)
  const vagas = getVagasInfo(formulario)

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                vagas.tipo === "esgotada"
                  ? "bg-red-100 text-red-700"
                  : vagas.tipo === "ultimas"
                  ? "bg-amber-100 text-amber-700"
                  : aberto
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {aberto ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {vagas.tipo === "esgotada" ? "Vagas esgotadas" :
                 !aberto ? "Inscrições encerradas" :
                 vagas.texto}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-base group-hover:text-parish-navy transition-colors">
              {formulario.titulo}
            </h3>
            {formulario.descricao && (
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{formulario.descricao}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              {formulario.dataInicio && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(formulario.dataInicio).toLocaleDateString("pt-BR")}
                  {formulario.dataFim && ` até ${new Date(formulario.dataFim).toLocaleDateString("pt-BR")}`}
                </span>
              )}
              {formulario.vagas && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {vagas.inscritos}/{formulario.vagas}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {aberto ? (
              <Link
                href={`/atividades/${atividadeSlug}/${formulario.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-parish-gold text-white text-sm font-semibold rounded-xl hover:bg-parish-gold-dark transition-all shadow-sm hover:shadow-md"
              >
                Inscrever-se
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/atividades/${atividadeSlug}/${formulario.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-all"
              >
                Ver detalhes
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Barra de progresso de vagas */}
        {formulario.vagas && vagas.total && (
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  vagas.tipo === "esgotada" ? "bg-red-500" :
                  vagas.tipo === "ultimas" ? "bg-amber-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, (vagas.inscritos / vagas.total) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AtividadeDetalhes({ atividade }: { atividade: Atividade }) {
  const router = useRouter()

  const IconComp = TIPO_ICON[atividade.tipo] ?? Sparkles
  const gradient = TIPO_GRADIENT[atividade.tipo] ?? TIPO_GRADIENT.OUTRO
  const formulariosAtivos = atividade.formularios.filter(isAberto)
  const formulariosEncerrados = atividade.formularios.filter((f) => !isAberto(f))

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
              {formulariosAtivos.length > 0 && (
                <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-500/90 text-white">
                  {formulariosAtivos.length === 1 ? "Inscrições abertas" : `${formulariosAtivos.length} inscrições abertas`}
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

            {/* Formulários / Inscrições */}
            {atividade.aceitaInscricoes && atividade.formularios.length > 0 && (
              <div id="inscricoes" className="space-y-4">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-parish-gold" />
                  <h2 className="font-playfair text-xl font-bold text-gray-800">
                    Inscrições disponíveis
                  </h2>
                </div>

                {formulariosAtivos.length > 0 && (
                  <div className="space-y-3">
                    {formulariosAtivos.map((f) => (
                      <FormularioCard key={f.id} formulario={f} atividadeSlug={atividade.slug} />
                    ))}
                  </div>
                )}

                {formulariosEncerrados.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Encerradas
                    </p>
                    {formulariosEncerrados.map((f) => (
                      <FormularioCard key={f.id} formulario={f} atividadeSlug={atividade.slug} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Link externo */}
            {atividade.linkExterno && !atividade.aceitaInscricoes && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <a
                  href={atividade.linkExterno}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition shadow-md"
                >
                  {atividade.textoBotao || "Saiba mais"}
                  <ArrowRight className="w-4 h-4" />
                </a>
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

            {/* Resumo de inscrições */}
            {atividade.aceitaInscricoes && atividade.formularios.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">
                  Inscrições
                </h3>
                <div className="space-y-2">
                  {atividade.formularios.map((f) => {
                    const aberto = isAberto(f)
                    return (
                      <Link
                        key={f.id}
                        href={`/atividades/${atividade.slug}/${f.slug}`}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-parish-navy transition group"
                      >
                        <span className="text-sm text-gray-700 group-hover:text-parish-navy truncate pr-2">
                          {f.titulo}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          aberto ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {aberto ? "Aberto" : "Encerrado"}
                        </span>
                      </Link>
                    )
                  })}
                </div>
                {formulariosAtivos.length > 0 && (
                  <Link
                    href={`/atividades/${atividade.slug}/${formulariosAtivos[0].slug}`}
                    className="mt-4 block w-full text-center py-3 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition text-sm"
                  >
                    {atividade.textoBotao || "Inscreva-se"}
                  </Link>
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
