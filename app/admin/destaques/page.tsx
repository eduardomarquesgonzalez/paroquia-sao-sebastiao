"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Megaphone, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Destaque {
  id: string
  title: string | null
  image: string | null
  linkUrl: string | null
  active: boolean
  order: number
  expiresAt: string | null
  createdAt: string
}

function statusBadge(d: Destaque) {
  const now = new Date()
  if (d.expiresAt && new Date(d.expiresAt) < now)
    return <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Expirado</span>
  if (!d.active)
    return <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">Inativo</span>
  if (d.expiresAt && new Date(d.expiresAt) > now && new Date(d.createdAt) > now)
    return <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Agendado</span>
  return <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Ativo</span>
}

export default function DestaquesAdminPage() {
  const [destaques, setDestaques] = useState<Destaque[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDestaques() }, [])

  async function fetchDestaques() {
    try {
      setLoading(true)
      const r = await fetch("/api/destaques")
      if (!r.ok) throw new Error()
      setDestaques(await r.json())
    } catch {
      toast.error("Erro ao carregar destaques")
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(d: Destaque) {
    try {
      const r = await fetch(`/api/destaques/${d.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !d.active }),
      })
      if (!r.ok) throw new Error()
      setDestaques((prev) => prev.map((x) => x.id === d.id ? { ...x, active: !x.active } : x))
      toast.success(d.active ? "Destaque desativado" : "Destaque ativado")
    } catch {
      toast.error("Erro ao atualizar destaque")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este destaque?")) return
    try {
      const r = await fetch(`/api/destaques/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error()
      setDestaques((prev) => prev.filter((x) => x.id !== id))
      toast.success("Destaque excluído")
    } catch {
      toast.error("Erro ao excluir destaque")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-parish-text">Destaques</h1>
          <p className="text-parish-text-light mt-1">Banners exibidos na página inicial após o Hero</p>
        </div>
        <Link
          href="/admin/destaques/novo"
          className="bg-parish-gold text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-parish-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Destaque</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Total</p>
          <p className="text-2xl font-bold text-parish-text mt-1">{destaques.length}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Ativos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {destaques.filter((d) => d.active && (!d.expiresAt || new Date(d.expiresAt) > new Date())).length}
          </p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Inativos</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">
            {destaques.filter((d) => !d.active).length}
          </p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Expirados</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">
            {destaques.filter((d) => d.expiresAt && new Date(d.expiresAt) < new Date()).length}
          </p>
        </div>
      </div>

      {/* List */}
      {destaques.length === 0 ? (
        <div className="bg-parish-surface rounded-lg shadow-sm p-12 text-center border border-parish-primary">
          <Megaphone className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
          <p className="text-parish-text-light mb-2">Nenhum destaque cadastrado</p>
          <Link href="/admin/destaques/novo" className="text-parish-gold hover:text-parish-gold-dark text-sm">
            Criar seu primeiro destaque
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destaques.map((d) => (
            <div
              key={d.id}
              className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden hover:shadow-md transition"
            >
              {/* Thumb */}
              <div className="h-40 bg-parish-primary relative overflow-hidden">
                {d.image ? (
                  <img src={d.image} alt={d.title ?? "Destaque"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-parish-navy to-parish-navy-dark">
                    <Megaphone className="w-12 h-12 text-white/20" />
                  </div>
                )}
                {/* Status overlay */}
                <div className="absolute top-2 left-2">{statusBadge(d)}</div>
                {/* Order badge */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  #{d.order}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-parish-text line-clamp-1">
                  {d.title ?? <span className="text-parish-text-light italic">Sem título</span>}
                </h3>

                {d.linkUrl && (
                  <a
                    href={d.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-parish-gold hover:underline truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{d.linkUrl}</span>
                  </a>
                )}

                {d.expiresAt && (
                  <p className="flex items-center gap-1 text-xs text-parish-text-light">
                    <Calendar className="w-3 h-3" />
                    Expira: {new Date(d.expiresAt).toLocaleDateString("pt-BR")}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-parish-border">
                  <button
                    onClick={() => toggleActive(d)}
                    className="flex items-center gap-1.5 text-xs font-medium transition"
                  >
                    {d.active ? (
                      <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Ativo</span></>
                    ) : (
                      <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-500">Inativo</span></>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/destaques/${d.id}/editar`}
                      className="p-1.5 text-parish-text-light hover:text-parish-gold transition"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 text-parish-text-light hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
