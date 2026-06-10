import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const formularioId = searchParams.get("formularioId")
    const atividadeId = searchParams.get("atividadeId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number(searchParams.get("page") ?? 1)
    const limit = Number(searchParams.get("limit") ?? 20)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (formularioId) where.formularioId = formularioId

    if (atividadeId) {
      where.formulario = { atividadeId }
    }

    if (status) where.status = status

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { telefone: { contains: search, mode: "insensitive" } },
      ]
    }

    const [inscricoes, total] = await Promise.all([
      prisma.inscricao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          formulario: {
            include: {
              atividade: { select: { id: true, nome: true, slug: true } },
            },
          },
        },
      }),
      prisma.inscricao.count({ where }),
    ])

    return NextResponse.json({
      inscricoes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.formularioId) {
      return NextResponse.json({ error: "formularioId é obrigatório" }, { status: 400 })
    }

    const formulario = await prisma.formularioInscricao.findUnique({
      where: { id: data.formularioId },
      include: {
        _count: {
          select: { inscricoes: { where: { status: { not: "CANCELADO" } } } },
        },
      },
    })

    if (!formulario || !formulario.ativo) {
      return NextResponse.json({ error: "Formulário não disponível" }, { status: 400 })
    }

    const now = new Date()
    if (formulario.dataInicio && now < formulario.dataInicio) {
      return NextResponse.json({ error: "Inscrições ainda não iniciaram" }, { status: 400 })
    }
    if (formulario.dataFim && now > formulario.dataFim) {
      return NextResponse.json({ error: "Inscrições encerradas" }, { status: 400 })
    }

    if (formulario.vagas !== null && formulario._count.inscricoes >= formulario.vagas) {
      return NextResponse.json({ error: "Vagas esgotadas" }, { status: 400 })
    }

    // Extrair nome/email/telefone das respostas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let respostas: Record<string, any> = {}
    if (data.respostas) {
      respostas = typeof data.respostas === "string" ? JSON.parse(data.respostas) : data.respostas
    }

    const inscricao = await prisma.inscricao.create({
      data: {
        formularioId: data.formularioId,
        respostas: respostas as object,
        nome: (data.nome as string) || null,
        email: (data.email as string) || null,
        telefone: (data.telefone as string) || null,
        status: "PENDENTE",
      },
    })

    return NextResponse.json(inscricao, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
