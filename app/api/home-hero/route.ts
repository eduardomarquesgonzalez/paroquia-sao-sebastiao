import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaults = {
  heading: "Bem-vindo à Paróquia São Sebastião",
  subtitle: "Uma comunidade de fé e amor no coração de Três Barras, Cuiabá-MT",
  btn1Text: "Ver Horários de Missas",
  btn1Link: "#missas",
  btn2Text: "Entre em Contato",
  btn2Link: "/contato",
};

export async function GET() {
  try {
    const hero = await prisma.homeHero.findFirst();
    return NextResponse.json(hero ?? defaults);
  } catch {
    return NextResponse.json(defaults);
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
