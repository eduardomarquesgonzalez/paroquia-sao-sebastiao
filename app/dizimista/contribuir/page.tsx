"use client"

import { useState }   from "react"
import { useRouter }  from "next/navigation"
import { Heart, DollarSign, QrCode, FileText, Loader2, AlertCircle } from "lucide-react"
import { toast }      from "sonner"
import { formatCurrency } from "@/lib/utils"

const PRESET_VALUES = [20, 50, 100, 200]

type Method = "PIX" | "BOLETO"

export default function ContribuirPage() {
  const router = useRouter()

  const [amount,   setAmount]   = useState<number | "">(50)
  const [custom,   setCustom]   = useState("")
  const [method,   setMethod]   = useState<Method>("PIX")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  const finalAmount = custom !== "" ? Number(custom) : (amount as number)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!finalAmount || finalAmount < 1) {
      setError("Informe um valor válido (mínimo R$ 1,00).")
      return
    }

    setLoading(true)
    try {
      const now = new Date()
      const competence = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

      const res  = await fetch("/api/dizimista/contribuicao", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: finalAmount, method, competence }),
      })
      const data = await res.json()

      if (!res.ok && res.status !== 202) {
        setError(data.error ?? "Erro ao gerar cobrança.")
        return
      }

      if (data.warning) toast.warning(data.warning)
      router.push(`/dizimista/contribuir/${data.contributionId}`)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-parish-gold/10 rounded-lg flex items-center justify-center">
          <Heart className="w-5 h-5 text-parish-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-parish-text">Contribuir com o Dízimo</h1>
          <p className="text-xs text-parish-text-light">Contribuição para a Paróquia São Sebastião</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Valor */}
        <div className="bg-parish-surface rounded-xl border border-parish-border p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-parish-gold" />
            <h2 className="text-sm font-semibold text-parish-text">Valor da contribuição</h2>
          </div>

          {/* Valores predefinidos */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_VALUES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => { setAmount(v); setCustom("") }}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition ${
                  amount === v && custom === ""
                    ? "bg-parish-gold text-white border-parish-gold"
                    : "bg-parish-background border-parish-border text-parish-text hover:border-parish-gold"
                }`}
              >
                {formatCurrency(v)}
              </button>
            ))}
          </div>

          {/* Valor personalizado */}
          <div>
            <label className="block text-xs text-parish-text-light mb-1.5">
              Outro valor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-parish-text-light">R$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setAmount("") }}
                placeholder="0,00"
                className="w-full pl-9 pr-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold"
              />
            </div>
          </div>

          {finalAmount > 0 && (
            <div className="bg-parish-gold/8 rounded-lg px-4 py-3 border border-parish-gold/20 text-center">
              <p className="text-xs text-parish-text-light">Valor selecionado</p>
              <p className="text-2xl font-bold text-parish-gold">{formatCurrency(finalAmount)}</p>
            </div>
          )}
        </div>

        {/* Método de pagamento */}
        <div className="bg-parish-surface rounded-xl border border-parish-border p-5 space-y-3">
          <h2 className="text-sm font-semibold text-parish-text">Forma de pagamento</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("PIX")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                method === "PIX"
                  ? "border-parish-gold bg-parish-gold/5"
                  : "border-parish-border bg-parish-background hover:border-parish-gold/50"
              }`}
            >
              <QrCode className={`w-6 h-6 ${method === "PIX" ? "text-parish-gold" : "text-parish-text-light"}`} />
              <span className={`text-sm font-semibold ${method === "PIX" ? "text-parish-gold" : "text-parish-text"}`}>PIX</span>
              <span className="text-xs text-parish-text-light">Aprovação imediata</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("BOLETO")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                method === "BOLETO"
                  ? "border-parish-navy bg-parish-navy/5"
                  : "border-parish-border bg-parish-background hover:border-parish-navy/30"
              }`}
            >
              <FileText className={`w-6 h-6 ${method === "BOLETO" ? "text-parish-navy" : "text-parish-text-light"}`} />
              <span className={`text-sm font-semibold ${method === "BOLETO" ? "text-parish-navy" : "text-parish-text"}`}>Boleto</span>
              <span className="text-xs text-parish-text-light">Vence em 3 dias</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || finalAmount < 1}
          className="w-full py-3 bg-parish-gold text-white rounded-xl font-semibold text-sm hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando cobrança...</>
          ) : (
            <><Heart className="w-4 h-4" /> Contribuir {finalAmount > 0 ? formatCurrency(finalAmount) : ""}</>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-parish-text-light">
        Sua contribuição sustenta a missão da paróquia. Obrigado pela generosidade!
      </p>
    </div>
  )
}
