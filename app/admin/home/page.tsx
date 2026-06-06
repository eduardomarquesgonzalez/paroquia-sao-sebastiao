"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Save,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface BannerSlide {
  id: string;
  image: string;
  order: number;
  active: boolean;
}

interface HomeHero {
  heading: string;
  subtitle: string;
  btn1Text: string;
  btn1Link: string;
  btn2Text: string;
  btn2Link: string;
}

const emptyHero: HomeHero = {
  heading: "",
  subtitle: "",
  btn1Text: "",
  btn1Link: "",
  btn2Text: "",
  btn2Link: "",
};

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState<"slides" | "texto">("slides");
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [hero, setHero] = useState<HomeHero>(emptyHero);
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingSlide, setSavingSlide] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [slidesRes, heroRes] = await Promise.all([
        fetch("/api/banner-slides?all=true"),
        fetch("/api/home-hero"),
      ]);
      if (slidesRes.ok) {
        const data = await slidesRes.json();
        setSlides(Array.isArray(data) ? data : []);
      }
      if (heroRes.ok) setHero(await heroRes.json());
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSlides() {
    const res = await fetch("/api/banner-slides?all=true");
    if (res.ok) {
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    }
  }

  async function toggleActive(slide: BannerSlide) {
    try {
      const res = await fetch(`/api/banner-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !slide.active }),
      });
      if (!res.ok) throw new Error();
      toast.success(slide.active ? "Slide desativado" : "Slide ativado");
      fetchSlides();
    } catch {
      toast.error("Erro ao atualizar slide");
    }
  }

  async function deleteSlide(id: string) {
    if (!confirm("Excluir este slide permanentemente?")) return;
    try {
      const res = await fetch(`/api/banner-slides/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Slide excluído");
      fetchSlides();
    } catch {
      toast.error("Erro ao excluir slide");
    }
  }

  async function moveSlide(id: string, direction: "up" | "down") {
    const ordered = [...slides].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((s) => s.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    const current = ordered[index];
    const target = ordered[targetIndex];

    try {
      await Promise.all([
        fetch(`/api/banner-slides/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: target.order }),
        }),
        fetch(`/api/banner-slides/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: current.order }),
        }),
      ]);
      fetchSlides();
    } catch {
      toast.error("Erro ao reordenar slides");
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo deve ser uma imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function saveNewSlide() {
    if (!newImage) {
      toast.error("Selecione uma imagem");
      return;
    }
    setSavingSlide(true);
    try {
      const res = await fetch("/api/banner-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: newImage }),
      });
      if (!res.ok) throw new Error();
      toast.success("Slide adicionado com sucesso");
      setNewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSlides();
    } catch {
      toast.error("Erro ao adicionar slide");
    } finally {
      setSavingSlide(false);
    }
  }

  async function saveHero() {
    setSavingHero(true);
    try {
      const res = await fetch("/api/home-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });
      if (!res.ok) throw new Error();
      toast.success("Texto atualizado com sucesso");
    } catch {
      toast.error("Erro ao salvar texto");
    } finally {
      setSavingHero(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    );
  }

  const orderedSlides = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="p-2 text-parish-text-light hover:text-parish-text transition rounded-lg hover:bg-parish-background"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-parish-text">Página Inicial</h1>
          <p className="text-sm text-parish-text-light">
            Gerencie o carrossel e o texto de boas-vindas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-parish-surface rounded-xl p-4 border border-parish-border">
          <p className="text-xs text-parish-text-light uppercase tracking-wide mb-1">
            Total de Slides
          </p>
          <p className="text-3xl font-bold text-parish-text">{slides.length}</p>
        </div>
        <div className="bg-parish-surface rounded-xl p-4 border border-parish-border">
          <p className="text-xs text-parish-text-light uppercase tracking-wide mb-1">
            Slides Ativos
          </p>
          <p className="text-3xl font-bold text-parish-gold">
            {slides.filter((s) => s.active).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-parish-border mb-6">
        <button
          onClick={() => setActiveTab("slides")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === "slides"
              ? "border-parish-gold text-parish-gold"
              : "border-transparent text-parish-text-light hover:text-parish-text"
          }`}
        >
          Slides do Carrossel
        </button>
        <button
          onClick={() => setActiveTab("texto")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === "texto"
              ? "border-parish-gold text-parish-gold"
              : "border-transparent text-parish-text-light hover:text-parish-text"
          }`}
        >
          Texto da Seção
        </button>
      </div>

      {/* ── Tab: Slides ── */}
      {activeTab === "slides" && (
        <div className="space-y-6">
          {orderedSlides.length === 0 ? (
            <div className="text-center py-16 bg-parish-surface rounded-xl border border-parish-border">
              <Layers className="w-12 h-12 text-parish-secondary mx-auto mb-3" />
              <p className="text-parish-text-light font-medium">
                Nenhum slide cadastrado
              </p>
              <p className="text-sm text-parish-secondary mt-1">
                Adicione imagens abaixo para o carrossel
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderedSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`flex items-center gap-4 bg-parish-surface rounded-xl p-4 border transition ${
                    slide.active
                      ? "border-parish-border"
                      : "border-parish-border opacity-50"
                  }`}
                >
                  <span className="w-6 text-center text-xs font-bold text-parish-secondary">
                    {index + 1}
                  </span>

                  <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-parish-background">
                    <img
                      src={slide.image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-parish-text">
                      Slide {index + 1}
                    </p>
                    <span
                      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full mt-1 ${
                        slide.active
                          ? "bg-green-100 text-green-700"
                          : "bg-parish-background text-parish-text-light"
                      }`}
                    >
                      {slide.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveSlide(slide.id, "up")}
                      disabled={index === 0}
                      className="p-2 text-parish-text-light hover:text-parish-text disabled:opacity-25 disabled:cursor-not-allowed transition rounded-lg hover:bg-parish-background"
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSlide(slide.id, "down")}
                      disabled={index === orderedSlides.length - 1}
                      className="p-2 text-parish-text-light hover:text-parish-text disabled:opacity-25 disabled:cursor-not-allowed transition rounded-lg hover:bg-parish-background"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(slide)}
                      className="p-2 text-parish-text-light hover:text-parish-text transition rounded-lg hover:bg-parish-background"
                      title={slide.active ? "Desativar slide" : "Ativar slide"}
                    >
                      {slide.active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteSlide(slide.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                      title="Excluir slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Slide */}
          <div className="bg-parish-surface rounded-xl border border-parish-border p-6">
            <h3 className="text-sm font-semibold text-parish-text mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-parish-gold" />
              Adicionar Novo Slide
            </h3>

            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-parish-border rounded-xl p-8 text-center cursor-pointer hover:border-parish-gold transition group"
              >
                {newImage ? (
                  <>
                    <img
                      src={newImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <p className="text-xs text-parish-text-light">
                      Clique para trocar a imagem
                    </p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-parish-secondary mx-auto mb-3 group-hover:text-parish-gold transition" />
                    <p className="text-sm text-parish-text-light">
                      Clique para selecionar uma imagem
                    </p>
                    <p className="text-xs text-parish-secondary mt-1">
                      PNG, JPG até 5MB
                    </p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                onClick={saveNewSlide}
                disabled={!newImage || savingSlide}
                className="w-full px-4 py-2.5 bg-parish-gold text-white rounded-lg font-medium hover:bg-parish-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingSlide ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {savingSlide ? "Salvando..." : "Adicionar Slide"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Texto ── */}
      {activeTab === "texto" && (
        <div className="bg-parish-surface rounded-xl border border-parish-border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-parish-text mb-1.5">
              Título Principal
            </label>
            <input
              type="text"
              value={hero.heading}
              onChange={(e) => setHero({ ...hero, heading: e.target.value })}
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-parish-text bg-parish-background focus:outline-none focus:ring-2 focus:ring-parish-gold text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-parish-text mb-1.5">
              Subtítulo
            </label>
            <input
              type="text"
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-parish-text bg-parish-background focus:outline-none focus:ring-2 focus:ring-parish-gold text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-parish-text-light uppercase tracking-wide mb-1.5">
                Botão 1 — Texto
              </label>
              <input
                type="text"
                value={hero.btn1Text}
                onChange={(e) => setHero({ ...hero, btn1Text: e.target.value })}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-parish-text bg-parish-background focus:outline-none focus:ring-2 focus:ring-parish-gold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-parish-text-light uppercase tracking-wide mb-1.5">
                Botão 1 — Link
              </label>
              <input
                type="text"
                value={hero.btn1Link}
                onChange={(e) => setHero({ ...hero, btn1Link: e.target.value })}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-parish-text bg-parish-background focus:outline-none focus:ring-2 focus:ring-parish-gold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-parish-text-light uppercase tracking-wide mb-1.5">
                Botão 2 — Texto
              </label>
              <input
                type="text"
                value={hero.btn2Text}
                onChange={(e) => setHero({ ...hero, btn2Text: e.target.value })}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-parish-text bg-parish-background focus:outline-none focus:ring-2 focus:ring-parish-gold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-parish-text-light uppercase tracking-wide mb-1.5">
                Botão 2 — Link
              </label>
              <input
                type="text"
                value={hero.btn2Link}
                onChange={(e) => setHero({ ...hero, btn2Link: e.target.value })}
                className="w-full px-4 py-2.5 border border-parish-border rounded-lg text-parish-text bg-parish-background focus:outline-none focus:ring-2 focus:ring-parish-gold text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={saveHero}
              disabled={savingHero}
              className="px-6 py-2.5 bg-parish-gold text-white rounded-lg font-medium hover:bg-parish-gold-dark transition disabled:opacity-50 flex items-center gap-2"
            >
              {savingHero ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingHero ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
