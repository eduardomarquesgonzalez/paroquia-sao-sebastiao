import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    if (showAll) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const slides = await prisma.bannerSlide.findMany({
      where: showAll ? {} : { active: true },
      orderBy: { order: "asc" },
      select: { id: true, image: true, order: true, active: true },
    });

    return NextResponse.json(slides);
  } catch (error) {
    console.error("Erro ao buscar slides:", error);
    return NextResponse.json({ error: "Erro ao buscar slides" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    if (!data.image) {
      return NextResponse.json({ error: "Imagem é obrigatória" }, { status: 400 });
    }

    const count = await prisma.bannerSlide.count();
    const slide = await prisma.bannerSlide.create({
      data: { image: data.image, order: count, active: true },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar slide:", error);
    return NextResponse.json({ error: "Erro ao criar slide" }, { status: 500 });
  }
}
