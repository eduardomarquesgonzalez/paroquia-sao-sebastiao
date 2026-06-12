import { NextRequest, NextResponse } from "next/server"
import { getServerSession }         from "next-auth"
import { authOptions }              from "@/lib/auth"
import { prisma }                   from "@/lib/prisma"
import { requireRole, handlePermissionError } from "@/lib/permissions"
import { audit }                    from "@/lib/audit"
import bcrypt                       from "bcrypt"

export const dynamic = "force-dynamic"

// GET /api/admin/usuarios — lista com paginação e filtros
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    requireRole(session, "ADMIN")

    const { searchParams } = req.nextUrl
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1))
    const limit  = Math.min(50, Number(searchParams.get("limit") ?? 20))
    const search = searchParams.get("search") ?? ""
    const role   = searchParams.get("role")   ?? ""
    const status = searchParams.get("status") ?? ""

    const where = {
      ...(search ? {
        OR: [
          { name:  { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
      ...(role   ? { role:   role   as never } : {}),
      ...(status ? { status: status as never } : {}),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id:        true,
          name:      true,
          email:     true,
          role:      true,
          status:    true,
          phone:     true,
          image:     true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    const permRes = handlePermissionError(err)
    if (permRes) return permRes
    console.error(err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/admin/usuarios — criar usuário
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    requireRole(session, "ADMIN")

    const body = await req.json() as {
      name?: string; email?: string; password?: string
      role?: string; status?: string; phone?: string; cpf?: string
    }

    const { name, email, password, role = "USER", status = "ACTIVE", phone, cpf } = body

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role as never, status: status as never, phone, cpf },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    })

    await audit({
      userId:   session!.user.id,
      action:   "CREATE",
      entity:   "User",
      entityId: user.id,
      newData:  { name, email, role, status },
      request:  req,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    const permRes = handlePermissionError(err)
    if (permRes) return permRes
    console.error(err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
