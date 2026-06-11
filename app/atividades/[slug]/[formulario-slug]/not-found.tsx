import Link from "next/link"
import PublicNavbar from "@/components/PublicNavbar"
import PublicFooter from "@/components/PublicFooter"

export default function FormularioNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-md px-4">
          <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
          <h1 className="font-playfair text-2xl font-bold text-gray-800 mb-2">
            Formulário não encontrado
          </h1>
          <p className="text-gray-500 mb-6">
            Este formulário de inscrição não existe ou foi removido.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-parish-navy text-white rounded-xl hover:bg-parish-navy-dark transition font-semibold"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
