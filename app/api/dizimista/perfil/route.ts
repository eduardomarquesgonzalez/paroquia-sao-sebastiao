import { NextRequest, NextResponse } from "next/server"
import { getServerSession }         from "next-auth"
import { authOptions }              from "@/lib/auth"
import { prisma }                   from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/dizimista/perfil — retorna User + Dizimista do usuário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id:        true,
        name:      true,
        email:     true,
        phone:     true,
        cpf:       true,
        dizimista: {
          select: {
            birthDate:    true,
            address:      true,
            neighborhood: true,
            city:         true,
            state:        true,
            zipCode:      true,
            active:       true,
          },
        },
      },
    })

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    return NextResponse.json(user)
  } catch (err) {
    console.error("[GET /api/dizimista/perfil]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/dizimista/perfil — atualiza User + faz upsert no Dizimista
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await req.json() as {
      name?:         string
      phone?:        string
      cpf?:          string
      birthDate?:    string
      address?:      string
      neighborhood?: string
      city?:         string
      state?:        string
      zipCode?:      string
    }

    const userId = session.user.id

    // Atualiza User
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name  !== undefined && { name:  body.name  || null }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.cpf   !== undefined && { cpf:   body.cpf   || null }),
      },
    })

    // Upsert Dizimista (cria registro se não existir)
    const dizimistaData = {
      ...(body.birthDate    !== undefined && { birthDate:    body.birthDate ? new Date(body.birthDate) : null }),
      ...(body.address      !== undefined && { address:      body.address      || null }),
      ...(body.neighborhood !== undefined && { neighborhood: body.neighborhood || null }),
      ...(body.city         !== undefined && { city:         body.city         || "Cuiabá" }),
      ...(body.state        !== undefined && { state:        body.state        || "MT" }),
      ...(body.zipCode      !== undefined && { zipCode:      body.zipCode      || null }),
    }

    if (Object.keys(dizimistaData).length > 0) {
      await prisma.dizimista.upsert({
        where:  { userId },
        update: dizimistaData,
        create: { userId, ...dizimistaData },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[PUT /api/dizimista/perfil]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
