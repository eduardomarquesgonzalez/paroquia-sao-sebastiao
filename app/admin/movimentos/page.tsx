"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Users, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Movement {
  id: string;
  name: string;
  description: string;
  coordinator: string | null;
  schedules: string[];
  contact: string | null;
  image: string | null;
  highlight: boolean;
  active: boolean;
  createdAt: string;
}

export default function MovimentosAdminPage() {
  const [items, setItems] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      const res = await fetch("/api/movimentos?all=1");
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error("Erro ao carregar movimentos");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este movimento/pastoral?")) return;
    try {
      const res = await fetch(`/api/movimentos?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Movimento excluído!");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Erro ao excluir movimento");
    }
  }

  async function toggleActive(item: Movement) {
    try {
      const res = await fetch("/api/movimentos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, active: !i.active } : i));
      toast.success(item.active ? "Movimento desativado" : "Movimento ativado");
    } catch {
      toast.error("Erro ao alterar status");
    }
  }

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ||
      (filter === "active" && i.active) ||
      (filter === "inactive" && !i.active) ||
      (filter === "highlight" && i.highlight);
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
          <h1 className="text-3xl font-bold text-parish-text">Movimentos e Pastorais</h1>
          <p className="text-parish-text-light mt-1">Gerencie os movimentos e pastorais da paróquia</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/movimentos"
            target="_blank"
            className="px-4 py-2 border border-parish-border rounded-lg text-parish-text-light text-sm hover:bg-parish-background transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Ver página
          </Link>
          <Link
            href="/admin/movimentos/novo"
            className="bg-parish-gold text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-parish-gold-dark transition text-sm"
          >
            <Plus className="w-5 h-5" /> Novo Movimento
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: items.length, color: "text-parish-text" },
          { label: "Ativos", value: items.filter((i) => i.active).length, color: "text-green-600" },
          { label: "Inativos", value: items.filter((i) => !i.active).length, color: "text-orange-500" },
          { label: "Em Destaque", value: items.filter((i) => i.highlight).length, color: "text-parish-gold" },
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
            placeholder="Buscar movimentos e pastorais..."
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
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="highlight">Em Destaque</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-parish-surface rounded-lg p-12 text-center border border-parish-primary">
          <Users className="w-16 h-16 text-parish-secondary mx-auto mb-4" />
          <p className="text-parish-text-light mb-2">Nenhum movimento ou pastoral encontrado</p>
          <Link href="/admin/movimentos/novo" className="text-parish-gold hover:text-parish-gold-dark text-sm">
            Cadastrar o primeiro movimento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-parish-surface rounded-lg shadow-sm border border-parish-primary overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-parish-sky/20 to-parish-navy/10 flex-shrink-0 overflow-hidden relative">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-parish-gold/40" />
                  </div>
                )}
                {item.highlight && (
                  <div className="absolute top-2 right-2 bg-parish-gold text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Destaque
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {item.active ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">Ativo</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Inativo</span>
                  )}
                </div>

                <h3 className="font-bold text-parish-text mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-sm text-parish-text-light line-clamp-2 mb-3">{item.description}</p>

                {item.coordinator && (
                  <p className="text-xs text-parish-text-light mb-1 line-clamp-1">👤 {item.coordinator}</p>
                )}
                {item.schedules.length > 0 && (
                  <p className="text-xs text-parish-text-light mb-3 line-clamp-1">
                    📅 {item.schedules[0]}{item.schedules.length > 1 ? ` +${item.schedules.length - 1}` : ""}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-parish-primary">
                  <Link
                    href={`/admin/movimentos/${item.id}/editar`}
                    className="text-parish-gold hover:text-parish-gold-dark flex items-center gap-1 text-sm transition"
                  >
                    <Edit className="w-4 h-4" /> Editar
                  </Link>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleActive(item)}
                      className="text-parish-text-light hover:text-parish-text transition"
                      title={item.active ? "Desativar" : "Ativar"}
                    >
                      {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
