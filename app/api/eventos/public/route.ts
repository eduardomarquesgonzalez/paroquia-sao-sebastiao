import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar eventos públicos futuros (sem autenticação)
export async function GET() {
  try {
    const eventos = await prisma.event.findMany({
      where: {
        published: true,
        date: {
          gte: new Date(), // Apenas eventos futuros
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc", // Ordenar do mais próximo para o mais distante
      },
      take: 10, // Limitar a 10 próximos eventos
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Erro ao buscar eventos públicos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar eventos" },
      { status: 500 }
    );
  }
}
