"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import {
  LayoutDashboard, User, History, LogOut, Heart, ChevronRight,
} from "lucide-react"

const NAV = [
  { href: "/dizimista",          label: "Painel",   icon: LayoutDashboard },
  { href: "/dizimista/perfil",   label: "Perfil",   icon: User },
  { href: "/dizimista/historico", label: "Histórico", icon: History },
]

export default function DizimistaLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/login?callbackUrl=/dizimista")
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parish-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-parish-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parish-background flex flex-col">
      {/* Top bar */}
      <header className="bg-parish-navy text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-parish-gold fill-parish-gold" />
          <span className="font-bold text-parish-gold">Área do Dizimista</span>
          <span className="text-white/30 hidden sm:inline">—</span>
          <span className="text-sm text-white/70 hidden sm:inline">Paróquia São Sebastião</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70 hidden sm:inline">{session?.user?.name ?? session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition px-2 py-1 rounded hover:bg-white/10">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-5xl w-full mx-auto px-4 py-6 gap-6">
        {/* Sidebar */}
        <nav className="w-52 shrink-0 hidden md:block">
          <div className="bg-parish-surface rounded-xl border border-parish-border overflow-hidden">
            <div className="px-4 py-3 border-b border-parish-border">
              <p className="text-xs text-parish-text-light">Menu</p>
            </div>
            <ul className="py-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <li key={href}>
                    <Link href={href}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                        active
                          ? "bg-parish-gold/10 text-parish-gold font-semibold border-r-2 border-parish-gold"
                          : "text-parish-text hover:bg-parish-background"
                      }`}>
                      <Icon className="w-4 h-4" />
                      {label}
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden w-full -mt-2 mb-2">
          <div className="bg-parish-surface rounded-xl border border-parish-border flex overflow-x-auto">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition whitespace-nowrap px-3 ${
                    active ? "text-parish-gold font-semibold border-b-2 border-parish-gold" : "text-parish-text-light"
                  }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
