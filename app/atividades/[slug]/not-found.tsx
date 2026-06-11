import Link from "next/link"
import { AlertCircle } from "lucide-react"
import PublicNavbar from "@/components/PublicNavbar"
import PublicFooter from "@/components/PublicFooter"

export default function AtividadeNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">Atividade não encontrada</h1>
        <p className="text-gray-500 text-center max-w-sm">
          Esta atividade não existe ou não está disponível no momento.
        </p>
        <Link
          href="/"
          className="mt-2 px-5 py-2.5 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition"
        >
          Voltar ao início
        </Link>
      </div>
      <PublicFooter />
    </div>
  )
}
