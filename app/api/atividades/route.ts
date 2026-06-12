import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasRole } from "@/lib/permissions"
import { slugify } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const includeFormularios = searchParams.get("includeFormularios") === "true"

    const atividades = await prisma.atividade.findMany({
      orderBy: [{ order: "asc" }, { nome: "asc" }],
      include: {
        formularios: includeFormularios
          ? {
              orderBy: { order: "asc" },
              select: {
                id: true,
                slug: true,
                titulo: true,
                ativo: true,
                vagas: true,
                _count: {
                  select: {
                    inscricoes: { where: { status: { not: "CANCELADO" } } },
                  },
                },
              },
            }
          : {
              orderBy: { order: "asc" },
              select: { id: true, titulo: true, ativo: true },
              take: 1,
            },
      },
    })

    return NextResponse.json(atividades)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (!hasRole(session.user.role, "EDITOR")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const data = await request.json()

    if (!data.nome || !data.descricao) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    // Gerar slug único
    let baseSlug = slugify(data.nome)
    let slug = baseSlug
    let counter = 1
    while (await prisma.atividade.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const atividade = await prisma.atividade.create({
      data: {
        nome: data.nome,
        slug,
        descricao: data.descricao,
        descricaoCompleta: data.descricaoCompleta || null,
        tipo: data.tipo || "OUTRO",
        imagem: data.imagem || null,
        textoBotao: data.textoBotao || null,
        linkExterno: data.linkExterno || null,
        cor: data.cor || null,
        local: data.local || null,
        responsavel: data.responsavel || null,
        contato: data.contato || null,
        horarios: data.horarios || [],
        aceitaInscricoes: data.aceitaInscricoes ?? false,
        showInNavbar: data.showInNavbar ?? false,
        navbarOrder: data.navbarOrder ?? 0,
        active: data.active ?? true,
        order: data.order ?? 0,
      },
    })

    return NextResponse.json(atividade, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
