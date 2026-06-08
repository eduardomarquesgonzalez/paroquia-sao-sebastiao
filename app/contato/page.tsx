"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircle, Clock, ExternalLink, ChevronRight } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const INSTAGRAM_URL = "https://www.instagram.com/sebastiao.tresbarras/";
const WHATSAPP_NUMBER = "5565992771705";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Par%C3%B3quia%20S%C3%A3o%20Sebasti%C3%A3o.`;
const MAPS_LINK = "https://maps.google.com/?q=Av.+A,+332+-+Tr%C3%AAs+Barras,+Cuiab%C3%A1+-+MT,+78058-531";

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-parish-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative bg-parish-text-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parish-gold/20 via-transparent to-parish-sky/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-parish-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-parish-sky/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 py-24 relative">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
            <Link href="/" className="hover:text-white/80 transition">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">Contato</span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-parish-gold/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-parish-gold" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-parish-gold">
                Fale Conosco
              </span>
            </div>
            <h1 className="font-playfair text-5xl font-bold text-white mb-6 leading-tight">
              Entre em Contato
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Estamos aqui para servir você. Fale conosco por qualquer um dos
              canais abaixo e responderemos o mais breve possível.
            </p>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-parish-background"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      {/* Contact cards */}
      <section className="py-16 bg-parish-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Email */}
            <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mb-5 group-hover:bg-parish-gold/20 transition">
                <Mail className="w-8 h-8 text-parish-gold" />
              </div>
              <h2 className="font-bold text-lg text-parish-text mb-1">E-mail</h2>
              <p className="text-sm text-parish-text-light mb-5">Envie sua mensagem a qualquer hora</p>
              <a
                href="mailto:saosebastiaomt@outlook.com.br"
                className="text-parish-gold font-medium text-sm hover:text-parish-gold-dark transition break-all"
              >
                saosebastiaomt@outlook.com.br
              </a>
            </div>

            {/* WhatsApp */}
            <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-bold text-lg text-parish-text mb-1">WhatsApp</h2>
              <p className="text-sm text-parish-text-light mb-5">Atendimento rápido pelo WhatsApp</p>
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="text-parish-text font-semibold text-lg hover:text-parish-gold transition mb-4"
              >
                (65) 9 9277-1705
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir WhatsApp
              </a>
            </div>

            {/* Endereço */}
            <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mb-5 group-hover:bg-parish-gold/20 transition">
                <MapPin className="w-8 h-8 text-parish-gold" />
              </div>
              <h2 className="font-bold text-lg text-parish-text mb-1">Endereço</h2>
              <p className="text-sm text-parish-text-light mb-5">Venha nos visitar pessoalmente</p>
              <address className="not-italic text-parish-text text-sm leading-relaxed mb-5">
                Av. A, 332 – Três Barras<br />
                Cuiabá – MT, 78058-531
              </address>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-parish-gold hover:text-parish-gold-dark font-medium transition"
              >
                <ExternalLink className="w-4 h-4" />
                Ver no Maps
              </a>
            </div>

            {/* Instagram */}
            <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-5 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition">
                <InstagramIcon className="w-8 h-8 text-pink-500" />
              </div>
              <h2 className="font-bold text-lg text-parish-text mb-1">Instagram</h2>
              <p className="text-sm text-parish-text-light mb-5">Acompanhe nossas novidades</p>
              <p className="text-parish-text font-semibold text-sm mb-4">@sebastiao.tresbarras</p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-all text-sm"
              >
                <InstagramIcon className="w-4 h-4" />
                Seguir
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Horários de atendimento */}
      <section className="pb-12 bg-parish-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-parish-surface rounded-2xl border border-parish-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-parish-gold/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-parish-gold" />
              </div>
              <h2 className="text-xl font-bold text-parish-text">Horários de Atendimento</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { dias: "Segunda a Sexta", horario: "08h00 – 12h00 / 14h00 – 18h00" },
                { dias: "Sábado", horario: "08h00 – 12h00" },
                { dias: "Domingo", horario: "Após as Missas" },
                { dias: "Feriados", horario: "Consultar por WhatsApp" },
              ].map(({ dias, horario }) => (
                <div key={dias} className="flex items-start gap-3 p-4 rounded-xl bg-parish-background border border-parish-border/50">
                  <span className="w-2 h-2 rounded-full bg-parish-gold mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-parish-text text-sm">{dias}</p>
                    <p className="text-parish-text-light text-sm">{horario}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section className="py-16 bg-parish-surface border-t border-parish-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-parish-gold/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-parish-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-parish-text">Nossa Localização</h2>
              <p className="text-parish-text-light text-sm mt-0.5">
                Av. A, 332 – Três Barras, Cuiabá-MT
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-parish-border shadow-lg">
            <iframe
              title="Localização da Paróquia São Sebastião"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3843.8!2d-56.10222!3d-15.5717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x939db1a92e3bc82f%3A0x5c6e14e5c01b4a0!2sAv.%20A%2C%20332%20-%20Tr%C3%AAs%20Barras%2C%20Cuiab%C3%A1%20-%20MT%2C%2078058-531!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="450"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-parish-gold hover:bg-parish-gold-dark text-white rounded-xl font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver no Google Maps
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
