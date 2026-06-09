import { NextRequest, NextResponse }            from "next/server"
import { prisma }                              from "@/lib/prisma"
import { sendMail, buildPasswordResetEmail }   from "@/lib/email"
import crypto                                  from "crypto"

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

    const baseUrl  = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    try {
      await sendMail({
        to:      email,
        subject: "Redefinição de senha — Paróquia São Sebastião",
        html:    buildPasswordResetEmail(user.name ?? "Fiel", resetUrl),
      })
    } catch (mailErr) {
      console.error("[forgot-password] Falha ao enviar e-mail:", mailErr)
      // Não expõe o erro ao cliente; token já foi salvo
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
