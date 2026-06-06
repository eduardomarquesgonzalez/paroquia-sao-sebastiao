"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Clock, Phone, Mail, ArrowLeft, Church,
  MessageCircle, ExternalLink, Calendar,
} from "lucide-react";

interface Mass {
  id: string;
  dayOfWeek: string;
  time: string;
  type: string;
  observations: string | null;
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
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  image: string | null;
  mapUrl: string | null;
  masses: Mass[];
}

const DAY_ORDER: Record<string, number> = {
  domingo: 0,
  segunda: 1, "segunda-feira": 1,
  terça: 2, "terca": 2, "terça-feira": 2,
  quarta: 3, "quarta-feira": 3,
  quinta: 4, "quinta-feira": 4,
  sexta: 5, "sexta-feira": 5,
  sábado: 6, sabado: 6,
};

function groupMassesByDay(masses: Mass[]) {
  const map = new Map<string, Mass[]>();
  const sorted = [...masses].sort(
    (a, b) =>
      (DAY_ORDER[a.dayOfWeek.toLowerCase()] ?? 9) -
      (DAY_ORDER[b.dayOfWeek.toLowerCase()] ?? 9)
  );
  for (const m of sorted) {
    const key = m.dayOfWeek;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return map;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ComunidadePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [comunidade, setComunidade] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/comunidades/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setComunidade(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-parish-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    );
  }

  if (notFound || !comunidade) {
    return (
      <div className="min-h-screen bg-parish-background flex items-center justify-center p-4">
        <div className="text-center">
          <Church className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-parish-text mb-3">Comunidade não encontrada</h1>
          <p className="text-parish-text-light mb-8">Esta comunidade não existe ou está inativa.</p>
          <Link href="/comunidades" className="inline-flex items-center gap-2 px-6 py-3 bg-parish-gold text-white rounded-xl hover:bg-parish-gold-dark transition">
            <ArrowLeft className="w-4 h-4" />Ver todas as comunidades
          </Link>
        </div>
      </div>
    );
  }

  const massesByDay = groupMassesByDay(comunidade.masses);
  const fullAddress = [
    comunidade.address,
    comunidade.neighborhood,
    comunidade.city && comunidade.state
      ? `${comunidade.city}-${comunidade.state}`
      : comunidade.city || comunidade.state,
    comunidade.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  const whatsappLink = comunidade.phone
    ? `https://wa.me/55${comunidade.phone.replace(/\D/g, "")}?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20a%20comunidade%20${encodeURIComponent(comunidade.name)}.`
    : null;

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

      {/* Banner */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden">
        {comunidade.image ? (
          <img
            src={comunidade.image}
            alt={comunidade.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-parish-sky to-parish-gold" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <Link
            href="/comunidades"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />Todas as comunidades
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow">
            {comunidade.name}
          </h1>
          {(comunidade.neighborhood || comunidade.city) && (
            <p className="flex items-center gap-1.5 text-white/80 mt-2 text-sm">
              <MapPin className="w-4 h-4" />
              {[comunidade.neighborhood, comunidade.city].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descrição */}
            {comunidade.description && (
              <section className="bg-parish-surface rounded-2xl border border-parish-border p-8">
                <h2 className="text-xl font-bold text-parish-text mb-4">Sobre a Comunidade</h2>
                <p className="text-parish-text leading-relaxed whitespace-pre-wrap">
                  {comunidade.description}
                </p>
              </section>
            )}

            {/* Horários de Missa */}
            <section className="bg-parish-surface rounded-2xl border border-parish-border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-parish-gold/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-parish-gold" />
                </div>
                <h2 className="text-xl font-bold text-parish-text">Horários de Missa</h2>
              </div>

              {massesByDay.size === 0 ? (
                <p className="text-parish-text-light text-sm">Horários não cadastrados ainda.</p>
              ) : (
                <div className="space-y-4">
                  {Array.from(massesByDay.entries()).map(([day, masses]) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-2 p-4 rounded-xl bg-parish-background">
                      <div className="sm:w-32 flex-shrink-0">
                        <span className="font-semibold text-parish-text text-sm">
                          {capitalize(day)}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {masses.map((m) => (
                          <div key={m.id} className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-parish-gold">
                              <Clock className="w-3.5 h-3.5" />
                              {m.time}
                            </span>
                            <span className="text-xs text-parish-text-light">– {m.type}</span>
                            {m.observations && (
                              <span className="text-xs text-parish-secondary italic">({m.observations})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Localização */}
            {fullAddress && (
              <div className="bg-parish-surface rounded-2xl border border-parish-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-parish-gold" />
                  <h3 className="font-bold text-parish-text">Localização</h3>
                </div>
                <p className="text-sm text-parish-text-light leading-relaxed mb-4">{fullAddress}</p>
                {comunidade.mapUrl && (
                  <a
                    href={comunidade.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-parish-gold hover:text-parish-gold-dark font-medium transition"
                  >
                    <ExternalLink className="w-4 h-4" />Abrir no Maps
                  </a>
                )}
              </div>
            )}

            {/* Contato */}
            {(comunidade.phone || comunidade.email) && (
              <div className="bg-parish-surface rounded-2xl border border-parish-border p-6">
                <h3 className="font-bold text-parish-text mb-4">Contato</h3>
                <div className="space-y-3">
                  {comunidade.phone && (
                    <a
                      href={`tel:${comunidade.phone}`}
                      className="flex items-center gap-3 text-sm text-parish-text-light hover:text-parish-text transition"
                    >
                      <Phone className="w-4 h-4 text-parish-gold flex-shrink-0" />
                      {comunidade.phone}
                    </a>
                  )}
                  {comunidade.email && (
                    <a
                      href={`mailto:${comunidade.email}`}
                      className="flex items-center gap-3 text-sm text-parish-text-light hover:text-parish-text transition break-all"
                    >
                      <Mail className="w-4 h-4 text-parish-gold flex-shrink-0" />
                      {comunidade.email}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3.5 rounded-2xl font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Falar no WhatsApp
              </a>
            )}

            {/* Voltar */}
            <Link
              href="/comunidades"
              className="flex items-center justify-center gap-2 w-full border border-parish-border text-parish-text-light hover:text-parish-text hover:border-parish-gold px-6 py-3 rounded-2xl text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />Ver todas as comunidades
            </Link>
          </div>
        </div>

        {/* Mapa embed */}
        {comunidade.mapUrl && comunidade.mapUrl.includes("maps.google.com/maps/embed") && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-parish-gold/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-parish-gold" />
              </div>
              <h2 className="text-xl font-bold text-parish-text">Nossa Localização</h2>
            </div>
            <div className="rounded-2xl overflow-hidden border border-parish-border shadow">
              <iframe
                src={comunidade.mapUrl}
                width="100%"
                height="400"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Localização – ${comunidade.name}`}
              />
            </div>
          </section>
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
                <li><Link href="/comunidades" className="hover:text-white transition">Comunidades</Link></li>
                <li><Link href="/eventos" className="hover:text-white transition">Eventos</Link></li>
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
