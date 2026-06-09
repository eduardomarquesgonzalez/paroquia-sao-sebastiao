"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { KeyRound, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
  const params   = useSearchParams()
  const router   = useRouter()
  const token    = params.get("token") ?? ""

  const [password,  setPassword]  = useState("")
  const [confirm,   setConfirm]   = useState("")
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState("")

  useEffect(() => {
    if (!token) setError("Link inválido. Solicite um novo e-mail de recuperação.")
  }, [token])

  const strength =
    password.length === 0  ? 0
    : password.length < 6  ? 1
    : password.length < 8  ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError("As senhas não coincidem."); return }
    if (password.length < 8)  { setError("A senha deve ter no mínimo 8 caracteres."); return }

    setLoading(true)
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao redefinir senha."); return }
      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 3000)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-parish-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-parish-surface rounded-2xl border border-parish-border shadow-sm p-8">

          {/* Sucesso */}
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-parish-text">Senha redefinida!</h1>
                <p className="text-sm text-parish-text-light mt-2">
                  Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
                </p>
              </div>
              <Link href="/auth/login"
                className="block text-sm text-parish-gold hover:text-parish-gold-dark transition font-medium">
                Ir para o login agora
              </Link>
            </div>

          /* Token inválido (sem token na URL) */
          ) : !token ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-parish-text">Link inválido</h1>
                <p className="text-sm text-parish-text-light mt-2">
                  Este link de recuperação é inválido ou não contém um token.
                  Solicite um novo link.
                </p>
              </div>
              <Link href="/auth/forgot-password"
                className="block text-sm text-parish-gold hover:text-parish-gold-dark transition font-medium">
                Solicitar novo link
              </Link>
            </div>

          /* Formulário */
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-parish-gold/10 rounded-xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-parish-gold" />
                </div>
                <h1 className="text-xl font-bold text-parish-text">Nova senha</h1>
                <p className="text-sm text-parish-text-light mt-1">
                  Escolha uma senha segura com pelo menos 8 caracteres.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nova senha */}
                <div>
                  <label className="block text-xs text-parish-text-light mb-1.5">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-2.5 pr-10 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold"
                    />
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-parish-text-light hover:text-parish-text transition">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Barra de força */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength
                              ? strength <= 1 ? "bg-red-400"
                              : strength === 2 ? "bg-amber-400"
                              : strength === 3 ? "bg-yellow-400"
                              : "bg-emerald-400"
                              : "bg-parish-border"
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-parish-text-light">
                        {strength <= 1 ? "Senha muito fraca"
                          : strength === 2 ? "Senha fraca"
                          : strength === 3 ? "Senha boa"
                          : "Senha forte"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="block text-xs text-parish-text-light mb-1.5">Confirmar senha</label>
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold transition ${
                      confirm && confirm !== password
                        ? "border-red-300 bg-red-50"
                        : "border-parish-border"
                    }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-2.5 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Redefinir senha"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
