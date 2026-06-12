import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasRole } from "@/lib/permissions"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const atividade = await prisma.atividade.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        formularios: {
          orderBy: { order: "asc" },
          include: {
            campos: { orderBy: { order: "asc" } },
            _count: {
              select: {
                inscricoes: { where: { status: { not: "CANCELADO" } } },
              },
            },
          },
        },
      },
    })

    if (!atividade) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    return NextResponse.json(atividade)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (!hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const data = await request.json()

    const atividade = await prisma.atividade.update({
      where: { id: params.id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        descricaoCompleta: data.descricaoCompleta ?? null,
        tipo: data.tipo,
        imagem: data.imagem ?? null,
        textoBotao: data.textoBotao || null,
        linkExterno: data.linkExterno || null,
        cor: data.cor || null,
        local: data.local || null,
        responsavel: data.responsavel || null,
        contato: data.contato || null,
        horarios: data.horarios ?? [],
        aceitaInscricoes: data.aceitaInscricoes ?? false,
        showInNavbar: data.showInNavbar ?? false,
        navbarOrder: data.navbarOrder ?? 0,
        active: data.active ?? true,
        order: data.order ?? 0,
      },
    })

    return NextResponse.json(atividade)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (!hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    await prisma.atividade.delete({ where: { id: params.id } })

    return NextResponse.json({ message: "Atividade excluída com sucesso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
