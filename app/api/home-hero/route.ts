import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hero = await prisma.homeHero.findFirst();
    return NextResponse.json(hero ?? null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const existing = await prisma.homeHero.findFirst();

    const hero = existing
      ? await prisma.homeHero.update({ where: { id: existing.id }, data })
      : await prisma.homeHero.create({ data });

    return NextResponse.json(hero);
  } catch (error) {
    console.error("Erro ao salvar hero:", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
