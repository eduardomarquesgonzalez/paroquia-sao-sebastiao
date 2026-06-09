"use client"

import { useEffect, useState } from "react"
import { useSession }          from "next-auth/react"
import { User, Save, Loader2 } from "lucide-react"
import { toast }               from "sonner"

interface ProfileForm {
  name:         string
  phone:        string
  cpf:          string
  birthDate:    string
  address:      string
  neighborhood: string
  city:         string
  state:        string
  zipCode:      string
}

const EMPTY: ProfileForm = {
  name: "", phone: "", cpf: "", birthDate: "",
  address: "", neighborhood: "", city: "Cuiabá", state: "MT", zipCode: "",
}

export default function DizimistaPerfilPage() {
  const { data: session } = useSession()
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form,     setForm]     = useState<ProfileForm>(EMPTY)

  useEffect(() => {
    fetch("/api/dizimista/perfil")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        const d = data.dizimista
        setForm({
          name:         data.name         ?? "",
          phone:        data.phone        ?? "",
          cpf:          data.cpf          ?? "",
          birthDate:    d?.birthDate ? d.birthDate.slice(0, 10) : "",
          address:      d?.address        ?? "",
          neighborhood: d?.neighborhood   ?? "",
          city:         d?.city           ?? "Cuiabá",
          state:        d?.state          ?? "MT",
          zipCode:      d?.zipCode        ?? "",
        })
      })
      .catch(() => toast.error("Erro ao carregar perfil"))
      .finally(() => setFetching(false))
  }, [])

  const set = (field: keyof ProfileForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/dizimista/perfil", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Perfil atualizado com sucesso!")
    } catch {
      toast.error("Erro ao salvar perfil")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-parish-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-parish-navy/10 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-parish-navy" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-parish-text">Meu Perfil</h1>
          <p className="text-xs text-parish-text-light">{session?.user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Dados pessoais */}
        <div className="bg-parish-surface rounded-xl border border-parish-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-parish-text">Dados pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-parish-text-light mb-1.5">Nome completo</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Telefone / WhatsApp</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+55 65 9 0000-0000"
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">CPF</label>
              <input type="text" value={form.cpf} onChange={(e) => set("cpf", e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Data de nascimento</label>
              <input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-parish-surface rounded-xl border border-parish-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-parish-text">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-parish-text-light mb-1.5">Logradouro</label>
              <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)}
                placeholder="Rua, Av., número..."
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Bairro</label>
              <input type="text" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">CEP</label>
              <input type="text" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)}
                placeholder="00000-000"
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Cidade</label>
              <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Estado</label>
              <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)}
                maxLength={2} placeholder="MT"
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold uppercase" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>
      </form>
    </div>
  )
}
