"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { ROLE_LABELS } from "@/lib/permissions"

const AVAILABLE_ROLES = ["USER", "DIZIMISTA", "COORDINATOR", "SECRETARY", "EDITOR", "FINANCE", "ADMIN"]

export default function NovoUsuarioPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "USER", status: "ACTIVE", phone: "", cpf: "",
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }
    if (form.password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:   form.name  || null,
          email:  form.email,
          password: form.password,
          role:   form.role,
          status: form.status,
          phone:  form.phone || null,
          cpf:    form.cpf   || null,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar usuário")
      toast.success("Usuário criado com sucesso!")
      router.push("/admin/usuarios")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar usuário")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/usuarios" className="text-parish-text-light hover:text-parish-text transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-parish-text">Novo Usuário</h1>
          <p className="text-parish-text-light text-sm">Criar uma nova conta de acesso</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-parish-surface rounded-lg border border-parish-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-parish-text">Dados pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-parish-text-light mb-1.5">Nome completo</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">E-mail *</label>
              <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Telefone</label>
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
          </div>
        </div>

        <div className="bg-parish-surface rounded-lg border border-parish-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-parish-text">Acesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Perfil *</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold">
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Status *</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold">
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="PENDING_VERIFICATION">Aguardando verificação</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Senha *</label>
              <input type="password" required minLength={8} value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
            <div>
              <label className="block text-xs text-parish-text-light mb-1.5">Confirmar senha *</label>
              <input type="password" required minLength={8} value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/admin/usuarios"
            className="px-4 py-2 border border-parish-border rounded-lg text-sm text-parish-text-light hover:bg-parish-background transition">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50">
            <UserPlus className="w-4 h-4" />
            {saving ? "Criando..." : "Criar usuário"}
          </button>
        </div>
      </form>
    </div>
  )
}
