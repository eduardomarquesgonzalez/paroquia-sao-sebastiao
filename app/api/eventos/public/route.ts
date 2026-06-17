import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar eventos públicos publicados (sem autenticação)
// Retorna todos os publicados — encerrados são diferenciados visualmente no frontend
export async function GET() {
  try {
    const eventos = await prisma.event.findMany({
      where: { published: true },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: [{ order: "asc" }, { date: "asc" }],
    });
    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Erro ao buscar eventos públicos:", error);
    return NextResponse.json({ error: "Erro ao buscar eventos" }, { status: 500 });
  }
}
