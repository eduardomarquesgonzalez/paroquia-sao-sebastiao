"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight, Church } from "lucide-react";
import HorariosMissasPorDia from "@/components/HorariosMissasPorDia";
import CarouselFaixas from "@/components/CarouselFaixas";
import Image from "next/image";
import logoImg from "@/public/logo.png";

interface CommunityPreview {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  neighborhood: string | null;
  city: string | null;
  image: string | null;
  masses: { id: string; dayOfWeek: string; time: string }[];
}

interface HomeHero {
  heading: string | null;
  subtitle: string | null;
  btn1Text: string | null;
  btn1Link: string | null;
  btn2Text: string | null;
  btn2Link: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string | null;
  image: string | null;
}

export default function HomePage() {
  const [comunidades, setComunidades] = useState<CommunityPreview[]>([]);
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loadingComunidades, setLoadingComunidades] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [hero, setHero] = useState<HomeHero | null>(null);

  useEffect(() => {
    fetchComunidades();
    fetchEventos();
    fetch("/api/home-hero")
      .then((r) => r.json())
      .then((data: HomeHero) => setHero(data))
      .catch(() => {});
  }, []);

  async function fetchComunidades() {
    try {
      const response = await fetch("/api/comunidades/public");
      if (response.ok) {
        const data = await response.json();
        setComunidades(Array.isArray(data) ? data.slice(0, 6) : []);
      }
    } catch (error) {
      console.error("Erro ao carregar comunidades:", error);
    } finally {
      setLoadingComunidades(false);
    }
  }

  async function fetchEventos() {
    try {
      const response = await fetch("/api/eventos/public");
      if (response.ok) {
        const data = await response.json();
        setEventos(data.slice(0, 3));
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoadingEventos(false);
    }
  }

  const formatEventDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  function getFirstMasses(masses: CommunityPreview["masses"], max = 2): string {
    if (!masses.length) return "";
    const dayOrder: Record<string, number> = {
      domingo: 0, segunda: 1, "segunda-feira": 1,
      terça: 2, terca: 2, "terça-feira": 2,
      quarta: 3, "quarta-feira": 3,
      quinta: 4, "quinta-feira": 4,
      sexta: 5, "sexta-feira": 5,
      sábado: 6, sabado: 6,
    };
    const sorted = [...masses].sort(
      (a, b) =>
        (dayOrder[a.dayOfWeek.toLowerCase()] ?? 9) -
        (dayOrder[b.dayOfWeek.toLowerCase()] ?? 9)
    );
    const formatted = sorted
      .slice(0, max)
      .map((m) => `${m.dayOfWeek.charAt(0).toUpperCase() + m.dayOfWeek.slice(1)} ${m.time}`);
    const extra = masses.length - max;
    return formatted.join(" · ") + (extra > 0 ? ` +${extra}` : "");
  }

  return (
    <div className="min-h-screen bg-parish-background">
      {/* Header/Navbar */}
      <header className="bg-parish-surface shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src={logoImg}
                alt="Logo da Paróquia"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="font-bold text-2xl text-parish-text-dark">
                  Paróquia São Sebastião
                </h1>
                <p className="text-sm text-parish-text-light">
                  Três Barras, Cuiabá-MT
                </p>
              </div>
            </div>

            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-parish-text-light hover:text-parish-gold transition font-medium">
                Início
              </Link>
              <Link href="/posts" className="text-parish-text-light hover:text-parish-gold transition">
                Notícias
              </Link>
              <Link href="/eventos" className="text-parish-text-light hover:text-parish-gold transition">
                Eventos
              </Link>
              <Link href="/comunidades" className="text-parish-text-light hover:text-parish-gold transition">
                Comunidades
              </Link>
              <Link href="/missas" className="text-parish-text-light hover:text-parish-gold transition">
                Missas
              </Link>
              <Link href="/sobre" className="text-parish-text-light hover:text-parish-gold transition">
                Sobre
              </Link>
              <Link href="/contato" className="text-parish-text-light hover:text-parish-gold transition">
                Contato
              </Link>
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

      {/* Welcome Section */}
      <section className="text-white">
        <CarouselFaixas>
          {hero && (hero.heading || hero.subtitle || hero.btn1Text || hero.btn2Text) && (
            <div className="container mx-auto px-4 py-24">
              <div className="max-w-2xl">
                {hero.heading && (
                  <h2 className="text-5xl font-bold mb-6">{hero.heading}</h2>
                )}
                {hero.subtitle && (
                  <p className="text-xl mb-8 text-white/90">{hero.subtitle}</p>
                )}
                {(hero.btn1Text || hero.btn2Text) && (
                  <div className="flex flex-wrap gap-4">
                    {hero.btn1Text && hero.btn1Link && (
                      <Link
                        href={hero.btn1Link}
                        className="bg-parish-surface text-parish-gold px-8 py-3 rounded-lg font-semibold hover:bg-parish-background transition"
                      >
                        {hero.btn1Text}
                      </Link>
                    )}
                    {hero.btn2Text && hero.btn2Link && (
                      <Link
                        href={hero.btn2Link}
                        className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-parish-gold transition"
                      >
                        {hero.btn2Text}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CarouselFaixas>
      </section>

      {/* Horários de Missa */}
      <section id="missas" className="py-16 bg-parish-surface">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-parish-text">
                Horários de Missas
              </h2>
              <p className="text-parish-text-light mt-2">
                Confira os horários das nossas celebrações
              </p>
            </div>
            <Link
              href="/missas"
              className="text-parish-gold hover:text-parish-gold-dark flex items-center space-x-2 font-medium"
            >
              <span>Ver detalhes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="max-w-4xl mx-auto">
            <HorariosMissasPorDia />
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section id="eventos" className="py-16 bg-parish-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-parish-text">
                Próximos Eventos
              </h2>
              <p className="text-parish-text-light mt-2">
                Participe das atividades da nossa paróquia
              </p>
            </div>
            <Link
              href="/eventos"
              className="text-parish-gold hover:text-parish-gold-dark flex items-center space-x-2 font-medium"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingEventos ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold mx-auto" />
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12 bg-parish-surface rounded-lg">
              <Calendar className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
              <p className="text-parish-text-light">
                Nenhum evento próximo no momento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <Link
                  key={evento.id}
                  href={`/eventos/${evento.id}`}
                  className="bg-parish-surface rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {evento.image ? (
                    <div className="h-48 bg-parish-primary">
                      <img
                        src={evento.image}
                        alt={evento.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-parish-sky to-parish-gold flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center text-sm text-parish-sky-dark mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatEventDate(evento.date)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-parish-text mb-2 line-clamp-2">
                      {evento.title}
                    </h3>
                    <p className="text-parish-text-light text-sm mb-4 line-clamp-2">
                      {evento.description}
                    </p>
                    {evento.location && (
                      <div className="flex items-center text-sm text-parish-secondary">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">{evento.location}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nossas Comunidades */}
      <section id="comunidades" className="py-16 bg-parish-surface">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-parish-text">
                Nossas Comunidades
              </h2>
              <p className="text-parish-text-light mt-2">
                Conheça as comunidades da Paróquia São Sebastião
              </p>
            </div>
            <Link
              href="/comunidades"
              className="text-parish-gold hover:text-parish-gold-dark flex items-center space-x-2 font-medium"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingComunidades ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold mx-auto" />
            </div>
          ) : comunidades.length === 0 ? (
            <div className="text-center py-12 bg-parish-background rounded-2xl border border-parish-border">
              <Church className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
              <p className="text-parish-text-light">
                As comunidades serão cadastradas em breve
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comunidades.map((c) => (
                <Link
                  key={c.id}
                  href={`/comunidades/${c.slug}`}
                  className="group bg-parish-surface border border-parish-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-parish-gold/40 transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 flex-shrink-0 overflow-hidden">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-parish-sky to-parish-gold flex items-center justify-center">
                        <Church className="w-14 h-14 text-white opacity-60" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-5 flex flex-col gap-2">
                    <h3 className="font-bold text-parish-text group-hover:text-parish-gold transition leading-snug line-clamp-2">
                      {c.name}
                    </h3>

                    {c.description && (
                      <p className="text-sm text-parish-text-light line-clamp-2">
                        {c.description}
                      </p>
                    )}

                    <div className="space-y-1.5 mt-auto pt-3">
                      {(c.neighborhood || c.city) && (
                        <div className="flex items-center gap-1.5 text-xs text-parish-text-light">
                          <MapPin className="w-3.5 h-3.5 text-parish-gold flex-shrink-0" />
                          <span className="line-clamp-1">
                            {[c.neighborhood, c.city].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {c.masses.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-parish-text-light">
                          <Clock className="w-3.5 h-3.5 text-parish-gold flex-shrink-0" />
                          <span className="line-clamp-1">{getFirstMasses(c.masses)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-parish-border mt-1">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-parish-gold group-hover:gap-2 transition-all">
                        Ver comunidade <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
                <li>
                  <Link href="/missas" className="hover:text-white transition">
                    Horários de Missas
                  </Link>
                </li>
                <li>
                  <Link href="/comunidades" className="hover:text-white transition">
                    Comunidades
                  </Link>
                </li>
                <li>
                  <Link href="/eventos" className="hover:text-white transition">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="hover:text-white transition">
                    Contato
                  </Link>
                </li>
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
            <p>
              &copy; 2026 Paróquia São Sebastião. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
