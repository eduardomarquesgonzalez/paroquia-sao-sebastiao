"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Eye, Upload, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EventData {
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  image: string;
  published: boolean;
}

export default function EditarEventoPage() {
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<EventData>({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    image: "",
    published: false,
  });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchEvento();
  }, [eventoId]);

  async function fetchEvento() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/eventos/${eventoId}`);

      if (!response.ok) throw new Error("Evento não encontrado");

      const data = await response.json();

      // Formatar datas para input datetime-local
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: data.title,
        description: data.description,
        date: formatDateForInput(data.date),
        endDate: data.endDate ? formatDateForInput(data.endDate) : "",
        location: data.location || "",
        image: data.image || "",
        published: data.published,
      });

      if (data.image) {
        setImagePreview(data.image);
      }
    } catch (error) {
      console.error("Erro ao carregar evento:", error);
      toast.error("Erro ao carregar evento");
      router.push("/admin/eventos");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      setFormData((prev) => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          published: shouldPublish,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      toast.success(
        shouldPublish ? "Evento publicado com sucesso!" : "Evento atualizado!"
      );
      router.push("/admin/eventos");
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast.error("Erro ao atualizar o evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/eventos?id=${eventoId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Evento excluído com sucesso!");
      router.push("/admin/eventos");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir evento");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/eventos"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Evento</h1>
            <p className="text-gray-600 mt-1">
              Atualize as informações do evento
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>
          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>
          <button
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{isSubmitting ? "Salvando..." : "Publicar"}</span>
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Evento *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Missa de São Sebastião"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
              required
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva os detalhes do evento..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              required
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Igreja Matriz São Sebastião"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Date and Time */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora *
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* End Date (Optional) */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Término (Opcional)
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Para eventos que duram mais de um dia
            </p>
          </div>

          {/* Image */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Evento
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Clique para fazer upload
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-lg"
                />
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

          {/* Publish Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Publicado</p>
                <p className="text-xs text-gray-500">Evento visível no site</p>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
