import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const slide = await prisma.bannerSlide.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error("Erro ao atualizar slide:", error);
    return NextResponse.json({ error: "Erro ao atualizar slide" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.bannerSlide.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Slide excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir slide:", error);
    return NextResponse.json({ error: "Erro ao excluir slide" }, { status: 500 });
  }
}
