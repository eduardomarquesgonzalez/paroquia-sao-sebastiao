"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, FileText, Calendar, Heart, Users, Settings,
  Church, Clock, Image, Mail, Home, HandHeart, UserCheck, Shield,
} from "lucide-react";
import { hasRole } from "@/lib/permissions";

interface NavItem {
  name:      string
  href:      string
  icon:      React.ElementType
  minRole?:  string  // Role mínimo necessário para ver o item
}

const navigation: NavItem[] = [
  { name: "Dashboard",         href: "/admin",                   icon: LayoutDashboard },
  { name: "Página Inicial",    href: "/admin/home",              icon: Home },
  { name: "Posts",             href: "/admin/posts",             icon: FileText },
  { name: "Eventos",           href: "/admin/eventos",           icon: Calendar },
  { name: "Comunidades",       href: "/admin/comunidades",       icon: Church },
  { name: "Projetos Sociais",  href: "/admin/projetos-sociais",  icon: HandHeart },
  { name: "Horários de Missas",href: "/admin/missas",            icon: Clock },
  { name: "Sacramentos",       href: "/admin/sacramentos",       icon: Church },
  { name: "Clero",             href: "/admin/clero",             icon: UserCheck },
  { name: "Movimentos",        href: "/admin/movimentos",        icon: Users },
  { name: "Doações",           href: "/admin/doacoes",           icon: Heart,     minRole: "FINANCE" },
  { name: "Galeria",           href: "/admin/galeria",           icon: Image },
  { name: "Newsletter",        href: "/admin/newsletter",        icon: Mail },
  { name: "Usuários",          href: "/admin/usuarios",          icon: Shield,    minRole: "ADMIN" },
  { name: "Configurações",     href: "/admin/configuracoes",     icon: Settings,  minRole: "ADMIN" },
];

export default function AdminSidebar() {
  const pathname            = usePathname();
  const { data: session }   = useSession();
  const role                = session?.user?.role ?? "";

  const visibleNav = navigation.filter((item) =>
    !item.minRole || hasRole(role, item.minRole)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-parish-text-dark">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4 mb-6">
              <Church className="w-8 h-8 text-parish-gold" />
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg">Admin</h1>
                <p className="text-parish-secondary text-xs">Paróquia São Sebastião</p>
              </div>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {visibleNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition
                      ${
                        isActive
                          ? "bg-parish-text text-white"
                          : "text-parish-primary hover:bg-parish-text hover:text-white"
                      }
                    `}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-parish-gold" : "text-parish-secondary"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
