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

  useEffect(() => { fetchPost(); }, [postId]);

  async function fetchPost() {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}/public`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Post não encontrado");
        throw new Error("Erro ao carregar post");
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error("Erro ao carregar post:", error);
      setError(error instanceof Error ? error.message : "Erro ao carregar post");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parish-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-parish-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-parish-text mb-4">Post não encontrado</h1>
          <p className="text-parish-text-light mb-8">O post que você está procurando não existe ou foi removido.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition">
            <ArrowLeft className="w-4 h-4 mr-2" />Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-parish-background">
      <header className="bg-parish-surface shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div>
                <h1 className="font-bold text-xl text-parish-text-dark">Paróquia São Sebastião</h1>
                <p className="text-xs text-parish-text-light">Três Barras, Cuiabá-MT</p>
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="text-parish-text-light hover:text-parish-gold transition">Início</Link>
              <Link href="/posts" className="text-parish-text-light hover:text-parish-gold transition">Posts</Link>
            </div>
          </div>
        </nav>
      </header>

      {post.coverImage && (
        <div className="w-full h-96 bg-parish-primary">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {post.category && (
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-parish-sky-light text-parish-sky-dark rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-parish-text mb-6 leading-tight">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-6 text-parish-text-light text-sm mb-8 pb-8 border-b border-parish-border">
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
          <button className="flex items-center space-x-2 text-parish-gold hover:text-parish-gold-dark transition">
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>

        {post.excerpt && (
          <div className="bg-parish-sky-light border-l-4 border-parish-gold p-6 mb-8">
            <p className="text-lg text-parish-text italic">{post.excerpt}</p>
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <div className="text-parish-text leading-relaxed whitespace-pre-wrap">{post.content}</div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-parish-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-parish-text-light" />
              {post.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-parish-primary text-parish-text rounded-full text-sm hover:bg-parish-secondary hover:text-white transition cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-parish-border">
          <Link href="/" className="inline-flex items-center text-parish-gold hover:text-parish-gold-dark transition font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />Voltar para o início
          </Link>
        </div>
      </article>

      <footer className="bg-parish-text-dark text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-bold text-lg mb-2">Paróquia São Sebastião</h3>
          <p className="text-parish-secondary text-sm">Bairro Três Barras, Cuiabá-MT</p>
          <p className="text-parish-secondary text-sm mt-4">&copy; 2025 Paróquia São Sebastião. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
