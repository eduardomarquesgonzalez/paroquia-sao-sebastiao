import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasRole } from "@/lib/permissions"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const destaque = await prisma.destaque.findUnique({
      where: { id: params.id },
      include: { createdBy: { select: { name: true, email: true } } },
    })

    if (!destaque) {
      return NextResponse.json({ error: "Destaque não encontrado" }, { status: 404 })
    }

    return NextResponse.json(destaque)
  } catch (error) {
    console.error("Erro ao buscar destaque:", error)
    return NextResponse.json({ error: "Erro ao buscar destaque" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()

    const existing = await prisma.destaque.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: "Destaque não encontrado" }, { status: 404 })
    }

    const destaque = await prisma.destaque.update({
      where: { id: params.id },
      data: {
        title:     "title"     in data ? (data.title     || null) : existing.title,
        image:     "image"     in data ? (data.image     || null) : existing.image,
        linkUrl:   "linkUrl"   in data ? (data.linkUrl   || null) : existing.linkUrl,
        active:    "active"    in data ? data.active               : existing.active,
        order:     "order"     in data ? data.order                : existing.order,
        expiresAt: "expiresAt" in data ? (data.expiresAt ? new Date(data.expiresAt) : null) : existing.expiresAt,
      },
    })

    return NextResponse.json(destaque)
  } catch (error) {
    console.error("Erro ao atualizar destaque:", error)
    return NextResponse.json({ error: "Erro ao atualizar destaque" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await prisma.destaque.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Destaque excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir destaque:", error)
    return NextResponse.json({ error: "Erro ao excluir destaque" }, { status: 500 })
  }
}
