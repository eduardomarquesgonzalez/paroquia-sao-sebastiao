import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.atividade.findMany({
      where: { active: true, showInNavbar: true },
      orderBy: [{ navbarOrder: "asc" }, { nome: "asc" }],
      select: {
        id: true,
        nome: true,
        slug: true,
        linkExterno: true,
        navbarOrder: true,
      },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
