"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: 'published' | 'draft';
  views: number;
  createdAt: string;
  author: string;
}

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando posts...');
      const response = await fetch("/api/posts");

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro da API:', errorData);
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      console.log('Posts recebidos:', data);

      setPosts(data);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao carregar posts: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold mb-4"></div>
        <p className="text-parish-text-light">Carregando posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-parish-text mb-2">Erro ao carregar posts</h2>
        <p className="text-parish-text-light mb-4 text-center">{error}</p>
        <div className="space-y-2 text-sm text-parish-secondary bg-parish-background p-4 rounded-lg mb-4">
          <p><strong>Possíveis causas:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>A API route não foi criada em <code>app/api/posts/route.ts</code></li>
            <li>Erro de conexão com o banco de dados</li>
            <li>Você não está autenticado (faça login novamente)</li>
          </ul>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-parish-gold text-white rounded-lg hover:bg-parish-gold-dark transition"
          >
            Tentar Novamente
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 border border-parish-border rounded-lg text-parish-text-light hover:bg-parish-background transition"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Post excluído com sucesso!");
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      toast.error("Erro ao excluir post");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-parish-text">Posts</h1>
          <p className="text-parish-text-light mt-1">Gerencie as publicações do site</p>
        </div>
        <Link
          href="/admin/posts/novo"
          className="bg-parish-gold text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-parish-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Post</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Total de Posts</p>
          <p className="text-2xl font-bold text-parish-text mt-1">
            {posts.length}
          </p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Publicados</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {posts.filter((p) => p.status === "published").length}
          </p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Rascunhos</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {posts.filter((p) => p.status === "draft").length}
          </p>
        </div>
        <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
          <p className="text-sm text-parish-text-light">Total de Visualizações</p>
          <p className="text-2xl font-bold text-parish-sky-dark mt-1">
            {posts.reduce((acc, p) => acc + p.views, 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-parish-secondary w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-parish-background border-b border-parish-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-parish-secondary uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-parish-secondary uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-parish-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-parish-secondary uppercase tracking-wider">
                  Visualizações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-parish-secondary uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-parish-secondary uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-parish-surface divide-y divide-parish-border">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <p className="text-parish-secondary mb-2">Nenhum post encontrado</p>
                      <Link
                        href="/admin/posts/novo"
                        className="text-parish-gold hover:text-parish-gold-dark text-sm"
                      >
                        Criar seu primeiro post
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-parish-background transition">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-parish-text">
                          {post.title}
                        </p>
                        <p className="text-xs text-parish-secondary mt-1 line-clamp-1">
                          {post.excerpt}
                        </p>
                        <p className="text-xs text-parish-secondary mt-1">
                          Por: {post.author}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-parish-sky-light text-parish-sky-dark">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {post.status === "published" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Rascunho
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-parish-text-light">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-parish-text-light">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/posts/${post.id}/editar`}
                          className="text-parish-gold hover:text-parish-gold-dark transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/posts/${post.id}`}
                          className="text-parish-text-light hover:text-parish-text transition"
                          title="Visualizar"
                          target="_blank"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
        <div className="flex items-center justify-between">
          <p className="text-sm text-parish-text-light">
            Mostrando {filteredPosts.length} de {posts.length} posts
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-parish-border rounded-lg text-sm text-parish-text-light hover:bg-parish-background transition disabled:opacity-50 disabled:cursor-not-allowed">
              Anterior
            </button>
            <button className="px-3 py-1 bg-parish-gold text-white rounded-lg text-sm hover:bg-parish-gold-dark transition">
              1
            </button>
            <button className="px-3 py-1 border border-parish-border rounded-lg text-sm text-parish-text-light hover:bg-parish-background transition">
              2
            </button>
            <button className="px-3 py-1 border border-parish-border rounded-lg text-sm text-parish-text-light hover:bg-parish-background transition">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
