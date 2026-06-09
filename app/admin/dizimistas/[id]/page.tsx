"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, User, Heart, TrendingUp, Calendar, CheckCircle2,
  Clock, XCircle, Loader2, ToggleLeft, ToggleRight, StickyNote,
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

type ContributionStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED"

interface Contribution {
  id:          string
  amount:      number
  competence:  string
  method:      string
  status:      ContributionStatus
  paidAt:      string | null
  createdAt:   string
}

interface DizimistaDetail {
  id:               string
  active:           boolean
  registrationDate: string
  notes:            string | null
  birthDate:        string | null
  address:          string | null
  neighborhood:     string | null
  city:             string | null
  state:            string | null
  zipCode:          string | null
  user: { id: string; name: string | null; email: string; phone: string | null; cpf: string | null }
  contributions: Contribution[]
  stats: { totalPaid: number; yearTotal: number; paidCount: number; total: number }
}

const STATUS_CONFIG: Record<ContributionStatus, { label: string; color: string; icon: React.ElementType }> = {
  PAID:       { label: "Pago",        color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  PENDING:    { label: "Pendente",    color: "text-amber-600 bg-amber-50 border-amber-200",       icon: Clock },
  PROCESSING: { label: "Processando", color: "text-blue-600 bg-blue-50 border-blue-200",          icon: Clock },
  FAILED:     { label: "Falhou",      color: "text-red-600 bg-red-50 border-red-200",             icon: XCircle },
  CANCELLED:  { label: "Cancelado",   color: "text-gray-500 bg-gray-50 border-gray-200",          icon: XCircle },
  REFUNDED:   { label: "Estornado",   color: "text-purple-600 bg-purple-50 border-purple-200",    icon: XCircle },
}

const METHOD_LABELS: Record<string, string> = {
  PIX: "PIX", BOLETO: "Boleto", CREDIT_CARD: "Cartão", DEBIT_CARD: "Débito",
  CASH: "Dinheiro", TRANSFER: "Transferência",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

function formatCompetence(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

export default function AdminDizimistaDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [data,    setData]    = useState<DizimistaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes,   setNotes]   = useState("")
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    fetch(`/api/admin/dizimistas/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) { setData(d); setNotes(d.notes ?? "") }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function toggleActive() {
    if (!data) return
    setSaving(true)
    try {
      const res  = await fetch(`/api/admin/dizimistas/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ active: !data.active }),
      })
      const json = await res.json()
      setData((prev) => prev ? { ...prev, active: json.active } : prev)
      toast.success(json.active ? "Dizimista ativado" : "Dizimista desativado")
    } catch {
      toast.error("Erro ao atualizar")
    } finally {
      setSaving(false)
    }
  }

  async function saveNotes() {
    setSaving(true)
    try {
      await fetch(`/api/admin/dizimistas/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ notes }),
      })
      toast.success("Observações salvas")
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-parish-gold animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-parish-text-light text-sm">Dizimista não encontrado.</p>
        <Link href="/admin/dizimistas" className="mt-3 inline-flex items-center gap-1.5 text-xs text-parish-gold font-medium hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Voltar */}
      <Link href="/admin/dizimistas"
        className="inline-flex items-center gap-1.5 text-xs text-parish-text-light hover:text-parish-text transition">
        <ArrowLeft className="w-3.5 h-3.5" /> Dizimistas
      </Link>

      {/* Cabeçalho do perfil */}
      <div className="bg-parish-surface rounded-xl border border-parish-border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-parish-navy/10 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-parish-navy" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-parish-text">{data.user.name ?? "—"}</h1>
              <p className="text-sm text-parish-text-light">{data.user.email}</p>
              {data.user.phone && <p className="text-xs text-parish-text-light">{data.user.phone}</p>}
            </div>
          </div>
          <button
            onClick={toggleActive}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              data.active
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
            } disabled:opacity-50`}
          >
            {data.active
              ? <><ToggleRight className="w-4 h-4" /> Desativar</>
              : <><ToggleLeft className="w-4 h-4" /> Ativar</>
            }
          </button>
        </div>

        {/* Dados pessoais */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ["CPF",        data.user.cpf ?? "—"],
            ["Nascimento", data.birthDate ? formatDate(data.birthDate) : "—"],
            ["Cadastrado", formatDate(data.registrationDate)],
            ["Cidade",     [data.city, data.state].filter(Boolean).join(" / ") || "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-parish-text-light">{label}</p>
              <p className="font-medium text-parish-text">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total pago",          value: formatCurrency(data.stats.totalPaid), color: "text-emerald-600", icon: TrendingUp },
          { label: `Em ${new Date().getFullYear()}`, value: formatCurrency(data.stats.yearTotal), color: "text-parish-gold", icon: Heart },
          { label: "Pagas",               value: String(data.stats.paidCount),        color: "text-parish-text",        icon: CheckCircle2 },
          { label: "Total registradas",   value: String(data.stats.total),           color: "text-parish-text-light",  icon: Calendar },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-parish-surface rounded-xl border border-parish-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-parish-text-light">{label}</span>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Contribuições */}
      <div className="bg-parish-surface rounded-xl border border-parish-border overflow-hidden">
        <div className="px-5 py-4 border-b border-parish-border">
          <h2 className="text-sm font-semibold text-parish-text">Histórico de contribuições</h2>
        </div>
        {data.contributions.length === 0 ? (
          <div className="py-10 text-center text-sm text-parish-text-light">
            Nenhuma contribuição registrada
          </div>
        ) : (
          <div className="divide-y divide-parish-border">
            {data.contributions.map((c) => {
              const cfg        = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.PENDING
              const StatusIcon = cfg.icon
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-parish-text capitalize">
                      {formatCompetence(c.competence)}
                    </p>
                    <p className="text-xs text-parish-text-light">
                      {METHOD_LABELS[c.method] ?? c.method}
                      {c.paidAt && <> · {formatDate(c.paidAt)}</>}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-parish-text shrink-0">
                    {formatCurrency(Number(c.amount))}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color} shrink-0`}>
                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Observações */}
      <div className="bg-parish-surface rounded-xl border border-parish-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-parish-gold" />
          <h2 className="text-sm font-semibold text-parish-text">Observações internas</h2>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Notas visíveis apenas para a equipe administrativa..."
          className="w-full px-3 py-2 border border-parish-border rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-parish-gold"
        />
        <button
          onClick={saveNotes}
          disabled={saving}
          className="px-4 py-2 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar observações"}
        </button>
      </div>
    </div>
  )
}
