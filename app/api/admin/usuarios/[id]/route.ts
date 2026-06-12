import { NextRequest, NextResponse } from "next/server"
import { getServerSession }         from "next-auth"
import { authOptions }              from "@/lib/auth"
import { prisma }                   from "@/lib/prisma"
import { requireRole, hasRole, handlePermissionError } from "@/lib/permissions"
import { audit }                    from "@/lib/audit"
import bcrypt                       from "bcrypt"

export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

// GET /api/admin/usuarios/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions)
    requireRole(session, "ADMIN")

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id:        true, name:      true, email:     true,
        role:      true, status:    true, phone:     true,
        cpf:       true, image:     true,
        createdAt: true, updatedAt: true,
      },
    })

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    return NextResponse.json(user)
  } catch (err) {
    const permRes = handlePermissionError(err)
    if (permRes) return permRes
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/admin/usuarios/[id]
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions)
    requireRole(session, "ADMIN")

    const body = await req.json() as {
      name?: string; role?: string; status?: string
      phone?: string; cpf?: string; password?: string
    }

    const current = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true, status: true },
    })
    if (!current) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    // Apenas SUPER_ADMIN pode promover para SUPER_ADMIN
    if (body.role === "SUPER_ADMIN" && !hasRole(session!.user.role, "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Sem permissão para atribuir este perfil" }, { status: 403 })
    }

    const data: Record<string, unknown> = {}
    if (body.name   !== undefined) data.name   = body.name
    if (body.role   !== undefined) data.role   = body.role
    if (body.status !== undefined) data.status = body.status
    if (body.phone  !== undefined) data.phone  = body.phone
    if (body.cpf    !== undefined) data.cpf    = body.cpf
    if (body.password) data.password = await bcrypt.hash(body.password, 12)

    const updated = await prisma.user.update({
      where: { id: params.id },
      data:  data as never,
      select: { id: true, name: true, email: true, role: true, status: true, updatedAt: true },
    })

    await audit({
      userId:   session!.user.id,
      action:   "UPDATE",
      entity:   "User",
      entityId: params.id,
      oldData:  current,
      newData:  data,
      request:  req,
    })

    return NextResponse.json(updated)
  } catch (err) {
    const permRes = handlePermissionError(err)
    if (permRes) return permRes
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/admin/usuarios/[id] — apenas SUPER_ADMIN
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions)
    requireRole(session, "SUPER_ADMIN")

    // Não permite auto-exclusão
    if (params.id === session!.user.id) {
      return NextResponse.json({ error: "Não é possível excluir seu próprio usuário" }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: params.id } })

    await audit({
      userId:   session!.user.id,
      action:   "DELETE",
      entity:   "User",
      entityId: params.id,
      request:  req,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const permRes = handlePermissionError(err)
    if (permRes) return permRes
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
