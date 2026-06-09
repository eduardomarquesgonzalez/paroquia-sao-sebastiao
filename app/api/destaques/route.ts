import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasRole } from "@/lib/permissions"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const destaques = await prisma.destaque.findMany({
      orderBy: { order: "asc" },
      include: { createdBy: { select: { name: true, email: true } } },
    })
    return NextResponse.json(destaques)
  } catch (error) {
    console.error("Erro ao buscar destaques:", error)
    return NextResponse.json({ error: "Erro ao buscar destaques" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()

    const destaque = await prisma.destaque.create({
      data: {
        title:       data.title     || null,
        image:       data.image     || null,
        linkUrl:     data.linkUrl   || null,
        active:      data.active    ?? true,
        order:       data.order     ?? 0,
        expiresAt:   data.expiresAt ? new Date(data.expiresAt) : null,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(destaque, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar destaque:", error)
    return NextResponse.json({ error: "Erro ao criar destaque" }, { status: 500 })
  }
}
