import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar comunidades públicas (apenas ativas)
export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      where: {
        active: true,
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        image: true,
        mapUrl: true,
        masses: {
          where: { active: true },
          orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
          select: {
            id: true,
            dayOfWeek: true,
            time: true,
            type: true,
            observations: true,
          },
        },
      },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Erro ao buscar comunidades públicas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comunidades" },
      { status: 500 }
    );
  }
}
