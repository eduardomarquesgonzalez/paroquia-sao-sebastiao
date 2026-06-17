import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

// GET - Listar missas ou obter uma específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Se tem ID, buscar missa específica
    if (id) {
      const missa = await prisma.mass.findUnique({
        where: { id },
        include: {
          community: true,
        },
      });

      if (!missa) {
        return NextResponse.json(
          { error: "Missa não encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(missa, );
    }

    // Listar todas as missas com comunidades
    const missas = await prisma.mass.findMany({
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            neighborhood: true,
            image: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
    });

    return NextResponse.json(missas, );
  } catch (error) {
    console.error("Erro ao buscar missas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar missas" },
      { status: 500 }
    );
  }
}

// POST - Criar nova missa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { dayOfWeek, time, type, communityId, observations, active } = body;

    // Validações
    if (!dayOfWeek || !time || !type || !communityId) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const validDays = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    if (!validDays.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: "Dia da semana inválido" },
        { status: 400 }
      );
    }

    const validTypes = ["DOMINICAL", "SEMANAL", "ESPECIAL"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipo de missa inválido" },
        { status: 400 }
      );
    }

    // Verificar se a comunidade existe
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Comunidade não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se já existe missa no mesmo dia, horário e comunidade
    const existingMass = await prisma.mass.findFirst({
      where: {
        dayOfWeek,
        time,
        communityId,
      },
    });

    if (existingMass) {
      return NextResponse.json(
        {
          error: "Já existe uma missa neste dia, horário e comunidade",
        },
        { status: 400 }
      );
    }

    // Criar missa
    const missa = await prisma.mass.create({
      data: {
        dayOfWeek,
        time,
        type,
        communityId,
        observations: observations || null,
        active: active !== undefined ? active : true,
      },
      include: {
        community: true,
      },
    });

    return NextResponse.json(missa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar missa:", error);
    return NextResponse.json({ error: "Erro ao criar missa" }, { status: 500 });
  }
}

// PUT - Atualizar missa
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, dayOfWeek, time, type, communityId, observations, active } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da missa é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a missa existe
    const existingMass = await prisma.mass.findUnique({
      where: { id },
    });

    if (!existingMass) {
      return NextResponse.json(
        { error: "Missa não encontrada" },
        { status: 404 }
      );
    }

    // Validações
    if (dayOfWeek) {
      const validDays = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      if (!validDays.includes(dayOfWeek)) {
        return NextResponse.json(
          { error: "Dia da semana inválido" },
          { status: 400 }
        );
      }
    }

    if (type) {
      const validTypes = ["DOMINICAL", "SEMANAL", "ESPECIAL"];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: "Tipo de missa inválido" },
          { status: 400 }
        );
      }
    }

    // Se mudou a comunidade, verificar se existe
    if (communityId && communityId !== existingMass.communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Comunidade não encontrada" },
          { status: 404 }
        );
      }
    }

    // Verificar conflito de horário
    if (dayOfWeek || time || communityId) {
      const conflictMass = await prisma.mass.findFirst({
        where: {
          dayOfWeek: dayOfWeek || existingMass.dayOfWeek,
          time: time || existingMass.time,
          communityId: communityId || existingMass.communityId,
          NOT: { id },
        },
      });

      if (conflictMass) {
        return NextResponse.json(
          {
            error: "Já existe uma missa neste dia, horário e comunidade",
          },
          { status: 400 }
        );
      }
    }

    // Atualizar missa
    const updatedMass = await prisma.mass.update({
      where: { id },
      data: {
        ...(dayOfWeek && { dayOfWeek }),
        ...(time && { time }),
        ...(type && { type }),
        ...(communityId && { communityId }),
        observations:
          observations !== undefined ? observations : existingMass.observations,
        active: active !== undefined ? active : existingMass.active,
      },
      include: {
        community: true,
      },
    });

    return NextResponse.json(updatedMass);
  } catch (error) {
    console.error("Erro ao atualizar missa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar missa" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar apenas o status (ativo/inativo)
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

    const updatedMass = await prisma.mass.update({
      where: { id },
      data: { active },
      include: {
        community: true,
      },
    });

    return NextResponse.json(updatedMass);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir missa
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da missa é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a missa existe
    const existingMass = await prisma.mass.findUnique({
      where: { id },
    });

    if (!existingMass) {
      return NextResponse.json(
        { error: "Missa não encontrada" },
        { status: 404 }
      );
    }

    // Excluir missa
    await prisma.mass.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Missa excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir missa:", error);
    return NextResponse.json(
      { error: "Erro ao excluir missa" },
      { status: 500 }
    );
  }
}
