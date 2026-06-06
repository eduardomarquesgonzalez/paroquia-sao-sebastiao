import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar posts públicos (sem autenticação)
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 20, // Limitar a 20 posts mais recentes
    });

    // Transformar para o formato esperado pelo frontend
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "",
      category: post.category || "Sem categoria",
      coverImage: post.coverImage,
      createdAt: post.createdAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString(),
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Erro ao buscar posts públicos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts" },
      { status: 500 }
    );
  }
}
