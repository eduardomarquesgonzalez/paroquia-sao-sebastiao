import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (id) {
      const item = await prisma.movement.findUnique({ where: { id } });
      if (!item) return NextResponse.json({ error: "Movimento não encontrado" }, { status: 404 });
      return NextResponse.json(item);
    }

    const where = all === "1" ? {} : { active: true };
    const items = await prisma.movement.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar movimentos:", error);
    return NextResponse.json({ error: "Erro ao buscar movimentos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { name, description, coordinator, schedules, contact, image, highlight, active, order } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });

    const item = await prisma.movement.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        coordinator: coordinator?.trim() || null,
        schedules: schedules || [],
        contact: contact?.trim() || null,
        image: image || null,
        highlight: highlight ?? false,
        active: active ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar movimento:", error);
    return NextResponse.json({ error: "Erro ao criar movimento" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { id, name, description, coordinator, schedules, contact, image, highlight, active, order } = body;

    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const existing = await prisma.movement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Movimento não encontrado" }, { status: 404 });

    const updated = await prisma.movement.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        coordinator: coordinator?.trim() || null,
        schedules: schedules ?? existing.schedules,
        contact: contact?.trim() || null,
        image: image !== undefined ? image : existing.image,
        highlight: highlight ?? existing.highlight,
        active: active ?? existing.active,
        order: order ?? existing.order,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar movimento:", error);
    return NextResponse.json({ error: "Erro ao atualizar movimento" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const existing = await prisma.movement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Movimento não encontrado" }, { status: 404 });

    await prisma.movement.delete({ where: { id } });
    return NextResponse.json({ message: "Movimento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir movimento:", error);
    return NextResponse.json({ error: "Erro ao excluir movimento" }, { status: 500 });
  }
}
