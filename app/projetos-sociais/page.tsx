"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, MapPin, Clock, Users, ChevronRight } from "lucide-react";

interface SocialProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  objective: string | null;
  location: string | null;
  audience: string | null;
  schedules: string[];
  image: string | null;
}

export default function ProjetosSociaisPage() {
  const [projects, setProjects] = useState<SocialProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projetos-sociais")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-parish-background">
      {/* Hero */}
      <section className="relative bg-parish-text-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parish-gold/20 via-transparent to-parish-sky/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-parish-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-parish-sky/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 py-24 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
            <Link href="/" className="hover:text-white/80 transition">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">Projetos Sociais</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-parish-gold/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-parish-gold" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-parish-gold">
                Ação Social
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Projetos Sociais
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Nossa paróquia acredita que a fé se expressa no amor ao próximo.
              Conheça os projetos que transformam vidas e fortalecem nossa comunidade.
            </p>
          </div>

          {/* Stats bar */}
          {!loading && projects.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{projects.length}</p>
                <p className="text-xs text-white/60 mt-0.5">Projetos ativos</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-parish-background" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* Mission statement */}
      <section className="py-16 bg-parish-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-1 bg-parish-gold mx-auto mb-6 rounded-full" />
            <p className="text-lg text-parish-text-light leading-relaxed">
              &ldquo;O serviço ao próximo é parte essencial da vida cristã. Cada projeto social da
              nossa paróquia nasce do amor e do compromisso com a dignidade humana,
              levando esperança e cuidado a quem mais precisa.&rdquo;
            </p>
            <p className="text-sm text-parish-gold font-semibold mt-4">— Paróquia São Sebastião</p>
          </div>
        </div>
      </section>

      {/* Projects listing */}
      <section className="pb-20 bg-parish-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 bg-parish-surface rounded-3xl border border-parish-border">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-parish-gold" />
              </div>
              <p className="font-semibold text-parish-text mb-1">Nenhum projeto cadastrado ainda</p>
              <p className="text-sm text-parish-text-light">Em breve novos projetos serão divulgados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group bg-parish-surface rounded-2xl overflow-hidden border border-parish-border/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden flex-shrink-0">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-parish-gold/30 to-parish-sky/30 flex items-center justify-center">
                        <Heart className="w-16 h-16 text-parish-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <div className="absolute top-4 left-4 bg-parish-gold text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Projeto Social
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6">
                    <h2 className="text-xl font-bold text-parish-text group-hover:text-parish-gold transition-colors duration-200 mb-2 leading-snug line-clamp-2">
                      {project.name}
                    </h2>

                    <p className="text-sm text-parish-text-light line-clamp-3 mb-4 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="space-y-2 mt-auto mb-5">
                      {project.schedules.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-parish-text-light">
                          <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-3 h-3 text-parish-gold" />
                          </div>
                          <span>{project.schedules[0]}{project.schedules.length > 1 ? ` +${project.schedules.length - 1}` : ""}</span>
                        </div>
                      )}
                      {project.location && (
                        <div className="flex items-center gap-2 text-xs text-parish-text-light">
                          <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-3 h-3 text-parish-gold" />
                          </div>
                          <span className="line-clamp-1">{project.location}</span>
                        </div>
                      )}
                      {project.audience && (
                        <div className="flex items-center gap-2 text-xs text-parish-text-light">
                          <div className="w-5 h-5 rounded bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-3 h-3 text-parish-gold" />
                          </div>
                          <span className="line-clamp-1">{project.audience}</span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/projetos-sociais/${project.slug}`}
                      className="group/btn flex items-center justify-center gap-2 w-full py-2.5 bg-parish-gold hover:bg-parish-gold-dark text-white text-sm font-semibold rounded-xl transition-all duration-200"
                    >
                      Saiba Mais
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-16 bg-parish-surface border-t border-parish-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-parish-text mb-3">Quer fazer parte?</h2>
          <p className="text-parish-text-light mb-6 max-w-md mx-auto">
            Entre em contato conosco e descubra como você pode colaborar com nossa missão social.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-6 py-3 bg-parish-gold text-white rounded-xl font-semibold hover:bg-parish-gold-dark transition"
          >
            Fale Conosco
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
