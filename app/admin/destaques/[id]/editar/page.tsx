"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Trash2, Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { compressImage } from "@/lib/utils"

interface FormData {
  title: string
  linkUrl: string
  image: string
  active: boolean
  order: number
  expiresAt: string
}

export default function EditarDestaquePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    linkUrl: "",
    image: "",
    active: true,
    order: 0,
    expiresAt: "",
  })
  const [imagePreview, setImagePreview] = useState("")
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload")
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => { fetchDestaque() }, [id])

  async function fetchDestaque() {
    try {
      setIsLoading(true)
      const r = await fetch(`/api/destaques/${id}`)
      if (!r.ok) throw new Error()
      const data = await r.json()
      const expiresAt = data.expiresAt
        ? new Date(data.expiresAt).toISOString().slice(0, 16)
        : ""
      setFormData({
        title:     data.title     ?? "",
        linkUrl:   data.linkUrl   ?? "",
        image:     data.image     ?? "",
        active:    data.active,
        order:     data.order,
        expiresAt,
      })
      if (data.image) {
        setImagePreview(data.image)
        if (!data.image.startsWith("data:")) {
          setImageMode("url")
          setImageUrl(data.image)
        }
      }
    } catch {
      toast.error("Erro ao carregar destaque")
      router.push("/admin/destaques")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida"); return }
    if (file.size > 20 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 20MB"); return }
    try {
      const compressed = await compressImage(file)
      setImagePreview(compressed)
      setFormData((prev) => ({ ...prev, image: compressed }))
    } catch {
      toast.error("Erro ao processar a imagem")
    }
  }

  const handleRemoveImage = () => {
    setImagePreview("")
    setImageUrl("")
    setFormData((prev) => ({ ...prev, image: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    setImagePreview(url)
    setFormData((prev) => ({ ...prev, image: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const r = await fetch(`/api/destaques/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:     formData.title     || null,
          image:     formData.image     || null,
          linkUrl:   formData.linkUrl   || null,
          active:    formData.active,
          order:     formData.order,
          expiresAt: formData.expiresAt || null,
        }),
      })
      if (!r.ok) throw new Error()
      toast.success("Destaque atualizado com sucesso!")
      router.push("/admin/destaques")
    } catch {
      toast.error("Erro ao atualizar destaque")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este destaque?")) return
    try {
      const r = await fetch(`/api/destaques/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error()
      toast.success("Destaque excluído!")
      router.push("/admin/destaques")
    } catch {
      toast.error("Erro ao excluir destaque")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/destaques" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Editar Destaque</h1>
            <p className="text-parish-text-light mt-1">Atualize as informações do banner</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDelete}
            className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition flex items-center gap-2">
            <Trash2 className="w-4 h-4" /><span>Excluir</span>
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" /><span>{isSubmitting ? "Salvando..." : "Salvar"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Imagem */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-3">Imagem do Banner</label>

            <div className="flex rounded-lg border border-parish-border overflow-hidden mb-4 text-sm">
              <button type="button" onClick={() => { setImageMode("upload"); handleRemoveImage() }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${imageMode === "upload" ? "bg-parish-gold text-white" : "bg-parish-background text-parish-text-light hover:bg-parish-primary"}`}>
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
              <button type="button" onClick={() => { setImageMode("url"); handleRemoveImage() }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${imageMode === "url" ? "bg-parish-gold text-white" : "bg-parish-background text-parish-text-light hover:bg-parish-primary"}`}>
                <LinkIcon className="w-3.5 h-3.5" /> URL
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            {imageMode === "url" ? (
              <div className="space-y-3">
                <input type="url" value={imageUrl} onChange={handleUrlChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-sm" />
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover max-h-52"
                      onError={() => { setImagePreview(""); toast.error("URL inválida") }} />
                    <button type="button" onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : !imagePreview ? (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-parish-border rounded-lg p-8 text-center hover:border-parish-gold transition cursor-pointer">
                <ImageIcon className="w-10 h-10 text-parish-secondary mx-auto mb-2" />
                <p className="text-sm text-parish-text-light">Clique para fazer upload</p>
                <p className="text-xs text-parish-secondary mt-1">PNG, JPG até 20MB — comprimido automaticamente</p>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg max-h-52 object-cover" />
                <button type="button" onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Título e Link */}
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-4">
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2">
                Título <span className="text-parish-secondary font-normal">(opcional)</span>
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="Ex: Festa de São Sebastião 2026"
                className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-parish-text-light mb-2 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" /> Link / URL <span className="text-parish-secondary font-normal">(opcional)</span>
              </label>
              <input type="url" name="linkUrl" value={formData.linkUrl} onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              {formData.linkUrl && (() => {
                try { const u = new URL(formData.linkUrl); return u.protocol !== "http:" && u.protocol !== "https:" } catch { return true }
              })() && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span> URL inválida — o banner não ficará clicável.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary space-y-4">
            <div>
              <label className="block text-sm text-parish-secondary mb-2">Ordem de exibição</label>
              <input type="number" name="order" value={formData.order} min={0}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none" />
              <p className="text-xs text-parish-secondary mt-1">Menor número = exibido primeiro</p>
            </div>

            <div className="pt-2 border-t border-parish-border">
              <label className="block text-sm text-parish-secondary mb-2">Data de validade <span className="font-normal">(opcional)</span></label>
              <input type="datetime-local" name="expiresAt" value={formData.expiresAt} onChange={handleChange}
                className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-sm" />
              <p className="text-xs text-parish-secondary mt-1">O destaque deixa de aparecer após esta data</p>
            </div>

            <div className="pt-2 border-t border-parish-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="active" checked={formData.active} onChange={handleChange}
                  className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold" />
                <div>
                  <p className="text-sm font-medium text-parish-text-light">Ativo</p>
                  <p className="text-xs text-parish-secondary">Exibir na página inicial</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
