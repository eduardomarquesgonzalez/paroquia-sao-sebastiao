"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Users, Plus, Search, ChevronLeft, ChevronRight,
  Shield, UserCheck, UserX, Clock, Edit2,
} from "lucide-react"
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/permissions"

interface User {
  id:        string
  name:      string | null
  email:     string
  role:      string
  status:    string
  phone:     string | null
  createdAt: string
}

interface PageData {
  users: User[]
  total: number
  pages: number
  page:  number
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  ADMIN:       "bg-parish-navy/10 text-parish-navy",
  FINANCE:     "bg-emerald-100 text-emerald-700",
  SECRETARY:   "bg-blue-100 text-blue-700",
  COORDINATOR: "bg-purple-100 text-purple-700",
  DIZIMISTA:   "bg-yellow-100 text-yellow-700",
  EDITOR:      "bg-gray-100 text-gray-600",
  USER:        "bg-gray-100 text-gray-600",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  ACTIVE:               <UserCheck className="w-3.5 h-3.5 text-emerald-500" />,
  INACTIVE:             <UserX    className="w-3.5 h-3.5 text-gray-400" />,
  SUSPENDED:            <UserX    className="w-3.5 h-3.5 text-red-500" />,
  PENDING_VERIFICATION: <Clock    className="w-3.5 h-3.5 text-yellow-500" />,
}

const STATUS_TEXT: Record<string, string> = {
  ACTIVE:               "text-emerald-600",
  INACTIVE:             "text-gray-400",
  SUSPENDED:            "text-red-600",
  PENDING_VERIFICATION: "text-yellow-600",
}

export default function UsuariosPage() {
  const [data,    setData]    = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [role,    setRole]    = useState("")
  const [status,  setStatus]  = useState("")
  const [page,    setPage]    = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams({
      page:   String(page),
      limit:  "20",
      search, role, status,
    })
    const res  = await fetch(`/api/admin/usuarios?${qs}`)
    const json = await res.json() as PageData
    setData(json)
    setLoading(false)
  }, [page, search, role, status])

  useEffect(() => { void load() }, [load])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, role, status])

  const stats = {
    total:   data?.total ?? 0,
    active:  data?.users.filter((u) => u.status === "ACTIVE").length ?? 0,
    admins:  data?.users.filter((u) => ["SUPER_ADMIN", "ADMIN"].includes(u.role)).length ?? 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-parish-navy/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-parish-navy" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-parish-text">Usuários</h1>
            <p className="text-parish-text-light text-sm">Gestão de contas e permissões</p>
          </div>
        </div>
        <Link href="/admin/usuarios/novo"
          className="flex items-center gap-1.5 px-4 py-2 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition">
          <Plus className="w-4 h-4" /> Novo usuário
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",         value: data?.total ?? "—",   icon: <Users className="w-4 h-4 text-parish-navy" /> },
          { label: "Ativos",        value: stats.active,          icon: <UserCheck className="w-4 h-4 text-emerald-500" /> },
          { label: "Administradores", value: stats.admins,        icon: <Shield className="w-4 h-4 text-parish-gold" /> },
        ].map((s) => (
          <div key={s.label} className="bg-parish-surface rounded-lg border border-parish-border p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-parish-background rounded-lg flex items-center justify-center">{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-parish-text">{s.value}</p>
              <p className="text-xs text-parish-text-light">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-parish-surface rounded-lg border border-parish-border p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parish-text-light" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold">
          <option value="">Todos os perfis</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-parish-surface rounded-lg border border-parish-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parish-gold" />
          </div>
        ) : !data?.users.length ? (
          <div className="text-center py-16 text-parish-text-light">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-parish-background border-b border-parish-border">
                <tr>
                  {["Usuário", "Perfil", "Status", "Telefone", "Desde", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-parish-text-light uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-parish-border">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-parish-background/50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-parish-text">{user.name ?? "—"}</p>
                        <p className="text-xs text-parish-text-light">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${STATUS_TEXT[user.status] ?? "text-gray-500"}`}>
                        {STATUS_ICONS[user.status]}
                        {STATUS_LABELS[user.status] ?? user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-parish-text-light text-xs">{user.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-parish-text-light text-xs">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/usuarios/${user.id}/editar`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-parish-border rounded-lg text-xs text-parish-text-light hover:bg-parish-background transition">
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-parish-border">
            <p className="text-xs text-parish-text-light">
              {data.total} usuário{data.total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 border border-parish-border rounded hover:bg-parish-background transition disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-parish-text-light">
                {page} / {data.pages}
              </span>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                className="p-1.5 border border-parish-border rounded hover:bg-parish-background transition disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
