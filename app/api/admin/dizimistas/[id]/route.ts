import { NextRequest, NextResponse } from "next/server"
import { getServerSession }         from "next-auth"
import { authOptions }              from "@/lib/auth"
import { prisma }                   from "@/lib/prisma"
import { hasRole }                  from "@/lib/permissions"

export const dynamic = "force-dynamic"

// GET /api/admin/dizimistas/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !hasRole(session.user.role ?? "", "FINANCE")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const dizimista = await prisma.dizimista.findUnique({
      where: { id: params.id },
      select: {
        id:               true,
        active:           true,
        registrationDate: true,
        notes:            true,
        birthDate:        true,
        address:          true,
        neighborhood:     true,
        city:             true,
        state:            true,
        zipCode:          true,
        user: {
          select: { id: true, name: true, email: true, phone: true, cpf: true },
        },
        contributions: {
          orderBy: { competence: "desc" },
          select: {
            id:            true,
            amount:        true,
            competence:    true,
            method:        true,
            status:        true,
            paidAt:        true,
            createdAt:     true,
            gatewayId:     true,
            gatewayProvider: true,
          },
        },
      },
    })

    if (!dizimista) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }

    const paid      = dizimista.contributions.filter((c) => c.status === "PAID")
    const totalPaid = paid.reduce((s, c) => s + Number(c.amount), 0)
    const currentYear = new Date().getFullYear()
    const yearTotal = paid
      .filter((c) => new Date(c.competence).getFullYear() === currentYear)
      .reduce((s, c) => s + Number(c.amount), 0)

    return NextResponse.json({
      ...dizimista,
      stats: { totalPaid, yearTotal, paidCount: paid.length, total: dizimista.contributions.length },
    })
  } catch (err) {
    console.error("[GET /api/admin/dizimistas/[id]]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PATCH /api/admin/dizimistas/[id] — ativa/desativa ou atualiza notas
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !hasRole(session.user.role ?? "", "FINANCE")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await req.json() as { active?: boolean; notes?: string }

    const updated = await prisma.dizimista.update({
      where: { id: params.id },
      data:  { active: body.active, notes: body.notes },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("[PATCH /api/admin/dizimistas/[id]]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
