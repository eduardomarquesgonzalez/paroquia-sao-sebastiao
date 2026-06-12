import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasRole } from "@/lib/permissions"

export const dynamic = "force-dynamic"

function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string; formularioId: string } }
) {
  try {
    const formulario = await prisma.formularioInscricao.findFirst({
      where: {
        OR: [{ id: params.formularioId }, { slug: params.formularioId }],
        atividade: { OR: [{ id: params.id }, { slug: params.id }] },
      },
      include: {
        atividade: { select: { id: true, nome: true, slug: true } },
        campos: { orderBy: { order: "asc" } },
        _count: {
          select: { inscricoes: { where: { status: { not: "CANCELADO" } } } },
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
  { params }: { params: { id: string; formularioId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (!hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const data = await request.json()

    const existing = await prisma.formularioInscricao.findUnique({
      where: { id: params.formularioId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
    }

    // Atualizar slug se título mudou e slug não foi fornecido explicitamente
    let slug = existing.slug
    if (data.slug && data.slug !== existing.slug) {
      const candidate = toSlug(data.slug)
      const conflict = await prisma.formularioInscricao.findFirst({
        where: { slug: candidate, NOT: { id: params.formularioId } },
      })
      slug = conflict ? existing.slug : candidate
    }

    // Atualizar campos dinâmicos se enviados
    if (data.campos !== undefined) {
      await prisma.campoFormulario.deleteMany({ where: { formularioId: existing.id } })
      if (data.campos.length > 0) {
        await prisma.campoFormulario.createMany({
          data: data.campos.map((c: any, i: number) => ({
            formularioId: existing.id,
            label: c.label,
            tipo: c.tipo,
            obrigatorio: c.obrigatorio ?? false,
            placeholder: c.placeholder ?? null,
            instrucao: c.instrucao ?? null,
            opcoes: c.opcoes ?? [],
            order: c.order ?? i,
          })),
        })
      }
    }

    const formulario = await prisma.formularioInscricao.update({
      where: { id: params.formularioId },
      data: {
        slug,
        titulo: data.titulo ?? existing.titulo,
        descricao: data.descricao !== undefined ? data.descricao ?? null : existing.descricao,
        mensagemConfirmacao:
          data.mensagemConfirmacao !== undefined
            ? data.mensagemConfirmacao ?? null
            : existing.mensagemConfirmacao,
        aceitaArquivos: data.aceitaArquivos ?? existing.aceitaArquivos,
        vagas: data.vagas !== undefined ? (data.vagas ? Number(data.vagas) : null) : existing.vagas,
        dataInicio:
          data.dataInicio !== undefined
            ? data.dataInicio
              ? new Date(data.dataInicio)
              : null
            : existing.dataInicio,
        dataFim:
          data.dataFim !== undefined
            ? data.dataFim
              ? new Date(data.dataFim)
              : null
            : existing.dataFim,
        ativo: data.ativo ?? existing.ativo,
        order: data.order ?? existing.order,
      },
      include: {
        campos: { orderBy: { order: "asc" } },
        _count: {
          select: { inscricoes: { where: { status: { not: "CANCELADO" } } } },
        },
      },
    })

    return NextResponse.json(formulario)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; formularioId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (!hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    await prisma.formularioInscricao.delete({ where: { id: params.formularioId } })

    return NextResponse.json({ message: "Formulário excluído com sucesso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
