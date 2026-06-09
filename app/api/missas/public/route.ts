import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
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

    // Retorna somente comunidades que têm pelo menos uma missa ativa
    const withMasses = communities.filter((c) => c.masses.length > 0);

    return NextResponse.json(withMasses);
  } catch (error) {
    console.error("Erro ao buscar missas públicas:", error);
    return NextResponse.json({ error: "Erro ao buscar missas" }, { status: 500 });
  }
}
