"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError("Erro ao enviar e-mail. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-parish-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-parish-surface rounded-2xl border border-parish-border shadow-sm p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-parish-text">Verifique seu e-mail</h1>
                <p className="text-sm text-parish-text-light mt-2">
                  Se <strong>{email}</strong> tiver uma conta cadastrada, você receberá um link para redefinir sua senha em breve.
                </p>
              </div>
              <Link href="/auth/login"
                className="block text-sm text-parish-gold hover:text-parish-gold-dark transition font-medium">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-parish-gold/10 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-parish-gold" />
                </div>
                <h1 className="text-xl font-bold text-parish-text">Esqueceu a senha?</h1>
                <p className="text-sm text-parish-text-light mt-1">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-parish-text-light mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar link de redefinição"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-parish-text-light hover:text-parish-text transition">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
