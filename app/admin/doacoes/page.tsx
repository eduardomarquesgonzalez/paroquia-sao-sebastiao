import { redirect } from "next/navigation"

// Redireciona para o painel de dizimistas (módulo unificado)
export default function DoacoesPage() {
  redirect("/admin/dizimistas")
}
