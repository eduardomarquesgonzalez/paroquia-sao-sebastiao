import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Listar missas públicas (apenas ativas)
export async function GET() {
  try {
    const missas = await prisma.mass.findMany({
      where: {
        active: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
      select: {
        id: true,
        dayOfWeek: true,
        time: true,
        type: true,
        //location: true,
        // observations: true,
      },
    });

    return NextResponse.json(missas);
  } catch (error) {
    console.error("Erro ao buscar missas públicas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar missas" },
      { status: 500 }
    );
  }
}
