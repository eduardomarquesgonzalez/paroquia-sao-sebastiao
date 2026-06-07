"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Church, ArrowRight, ArrowLeft } from "lucide-react";

interface Mass {
  id: string;
  dayOfWeek: string;
  time: string;
  type: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  image: string | null;
  masses: Mass[];
}

const DAY_ORDER: Record<string, number> = {
  domingo: 0, segunda: 1, "segunda-feira": 1,
  terca: 2, "terça": 2, "terça-feira": 2,
  quarta: 3, "quarta-feira": 3,
  quinta: 4, "quinta-feira": 4,
  sexta: 5, "sexta-feira": 5,
  sabado: 6, "sábado": 6,
};

function getFirstMasses(masses: Mass[], max = 2): string {
  if (!masses.length) return "";
  const sorted = [...masses].sort(
    (a, b) =>
      (DAY_ORDER[a.dayOfWeek.toLowerCase()] ?? 9) -
      (DAY_ORDER[b.dayOfWeek.toLowerCase()] ?? 9)
  );
  const formatted = sorted
    .slice(0, max)
    .map((m) => `${capitalize(m.dayOfWeek)} ${m.time}`);
  const extra = masses.length - max;
  return formatted.join(" · ") + (extra > 0 ? ` +${extra}` : "");
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ComunidadesPage() {
  const [comunidades, setComunidades] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/comunidades/public")
      .then((r) => r.json())
      .then((data) => setComunidades(Array.isArray(data) ? data : []))
      .catch(() => setComunidades([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-parish-background">
      {/* Header */}
      <header className="bg-parish-surface shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div>
                <h1 className="font-bold text-xl text-parish-text-dark">Paróquia São Sebastião</h1>
                <p className="text-xs text-parish-text-light">Três Barras, Cuiabá-MT</p>
              </div>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-parish-text-light hover:text-parish-gold transition">Início</Link>
              <Link href="/posts" className="text-parish-text-light hover:text-parish-gold transition">Notícias</Link>
              <Link href="/eventos" className="text-parish-text-light hover:text-parish-gold transition">Eventos</Link>
              <Link href="/comunidades" className="text-parish-gold font-medium">Comunidades</Link>
              <Link href="/missas" className="text-parish-text-light hover:text-parish-gold transition">Missas</Link>
              <Link href="/contato" className="text-parish-text-light hover:text-parish-gold transition">Contato</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition text-sm font-medium">
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-parish-sky to-parish-gold py-16 text-white">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white/75 hover:text-white text-sm mb-6 transition">
            <ArrowLeft className="w-4 h-4 mr-1" />Voltar para o início
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Church className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Nossas Comunidades</h1>
          </div>
          <p className="text-white/80 text-lg max-w-xl">
            Conheça as comunidades que fazem parte da Paróquia São Sebastião
            em Cuiabá-MT.
          </p>
        </div>
      </div>

      {/* Grid */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
          </div>
        ) : comunidades.length === 0 ? (
          <div className="text-center py-20 bg-parish-surface rounded-2xl border border-parish-border">
            <Church className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-parish-text mb-2">Nenhuma comunidade cadastrada</h2>
            <p className="text-parish-text-light">Em breve as comunidades estarão disponíveis.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comunidades.map((c) => (
              <Link
                key={c.id}
                href={`/comunidades/${c.slug}`}
                className="group bg-parish-surface rounded-2xl border border-parish-border overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-parish-gold/40 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="h-48 flex-shrink-0 overflow-hidden">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-parish-sky to-parish-gold flex items-center justify-center">
                      <Church className="w-16 h-16 text-white opacity-60" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <h2 className="font-bold text-lg text-parish-text group-hover:text-parish-gold transition leading-snug">
                    {c.name}
                  </h2>

                  {c.description && (
                    <p className="text-sm text-parish-text-light line-clamp-2">{c.description}</p>
                  )}

                  <div className="space-y-2 mt-auto">
                    {(c.neighborhood || c.address) && (
                      <div className="flex items-start gap-2 text-sm text-parish-text-light">
                        <MapPin className="w-4 h-4 text-parish-gold flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {c.neighborhood || c.address}
                          {c.city ? `, ${c.city}` : ""}
                        </span>
                      </div>
                    )}
                    {c.masses.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-parish-text-light">
                        <Clock className="w-4 h-4 text-parish-gold flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{getFirstMasses(c.masses)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-parish-border mt-2">
                    <span className="text-xs text-parish-secondary">
                      {c.masses.length > 0
                        ? `${c.masses.length} missa${c.masses.length > 1 ? "s" : ""} cadastrada${c.masses.length > 1 ? "s" : ""}`
                        : "Horários em breve"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-parish-gold group-hover:gap-2 transition-all">
                      Ver <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-parish-text-dark text-white py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Paróquia São Sebastião</h3>
              <p className="text-parish-secondary text-sm">Uma comunidade católica dedicada à fé, esperança e caridade.</p>
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
                <li>
                  <a href="https://www.instagram.com/sebastiao.tresbarras/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-pink-400 transition">
                    <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    @sebastiao.tresbarras
                  </a>
                </li>
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
