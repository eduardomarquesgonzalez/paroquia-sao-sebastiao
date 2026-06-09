import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"

// GET /api/eventos/destaques — retorna eventos marcados como destaque e ainda válidos
export async function GET() {
  try {
    const now = new Date()

    const destaques = await prisma.event.findMany({
      where: {
        published: true,
        featured:  true,
        // Evento válido: ainda não encerrou (usa endDate se existir, senão date)
        OR: [
          { endDate: { gte: now } },
          { endDate: null, date: { gte: now } },
        ],
      },
      orderBy: [
        { featuredOrder: "asc" },
        { date: "asc" },
      ],
      take: 10,
      select: {
        id:       true,
        title:    true,
        image:    true,
        date:     true,
        endDate:  true,
        location: true,
        siteUrl:  true,
        featuredOrder: true,
      },
    })

    return NextResponse.json(destaques)
  } catch (err) {
    console.error("[GET /api/eventos/destaques]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
