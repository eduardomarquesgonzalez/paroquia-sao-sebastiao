"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Church, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Email ou senha incorretos')
      } else {
        toast.success('Login realizado com sucesso!')
        router.push('/admin')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-parish-text-dark via-parish-text to-parish-text-dark flex items-center justify-center p-4">
      <div className="bg-parish-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-parish-sky-light rounded-full mb-4">
            <Church className="w-8 h-8 text-parish-gold" />
          </div>
          <h1 className="text-2xl font-bold text-parish-text">Painel Administrativo</h1>
          <p className="text-parish-text-light mt-2">Paróquia São Sebastião</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-parish-text-light mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-parish-secondary" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-parish-text-light">
                Senha
              </label>
              <Link href="/auth/forgot-password" className="text-xs text-parish-gold hover:text-parish-gold-dark transition">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-parish-secondary" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-parish-gold text-white py-3 rounded-lg font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-parish-gold hover:underline">
            ← Voltar para o site
          </Link>
        </div>

        {/* <div className="mt-6 p-4 bg-parish-background rounded-lg">
          <p className="text-xs text-parish-text-light text-center">
            <strong>Credenciais padrão:</strong><br />
            Email: admin@paroquiasaosebastiao.com.br<br />
            Senha: Admin@123456
          </p>
        </div> */}
      </div>
    </div>
  )
}
