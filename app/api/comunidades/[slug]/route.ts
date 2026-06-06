import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const community = await prisma.community.findUnique({
      where: { slug: params.slug, active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
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

    if (!community) {
      return NextResponse.json(
        { error: "Comunidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(community);
  } catch (error) {
    console.error("Erro ao buscar comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comunidade" },
      { status: 500 }
    );
  }
}
