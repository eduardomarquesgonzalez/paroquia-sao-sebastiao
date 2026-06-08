import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.clero.findUnique({ where: { id: params.id } });
    if (!item || !item.active)
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Erro ao buscar membro do clero:", error);
    return NextResponse.json({ error: "Erro ao buscar membro" }, { status: 500 });
  }
}
