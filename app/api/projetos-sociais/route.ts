import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (id) {
      const project = await prisma.socialProject.findUnique({ where: { id } });
      if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
      return NextResponse.json(project);
    }

    const where = all === "1" ? {} : { published: true, active: true };
    const projects = await prisma.socialProject.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return NextResponse.json({ error: "Erro ao buscar projetos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { name, description, objective, schedules, location, audience, responsible, phone, whatsapp, email, image, gallery, mapUrl, published, active, order } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });

    let slug = toSlug(name);
    const existing = await prisma.socialProject.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const project = await prisma.socialProject.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim(),
        objective: objective?.trim() || null,
        schedules: schedules || [],
        location: location?.trim() || null,
        audience: audience?.trim() || null,
        responsible: responsible?.trim() || null,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        email: email?.trim() || null,
        image: image || null,
        gallery: gallery || [],
        mapUrl: mapUrl?.trim() || null,
        published: published ?? false,
        active: active ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json({ error: "Erro ao criar projeto" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { id, name, description, objective, schedules, location, audience, responsible, phone, whatsapp, email, image, gallery, mapUrl, published, active, order } = body;

    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const existing = await prisma.socialProject.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    const updated = await prisma.socialProject.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        objective: objective?.trim() || null,
        schedules: schedules ?? existing.schedules,
        location: location?.trim() || null,
        audience: audience?.trim() || null,
        responsible: responsible?.trim() || null,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        email: email?.trim() || null,
        image: image !== undefined ? image : existing.image,
        gallery: gallery ?? existing.gallery,
        mapUrl: mapUrl?.trim() || null,
        published: published ?? existing.published,
        active: active ?? existing.active,
        order: order ?? existing.order,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json({ error: "Erro ao atualizar projeto" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const existing = await prisma.socialProject.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    await prisma.socialProject.delete({ where: { id } });
    return NextResponse.json({ message: "Projeto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    return NextResponse.json({ error: "Erro ao excluir projeto" }, { status: 500 });
  }
}
