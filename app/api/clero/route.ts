import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    const where = all === "1" ? {} : { active: true };
    const items = await prisma.clero.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar clero:", error);
    return NextResponse.json({ error: "Erro ao buscar clero" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const {
      name, role, photo, birthDate, birthCity,
      ordinationDate, ordainer, currentRole, biography,
      instagram, facebook, youtube, whatsapp, tiktok,
      order, active,
    } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    if (!role?.trim()) return NextResponse.json({ error: "Cargo é obrigatório" }, { status: 400 });

    const item = await prisma.clero.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        photo: photo || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthCity: birthCity?.trim() || null,
        ordinationDate: ordinationDate ? new Date(ordinationDate) : null,
        ordainer: ordainer?.trim() || null,
        currentRole: currentRole?.trim() || null,
        biography: biography?.trim() || null,
        instagram: instagram?.trim() || null,
        facebook: facebook?.trim() || null,
        youtube: youtube?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        tiktok: tiktok?.trim() || null,
        order: order ?? 0,
        active: active ?? true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar membro do clero:", error);
    return NextResponse.json({ error: "Erro ao criar membro do clero" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const {
      id, name, role, photo, birthDate, birthCity,
      ordinationDate, ordainer, currentRole, biography,
      instagram, facebook, youtube, whatsapp, tiktok,
      order, active,
    } = body;

    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const existing = await prisma.clero.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });

    const updated = await prisma.clero.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(role && { role: role.trim() }),
        photo: photo !== undefined ? photo : existing.photo,
        birthDate: birthDate ? new Date(birthDate) : existing.birthDate,
        birthCity: birthCity?.trim() ?? existing.birthCity,
        ordinationDate: ordinationDate ? new Date(ordinationDate) : existing.ordinationDate,
        ordainer: ordainer?.trim() ?? existing.ordainer,
        currentRole: currentRole?.trim() ?? existing.currentRole,
        biography: biography?.trim() ?? existing.biography,
        instagram: instagram?.trim() ?? existing.instagram,
        facebook: facebook?.trim() ?? existing.facebook,
        youtube: youtube?.trim() ?? existing.youtube,
        whatsapp: whatsapp?.trim() ?? existing.whatsapp,
        tiktok: tiktok?.trim() ?? existing.tiktok,
        order: order ?? existing.order,
        active: active ?? existing.active,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar membro do clero:", error);
    return NextResponse.json({ error: "Erro ao atualizar membro do clero" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const existing = await prisma.clero.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });

    await prisma.clero.delete({ where: { id } });
    return NextResponse.json({ message: "Membro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir membro do clero:", error);
    return NextResponse.json({ error: "Erro ao excluir membro do clero" }, { status: 500 });
  }
}
