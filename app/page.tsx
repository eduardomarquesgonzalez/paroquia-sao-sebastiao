"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  BookOpen,
  Tag,
  Church,
} from "lucide-react";
import HorariosMissasPorDia from "@/components/HorariosMissasPorDia";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  createdAt: string;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchEventos();
  }, []);

  async function fetchPosts() {
    try {
      const response = await fetch("/api/posts/public");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.slice(0, 6)); // Mostrar apenas os 6 mais recentes
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function fetchEventos() {
    try {
      const response = await fetch("/api/eventos/public");
      if (response.ok) {
        const data = await response.json();
        setEventos(data.slice(0, 3)); // Mostrar apenas os 3 próximos
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoadingEventos(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className=" flex items-center space-x-2 ">
              <Church className="w-10 h-10 text-parish-blue" />
              <div>
                <h1 className="font-bold text-2xl text-blue-900">
                  Paróquia São Sebastião
                </h1>
                <p className="text-sm text-gray-600">Três Barras, Cuiabá-MT</p>
              </div>
            </div>

            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Início
              </Link>
              <Link
                href="/posts"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Notícias
              </Link>
              <Link
                href="/eventos"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Eventos
              </Link>
              <Link
                href="/missas"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Missas
              </Link>
              <Link
                href="/sobre"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Sobre
              </Link>
              <Link
                href="/contato"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Contato
              </Link>
            </div>

            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Welcome Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-bold mb-6">
              Bem-vindo à Paróquia São Sebastião
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Uma comunidade de fé e amor no coração de Três Barras, Cuiabá-MT
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#missas"
                className="bg-white text-parish-blue px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Ver Horários de Missas
              </Link>
              <Link
                href="/contato"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-parish-blue transition"
              >
                Entre em Contato
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Horários de Missa - COMPONENTE DINÂMICO */}
      <section id="missas" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Horários de Missas
              </h2>
              <p className="text-gray-600 mt-2">
                Confira os horários das nossas celebrações
              </p>
            </div>
            <Link
              href="/missas"
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 font-medium"
            >
              <span>Ver detalhes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Componente dinâmico que busca da API */}
          <div className="max-w-4xl mx-auto">
            <HorariosMissasPorDia />
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section id="eventos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Próximos Eventos
              </h2>
              <p className="text-gray-600 mt-2">
                Participe das atividades da nossa paróquia
              </p>
            </div>
            <Link
              href="/eventos"
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 font-medium"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingEventos ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum evento próximo no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <Link
                  key={evento.id}
                  href={`/eventos/${evento.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {evento.image ? (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={evento.image}
                        alt={evento.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center text-sm text-blue-600 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatEventDate(evento.date)}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {evento.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {evento.description}
                    </p>

                    {evento.location && (
                      <div className="flex items-center text-sm text-gray-500">
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

      {/* Posts/Notícias */}
      <section id="posts" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Notícias e Avisos
              </h2>
              <p className="text-gray-600 mt-2">
                Fique por dentro das novidades da paróquia
              </p>
            </div>
            <Link
              href="/posts"
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 font-medium"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingPosts ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Nenhuma notícia disponível no momento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {post.coverImage ? (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {post.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Tag className="w-3 h-3 mr-1" />
                          {post.category}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Paróquia São Sebastião</h3>
              <p className="text-gray-400 text-sm">
                Uma comunidade católica dedicada à fé, esperança e caridade.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <Link href="/missas" className="hover:text-white transition">
                    Horários de Missas
                  </Link>
                </li>
                <li>
                  <Link href="/eventos" className="hover:text-white transition">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link href="/posts" className="hover:text-white transition">
                    Notícias
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
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Bairro Três Barras</li>
                <li>Cuiabá-MT</li>
                <li>saosebastiaomt@outlook.com.br</li>
                <li>(65) 0000-0000</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2025 Paróquia São Sebastião. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
