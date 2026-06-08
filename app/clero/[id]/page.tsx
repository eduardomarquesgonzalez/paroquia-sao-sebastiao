"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserCircle2,
  MapPin,
  Calendar,
  Sparkles,
  BookOpen,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { formatDate } from "@/lib/utils";

interface CleroMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  birthDate: string | null;
  birthCity: string | null;
  ordinationDate: string | null;
  ordainer: string | null;
  currentRole: string | null;
  biography: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  whatsapp: string | null;
  tiktok: string | null;
}

const ROLE_BADGE: Record<string, string> = {
  "Pároco": "bg-parish-gold/15 text-parish-gold border-parish-gold/30",
  "Vigário": "bg-parish-navy/10 text-parish-navy border-parish-navy/20",
  "Seminarista": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function TikTokIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.2 8.2 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.03-.08z" />
    </svg>
  );
}

export default function CleroDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<CleroMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/clero/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setMember)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const isPadre = member && ["Pároco", "Vigário"].includes(member.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-parish-background">
        <PublicNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-parish-background">
        <PublicNavbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <UserCircle2 className="w-16 h-16 text-parish-border mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-parish-text mb-2">Membro não encontrado</h1>
          <p className="text-parish-text-light mb-6">O perfil que você procura não existe ou foi removido.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-parish-gold text-white rounded-lg font-semibold text-sm hover:bg-parish-gold-dark transition">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parish-background">
      <PublicNavbar />

      {/* ─── HERO BANNER ─── */}
      <section className="bg-parish-navy relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-parish-gold/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 py-16 relative">
          <nav className="flex items-center gap-2 text-xs text-white/45 mb-8">
            <Link href="/" className="hover:text-white/70 transition">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/60">Clero</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80 truncate max-w-[160px]">{member.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden border-4 border-white/15 shadow-xl bg-parish-navy-dark flex items-center justify-center">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 className="w-24 h-24 text-white/20" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <span className={`inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-3 ${ROLE_BADGE[member.role] ?? "bg-white/10 text-white/80 border-white/20"}`}>
                {member.role}
              </span>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                {member.name}
              </h1>
              {member.currentRole && (
                <p className="text-white/65 text-sm md:text-base">{member.currentRole}</p>
              )}

              {/* Social icons */}
              {(member.instagram || member.facebook || member.youtube || member.whatsapp || member.tiktok) && (
                <div className="flex items-center gap-3 mt-5 justify-center md:justify-start">
                  {member.instagram && (
                    <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-parish-gold hover:border-parish-gold flex items-center justify-center transition-all duration-200" aria-label="Instagram">
                      <Instagram className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {member.facebook && (
                    <a href={member.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-parish-gold hover:border-parish-gold flex items-center justify-center transition-all duration-200" aria-label="Facebook">
                      <Facebook className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {member.youtube && (
                    <a href={member.youtube} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-parish-gold hover:border-parish-gold flex items-center justify-center transition-all duration-200" aria-label="YouTube">
                      <Youtube className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {member.whatsapp && (
                    <a href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-parish-gold hover:border-parish-gold flex items-center justify-center transition-all duration-200" aria-label="WhatsApp">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {member.tiktok && (
                    <a href={member.tiktok} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-parish-gold hover:border-parish-gold flex items-center justify-center transition-all duration-200" aria-label="TikTok">
                      <TikTokIcon />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BODY ─── */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left: info cards */}
            <div className="md:col-span-1 space-y-4">

              {/* Informações pessoais */}
              <div className="bg-parish-surface rounded-2xl border border-parish-border p-5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-parish-gold mb-4">
                  Informações Pessoais
                </h2>
                <ul className="space-y-3">
                  {member.birthDate && (
                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-parish-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] text-parish-text-light uppercase tracking-wide">Nascimento</p>
                        <p className="text-sm font-medium text-parish-text">{formatDate(member.birthDate)}</p>
                      </div>
                    </li>
                  )}
                  {member.birthCity && (
                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-parish-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] text-parish-text-light uppercase tracking-wide">Cidade natal</p>
                        <p className="text-sm font-medium text-parish-text">{member.birthCity}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Informações religiosas (só para padres) */}
              {isPadre && (member.ordinationDate || member.ordainer || member.currentRole) && (
                <div className="bg-parish-surface rounded-2xl border border-parish-border p-5">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-parish-gold mb-4">
                    Vida Religiosa
                  </h2>
                  <ul className="space-y-3">
                    {member.ordinationDate && (
                      <li className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-parish-gold" />
                        </div>
                        <div>
                          <p className="text-[10px] text-parish-text-light uppercase tracking-wide">Ordenação</p>
                          <p className="text-sm font-medium text-parish-text">{formatDate(member.ordinationDate)}</p>
                        </div>
                      </li>
                    )}
                    {member.ordainer && (
                      <li className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UserCircle2 className="w-3.5 h-3.5 text-parish-gold" />
                        </div>
                        <div>
                          <p className="text-[10px] text-parish-text-light uppercase tracking-wide">Ordenante</p>
                          <p className="text-sm font-medium text-parish-text">{member.ordainer}</p>
                        </div>
                      </li>
                    )}
                    {member.currentRole && (
                      <li className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-parish-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-parish-gold" />
                        </div>
                        <div>
                          <p className="text-[10px] text-parish-text-light uppercase tracking-wide">Função atual</p>
                          <p className="text-sm font-medium text-parish-text">{member.currentRole}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: biography */}
            <div className="md:col-span-2">
              {member.biography ? (
                <div className="bg-parish-surface rounded-2xl border border-parish-border p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-parish-gold flex-shrink-0" />
                    <h2 className="font-playfair text-xl font-bold text-parish-navy-dark">
                      {member.role === "Seminarista" ? "Vocação e Caminhada" : "Biografia"}
                    </h2>
                  </div>
                  <div className="text-parish-text leading-relaxed whitespace-pre-wrap text-[15px]">
                    {member.biography}
                  </div>
                </div>
              ) : (
                <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
                  <BookOpen className="w-10 h-10 text-parish-border mb-3" />
                  <p className="text-parish-text-light text-sm">Biografia em breve</p>
                </div>
              )}
            </div>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-parish-border">
            <Link href="/" className="inline-flex items-center gap-2 text-parish-gold hover:text-parish-gold-dark font-medium text-sm transition">
              <ArrowLeft className="w-4 h-4" /> Voltar ao início
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
