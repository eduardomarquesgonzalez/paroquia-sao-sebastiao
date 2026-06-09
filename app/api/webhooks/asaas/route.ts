import { NextRequest, NextResponse } from "next/server"
import { prisma }                   from "@/lib/prisma"

/*
 * Webhook do Asaas — recebe notificações de pagamento.
 *
 * Eventos tratados:
 *   PAYMENT_RECEIVED   → status PAID  (PIX aprovado instantaneamente)
 *   PAYMENT_CONFIRMED  → status PAID  (boleto compensado)
 *   PAYMENT_OVERDUE    → status FAILED
 *   PAYMENT_DELETED    → status CANCELLED
 *   PAYMENT_REFUNDED   → status REFUNDED (se mapeado no enum)
 *
 * Segurança: valida o token de acesso via header "asaas-access-token".
 * Configure ASAAS_WEBHOOK_TOKEN igual ao token definido no painel Asaas.
 */

const STATUS_MAP: Record<string, string> = {
  PAYMENT_RECEIVED:  "PAID",
  PAYMENT_CONFIRMED: "PAID",
  PAYMENT_OVERDUE:   "FAILED",
  PAYMENT_DELETED:   "CANCELLED",
  PAYMENT_REFUNDED:  "REFUNDED",
}

export async function POST(req: NextRequest) {
  try {
    // Validação do token do webhook (opcional, mas recomendada)
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
    if (webhookToken) {
      const receivedToken = req.headers.get("asaas-access-token")
      if (receivedToken !== webhookToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const body = await req.json()
    const event = body?.event as string | undefined

    if (!event) {
      return NextResponse.json({ received: true })
    }

    const newStatus = STATUS_MAP[event]
    if (!newStatus) {
      // Evento não monitorado — responde 200 para o Asaas não reenviar
      return NextResponse.json({ received: true, ignored: true })
    }

    const payment = body?.payment
    if (!payment?.id) {
      return NextResponse.json({ received: true, ignored: true })
    }

    // Localiza a contribuição pelo gatewayId (ID do pagamento no Asaas)
    const contribution = await prisma.titheContribution.findFirst({
      where: { gatewayId: payment.id },
    })

    if (!contribution) {
      // Pode ser de outro sistema — ignorar silenciosamente
      return NextResponse.json({ received: true, notFound: true })
    }

    // Monta o update
    const updateData: Record<string, unknown> = { status: newStatus }

    if (newStatus === "PAID") {
      updateData.paidAt = new Date(payment.paymentDate ?? payment.confirmedDate ?? Date.now())
    }

    await prisma.titheContribution.update({
      where: { id: contribution.id },
      data:  updateData as never,
    })

    return NextResponse.json({ received: true, contributionId: contribution.id, newStatus })
  } catch (err) {
    console.error("[webhook/asaas]", err)
    // Retorna 200 para evitar reenvio excessivo do Asaas
    return NextResponse.json({ received: true, error: "internal" })
  }
}
