"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import logoImg from "@/public/logo.png";

interface NavAtividade {
  id: string;
  nome: string;
  slug: string;
  linkExterno: string | null;
  navbarOrder: number;
}

const NAV_LINKS_BEFORE = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Eventos" },
  { href: "/comunidades", label: "Comunidades" },
  { href: "/projetos-sociais", label: "Projetos Sociais" },
];

const NAV_LINKS_AFTER = [
  { href: "/missas", label: "Missas" },
  { href: "/contato", label: "Contato" },
];

const linkClass =
  "px-3.5 py-2 text-sm font-medium text-parish-text hover:text-parish-gold rounded-lg hover:bg-parish-gold/6 transition-all duration-200";

const mobileLinkClass =
  "block px-4 py-2.5 text-sm font-medium text-parish-text hover:text-parish-gold hover:bg-parish-gold/6 rounded-lg transition-all";

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navAtividades, setNavAtividades] = useState<NavAtividade[]>([]);
  const [mobileAtivOpen, setMobileAtivOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMobileAtivOpen(false);
  }, []);

  // Busca itens do navbar de forma assíncrona (sem bloquear renderização)
  useEffect(() => {
    fetch("/api/atividades/navbar")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setNavAtividades(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasAtividades = navAtividades.length > 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-parish-border">
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
            {NAV_LINKS_BEFORE.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}

            {/* Dropdown dinâmico de atividades */}
            {hasAtividades && (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`${linkClass} inline-flex items-center gap-1`}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  Atividades
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white border border-parish-border rounded-xl shadow-lg py-1.5 z-50 transition-all duration-150 origin-top ${
                    dropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  role="menu"
                >
                  {/* Seta decorativa */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-parish-border rotate-45" />

                  {navAtividades.map((a) => (
                    <Link
                      key={a.id}
                      href={a.linkExterno || `/atividades/${a.slug}`}
                      target={a.linkExterno ? "_blank" : undefined}
                      rel={a.linkExterno ? "noopener noreferrer" : undefined}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-parish-text hover:text-parish-gold hover:bg-parish-gold/6 transition-all"
                      role="menuitem"
                    >
                      {a.nome}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {NAV_LINKS_AFTER.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
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
            menuOpen ? "max-h-[600px] pb-4" : "max-h-0"
          }`}
        >
          <div className="border-t border-parish-border/40 pt-3 space-y-0.5">
            {NAV_LINKS_BEFORE.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                {link.label}
              </Link>
            ))}

            {/* Seção de atividades no mobile */}
            {hasAtividades && (
              <div>
                <button
                  onClick={() => setMobileAtivOpen((v) => !v)}
                  className={`w-full flex items-center justify-between ${mobileLinkClass}`}
                >
                  <span>Atividades</span>
                  <ChevronDown
                    className={`w-4 h-4 text-parish-secondary transition-transform duration-200 ${
                      mobileAtivOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Itens filhos com animação */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    mobileAtivOpen ? "max-h-80" : "max-h-0"
                  }`}
                >
                  <div className="pl-4 border-l-2 border-parish-gold/30 ml-4 mt-0.5 space-y-0.5">
                    {navAtividades.map((a) => (
                      <Link
                        key={a.id}
                        href={a.linkExterno || `/atividades/${a.slug}`}
                        target={a.linkExterno ? "_blank" : undefined}
                        rel={a.linkExterno ? "noopener noreferrer" : undefined}
                        onClick={closeMenu}
                        className="block px-3 py-2 text-sm text-parish-text-light hover:text-parish-gold hover:bg-parish-gold/6 rounded-lg transition-all"
                      >
                        {a.nome}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {NAV_LINKS_AFTER.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={mobileLinkClass}
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
