"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import logoImg from "@/public/logo.png";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Eventos" },
  { href: "/comunidades", label: "Comunidades" },
  { href: "/projetos-sociais", label: "Projetos Sociais" },
  { href: "/missas", label: "Missas" },
  { href: "/contato", label: "Contato" },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-xl shadow-glass border-b border-white/30"
          : "bg-white/75 backdrop-blur-lg"
      }`}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={logoImg}
              alt="Logo da Paróquia"
              width={42}
              height={42}
              className="object-contain"
            />
            <div>
              <span className="block font-playfair font-bold text-base md:text-lg text-parish-navy-dark leading-tight">
                Paróquia São Sebastião
              </span>
              <span className="block text-[11px] text-parish-text-light tracking-wide hidden sm:block">
                Três Barras · Cuiabá-MT
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-parish-text hover:text-parish-gold rounded-lg hover:bg-parish-gold/6 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold bg-parish-navy text-white rounded-lg hover:bg-parish-navy-dark transition-colors duration-200"
            >
              Área Admin
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-2 text-parish-text hover:text-parish-gold rounded-lg hover:bg-parish-gold/6 transition-colors"
              aria-label="Abrir menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <div className="border-t border-parish-border/40 pt-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block px-4 py-2.5 text-sm font-medium text-parish-text hover:text-parish-gold hover:bg-parish-gold/6 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-parish-border/40">
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="block px-4 py-2.5 text-sm font-semibold bg-parish-navy text-white rounded-lg text-center hover:bg-parish-navy-dark transition-colors mt-2"
              >
                Área Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
