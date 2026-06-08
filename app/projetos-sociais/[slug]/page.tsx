"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  Heart, MapPin, Clock, Users, User, Phone, Mail,
  ArrowLeft, MessageCircle, HandHeart, ChevronRight, X
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

interface SocialProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  objective: string | null;
  schedules: string[];
  location: string | null;
  audience: string | null;
  responsible: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  image: string | null;
  gallery: string[];
  mapUrl: string | null;
}

export default function ProjetoSocialPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<SocialProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projetos-sociais/${slug}`)
      .then((r) => {
        if (!r.ok) { setNotFoundState(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProject(data); })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-parish-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    );
  }

  if (notFoundState || !project) return notFound();

  const whatsappLink = project.whatsapp
    ? `https://wa.me/55${project.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Tenho interesse no projeto ${project.name} da Paróquia São Sebastião.`)}`
    : null;

  const isEmbedMap = project.mapUrl?.includes("maps.google.com/maps/embed") ||
    project.mapUrl?.includes("google.com/maps/embed");

  return (
    <div className="min-h-screen bg-parish-background">
      <PublicNavbar />

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxImg(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImg}
            alt="Foto do projeto"
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Hero banner */}
      <section className="relative h-72 md:h-96 bg-parish-text-dark overflow-hidden">
        {project.image ? (
          <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-parish-gold/30 to-parish-sky/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="container mx-auto">
            <nav className="flex items-center gap-2 text-xs text-white/50 mb-4">
              <Link href="/" className="hover:text-white/80 transition">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/projetos-sociais" className="hover:text-white/80 transition">Projetos Sociais</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/70 line-clamp-1">{project.name}</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-parish-gold/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
              <Heart className="w-3 h-3" /> Projeto Social
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-2xl">
              {project.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div className="bg-parish-surface rounded-2xl border border-parish-border p-8">
              <h2 className="text-xl font-bold text-parish-text mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-parish-gold rounded-full inline-block" />
                Sobre o Projeto
              </h2>
              <p className="text-parish-text-light leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Objective */}
            {project.objective && (
              <div className="bg-gradient-to-br from-parish-gold/5 to-parish-sky/5 rounded-2xl border border-parish-gold/20 p-8">
                <h2 className="text-xl font-bold text-parish-text mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-parish-gold" />
                  Objetivo Social
                </h2>
                <p className="text-parish-text-light leading-relaxed whitespace-pre-line">
                  {project.objective}
                </p>
              </div>
            )}

            {/* Gallery */}
            {project.gallery.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-parish-text mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-parish-gold rounded-full inline-block" />
                  Galeria de Fotos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {project.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxImg(img)}
                      className="group relative h-40 rounded-xl overflow-hidden border border-parish-border hover:border-parish-gold transition-all duration-200 hover:shadow-lg"
                    >
                      <img
                        src={img}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {isEmbedMap && (
              <div>
                <h2 className="text-xl font-bold text-parish-text mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-parish-gold" />
                  Localização
                </h2>
                <div className="rounded-2xl overflow-hidden border border-parish-border h-72">
                  <iframe
                    src={project.mapUrl!}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    className="border-0"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Info card */}
            <div className="bg-parish-surface rounded-2xl border border-parish-border p-6 space-y-5">
              <h3 className="font-bold text-parish-text text-lg">Informações</h3>

              {project.schedules.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-parish-gold mb-2">
                    <Clock className="w-3.5 h-3.5" /> Horários
                  </div>
                  <ul className="space-y-1.5">
                    {project.schedules.map((s, i) => (
                      <li key={i} className="text-sm text-parish-text-light bg-parish-background rounded-lg px-3 py-2">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.location && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-parish-gold mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Local
                  </div>
                  <p className="text-sm text-parish-text-light bg-parish-background rounded-lg px-3 py-2">
                    {project.location}
                  </p>
                </div>
              )}

              {project.audience && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-parish-gold mb-2">
                    <Users className="w-3.5 h-3.5" /> Público Atendido
                  </div>
                  <p className="text-sm text-parish-text-light bg-parish-background rounded-lg px-3 py-2">
                    {project.audience}
                  </p>
                </div>
              )}

              {project.responsible && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-parish-gold mb-2">
                    <User className="w-3.5 h-3.5" /> Responsável
                  </div>
                  <p className="text-sm text-parish-text-light bg-parish-background rounded-lg px-3 py-2">
                    {project.responsible}
                  </p>
                </div>
              )}
            </div>

            {/* Contact / CTA */}
            <div className="bg-parish-surface rounded-2xl border border-parish-border p-6 space-y-4">
              <h3 className="font-bold text-parish-text text-lg">Participar ou Apoiar</h3>
              <p className="text-sm text-parish-text-light">
                Quer fazer parte deste projeto ou ajudar com doações e voluntariado?
              </p>

              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Falar pelo WhatsApp
                </a>
              )}

              {project.phone && (
                <a
                  href={`tel:${project.phone.replace(/\D/g, "")}`}
                  className="flex items-center justify-center gap-2 w-full py-3 border border-parish-border text-parish-text-light hover:bg-parish-background rounded-xl text-sm font-medium transition"
                >
                  <Phone className="w-4 h-4 text-parish-gold" />
                  {project.phone}
                </a>
              )}

              {project.email && (
                <a
                  href={`mailto:${project.email}`}
                  className="flex items-center justify-center gap-2 w-full py-3 border border-parish-border text-parish-text-light hover:bg-parish-background rounded-xl text-sm font-medium transition"
                >
                  <Mail className="w-4 h-4 text-parish-gold" />
                  {project.email}
                </a>
              )}

              <div className="pt-2 border-t border-parish-border">
                <Link
                  href="/contato"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-parish-gold hover:bg-parish-gold-dark text-white rounded-xl font-semibold transition text-sm"
                >
                  <HandHeart className="w-4 h-4" />
                  Quero ser Voluntário
                </Link>
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/projetos-sociais"
              className="flex items-center gap-2 text-sm text-parish-text-light hover:text-parish-gold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Todos os projetos sociais
            </Link>
          </aside>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
