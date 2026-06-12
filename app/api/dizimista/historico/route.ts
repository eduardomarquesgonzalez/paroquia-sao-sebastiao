import { NextResponse }   from "next/server"
import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/dizimista/historico
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const dizimista = await prisma.dizimista.findUnique({
      where: { userId: session.user.id },
      select: { id: true, active: true, registrationDate: true },
    })

    if (!dizimista) {
      return NextResponse.json({ dizimista: null, contributions: [], stats: null })
    }

    const contributions = await prisma.titheContribution.findMany({
      where:   { dizimistaId: dizimista.id },
      orderBy: { competence: "desc" },
      select: {
        id:         true,
        amount:     true,
        competence: true,
        method:     true,
        status:     true,
        paidAt:     true,
        createdAt:  true,
        pixQrCode:  true,
        pixCopyPaste: true,
        pixExpiration: true,
        boletoUrl:  true,
      },
    })

    // Estatísticas
    const paid   = contributions.filter((c) => c.status === "PAID")
    const totalPaid    = paid.reduce((s, c) => s + Number(c.amount), 0)
    const lastPaid     = paid[0] ?? null
    const currentYear  = new Date().getFullYear()
    const yearTotal    = paid
      .filter((c) => new Date(c.competence).getFullYear() === currentYear)
      .reduce((s, c) => s + Number(c.amount), 0)

    return NextResponse.json({
      dizimista,
      contributions,
      stats: { totalPaid, yearTotal, lastPaid, count: paid.length },
    })
  } catch (err) {
    console.error("[GET /api/dizimista/historico]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
