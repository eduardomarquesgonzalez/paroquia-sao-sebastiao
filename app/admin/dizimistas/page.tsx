"use client"

import { useEffect, useState, useCallback } from "react"
import Link                                 from "next/link"
import {
  Heart, Search, Users, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Loader2, TrendingUp,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DizimistaSummary {
  id:               string
  active:           boolean
  registrationDate: string
  contributionCount: number
  totalPaid:        number
  user: {
    id:    string
    name:  string | null
    email: string
    phone: string | null
    cpf:   string | null
  }
}

interface ApiResponse {
  items: DizimistaSummary[]
  total: number
  page:  number
  pages: number
}

export default function AdminDizimistasPage() {
  const [data,    setData]    = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [status,  setStatus]  = useState("")
  const [page,    setPage]    = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (status) params.set("status", status)
    params.set("page", String(page))

    try {
      const res  = await fetch(`/api/admin/dizimistas?${params}`)
      const json = await res.json()
      setData(json)
    } catch {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { fetchData() }, [fetchData])

  // Reset página ao mudar filtros
  useEffect(() => { setPage(1) }, [search, status])

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-parish-text">Dizimistas</h1>
          <p className="text-sm text-parish-text-light mt-0.5">
            {data ? `${data.total} cadastro${data.total !== 1 ? "s" : ""}` : "Carregando..."}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-parish-surface rounded-xl border border-parish-border p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parish-text-light" />
          <input
            type="text"
            placeholder="Nome, e-mail ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold bg-white"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-parish-surface rounded-xl border border-parish-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-parish-gold animate-spin" />
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-parish-text-light/30 mb-3" />
            <p className="text-sm text-parish-text-light">Nenhum dizimista encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-parish-border bg-parish-background">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                    Fiel
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide hidden md:table-cell">
                    CPF
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide hidden lg:table-cell">
                    Total pago
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide hidden lg:table-cell">
                    Contribuições
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-parish-border">
                {data.items.map((d) => (
                  <tr key={d.id} className="hover:bg-parish-background transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-parish-text">{d.user.name ?? "—"}</p>
                      <p className="text-xs text-parish-text-light">{d.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-parish-text-light hidden md:table-cell">
                      {d.user.cpf ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {formatCurrency(d.totalPaid)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-parish-text-light hidden lg:table-cell">
                      {d.contributionCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {d.active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-gray-500 bg-gray-50 border border-gray-200">
                          <XCircle className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/dizimistas/${d.id}`}
                        className="text-xs text-parish-gold font-medium hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-parish-text-light">
            Página {data.page} de {data.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-parish-border text-xs text-parish-text hover:bg-parish-background disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-parish-border text-xs text-parish-text hover:bg-parish-background disabled:opacity-40"
            >
              Próxima <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
