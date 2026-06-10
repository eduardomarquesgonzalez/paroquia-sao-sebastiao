import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasRole } from "@/lib/permissions"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const formulario = await prisma.formularioInscricao.findUnique({
      where: { atividadeId: params.id },
      include: {
        campos: { orderBy: { order: "asc" } },
        _count: {
          select: {
            inscricoes: { where: { status: { not: "CANCELADO" } } },
          },
        },
      },
    })

    if (!formulario) {
      return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(formulario)
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

    const existing = await prisma.formularioInscricao.findUnique({
      where: { atividadeId: params.id },
    })

    let formulario
    if (existing) {
      // Deletar campos existentes e recriar
      await prisma.campoFormulario.deleteMany({ where: { formularioId: existing.id } })

      formulario = await prisma.formularioInscricao.update({
        where: { atividadeId: params.id },
        data: {
          titulo: data.titulo,
          descricao: data.descricao ?? null,
          vagas: data.vagas ? Number(data.vagas) : null,
          dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
          dataFim: data.dataFim ? new Date(data.dataFim) : null,
          ativo: data.ativo ?? true,
          campos: {
            create: (data.campos ?? []).map((c: {
              label: string
              tipo: string
              obrigatorio?: boolean
              placeholder?: string
              instrucao?: string
              opcoes?: string[]
              order?: number
            }, i: number) => ({
              label: c.label,
              tipo: c.tipo,
              obrigatorio: c.obrigatorio ?? false,
              placeholder: c.placeholder ?? null,
              instrucao: c.instrucao ?? null,
              opcoes: c.opcoes ?? [],
              order: c.order ?? i,
            })),
          },
        },
        include: {
          campos: { orderBy: { order: "asc" } },
        },
      })
    } else {
      formulario = await prisma.formularioInscricao.create({
        data: {
          atividadeId: params.id,
          titulo: data.titulo,
          descricao: data.descricao ?? null,
          vagas: data.vagas ? Number(data.vagas) : null,
          dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
          dataFim: data.dataFim ? new Date(data.dataFim) : null,
          ativo: data.ativo ?? true,
          campos: {
            create: (data.campos ?? []).map((c: {
              label: string
              tipo: string
              obrigatorio?: boolean
              placeholder?: string
              instrucao?: string
              opcoes?: string[]
              order?: number
            }, i: number) => ({
              label: c.label,
              tipo: c.tipo,
              obrigatorio: c.obrigatorio ?? false,
              placeholder: c.placeholder ?? null,
              instrucao: c.instrucao ?? null,
              opcoes: c.opcoes ?? [],
              order: c.order ?? i,
            })),
          },
        },
        include: {
          campos: { orderBy: { order: "asc" } },
        },
      })
    }

    return NextResponse.json(formulario)
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

    await prisma.formularioInscricao.delete({
      where: { atividadeId: params.id },
    })

    return NextResponse.json({ message: "Formulário excluído com sucesso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
