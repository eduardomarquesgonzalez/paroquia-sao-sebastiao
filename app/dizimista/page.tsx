"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Heart, History, User, Phone, HelpCircle, CheckCircle, AlertCircle,
} from "lucide-react"

export default function DizimistaPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(" ")[0] ?? "Fiel"

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-gradient-to-br from-parish-navy to-parish-navy-dark rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-parish-gold fill-parish-gold" />
            <span className="text-parish-gold text-sm font-semibold">Área do Dizimista</span>
          </div>
          <h1 className="text-2xl font-bold">Olá, {firstName}!</h1>
          <p className="text-white/70 text-sm mt-1">
            Obrigado por contribuir com a nossa paróquia. Sua fé e generosidade fazem a diferença.
          </p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dizimista/contribuir"
          className="bg-parish-gold text-white rounded-xl p-5 flex items-center gap-4 hover:bg-parish-gold-dark transition group sm:col-span-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Contribuir com o dízimo</p>
            <p className="text-xs text-white/75 mt-0.5">Fazer uma nova contribuição via PIX ou boleto</p>
          </div>
        </Link>

        <Link href="/dizimista/historico"
          className="bg-parish-surface rounded-xl border border-parish-border p-5 flex items-center gap-4 hover:border-parish-gold transition group">
          <div className="w-10 h-10 bg-parish-gold/10 rounded-lg flex items-center justify-center group-hover:bg-parish-gold/20 transition">
            <History className="w-5 h-5 text-parish-gold" />
          </div>
          <div>
            <p className="font-semibold text-parish-text text-sm">Histórico</p>
            <p className="text-xs text-parish-text-light mt-0.5">Ver todas as suas contribuições</p>
          </div>
        </Link>

        <Link href="/dizimista/perfil"
          className="bg-parish-surface rounded-xl border border-parish-border p-5 flex items-center gap-4 hover:border-parish-gold transition group">
          <div className="w-10 h-10 bg-parish-navy/10 rounded-lg flex items-center justify-center group-hover:bg-parish-navy/20 transition">
            <User className="w-5 h-5 text-parish-navy" />
          </div>
          <div>
            <p className="font-semibold text-parish-text text-sm">Meu perfil</p>
            <p className="text-xs text-parish-text-light mt-0.5">Atualizar dados cadastrais</p>
          </div>
        </Link>
      </div>

      {/* Informações sobre o dízimo */}
      <div className="bg-parish-surface rounded-xl border border-parish-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-parish-text flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-parish-gold" />
          O que é o dízimo?
        </h2>
        <p className="text-sm text-parish-text-light leading-relaxed">
          O dízimo é a contribuição voluntária de 10% dos rendimentos que os fiéis oferecem à Igreja como
          sinal de gratidão a Deus e participação na missão evangelizadora da paróquia.
        </p>
        <div className="space-y-2">
          {[
            "Sustenta as obras e serviços da paróquia",
            "Mantém as comunidades e pastorais ativas",
            "Ajuda famílias em situação de vulnerabilidade",
            "Contribui com a formação e missão do clero",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-parish-text">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contato */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Precisa de ajuda?</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Entre em contato com a secretaria paroquial pelo WhatsApp ou pessoalmente durante o horário de atendimento.
          </p>
          <a href="https://wa.me/556500000000" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-800 hover:text-amber-900 transition">
            <Phone className="w-3.5 h-3.5" /> Falar com a secretaria
          </a>
        </div>
      </div>
    </div>
  )
}
