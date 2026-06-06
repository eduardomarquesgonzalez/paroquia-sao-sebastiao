"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Tag, ArrowLeft, Eye, Share2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  views: number;
  createdAt: string;
  publishedAt: string;
  author: {
    name: string;
    email: string;
  };
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  async function fetchPost() {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}/public`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Post não encontrado");
        }
        throw new Error("Erro ao carregar post");
      }

      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error("Erro ao carregar post:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao carregar post"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Post não encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            O post que você está procurando não existe ou foi removido.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div>
                <h1 className="font-bold text-xl text-blue-900">
                  Paróquia São Sebastião
                </h1>
                <p className="text-xs text-gray-600">Três Barras, Cuiabá-MT</p>
              </div>
            </Link>

            <div className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Início
              </Link>
              <Link
                href="/posts"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Posts
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-96 bg-gray-200">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Category Badge */}
        {post.category && (
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{post.author.name || post.author.email}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>{post.views} visualizações</span>
          </div>

          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition">
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
            <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-600" />
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-bold text-lg mb-2">Paróquia São Sebastião</h3>
          <p className="text-gray-400 text-sm">Bairro Três Barras, Cuiabá-MT</p>
          <p className="text-gray-400 text-sm mt-4">
            &copy; 2025 Paróquia São Sebastião. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
