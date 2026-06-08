import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { ROLE_HIERARCHY } from "@/lib/permissions"

function roleLevel(role?: string): number {
  return ROLE_HIERARCHY[role ?? ""] ?? 0
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role as string | undefined

    // ── /admin/usuarios → ADMIN ou superior ──────────────────────────────────
    if (pathname.startsWith("/admin/usuarios")) {
      if (roleLevel(role) < ROLE_HIERARCHY.ADMIN) {
        return NextResponse.redirect(new URL("/admin?erro=sem-permissao", req.url))
      }
    }

    // ── /admin/financeiro → FINANCE ou superior ───────────────────────────────
    if (pathname.startsWith("/admin/financeiro") || pathname.startsWith("/admin/dizimistas")) {
      if (roleLevel(role) < ROLE_HIERARCHY.FINANCE) {
        return NextResponse.redirect(new URL("/admin?erro=sem-permissao", req.url))
      }
    }

    // ── /admin/* → qualquer role com nível ≥ SECRETARY ────────────────────────
    if (pathname.startsWith("/admin")) {
      if (roleLevel(role) < ROLE_HIERARCHY.SECRETARY) {
        return NextResponse.redirect(new URL("/auth/login?callbackUrl=/admin", req.url))
      }
    }

    // ── /dizimista/* → DIZIMISTA ou superior ─────────────────────────────────
    if (pathname.startsWith("/dizimista")) {
      if (roleLevel(role) < ROLE_HIERARCHY.DIZIMISTA) {
        return NextResponse.redirect(new URL("/auth/login?callbackUrl=/dizimista", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // withAuth chama o middleware acima apenas quando há token; caso contrário redireciona
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/dizimista/:path*"],
}
