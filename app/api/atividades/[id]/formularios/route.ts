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
  { params }: { params: { id: string } }
) {
  try {
    const atividade = await prisma.atividade.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    })
    if (!atividade) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    const formularios = await prisma.formularioInscricao.findMany({
      where: { atividadeId: atividade.id },
      orderBy: { order: "asc" },
      include: {
        campos: { orderBy: { order: "asc" } },
        _count: {
          select: { inscricoes: { where: { status: { not: "CANCELADO" } } } },
        },
      },
    })

    return NextResponse.json(formularios)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (!hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const atividade = await prisma.atividade.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    })
    if (!atividade) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    const data = await request.json()

    if (!data.titulo) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }

    // Gerar slug único
    let baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.titulo)
    let slug = baseSlug
    let suffix = 1
    while (await prisma.formularioInscricao.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    const formulario = await prisma.formularioInscricao.create({
      data: {
        atividadeId: atividade.id,
        slug,
        titulo: data.titulo,
        descricao: data.descricao ?? null,
        mensagemConfirmacao: data.mensagemConfirmacao ?? null,
        aceitaArquivos: data.aceitaArquivos ?? false,
        vagas: data.vagas ? Number(data.vagas) : null,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        ativo: data.ativo ?? true,
        order: data.order ?? 0,
      },
      include: { campos: true },
    })

    return NextResponse.json(formulario, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
