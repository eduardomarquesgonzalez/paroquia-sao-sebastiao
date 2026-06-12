"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Plus, Edit, Trash2, Compass, ToggleLeft, ToggleRight,
  ClipboardList, Users, Heart, Church, BookOpen, HandHeart, Sparkles, Navigation,
} from "lucide-react"

interface Atividade {
  id: string
  nome: string
  slug: string
  descricao: string
  tipo: string
  imagem: string | null
  cor: string | null
  active: boolean
  aceitaInscricoes: boolean
  showInNavbar: boolean
  navbarOrder: number
  order: number
  formularios: {
    id: string
    titulo: string
    ativo: boolean
  }[]
}

const TIPO_LABELS: Record<string, string> = {
  MOVIMENTO: "Movimento",
  PASTORAL: "Pastoral",
  MINISTERIO: "Ministério",
  CURSO: "Curso",
  CATEQUESE: "Catequese",
  PROJETO_SOCIAL: "Projeto Social",
  OUTRO: "Outro",
}

const TIPO_GRADIENT: Record<string, string> = {
  MOVIMENTO: "from-blue-700 via-blue-600 to-blue-500",
  PASTORAL: "from-rose-700 via-rose-600 to-rose-500",
  MINISTERIO: "from-indigo-700 via-indigo-600 to-indigo-500",
  CURSO: "from-amber-700 via-amber-600 to-amber-500",
  CATEQUESE: "from-emerald-700 via-emerald-600 to-emerald-500",
  PROJETO_SOCIAL: "from-purple-700 via-purple-600 to-purple-500",
  OUTRO: "from-gray-600 via-gray-500 to-gray-400",
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

export default function AtividadesAdminPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchAtividades = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/atividades")
      if (!res.ok) throw new Error()
      setAtividades(await res.json())
    } catch {
      toast.error("Erro ao carregar atividades")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAtividades() }, [fetchAtividades])

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setToggling(id)
    try {
      const res = await fetch(`/api/atividades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      })
      if (!res.ok) throw new Error()
      setAtividades((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !currentActive } : a))
      )
      toast.success(currentActive ? "Atividade desativada" : "Atividade ativada")
    } catch {
      toast.error("Erro ao alterar status")
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      const res = await fetch(`/api/atividades/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setAtividades((prev) => prev.filter((a) => a.id !== id))
      toast.success("Atividade excluída")
    } catch {
      toast.error("Erro ao excluir atividade")
    }
  }

  const total = atividades.length
  const ativos = atividades.filter((a) => a.active).length
  const comInscricoes = atividades.filter((a) => a.aceitaInscricoes && a.formularios.some((f) => f.ativo)).length
  const totalInscricoes = 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Atividades</h1>
            <p className="text-parish-text-light mt-1">Movimentos, pastorais e atividades paroquiais</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-parish-surface rounded-lg p-4 border border-parish-primary animate-pulse h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="bg-parish-surface rounded-lg border border-parish-primary overflow-hidden animate-pulse">
              <div className="h-36 bg-parish-primary/40" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-parish-primary/30 rounded w-2/3" />
                <div className="h-3 bg-parish-primary/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-parish-text">Atividades</h1>
          <p className="text-parish-text-light mt-1">Movimentos, pastorais e atividades paroquiais</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inscricoes"
            className="flex items-center gap-2 px-4 py-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition text-sm"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Inscrições ({totalInscricoes})</span>
          </Link>
          <Link
            href="/admin/atividades/novo"
            className="bg-parish-gold text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-parish-gold-dark transition"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Atividade</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Total
          </p>
          <p className="text-2xl font-bold text-parish-text mt-1">{total}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Ativas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{ativos}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Inscrições abertas</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{comInscricoes}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Total inscrições</p>
          <p className="text-2xl font-bold text-parish-gold mt-1">{totalInscricoes}</p>
        </div>
      </div>

      {/* Grid */}
      {atividades.length === 0 ? (
        <div className="col-span-full bg-parish-surface rounded-lg shadow-sm p-12 text-center border border-parish-primary">
          <Compass className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
          <p className="text-parish-text-light mb-2">Nenhuma atividade cadastrada</p>
          <Link href="/admin/atividades/novo" className="text-parish-gold hover:text-parish-gold-dark text-sm">
            Criar primeira atividade
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {atividades.map((a) => {
            const IconComp = TIPO_ICON[a.tipo] ?? Sparkles
            const gradient = TIPO_GRADIENT[a.tipo] ?? TIPO_GRADIENT.OUTRO
            const formAtivos = a.formularios.filter((f) => f.ativo).length

            return (
              <div
                key={a.id}
                className={`bg-parish-surface rounded-lg border overflow-hidden transition hover:shadow-md ${
                  a.active ? "border-parish-primary" : "border-gray-200 opacity-70"
                }`}
              >
                {/* Image / Gradient */}
                <div className="relative h-36 overflow-hidden">
                  {a.imagem ? (
                    <img
                      src={a.imagem}
                      alt={a.nome}
                      className={`w-full h-full object-cover ${!a.active ? "grayscale" : ""}`}
                    />
                  ) : a.cor ? (
                    <div className="w-full h-full" style={{ background: a.cor }} />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <IconComp className="w-10 h-10 text-white/50" />
                    </div>
                  )}

                  {/* Tipo badge */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/90 text-parish-navy-dark shadow">
                      {TIPO_LABELS[a.tipo] ?? a.tipo}
                    </span>
                  </div>

                  {/* Badges superiores direitos */}
                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {a.showInNavbar && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-parish-navy text-white shadow">
                        <Navigation className="w-3 h-3" />
                        Navbar
                      </span>
                    )}
                    {a.aceitaInscricoes && a.formularios.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-parish-gold text-white shadow">
                        <ClipboardList className="w-3 h-3" />
                        {a.formularios.length} form.
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-parish-text text-base mb-1 line-clamp-1">{a.nome}</h3>
                  <p className="text-xs text-parish-text-light line-clamp-2 mb-3">{a.descricao}</p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-parish-primary">
                    <button
                      onClick={() => handleToggleActive(a.id, a.active)}
                      disabled={toggling === a.id}
                      className="flex items-center gap-1.5 text-sm text-parish-text-light hover:text-parish-text transition disabled:opacity-50"
                      title={a.active ? "Desativar" : "Ativar"}
                    >
                      {a.active ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-xs">{a.active ? "Ativo" : "Inativo"}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/atividades/${a.id}/editar`}
                        className="flex items-center gap-1 text-parish-gold hover:text-parish-gold-dark transition text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(a.id, a.nome)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
