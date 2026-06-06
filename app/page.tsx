"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import HorariosMissasPorDia from "@/components/HorariosMissasPorDia";
import CarouselFaixas from "@/components/CarouselFaixas";
import ComunidadesCarousel from "@/components/ComunidadesCarousel";
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

  const getEventDay = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit" });

  const getEventMonth = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();

  const getEventTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const getEventWeekday = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { weekday: "long" });


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

      {/* Próximos Eventos */}
      <section id="eventos" className="py-20 bg-parish-surface relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-parish-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-parish-sky/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-parish-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-parish-gold">
                  Agenda da Paróquia
                </span>
              </div>
              <h2 className="text-4xl font-bold text-parish-text leading-tight">
                Próximos Eventos
              </h2>
              <p className="text-parish-text-light mt-2 text-base">
                Participe das celebrações e atividades da nossa comunidade
              </p>
            </div>
            <Link
              href="/eventos"
              className="group inline-flex items-center gap-2 px-5 py-2.5 border border-parish-gold text-parish-gold rounded-xl text-sm font-semibold hover:bg-parish-gold hover:text-white transition-all duration-200 flex-shrink-0"
            >
              Ver todos os eventos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loadingEventos ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-20 bg-parish-background rounded-3xl border border-parish-border">
              <div className="w-16 h-16 rounded-2xl bg-parish-gold/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-parish-gold" />
              </div>
              <p className="font-semibold text-parish-text mb-1">Nenhum evento próximo</p>
              <p className="text-sm text-parish-text-light">Em breve novas atividades serão divulgadas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento, index) => (
                <Link
                  key={evento.id}
                  href={`/eventos/${evento.id}`}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-parish-border/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden flex-shrink-0">
                    {evento.image ? (
                      <img
                        src={evento.image}
                        alt={evento.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-parish-sky to-parish-gold flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/50" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    {/* Date badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                      <span className="block text-xl font-bold text-parish-gold leading-none">
                        {getEventDay(evento.date)}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-parish-text-light mt-0.5">
                        {getEventMonth(evento.date)}
                      </span>
                    </div>

                    {/* "Próximo" badge only on first */}
                    {index === 0 && (
                      <div className="absolute top-4 right-4 bg-parish-gold text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                        Próximo
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6">
                    <h3 className="text-lg font-bold text-parish-text group-hover:text-parish-gold transition-colors duration-200 line-clamp-2 mb-2 leading-snug">
                      {evento.title}
                    </h3>

                    <p className="text-sm text-parish-text-light line-clamp-2 mb-4 leading-relaxed">
                      {evento.description}
                    </p>

                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-parish-text-light">
                        <div className="w-6 h-6 rounded-md bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-parish-gold" />
                        </div>
                        <span className="capitalize">{getEventWeekday(evento.date)}, {getEventTime(evento.date)}</span>
                      </div>
                      {evento.location && (
                        <div className="flex items-center gap-2 text-xs text-parish-text-light">
                          <div className="w-6 h-6 rounded-md bg-parish-gold/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-parish-gold" />
                          </div>
                          <span className="line-clamp-1">{evento.location}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-5 pt-4 border-t border-parish-border flex items-center justify-between">
                      <span className="text-sm font-semibold text-parish-gold flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200">
                        Saiba mais
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs text-parish-secondary bg-parish-background px-2.5 py-1 rounded-full">
                        {getEventMonth(evento.date)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nossas Comunidades */}
      <section id="comunidades" className="py-16 bg-parish-background">
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
            <div className="text-center py-12 bg-parish-surface rounded-2xl border border-parish-border">
              <p className="text-parish-text-light">
                As comunidades serão cadastradas em breve
              </p>
            </div>
          ) : (
            <ComunidadesCarousel comunidades={comunidades} />
          )}
        </div>
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
