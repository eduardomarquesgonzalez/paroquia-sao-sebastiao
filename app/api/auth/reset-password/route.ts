import { NextRequest, NextResponse } from "next/server"
import { prisma }                   from "@/lib/prisma"
import bcrypt                       from "bcrypt"

// POST /api/auth/reset-password
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json() as { token?: string; password?: string }

    if (!token || !password) {
      return NextResponse.json({ error: "Token e nova senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "A senha deve ter no mínimo 8 caracteres" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken:   token,
        passwordResetExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:             hashed,
        passwordResetToken:   null,
        passwordResetExpires: null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
