"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft, Plus, ClipboardList, Users, Calendar, ToggleLeft,
  ToggleRight, Trash2, ChevronRight, ExternalLink,
} from "lucide-react"

interface FormularioItem {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  ativo: boolean
  vagas: number | null
  dataInicio: string | null
  dataFim: string | null
  _count: { inscricoes: number }
}

export default function ListaFormulariosPage() {
  const params = useParams()
  const id = params.id as string

  const [atividadeNome, setAtividadeNome] = useState("")
  const [atividadeSlug, setAtividadeSlug] = useState("")
  const [formularios, setFormularios] = useState<FormularioItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [atRes, fRes] = await Promise.all([
        fetch(`/api/atividades/${id}`),
        fetch(`/api/atividades/${id}/formularios`),
      ])
      const at = await atRes.json()
      const fs = await fRes.json()
      setAtividadeNome(at.nome ?? "Atividade")
      setAtividadeSlug(at.slug ?? "")
      setFormularios(fs)
    } catch {
      toast.error("Erro ao carregar formulários")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleToggle = async (formularioId: string, ativo: boolean) => {
    try {
      await fetch(`/api/atividades/${id}/formularios/${formularioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      })
      setFormularios((prev) =>
        prev.map((f) => (f.id === formularioId ? { ...f, ativo: !ativo } : f))
      )
    } catch { toast.error("Erro ao atualizar") }
  }

  const handleDelete = async (formularioId: string) => {
    if (!confirm("Excluir este formulário? Todas as inscrições vinculadas serão perdidas.")) return
    try {
      await fetch(`/api/atividades/${id}/formularios/${formularioId}`, { method: "DELETE" })
      setFormularios((prev) => prev.filter((f) => f.id !== formularioId))
      toast.success("Formulário excluído")
    } catch { toast.error("Erro ao excluir") }
  }

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
          <Link href={`/admin/atividades/${id}/editar`} className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Formulários</h1>
            <p className="text-parish-text-light mt-1 text-sm">{atividadeNome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {atividadeSlug && (
            <Link
              href={`/atividades/${atividadeSlug}`}
              target="_blank"
              className="px-4 py-2 border border-parish-border text-parish-text-light rounded-lg hover:bg-parish-background transition text-sm flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver no site
            </Link>
          )}
          <Link
            href={`/admin/atividades/${id}/formularios/novo`}
            className="flex items-center gap-2 px-5 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition font-semibold text-sm"
          >
            <Plus className="w-4 h-4" /> Novo formulário
          </Link>
        </div>
      </div>

      {/* Lista */}
      {formularios.length === 0 ? (
        <div className="bg-parish-surface rounded-lg border border-parish-primary p-12 text-center">
          <ClipboardList className="w-12 h-12 text-parish-secondary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-parish-text mb-1">Nenhum formulário criado</h3>
          <p className="text-parish-secondary text-sm mb-5">
            Crie formulários de inscrição independentes para esta atividade.
          </p>
          <Link
            href={`/admin/atividades/${id}/formularios/novo`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition font-semibold"
          >
            <Plus className="w-4 h-4" /> Criar formulário
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {formularios.map((f) => {
            const totalVagas = f.vagas ?? null
            const inscritos = f._count.inscricoes
            const restantes = totalVagas ? totalVagas - inscritos : null

            return (
              <div key={f.id} className="bg-parish-surface rounded-lg border border-parish-primary p-5 hover:border-parish-gold/30 transition">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-parish-text">{f.titulo}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        f.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {f.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    {f.descricao && (
                      <p className="text-sm text-parish-secondary mb-2 line-clamp-1">{f.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-parish-secondary flex-wrap">
                      <span className="font-mono bg-parish-background px-2 py-0.5 rounded border border-parish-border">
                        /{f.slug}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {inscritos} inscrição{inscritos !== 1 ? "ões" : ""}
                        {totalVagas && ` / ${totalVagas} vagas`}
                      </span>
                      {f.dataInicio && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(f.dataInicio).toLocaleDateString("pt-BR")}
                          {f.dataFim && ` — ${new Date(f.dataFim).toLocaleDateString("pt-BR")}`}
                        </span>
                      )}
                    </div>

                    {/* Barra de vagas */}
                    {totalVagas && (
                      <div className="mt-3 w-full max-w-xs bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            restantes !== null && restantes <= 0 ? "bg-red-500" :
                            restantes !== null && restantes <= Math.ceil(totalVagas * 0.2) ? "bg-amber-500" :
                            "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, (inscritos / totalVagas) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/inscricoes?formularioId=${f.id}`}
                      className="p-2 text-parish-text-light hover:text-parish-gold hover:bg-parish-background rounded-lg transition"
                      title="Ver inscrições"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleToggle(f.id, f.ativo)}
                      className={`p-2 rounded-lg transition ${f.ativo ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
                      title={f.ativo ? "Desativar" : "Ativar"}
                    >
                      {f.ativo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <Link
                      href={`/admin/atividades/${id}/formularios/${f.id}/editar`}
                      className="p-2 text-parish-text-light hover:text-parish-text hover:bg-parish-background rounded-lg transition"
                      title="Editar"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
