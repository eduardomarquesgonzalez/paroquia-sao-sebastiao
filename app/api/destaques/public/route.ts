import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET() {
  try {
    const now = new Date()
    const destaques = await prisma.destaque.findMany({
      where: {
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: { order: "asc" },
      select: { id: true, title: true, image: true, linkUrl: true },
    })
    return NextResponse.json(destaques)
  } catch (error) {
    console.error("Erro ao buscar destaques:", error)
    return NextResponse.json({ error: "Erro ao buscar destaques" }, { status: 500 })
  }
}
