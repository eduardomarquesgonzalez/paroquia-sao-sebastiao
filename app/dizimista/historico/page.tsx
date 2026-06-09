"use client"

import { useEffect, useState } from "react"
import Link                    from "next/link"
import {
  History, Heart, TrendingUp, Calendar, CheckCircle2,
  Clock, XCircle, Loader2, Plus, ChevronRight,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type ContributionStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED"

interface Contribution {
  id:            string
  amount:        number
  competence:    string
  method:        string
  status:        ContributionStatus
  paidAt:        string | null
  createdAt:     string
  pixCopyPaste:  string | null
  pixExpiration: string | null
  boletoUrl:     string | null
}

interface Stats {
  totalPaid: number
  yearTotal:  number
  lastPaid:   Contribution | null
  count:      number
}

const STATUS_CONFIG: Record<ContributionStatus, { label: string; color: string; icon: React.ElementType }> = {
  PAID:       { label: "Pago",          color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  PENDING:    { label: "Pendente",      color: "text-amber-600  bg-amber-50  border-amber-200",  icon: Clock },
  PROCESSING: { label: "Processando",   color: "text-blue-600   bg-blue-50   border-blue-200",   icon: Clock },
  FAILED:     { label: "Falhou",        color: "text-red-600    bg-red-50    border-red-200",    icon: XCircle },
  CANCELLED:  { label: "Cancelado",     color: "text-gray-500   bg-gray-50   border-gray-200",   icon: XCircle },
  REFUNDED:   { label: "Estornado",     color: "text-purple-600 bg-purple-50 border-purple-200", icon: XCircle },
}

const METHOD_LABELS: Record<string, string> = {
  PIX:         "PIX",
  BOLETO:      "Boleto",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD:  "Cartão de débito",
  CASH:        "Dinheiro",
  TRANSFER:    "Transferência",
}

function formatCompetence(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

export default function DizimistaHistoricoPage() {
  const [data,    setData]    = useState<{ contributions: Contribution[]; stats: Stats | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dizimista/historico")
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-parish-gold animate-spin" />
      </div>
    )
  }

  const contributions = data?.contributions ?? []
  const stats         = data?.stats ?? null
  const currentYear   = new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-parish-gold/10 rounded-lg flex items-center justify-center">
            <History className="w-5 h-5 text-parish-gold" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-parish-text">Histórico de Contribuições</h1>
            <p className="text-xs text-parish-text-light">Registros de seus dízimos e doações</p>
          </div>
        </div>
        <Link href="/dizimista/contribuir"
          className="flex items-center gap-1.5 px-3 py-2 bg-parish-gold text-white rounded-lg text-xs font-semibold hover:bg-parish-gold-dark transition">
          <Plus className="w-3.5 h-3.5" /> Nova contribuição
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-parish-surface rounded-xl border border-parish-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-parish-gold" />
              <span className="text-xs text-parish-text-light">Total contribuído</span>
            </div>
            <p className="text-lg font-bold text-parish-text">{formatCurrency(stats.totalPaid)}</p>
          </div>
          <div className="bg-parish-surface rounded-xl border border-parish-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-parish-text-light">Em {currentYear}</span>
            </div>
            <p className="text-lg font-bold text-parish-text">{formatCurrency(stats.yearTotal)}</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-parish-surface rounded-xl border border-parish-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-parish-text-light">Contribuições pagas</span>
            </div>
            <p className="text-lg font-bold text-parish-text">{stats.count}</p>
          </div>
        </div>
      )}

      {/* Lista de contribuições */}
      {contributions.length === 0 ? (
        <div className="bg-parish-surface rounded-xl border border-parish-border">
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 bg-parish-gold/10 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-parish-gold/50" />
            </div>
            <p className="text-parish-text font-medium mb-1">Nenhuma contribuição registrada</p>
            <p className="text-sm text-parish-text-light mb-5 max-w-xs">
              Suas contribuições aparecerão aqui após o primeiro registro.
            </p>
            <Link href="/dizimista/contribuir"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition">
              <Plus className="w-4 h-4" /> Fazer primeira contribuição
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((c) => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.PENDING
            const StatusIcon = cfg.icon
            const isPending  = c.status === "PENDING" || c.status === "PROCESSING"

            return (
              <div key={c.id} className="bg-parish-surface rounded-xl border border-parish-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-parish-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-parish-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-parish-text capitalize">
                        {formatCompetence(c.competence)}
                      </p>
                      <p className="text-xs text-parish-text-light">
                        {METHOD_LABELS[c.method] ?? c.method}
                        {c.paidAt && (
                          <> · pago em {new Date(c.paidAt).toLocaleDateString("pt-BR")}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-sm font-bold text-parish-text">
                      {formatCurrency(Number(c.amount))}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Ação para contribuições pendentes */}
                {isPending && (c.pixCopyPaste || c.boletoUrl) && (
                  <div className="mt-3 pt-3 border-t border-parish-border">
                    <Link href={`/dizimista/contribuir/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-parish-gold hover:text-parish-gold-dark transition">
                      Ver instruções de pagamento <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
