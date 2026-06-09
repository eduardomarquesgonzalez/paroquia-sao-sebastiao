import { NextRequest, NextResponse } from "next/server"
import { getServerSession }         from "next-auth"
import { authOptions }              from "@/lib/auth"
import { prisma }                   from "@/lib/prisma"
import { hasRole }                  from "@/lib/permissions"

// GET /api/admin/dizimistas?search=&status=&page=1
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !hasRole(session.user.role ?? "", "FINANCE")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search  = searchParams.get("search")?.trim() ?? ""
    const status  = searchParams.get("status") ?? ""          // "active" | "inactive" | ""
    const page    = Math.max(1, Number(searchParams.get("page") ?? 1))
    const perPage = 20

    const where: Record<string, unknown> = {}
    if (status === "active")   where.active = true
    if (status === "inactive") where.active = false

    const userWhere = search
      ? {
          OR: [
            { name:  { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { cpf:   { contains: search } },
          ],
        }
      : undefined

    const [total, dizimistas] = await Promise.all([
      prisma.dizimista.count({
        where: { ...where, user: userWhere },
      }),
      prisma.dizimista.findMany({
        where: { ...where, user: userWhere },
        orderBy: { registrationDate: "desc" },
        skip:  (page - 1) * perPage,
        take:  perPage,
        select: {
          id:               true,
          active:           true,
          registrationDate: true,
          user: {
            select: { id: true, name: true, email: true, phone: true, cpf: true },
          },
          _count: {
            select: { contributions: true },
          },
          contributions: {
            where:  { status: "PAID" },
            select: { amount: true },
          },
        },
      }),
    ])

    const items = dizimistas.map((d) => ({
      id:               d.id,
      active:           d.active,
      registrationDate: d.registrationDate,
      user:             d.user,
      contributionCount: d._count.contributions,
      totalPaid:        d.contributions.reduce((s, c) => s + Number(c.amount), 0),
    }))

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / perPage),
    })
  } catch (err) {
    console.error("[GET /api/admin/dizimistas]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
