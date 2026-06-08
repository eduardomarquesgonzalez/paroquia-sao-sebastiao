import { NextRequest, NextResponse } from "next/server"
import { prisma }                   from "@/lib/prisma"
import crypto                       from "crypto"

// POST /api/auth/forgot-password
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string }

    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Sempre retorna 200 para não revelar se o e-mail existe
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    const token   = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken:   token,
        passwordResetExpires: expires,
      },
    })

    // TODO: enviar e-mail com o link de redefinição
    // O link deve ser: process.env.NEXTAUTH_URL + "/auth/reset-password?token=" + token
    // Integrar com Resend / Nodemailer conforme preferência
    console.info(`[forgot-password] Token gerado para ${email}: ${token}`)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
