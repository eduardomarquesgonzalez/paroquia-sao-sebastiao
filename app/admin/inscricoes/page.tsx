"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ClipboardList, Search, Filter, Download, Eye, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, Users, ArrowLeft, RefreshCw, X, ChevronDown,
} from "lucide-react"

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface InscricaoItem {
  id: string
  nome: string | null
  email: string | null
  telefone: string | null
  status: "PENDENTE" | "APROVADO" | "CANCELADO"
  createdAt: string
  respostas: Record<string, unknown>
  formulario: {
    id: string
    titulo: string
    atividade: {
      id: string
      nome: string
      slug: string
    }
  }
}

interface PaginatedResponse {
  inscricoes: InscricaoItem[]
  total: number
  page: number
  totalPages: number
}

// ─── Utilitários ───────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  CANCELADO: "Cancelado",
}

const STATUS_STYLE: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700 border-amber-200",
  APROVADO: "bg-green-100 text-green-700 border-green-200",
  CANCELADO: "bg-red-100 text-red-700 border-red-200",
}

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDENTE: Clock,
  APROVADO: CheckCircle2,
  CANCELADO: XCircle,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Modal de detalhes ─────────────────────────────────────────────────────────

function InscricaoModal({
  inscricao,
  onClose,
  onStatusChange,
}: {
  inscricao: InscricaoItem
  onClose: () => void
  onStatusChange: (id: string, status: string) => Promise<void>
}) {
  const [changing, setChanging] = useState(false)

  const handleStatus = async (status: string) => {
    setChanging(true)
    await onStatusChange(inscricao.id, status)
    setChanging(false)
    onClose()
  }

  const respostas = inscricao.respostas as Record<string, unknown>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800">Detalhes da Inscrição</h2>
            <p className="text-xs text-gray-500 mt-0.5">{inscricao.formulario.titulo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Info básica */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Atividade</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{inscricao.formulario.atividade.nome}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Data</p>
              <p className="text-sm text-gray-700 mt-0.5">{formatDate(inscricao.createdAt)}</p>
            </div>
            {inscricao.nome && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nome</p>
                <p className="text-sm text-gray-700 mt-0.5">{inscricao.nome}</p>
              </div>
            )}
            {inscricao.email && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">E-mail</p>
                <p className="text-sm text-gray-700 mt-0.5 truncate">{inscricao.email}</p>
              </div>
            )}
            {inscricao.telefone && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Telefone</p>
                <p className="text-sm text-gray-700 mt-0.5">{inscricao.telefone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full border ${STATUS_STYLE[inscricao.status]}`}>
                {STATUS_LABEL[inscricao.status]}
              </span>
            </div>
          </div>

          {/* Respostas */}
          {Object.keys(respostas).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Respostas do formulário</h3>
              <div className="space-y-3">
                {Object.entries(respostas).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">{key}</p>
                    <p className="text-sm text-gray-800 mt-0.5">
                      {Array.isArray(val) ? val.join(", ") : String(val || "—")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">Alterar status:</p>
          <div className="flex items-center gap-2">
            {["APROVADO", "PENDENTE", "CANCELADO"].map((s) => (
              <button
                key={s}
                disabled={changing || inscricao.status === s}
                onClick={() => handleStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  inscricao.status === s
                    ? STATUS_STYLE[s] + " cursor-default"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Página Principal ──────────────────────────────────────────────────────────

export default function InscricoesAdminPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedInscricao, setSelectedInscricao] = useState<InscricaoItem | null>(null)

  const fetchInscricoes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)

      const res = await fetch(`/api/inscricoes?${params}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error("Erro ao carregar inscrições")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchInscricoes() }, [fetchInscricoes])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/inscricoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Status alterado para ${STATUS_LABEL[status]}`)
      // Atualizar localmente
      setData((prev) =>
        prev
          ? {
              ...prev,
              inscricoes: prev.inscricoes.map((i) =>
                i.id === id ? { ...i, status: status as InscricaoItem["status"] } : i
              ),
            }
          : prev
      )
      if (selectedInscricao?.id === id) {
        setSelectedInscricao((prev) =>
          prev ? { ...prev, status: status as InscricaoItem["status"] } : prev
        )
      }
    } catch {
      toast.error("Erro ao alterar status")
    }
  }

  const exportCSV = () => {
    if (!data?.inscricoes.length) { toast.error("Nenhuma inscrição para exportar"); return }
    const rows = [
      ["ID", "Nome", "E-mail", "Telefone", "Atividade", "Status", "Data"],
      ...data.inscricoes.map((i) => [
        i.id,
        i.nome ?? "",
        i.email ?? "",
        i.telefone ?? "",
        i.formulario.atividade.nome,
        STATUS_LABEL[i.status],
        formatDate(i.createdAt),
      ]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inscricoes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exportado com sucesso")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch("")
    setSearchInput("")
    setStatusFilter("")
    setPage(1)
  }

  const hasFilters = search || statusFilter

  // Stats locais
  const pendentes = data?.inscricoes.filter((i) => i.status === "PENDENTE").length ?? 0
  const aprovados = data?.inscricoes.filter((i) => i.status === "APROVADO").length ?? 0
  const cancelados = data?.inscricoes.filter((i) => i.status === "CANCELADO").length ?? 0

  return (
    <div className="space-y-6">
      {/* Modal */}
      {selectedInscricao && (
        <InscricaoModal
          inscricao={selectedInscricao}
          onClose={() => setSelectedInscricao(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/atividades" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Inscrições</h1>
            <p className="text-parish-text-light mt-1 text-sm">
              Gerencie as inscrições recebidas pelas atividades
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInscricoes}
            className="flex items-center gap-2 px-3 py-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition text-sm"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <Link
            href="/admin/atividades"
            className="flex items-center gap-2 px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition text-sm"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Atividades</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Total (página)
          </p>
          <p className="text-2xl font-bold text-parish-text mt-1">{data?.total ?? 0}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-amber-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Pendentes
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendentes}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Aprovados
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">{aprovados}</p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Cancelados
          </p>
          <p className="text-2xl font-bold text-red-500 mt-1">{cancelados}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parish-secondary" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone..."
                className="w-full pl-9 pr-4 py-2.5 border border-parish-border rounded-lg text-sm focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-parish-gold text-white rounded-lg text-sm hover:bg-parish-gold-dark transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parish-secondary" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="pl-9 pr-8 py-2.5 border border-parish-border rounded-lg text-sm focus:ring-2 focus:ring-parish-gold outline-none bg-white appearance-none cursor-pointer"
              >
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-parish-secondary pointer-events-none" />
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                <X className="w-4 h-4" /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-parish-surface rounded-lg border border-parish-primary overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-parish-primary/50 animate-pulse bg-parish-primary/10" />
          ))}
        </div>
      ) : !data?.inscricoes.length ? (
        <div className="bg-parish-surface rounded-lg shadow-sm p-16 text-center border border-parish-primary">
          <ClipboardList className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
          <p className="text-parish-text-light text-lg font-medium">Nenhuma inscrição encontrada</p>
          <p className="text-parish-secondary text-sm mt-2">
            {hasFilters ? "Tente ajustar os filtros de busca." : "As inscrições aparecerão aqui quando forem enviadas."}
          </p>
        </div>
      ) : (
        <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-parish-primary bg-parish-background">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                    Inscrito
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                    Atividade
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                    Data
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.inscricoes.map((inscricao, i) => {
                  const StatusIcon = STATUS_ICON[inscricao.status]
                  return (
                    <tr
                      key={inscricao.id}
                      className={`border-b border-parish-primary/50 hover:bg-parish-background/50 transition ${
                        i % 2 === 0 ? "" : "bg-parish-background/30"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-parish-text">
                          {inscricao.nome || "—"}
                        </p>
                        {inscricao.email && (
                          <p className="text-xs text-parish-secondary truncate max-w-[180px]">
                            {inscricao.email}
                          </p>
                        )}
                        {inscricao.telefone && (
                          <p className="text-xs text-parish-secondary">{inscricao.telefone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-parish-text font-medium line-clamp-1">
                          {inscricao.formulario.atividade.nome}
                        </p>
                        <p className="text-xs text-parish-secondary">{inscricao.formulario.titulo}</p>
                      </td>
                      <td className="px-4 py-3 text-parish-text-light whitespace-nowrap">
                        {formatDate(inscricao.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLE[inscricao.status]}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {STATUS_LABEL[inscricao.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInscricao(inscricao)}
                            className="flex items-center gap-1 text-sm text-parish-gold hover:text-parish-gold-dark transition"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-parish-primary/50">
            {data.inscricoes.map((inscricao) => {
              const StatusIcon = STATUS_ICON[inscricao.status]
              return (
                <div key={inscricao.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-parish-text">
                        {inscricao.nome || "Sem nome"}
                      </p>
                      <p className="text-xs text-parish-secondary">{inscricao.formulario.atividade.nome}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border flex-shrink-0 ${STATUS_STYLE[inscricao.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {STATUS_LABEL[inscricao.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-parish-secondary">{formatDate(inscricao.createdAt)}</p>
                    <button
                      onClick={() => setSelectedInscricao(inscricao)}
                      className="flex items-center gap-1 text-sm text-parish-gold"
                    >
                      <Eye className="w-4 h-4" /> Ver detalhes
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Paginação */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-parish-text-light">
            Mostrando {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} de {data.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-parish-text px-2">
              {page} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
