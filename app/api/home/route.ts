import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const now = new Date()

    const [hero, comunidades, eventos, destaques, clero, projetosSociais, atividades] =
      await Promise.all([
        // Hero
        prisma.homeHero.findFirst(),

        // Comunidades ativas
        prisma.community.findMany({
          where: { active: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: {
            id: true, name: true, slug: true, description: true,
            neighborhood: true, city: true, image: true,
            masses: {
              where: { active: true },
              orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
              select: { id: true, dayOfWeek: true, time: true },
            },
          },
        }),

        // Eventos publicados
        prisma.event.findMany({
          where: { published: true },
          orderBy: [{ order: "asc" }, { date: "asc" }],
          select: {
            id: true, title: true, description: true, date: true,
            endDate: true, location: true, image: true, siteUrl: true,
          },
        }),

        // Destaques ativos não expirados
        prisma.destaque.findMany({
          where: {
            active: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          orderBy: { order: "asc" },
          select: { id: true, title: true, image: true, linkUrl: true },
        }),

        // Clero ativo
        prisma.clero.findMany({
          where: { active: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: { id: true, name: true, role: true, photo: true, currentRole: true },
        }),

        // Projetos sociais publicados
        prisma.socialProject.findMany({
          where: { published: true, active: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          take: 3,
          select: {
            id: true, name: true, slug: true, description: true,
            image: true, location: true, audience: true,
          },
        }),

        // Atividades ativas com formulários
        prisma.atividade.findMany({
          where: { active: true },
          orderBy: { order: "asc" },
          take: 6,
          select: {
            id: true, nome: true, slug: true, descricao: true, tipo: true,
            imagem: true, textoBotao: true, linkExterno: true, cor: true,
            aceitaInscricoes: true, showInNavbar: true, navbarOrder: true,
            formularios: {
              where: { ativo: true },
              orderBy: { order: "asc" },
              select: {
                id: true, slug: true, titulo: true, descricao: true,
                ativo: true, vagas: true, dataInicio: true, dataFim: true,
                _count: {
                  select: {
                    inscricoes: { where: { status: { not: "CANCELADO" } } },
                  },
                },
              },
            },
          },
        }),
      ])

    return NextResponse.json(
      { hero, comunidades, eventos, destaques, clero, projetosSociais, atividades }
    )
  } catch (error) {
    console.error("[GET /api/home]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
