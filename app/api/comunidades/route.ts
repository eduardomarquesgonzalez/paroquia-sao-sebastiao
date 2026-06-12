import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

// GET - Listar comunidades ou obter uma específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    // Buscar por ID
    if (id) {
      const community = await prisma.community.findUnique({
        where: { id },
        include: {
          masses: {
            where: { active: true },
            orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
          },
        },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Comunidade não encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(community);
    }

    // Buscar por slug
    if (slug) {
      const community = await prisma.community.findUnique({
        where: { slug },
        include: {
          masses: {
            where: { active: true },
            orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
          },
        },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Comunidade não encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(community);
    }

    // Listar todas
    const communities = await prisma.community.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { masses: true },
        },
      },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Erro ao buscar comunidades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comunidades" },
      { status: 500 }
    );
  }
}

// POST - Criar nova comunidade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      address,
      neighborhood,
      city,
      state,
      zipCode,
      phone,
      email,
      image,
      mapUrl,
      active,
      order,
    } = body;

    // Validações
    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Gerar slug se não fornecido
    let communitySlug = slug;
    if (!communitySlug) {
      communitySlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
        .replace(/\s+/g, "-") // Substitui espaços por hífens
        .replace(/-+/g, "-") // Remove hífens duplicados
        .trim();
    }

    // Verificar se slug já existe
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: communitySlug },
    });

    if (existingCommunity) {
      return NextResponse.json(
        { error: "Já existe uma comunidade com este nome/slug" },
        { status: 400 }
      );
    }

    // Criar comunidade
    const community = await prisma.community.create({
      data: {
        name,
        slug: communitySlug,
        description: description || null,
        address: address || null,
        neighborhood: neighborhood || null,
        city: city || "Cuiabá",
        state: state || "MT",
        zipCode: zipCode || null,
        phone: phone || null,
        email: email || null,
        image: image || null,
        mapUrl: mapUrl || null,
        active: active !== undefined ? active : true,
        order: order || 0,
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar comunidade" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar comunidade
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      slug,
      description,
      address,
      neighborhood,
      city,
      state,
      zipCode,
      phone,
      email,
      image,
      mapUrl,
      active,
      order,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se existe
    const existingCommunity = await prisma.community.findUnique({
      where: { id },
    });

    if (!existingCommunity) {
      return NextResponse.json(
        { error: "Comunidade não encontrada" },
        { status: 404 }
      );
    }

    // Se mudou o slug, verificar se não existe outro com mesmo slug
    if (slug && slug !== existingCommunity.slug) {
      const conflictCommunity = await prisma.community.findUnique({
        where: { slug },
      });

      if (conflictCommunity) {
        return NextResponse.json(
          { error: "Já existe uma comunidade com este slug" },
          { status: 400 }
        );
      }
    }

    // Atualizar
    const updatedCommunity = await prisma.community.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        description: description !== undefined ? description : undefined,
        address: address !== undefined ? address : undefined,
        neighborhood: neighborhood !== undefined ? neighborhood : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        zipCode: zipCode !== undefined ? zipCode : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        image: image !== undefined ? image : undefined,
        mapUrl: mapUrl !== undefined ? mapUrl : undefined,
        active: active !== undefined ? active : undefined,
        order: order !== undefined ? order : undefined,
      },
    });

    return NextResponse.json(updatedCommunity);
  } catch (error) {
    console.error("Erro ao atualizar comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar comunidade" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar apenas status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, active } = body;

    if (!id || active === undefined) {
      return NextResponse.json(
        { error: "ID e status são obrigatórios" },
        { status: 400 }
      );
    }

    const updatedCommunity = await prisma.community.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(updatedCommunity);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir comunidade
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se existe
    const existingCommunity = await prisma.community.findUnique({
      where: { id },
      include: {
        _count: {
          select: { masses: true },
        },
      },
    });

    if (!existingCommunity) {
      return NextResponse.json(
        { error: "Comunidade não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se tem missas associadas
    if (existingCommunity._count.masses > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Esta comunidade possui ${existingCommunity._count.masses} missa(s) cadastrada(s).`,
        },
        { status: 400 }
      );
    }

    // Excluir
    await prisma.community.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Comunidade excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao excluir comunidade" },
      { status: 500 }
    );
  }
}
