import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar post público e incrementar visualizações
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar post
    const post = await prisma.post.findUnique({
      where: {
        id: params.id,
        published: true, // Apenas posts publicados
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Incrementar views
    await prisma.post.update({
      where: { id: params.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erro ao buscar post público:", error);
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 });
  }
}
