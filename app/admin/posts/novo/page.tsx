"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NovoPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [] as string[],
    coverImage: "",
    published: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "title" && !formData.slug) {
        const slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/--+/g, "-")
          .trim();
        setFormData((prev) => ({ ...prev, slug }));
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData((prev) => ({ ...prev, coverImage: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, coverImage: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, published: shouldPublish }),
      });

      if (!response.ok) throw new Error("Erro ao criar post");

      toast.success(shouldPublish ? "Post publicado com sucesso!" : "Rascunho salvo!");
      router.push("/admin/posts");
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      toast.error("Erro ao salvar o post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/posts" className="text-parish-text-light hover:text-parish-text transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-parish-text">Novo Post</h1>
            <p className="text-parish-text-light mt-1">Crie uma nova publicação</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            className="px-4 py-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Rascunho</span>
          </button>
          <button
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{isSubmitting ? "Publicando..." : "Publicar"}</span>
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Digite o título do post"
              className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-lg"
              required
            />
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">URL (Slug)</label>
            <div className="flex items-center space-x-2">
              <span className="text-parish-secondary text-sm">paroquiasaosebastiao.com.br/posts/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="titulo-do-post"
                className="flex-1 px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Resumo</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Breve descrição do post (aparece nas listagens)"
              rows={3}
              className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Conteúdo *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Digite o conteúdo do post... (Suporte para Markdown)"
              rows={15}
              className="w-full px-4 py-3 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none resize-none font-mono text-sm"
              required
            />
            <p className="text-xs text-parish-secondary mt-2">
              Você pode usar Markdown para formatação: **negrito**, *itálico*, # títulos, etc.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Categoria</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
            >
              <option value="">Selecione uma categoria</option>
              <option value="Avisos">Avisos</option>
              <option value="Eventos">Eventos</option>
              <option value="Campanhas">Campanhas</option>
              <option value="Pastorais">Pastorais</option>
              <option value="Formação">Formação</option>
              <option value="Notícias">Notícias</option>
            </select>
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Tags</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Adicionar tag"
                className="flex-1 px-3 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition text-sm"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-parish-sky-light text-parish-sky-dark">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-parish-gold">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="block text-sm font-medium text-parish-text-light mb-2">Imagem de Capa</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {!imagePreview ? (
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-parish-border rounded-lg p-6 text-center hover:border-parish-gold transition cursor-pointer"
              >
                <Upload className="w-8 h-8 text-parish-secondary mx-auto mb-2" />
                <p className="text-sm text-parish-text-light">Clique para fazer upload</p>
                <p className="text-xs text-parish-secondary mt-1">PNG, JPG até 5MB</p>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-parish-surface rounded-lg shadow-sm p-6 border border-parish-primary">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 text-parish-gold border-parish-border rounded focus:ring-parish-gold"
              />
              <div>
                <p className="text-sm font-medium text-parish-text-light">Publicar imediatamente</p>
                <p className="text-xs text-parish-secondary">Tornar o post visível no site</p>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
