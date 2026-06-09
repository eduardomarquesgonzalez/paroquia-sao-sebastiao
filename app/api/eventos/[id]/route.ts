import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar evento específico (admin)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const evento = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar evento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar evento
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Validações
    if (!data.title || !data.description || !data.date) {
      return NextResponse.json(
        { error: "Título, descrição e data são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o evento existe
    const existingEvento = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!existingEvento) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar evento
    const evento = await prisma.event.update({
      where: { id: params.id },
      data: {
        title:         data.title,
        description:   data.description,
        date:          new Date(data.date),
        endDate:       data.endDate ? new Date(data.endDate) : null,
        location:      data.location || null,
        image:         data.image || null,
        siteUrl:       data.siteUrl || null,
        published:     data.published || false,
        order:         data.order ?? existingEvento.order,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir evento
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Evento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir evento" },
      { status: 500 }
    );
  }
}
