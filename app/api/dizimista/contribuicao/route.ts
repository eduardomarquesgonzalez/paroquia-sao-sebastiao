import { NextRequest, NextResponse } from "next/server"
import { getServerSession }         from "next-auth"
import { authOptions }              from "@/lib/auth"
import { prisma }                   from "@/lib/prisma"
import { getPaymentProvider }       from "@/lib/payment"

// POST /api/dizimista/contribuicao — cria contribuição e gera cobrança no gateway
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await req.json() as {
      amount:    number
      method:    "PIX" | "BOLETO"
      competence?: string   // YYYY-MM — padrão = mês atual
    }

    if (!body.amount || body.amount < 1) {
      return NextResponse.json({ error: "Valor inválido (mínimo R$ 1,00)" }, { status: 400 })
    }
    if (!["PIX", "BOLETO"].includes(body.method)) {
      return NextResponse.json({ error: "Método de pagamento inválido" }, { status: 400 })
    }

    // Busca ou cria o registro de dizimista
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, cpf: true },
    })
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    if (!user.cpf) {
      return NextResponse.json(
        { error: "Cadastre seu CPF no perfil antes de contribuir." },
        { status: 422 }
      )
    }

    let dizimista = await prisma.dizimista.findUnique({ where: { userId: user.id } })
    if (!dizimista) {
      dizimista = await prisma.dizimista.create({ data: { userId: user.id } })
    }

    // Competência = mês informado ou mês atual
    const now        = new Date()
    const competenceStr = body.competence ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const competence = new Date(`${competenceStr}-01T00:00:00Z`)

    // Cria registro inicial (PENDING) antes de chamar o gateway
    const contribution = await prisma.titheContribution.create({
      data: {
        dizimistaId: dizimista.id,
        amount:      body.amount,
        competence,
        method:      body.method,
        status:      "PENDING",
      },
    })

    // Se não há chave Asaas configurada, retorna sem gateway (modo manual)
    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({ contributionId: contribution.id, manual: true })
    }

    try {
      const provider = getPaymentProvider()
      const result   = await provider.createCharge({
        externalReference: contribution.id,
        customer: {
          name:  user.name  ?? "Dizimista",
          email: user.email,
          cpf:   user.cpf,
          phone: user.phone ?? undefined,
        },
        amount:      body.amount,
        method:      body.method,
        description: `Dízimo — ${competenceStr}`,
      })

      // Persiste dados do gateway
      const update: Record<string, unknown> = { gatewayId: result.gatewayId, gatewayProvider: "asaas" }

      if (result.method === "PIX") {
        update.pixQrCode    = result.qrCode
        update.pixCopyPaste = result.copyPaste
        update.pixExpiration = result.expiresAt
      } else if (result.method === "BOLETO") {
        update.boletoUrl    = result.boletoUrl
        update.boletoBarCode = result.barCode
      }

      await prisma.titheContribution.update({
        where: { id: contribution.id },
        data:  update as never,
      })

      return NextResponse.json({ contributionId: contribution.id, result })
    } catch (gatewayErr) {
      // Se o gateway falhar, mantém a contribuição como PENDING (pode tentar novamente)
      console.error("[Gateway error]", gatewayErr)
      return NextResponse.json(
        { contributionId: contribution.id, manual: true, warning: "Gateway indisponível, tente novamente." },
        { status: 202 }
      )
    }
  } catch (err) {
    console.error("[POST /api/dizimista/contribuicao]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
