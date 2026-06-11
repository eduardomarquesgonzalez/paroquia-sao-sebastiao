import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const atividades = await prisma.atividade.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 6,
      select: {
        id: true,
        nome: true,
        slug: true,
        descricao: true,
        tipo: true,
        imagem: true,
        textoBotao: true,
        linkExterno: true,
        cor: true,
        aceitaInscricoes: true,
        showInNavbar: true,
        navbarOrder: true,
        formulario: {
          select: {
            id: true,
            ativo: true,
            vagas: true,
            dataInicio: true,
            dataFim: true,
            _count: {
              select: {
                inscricoes: {
                  where: { status: { not: "CANCELADO" } },
                },
              },
            },
          },
        },
      },
    })
    return NextResponse.json(atividades)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
