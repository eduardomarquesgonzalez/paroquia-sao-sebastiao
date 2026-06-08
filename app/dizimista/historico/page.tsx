"use client"

import { History, Heart, Info } from "lucide-react"

// Placeholder — será preenchido quando a API de contribuições for implementada
export default function DizimistaHistoricoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-parish-gold/10 rounded-lg flex items-center justify-center">
          <History className="w-5 h-5 text-parish-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-parish-text">Histórico de Contribuições</h1>
          <p className="text-xs text-parish-text-light">Registros de seus dízimos e doações</p>
        </div>
      </div>

      <div className="bg-parish-surface rounded-xl border border-parish-border">
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 bg-parish-gold/10 rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-parish-gold/50" />
          </div>
          <p className="text-parish-text font-medium mb-1">Em breve disponível</p>
          <p className="text-sm text-parish-text-light max-w-sm">
            O histórico de contribuições será exibido aqui assim que o sistema de dízimo online for ativado pela paróquia.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Enquanto isso, você pode contribuir presencialmente nas missas ou pelo depósito bancário.
          Consulte a secretaria para mais informações.
        </p>
      </div>
    </div>
  )
}
