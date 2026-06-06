import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar evento público
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar evento
    const evento = await prisma.event.findUnique({
      where: {
        id: params.id,
        published: true, // Apenas eventos publicados
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro ao buscar evento público:", error);
    return NextResponse.json(
      { error: "Erro ao buscar evento" },
      { status: 500 }
    );
  }
}
