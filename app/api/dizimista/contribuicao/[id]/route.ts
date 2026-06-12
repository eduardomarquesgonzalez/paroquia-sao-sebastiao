import { NextRequest, NextResponse } from "next/server"
import { getServerSession }         from "next-auth"
import { authOptions }              from "@/lib/auth"
import { prisma }                   from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/dizimista/contribuicao/[id] — retorna status da contribuição
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const contribution = await prisma.titheContribution.findUnique({
      where: { id: params.id },
      select: {
        id:            true,
        amount:        true,
        competence:    true,
        method:        true,
        status:        true,
        paidAt:        true,
        pixQrCode:     true,
        pixCopyPaste:  true,
        pixExpiration: true,
        boletoUrl:     true,
        boletoBarCode: true,
        createdAt:     true,
        dizimista:     { select: { userId: true } },
      },
    })

    if (!contribution) {
      return NextResponse.json({ error: "Contribuição não encontrada" }, { status: 404 })
    }

    // Garante que pertence ao usuário logado
    if (contribution.dizimista.userId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    return NextResponse.json(contribution)
  } catch (err) {
    console.error("[GET /api/dizimista/contribuicao/[id]]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
