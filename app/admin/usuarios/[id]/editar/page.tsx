"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Trash2, Key } from "lucide-react"
import { toast } from "sonner"
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/permissions"

interface UserData {
  id:        string
  name:      string | null
  email:     string
  role:      string
  status:    string
  phone:     string | null
  cpf:       string | null
}

const AVAILABLE_ROLES = ["USER", "DIZIMISTA", "COORDINATOR", "SECRETARY", "EDITOR", "FINANCE", "ADMIN"]

export default function EditarUsuarioPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setSaving]   = useState(true)
  const [saving,  setIsSaving] = useState(false)
  const [user,    setUser]     = useState<UserData | null>(null)
  const [newPass, setNewPass]  = useState("")
  const [form, setForm] = useState({
    name: "", role: "USER", status: "ACTIVE", phone: "", cpf: "",
  })

  useEffect(() => {
    fetch(`/api/admin/usuarios/${id}`)
      .then((r) => r.json())
      .then((data: UserData) => {
        setUser(data)
        setForm({
          name:   data.name   ?? "",
          role:   data.role,
          status: data.status,
          phone:  data.phone  ?? "",
          cpf:    data.cpf    ?? "",
        })
      })
      .catch(() => { toast.error("Usuário não encontrado"); router.push("/admin/usuarios") })
      .finally(() => setSaving(false))
  }, [id, router])

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name   || null,
          role:     form.role,
          status:   form.status,
          phone:    form.phone  || null,
          cpf:      form.cpf    || null,
          ...(newPass ? { password: newPass } : {}),
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar")
      toast.success("Usuário atualizado!")
      router.push("/admin/usuarios")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este usuário permanentemente? Esta ação não pode ser desfeita.")) return
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir")
      toast.success("Usuário excluído!")
      router.push("/admin/usuarios")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-parish-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/usuarios" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-parish-text">Editar Usuário</h1>
            <p className="text-parish-text-light text-sm truncate max-w-xs">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete}
            className="px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-parish-gold text-white rounded-lg text-sm font-semibold hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-1.5">
            <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="bg-parish-surface rounded-lg border border-parish-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-parish-text">Dados pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-parish-text-light mb-1.5">Nome completo</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
          </div>
          <div>
            <label className="block text-xs text-parish-text-light mb-1.5">E-mail</label>
            <input type="email" value={user?.email ?? ""} disabled
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm bg-parish-background text-parish-text-light cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs text-parish-text-light mb-1.5">Telefone</label>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
          </div>
          <div>
            <label className="block text-xs text-parish-text-light mb-1.5">CPF</label>
            <input type="text" value={form.cpf} onChange={(e) => set("cpf", e.target.value)}
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
          </div>
        </div>
      </div>

      <div className="bg-parish-surface rounded-lg border border-parish-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-parish-text">Permissão e status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-parish-text-light mb-1.5">Perfil</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)}
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold">
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-parish-text-light mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-parish-surface rounded-lg border border-parish-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-parish-text-light" />
          <h2 className="text-sm font-semibold text-parish-text">Redefinir senha</h2>
        </div>
        <p className="text-xs text-parish-text-light">Deixe em branco para manter a senha atual.</p>
        <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
          placeholder="Nova senha (mín. 8 caracteres)"
          minLength={8}
          className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold" />
      </div>
    </div>
  )
}
