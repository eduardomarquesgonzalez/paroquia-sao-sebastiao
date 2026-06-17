import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const items = await prisma.clero.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        role: true,
        photo: true,
        currentRole: true,
        order: true,
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar clero público:", error);
    return NextResponse.json({ error: "Erro ao buscar clero" }, { status: 500 });
  }
}
