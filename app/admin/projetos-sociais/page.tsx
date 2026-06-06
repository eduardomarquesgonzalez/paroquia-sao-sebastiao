"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Heart, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SocialProject {
  id: string;
  name: string;
  description: string;
  location: string | null;
  schedules: string[];
  image: string | null;
  published: boolean;
  active: boolean;
  createdAt: string;
}

export default function ProjetosSociaisAdminPage() {
  const [projects, setProjects] = useState<SocialProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await fetch("/api/projetos-sociais?all=1");
      if (!res.ok) throw new Error("Erro ao carregar");
      setProjects(await res.json());
    } catch {
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    try {
      const res = await fetch(`/api/projetos-sociais?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Projeto excluído!");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Erro ao excluir projeto");
    }
  }

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ||
      (filter === "published" && p.published) ||
      (filter === "draft" && !p.published);
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-parish-text">Projetos Sociais</h1>
          <p className="text-parish-text-light mt-1">Gerencie os projetos sociais da paróquia</p>
        </div>
        <Link
          href="/admin/projetos-sociais/novo"
          className="bg-parish-gold text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-parish-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Projeto</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: projects.length, color: "text-parish-text" },
          { label: "Publicados", value: projects.filter((p) => p.published).length, color: "text-green-600" },
          { label: "Rascunhos", value: projects.filter((p) => !p.published).length, color: "text-orange-500" },
          { label: "Ativos", value: projects.filter((p) => p.active).length, color: "text-parish-gold" },
        ].map((stat) => (
          <div key={stat.label} className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary">
            <p className="text-sm text-parish-text-light">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-parish-surface rounded-lg shadow-sm p-4 border border-parish-primary flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-parish-secondary w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-parish-border rounded-lg focus:ring-2 focus:ring-parish-gold focus:border-transparent outline-none"
        >
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-parish-surface rounded-lg p-12 text-center border border-parish-primary">
          <Heart className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
          <p className="text-parish-text-light mb-2">Nenhum projeto encontrado</p>
          <Link href="/admin/projetos-sociais/novo" className="text-parish-gold hover:text-parish-gold-dark text-sm">
            Criar o primeiro projeto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              <div className="h-44 bg-gradient-to-br from-parish-gold/20 to-parish-sky/10 flex-shrink-0 overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-parish-gold/40" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {project.published ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">Publicado</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-medium">Rascunho</span>
                  )}
                  {!project.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Inativo</span>
                  )}
                </div>

                <h3 className="font-bold text-parish-text mb-1 line-clamp-2">{project.name}</h3>
                <p className="text-sm text-parish-text-light line-clamp-2 mb-3">{project.description}</p>

                {project.schedules.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-parish-text-light mb-1">
                    <Clock className="w-3.5 h-3.5 text-parish-gold" />
                    <span className="line-clamp-1">{project.schedules[0]}</span>
                  </div>
                )}
                {project.location && (
                  <div className="flex items-center gap-1.5 text-xs text-parish-text-light mb-3">
                    <MapPin className="w-3.5 h-3.5 text-parish-gold" />
                    <span className="line-clamp-1">{project.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-parish-primary">
                  <Link
                    href={`/admin/projetos-sociais/${project.id}/editar`}
                    className="text-parish-gold hover:text-parish-gold-dark flex items-center gap-1 text-sm transition"
                  >
                    <Edit className="w-4 h-4" /> Editar
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/projetos-sociais/${project.id}`}
                      target="_blank"
                      className="text-parish-text-light hover:text-parish-text transition"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
