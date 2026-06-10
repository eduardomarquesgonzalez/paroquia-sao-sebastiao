import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const inscricao = await prisma.inscricao.findUnique({
      where: { id: params.id },
      include: {
        formulario: {
          include: {
            atividade: true,
            campos: { orderBy: { order: "asc" } },
          },
        },
      },
    })

    if (!inscricao) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    return NextResponse.json(inscricao)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const data = await request.json()

    const validStatuses = ["PENDENTE", "APROVADO", "CANCELADO"]
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const inscricao = await prisma.inscricao.update({
      where: { id: params.id },
      data: { status: data.status },
    })

    return NextResponse.json(inscricao)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
