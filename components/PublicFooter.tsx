"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import logoImg from "@/public/logo.png";

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function PublicFooter() {
  return (
    <footer className="bg-parish-navy-dark text-white">
      <div className="border-b border-white/8">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

            {/* Brand */}
            <div className="lg:col-span-5">
              <Link href="/" className="flex items-center gap-3 mb-5">
                <Image
                  src={logoImg}
                  alt="Logo da Paróquia"
                  width={44}
                  height={44}
                  className="object-contain brightness-0 invert opacity-90"
                />
                <div>
                  <span className="block font-playfair font-bold text-xl text-white leading-tight">
                    Paróquia São Sebastião
                  </span>
                  <span className="block text-[11px] text-white/45 tracking-widest uppercase mt-0.5">
                    Três Barras · Cuiabá-MT
                  </span>
                </div>
              </Link>
              <p className="text-white/55 text-sm leading-relaxed max-w-xs">
                Uma comunidade católica dedicada à fé, esperança e caridade.
                Bem-vindo à nossa família paroquial em Três Barras.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="https://www.instagram.com/sebastiao.tresbarras/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/8 hover:bg-parish-gold border border-white/10 hover:border-parish-gold flex items-center justify-center transition-all duration-200"
                  aria-label="Instagram da Paróquia"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>

            {/* Links rápidos */}
            <div className="lg:col-span-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold mb-5">
                Links Rápidos
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/missas", label: "Horários de Missas" },
                  { href: "/comunidades", label: "Comunidades" },
                  { href: "/eventos", label: "Eventos" },
                  { href: "/projetos-sociais", label: "Projetos Sociais" },
                  { href: "/contato", label: "Contato" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2.5 text-white/55 hover:text-white text-sm transition-colors duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-parish-gold/40 group-hover:bg-parish-gold transition-colors flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div className="lg:col-span-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold mb-5">
                Contato
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-parish-gold flex-shrink-0 mt-0.5" />
                  <div className="text-white/55 text-sm leading-relaxed">
                    Av. A, 332 – Três Barras<br />
                    Cuiabá-MT, 78058-531
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-parish-gold flex-shrink-0"><PhoneIcon /></span>
                  <a href="tel:+5565992771705" className="text-white/55 hover:text-white text-sm transition-colors duration-200">
                    (65) 9 9277-1705
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-parish-gold flex-shrink-0"><MailIcon /></span>
                  <a href="mailto:saosebastiaomt@outlook.com.br" className="text-white/55 hover:text-white text-sm transition-colors duration-200 break-all">
                    saosebastiaomt@outlook.com.br
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-parish-gold flex-shrink-0"><InstagramIcon /></span>
                  <a
                    href="https://www.instagram.com/sebastiao.tresbarras/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/55 hover:text-white text-sm transition-colors duration-200"
                  >
                    @sebastiao.tresbarras
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto px-4 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">
            &copy; 2026 Paróquia São Sebastião. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-parish-gold/40 text-xs">✦</span>
            <span className="text-white/25 text-xs">Três Barras, Cuiabá-MT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
