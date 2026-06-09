"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter }             from "next/navigation"
import Link                                 from "next/link"
import {
  QrCode, FileText, CheckCircle2, Clock, XCircle,
  Loader2, Copy, Check, RefreshCw, ArrowLeft, AlertCircle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Status = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED"

interface Contribution {
  id:            string
  amount:        number
  competence:    string
  method:        string
  status:        Status
  paidAt:        string | null
  createdAt:     string
  pixQrCode:     string | null
  pixCopyPaste:  string | null
  pixExpiration: string | null
  boletoUrl:     string | null
  boletoBarCode: string | null
}

function useCountdown(iso: string | null) {
  const [seconds, setSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (!iso) return
    const target = new Date(iso).getTime()
    const tick = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000))
      setSeconds(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [iso])

  if (seconds === null) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function ContribuirDetalhePage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [data,       setData]       = useState<Contribution | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [copied,     setCopied]     = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const countdown = useCountdown(data?.pixExpiration ?? null)

  const fetchContribution = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true)
    try {
      const res = await fetch(`/api/dizimista/contribuicao/${id}`)
      if (!res.ok) { setError("Contribuição não encontrada."); return }
      const json: Contribution = await res.json()
      setData(json)
    } catch {
      setError("Erro ao carregar dados.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  // Carga inicial
  useEffect(() => { fetchContribution() }, [fetchContribution])

  // Polling de status (a cada 10s) enquanto pendente
  useEffect(() => {
    if (!data) return
    if (data.status === "PAID" || data.status === "FAILED" || data.status === "CANCELLED") return
    const id = setInterval(() => fetchContribution(), 10_000)
    return () => clearInterval(id)
  }, [data, fetchContribution])

  async function copyPix() {
    if (!data?.pixCopyPaste) return
    await navigator.clipboard.writeText(data.pixCopyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-parish-gold animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-parish-surface rounded-xl border border-parish-border p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm text-parish-text">{error || "Contribuição não encontrada."}</p>
        <Link href="/dizimista/contribuir"
          className="inline-flex items-center gap-2 text-xs text-parish-gold font-medium hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Nova contribuição
        </Link>
      </div>
    )
  }

  const isPaid      = data.status === "PAID"
  const isFailed    = data.status === "FAILED" || data.status === "CANCELLED"
  const isPending   = !isPaid && !isFailed
  const isPix       = data.method === "PIX"
  const isBoleto    = data.method === "BOLETO"
  const isManual    = !data.pixQrCode && !data.pixCopyPaste && !data.boletoUrl

  return (
    <div className="space-y-5 max-w-lg">
      {/* Voltar */}
      <Link href="/dizimista/historico"
        className="inline-flex items-center gap-1.5 text-xs text-parish-text-light hover:text-parish-text transition">
        <ArrowLeft className="w-3.5 h-3.5" /> Histórico
      </Link>

      {/* Status card */}
      <div className={`rounded-xl border p-5 text-center space-y-2 ${
        isPaid   ? "bg-emerald-50 border-emerald-200"   :
        isFailed ? "bg-red-50 border-red-200"           :
                   "bg-parish-gold/5 border-parish-gold/20"
      }`}>
        {isPaid ? (
          <><CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-lg font-bold text-emerald-700">Pagamento confirmado!</p>
          <p className="text-sm text-emerald-600">Obrigado pela sua contribuição.</p></>
        ) : isFailed ? (
          <><XCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-lg font-bold text-red-600">Pagamento não realizado</p>
          <p className="text-sm text-red-500">A contribuição foi cancelada ou falhou.</p></>
        ) : (
          <><Clock className="w-10 h-10 text-parish-gold mx-auto" />
          <p className="text-lg font-bold text-parish-text">Aguardando pagamento</p>
          <p className="text-sm text-parish-text-light">
            {formatCurrency(Number(data.amount))} via {isPix ? "PIX" : isBoleto ? "Boleto" : data.method}
          </p></>
        )}
      </div>

      {/* PIX */}
      {isPix && isPending && !isManual && (
        <div className="bg-parish-surface rounded-xl border border-parish-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-parish-gold" />
              <h2 className="text-sm font-semibold text-parish-text">PIX — QR Code</h2>
            </div>
            {countdown && (
              <span className={`text-xs font-mono px-2 py-1 rounded-full border ${
                countdown === "00:00:00"
                  ? "text-red-600 bg-red-50 border-red-200"
                  : "text-amber-600 bg-amber-50 border-amber-200"
              }`}>
                {countdown === "00:00:00" ? "Expirado" : `Expira em ${countdown}`}
              </span>
            )}
          </div>

          {data.pixQrCode && (
            <div className="flex justify-center">
              {/* QR code como imagem base64 ou string data URI */}
              <img
                src={data.pixQrCode.startsWith("data:") ? data.pixQrCode : `data:image/png;base64,${data.pixQrCode}`}
                alt="QR Code PIX"
                className="w-44 h-44 rounded-lg border border-parish-border"
              />
            </div>
          )}

          {data.pixCopyPaste && (
            <div className="space-y-1.5">
              <p className="text-xs text-parish-text-light">PIX Copia e Cola</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={data.pixCopyPaste}
                  className="flex-1 text-xs bg-parish-background border border-parish-border rounded-lg px-3 py-2 font-mono truncate"
                />
                <button
                  onClick={copyPix}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-parish-gold text-white hover:bg-parish-gold-dark transition"
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Boleto */}
      {isBoleto && isPending && !isManual && data.boletoUrl && (
        <div className="bg-parish-surface rounded-xl border border-parish-border p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-parish-navy" />
            <h2 className="text-sm font-semibold text-parish-text">Boleto Bancário</h2>
          </div>

          {data.boletoBarCode && (
            <div className="space-y-1.5">
              <p className="text-xs text-parish-text-light">Código de barras</p>
              <div className="bg-parish-background border border-parish-border rounded-lg px-3 py-2">
                <p className="text-xs font-mono break-all">{data.boletoBarCode}</p>
              </div>
            </div>
          )}

          <a
            href={data.boletoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 bg-parish-navy text-white rounded-xl font-semibold text-sm hover:bg-parish-navy/90 transition"
          >
            Abrir boleto para pagar
          </a>

          <p className="text-xs text-parish-text-light text-center">
            O boleto vence em 3 dias úteis. Após o vencimento, será necessário gerar uma nova cobrança.
          </p>
        </div>
      )}

      {/* Modo manual — sem gateway */}
      {isPending && isManual && (
        <div className="bg-parish-surface rounded-xl border border-parish-border p-5 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-parish-text">Contribuição registrada</p>
              <p className="text-xs text-parish-text-light mt-0.5">
                Sua contribuição foi registrada no sistema. Entre em contato com a secretaria paroquial
                para efetuar o pagamento pessoalmente ou por transferência.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Atualizar status */}
      {isPending && (
        <button
          onClick={() => fetchContribution(true)}
          disabled={refreshing}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-parish-border rounded-xl text-xs text-parish-text-light hover:bg-parish-background transition disabled:opacity-50"
        >
          {refreshing
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...</>
            : <><RefreshCw className="w-3.5 h-3.5" /> Verificar pagamento</>
          }
        </button>
      )}

      {isPaid && (
        <Link href="/dizimista"
          className="block w-full text-center py-3 bg-parish-gold text-white rounded-xl font-semibold text-sm hover:bg-parish-gold-dark transition">
          Ir para o painel
        </Link>
      )}

      {isFailed && (
        <Link href="/dizimista/contribuir"
          className="block w-full text-center py-3 bg-parish-gold text-white rounded-xl font-semibold text-sm hover:bg-parish-gold-dark transition">
          Tentar novamente
        </Link>
      )}
    </div>
  )
}
