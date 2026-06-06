"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, ArrowLeft, Clock, ExternalLink } from "lucide-react";

const WHATSAPP_NUMBER = "5565992771705";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Par%C3%B3quia%20S%C3%A3o%20Sebasti%C3%A3o.`;
const MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3843.xxxxxx!2d-56.0850!3d-15.5960!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDM1JzQ1LjYiUyA1NsKwMDUnMDYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr";
const MAPS_LINK = "https://maps.google.com/?q=Av.+A,+332+-+Tr%C3%AAs+Barras,+Cuiab%C3%A1+-+MT,+78058-531";

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-parish-background">
      {/* Header */}
      <header className="bg-parish-surface shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div>
                <h1 className="font-bold text-xl text-parish-text-dark">
                  Paróquia São Sebastião
                </h1>
                <p className="text-xs text-parish-text-light">Três Barras, Cuiabá-MT</p>
              </div>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-parish-text-light hover:text-parish-gold transition">Início</Link>
              <Link href="/posts" className="text-parish-text-light hover:text-parish-gold transition">Notícias</Link>
              <Link href="/eventos" className="text-parish-text-light hover:text-parish-gold transition">Eventos</Link>
              <Link href="/missas" className="text-parish-text-light hover:text-parish-gold transition">Missas</Link>
              <Link href="/sobre" className="text-parish-text-light hover:text-parish-gold transition">Sobre</Link>
              <Link href="/contato" className="text-parish-gold font-medium">Contato</Link>
            </div>
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition text-sm font-medium"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-parish-sky to-parish-gold overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-20 text-white">
          <Link
            href="/"
            className="inline-flex items-center text-white/75 hover:text-white text-sm mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o início
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Entre em<br />Contato
          </h1>
          <p className="text-white/80 text-lg max-w-lg">
            Estamos aqui para servir você. Fale conosco por qualquer um dos canais abaixo.
          </p>
        </div>
      </div>

      {/* Cards de contato */}
      <main className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-10 relative z-10 mb-16">

          {/* Email */}
          <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
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

          {/* WhatsApp / Telefone */}
          <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-bold text-lg text-parish-text mb-1">WhatsApp</h2>
            <p className="text-sm text-parish-text-light mb-5">Atendimento rápido pelo WhatsApp</p>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="text-parish-text font-semibold text-lg hover:text-parish-gold transition mb-5"
            >
              (65) 9 9277-1705
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Conversar no WhatsApp
            </a>
          </div>

          {/* Endereço */}
          <div className="bg-parish-surface rounded-2xl border border-parish-border p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
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
              Abrir no Google Maps
            </a>
          </div>
        </div>

        {/* Horários de atendimento */}
        <section className="bg-parish-surface rounded-2xl border border-parish-border p-8 mb-16">
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
              <div key={dias} className="flex items-start gap-3 p-4 rounded-xl bg-parish-background">
                <span className="w-2 h-2 rounded-full bg-parish-gold mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-parish-text text-sm">{dias}</p>
                  <p className="text-parish-text-light text-sm">{horario}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mapa */}
      <section className="bg-parish-surface border-t border-parish-border py-16">
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

      {/* Footer */}
      <footer className="bg-parish-text-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Paróquia São Sebastião</h3>
              <p className="text-parish-secondary text-sm">
                Uma comunidade católica dedicada à fé, esperança e caridade.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="text-parish-secondary text-sm space-y-2">
                <li><Link href="/missas" className="hover:text-white transition">Horários de Missas</Link></li>
                <li><Link href="/eventos" className="hover:text-white transition">Eventos</Link></li>
                <li><Link href="/posts" className="hover:text-white transition">Notícias</Link></li>
                <li><Link href="/contato" className="hover:text-white transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="text-parish-secondary text-sm space-y-2">
                <li>Av. A, 332 – Três Barras</li>
                <li>Cuiabá-MT, 78058-531</li>
                <li>saosebastiaomt@outlook.com.br</li>
                <li>(65) 9 9277-1705</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-parish-text pt-8 text-center text-parish-secondary text-sm">
            <p>&copy; 2026 Paróquia São Sebastião. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
