"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, UserCircle2, Search } from "lucide-react";
import { toast } from "sonner";

interface CleroMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  currentRole: string | null;
  active: boolean;
  order: number;
}

const ROLE_BADGE: Record<string, string> = {
  "Pároco": "bg-amber-100 text-amber-800",
  "Vigário": "bg-blue-100 text-blue-800",
  "Seminarista": "bg-emerald-100 text-emerald-800",
};

export default function AdminCleroPage() {
  const [members, setMembers] = useState<CleroMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const r = await fetch("/api/clero?all=1");
      if (!r.ok) throw new Error();
      setMembers(await r.json());
    } catch {
      toast.error("Erro ao carregar clero");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este membro do clero?")) return;
    try {
      const r = await fetch(`/api/clero?id=${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Membro excluído com sucesso!");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      toast.error("Erro ao excluir membro");
    }
  }

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-parish-text">Clero</h1>
          <p className="text-parish-text-light mt-1">Gerencie os membros do clero da paróquia</p>
        </div>
        <Link
          href="/admin/clero/novo"
          className="bg-parish-gold text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-parish-gold-dark transition text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Novo Membro
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: members.length, color: "text-parish-text" },
          { label: "Pároco", value: members.filter((m) => m.role === "Pároco").length, color: "text-amber-600" },
          { label: "Vigário", value: members.filter((m) => m.role === "Vigário").length, color: "text-blue-600" },
          { label: "Seminaristas", value: members.filter((m) => m.role === "Seminarista").length, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-parish-surface rounded-lg border border-parish-primary p-4 shadow-sm">
            <p className="text-sm text-parish-text-light">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-parish-surface rounded-lg border border-parish-primary p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parish-secondary" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-parish-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-parish-gold"
        >
          <option value="all">Todos os cargos</option>
          <option value="Pároco">Pároco</option>
          <option value="Vigário">Vigário</option>
          <option value="Seminarista">Seminarista</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-parish-surface rounded-lg border border-parish-primary">
          <UserCircle2 className="w-12 h-12 text-parish-secondary mx-auto mb-3" />
          <p className="text-parish-text-light text-sm">Nenhum membro encontrado</p>
          <Link href="/admin/clero/novo" className="text-parish-gold text-sm mt-2 inline-block hover:underline">
            Cadastrar primeiro membro
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <div key={m.id} className="bg-parish-surface rounded-lg border border-parish-primary shadow-sm overflow-hidden hover:shadow-md transition">
              {/* Photo */}
              <div className="h-44 bg-gradient-to-br from-parish-sky/20 to-parish-gold/20 flex items-center justify-center overflow-hidden">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 className="w-16 h-16 text-parish-navy/25" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-parish-text text-sm line-clamp-1">{m.name}</h3>
                    {m.currentRole && <p className="text-xs text-parish-text-light line-clamp-1 mt-0.5">{m.currentRole}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_BADGE[m.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {m.role}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-parish-primary mt-3">
                  <Link href={`/admin/clero/${m.id}/editar`} className="flex items-center gap-1 text-parish-gold hover:text-parish-gold-dark text-sm transition">
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link href={`/clero/${m.id}`} target="_blank" className="text-parish-text-light hover:text-parish-text transition" title="Visualizar">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 transition" title="Excluir">
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
