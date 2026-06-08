import {
  PaymentProvider,
  CreateChargeInput,
  ChargeResult,
  WebhookPayload,
} from "./types"

const BASE_URL = process.env.ASAAS_BASE_URL ?? "https://sandbox.asaas.com/api/v3"
const API_KEY  = process.env.ASAAS_API_KEY  ?? ""

async function asaasRequest<T>(
  path: string,
  method: "GET" | "POST" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "access_token": API_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new Error(`Asaas ${method} ${path} → ${res.status}: ${detail}`)
  }

  return res.json() as Promise<T>
}

// Retorna customerId Asaas para o CPF, criando o cliente se não existir
async function ensureCustomer(
  name:  string,
  email: string,
  cpf:   string,
  phone?: string
): Promise<string> {
  const existing = await asaasRequest<{ data: Array<{ id: string }> }>(
    `/customers?cpfCnpj=${cpf.replace(/\D/g, "")}`,
    "GET"
  )
  if (existing.data.length > 0) return existing.data[0].id

  const created = await asaasRequest<{ id: string }>("/customers", "POST", {
    name,
    email,
    cpfCnpj:     cpf.replace(/\D/g, ""),
    mobilePhone: phone?.replace(/\D/g, ""),
  })
  return created.id
}

type AsaasStatus =
  | "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE"
  | "REFUNDED" | "RECEIVED_IN_CASH" | "REFUND_REQUESTED"
  | "CHARGEBACK_REQUESTED" | "CHARGEBACK_DISPUTE" | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED" | "DUNNING_RECEIVED" | "AWAITING_RISK_ANALYSIS"

function mapStatus(s: AsaasStatus): WebhookPayload["status"] {
  if (s === "RECEIVED" || s === "CONFIRMED" || s === "RECEIVED_IN_CASH") return "PAID"
  if (s === "OVERDUE" || s === "CHARGEBACK_REQUESTED") return "FAILED"
  if (s === "REFUNDED" || s === "REFUND_REQUESTED") return "REFUNDED"
  if (s === "PENDING" || s === "AWAITING_RISK_ANALYSIS") return "PENDING"
  return "PROCESSING"
}

export const asaasProvider: PaymentProvider = {
  async createCharge(input: CreateChargeInput): Promise<ChargeResult> {
    const customerId = await ensureCustomer(
      input.customer.name,
      input.customer.email,
      input.customer.cpf,
      input.customer.phone
    )

    const billingType =
      input.method === "PIX"         ? "PIX"
      : input.method === "BOLETO"    ? "BOLETO"
      : input.method === "CREDIT_CARD" ? "CREDIT_CARD"
      : "DEBIT_CARD"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const charge = await asaasRequest<any>("/payments", "POST", {
      customer:         customerId,
      billingType,
      value:            input.amount,
      dueDate:          input.dueDate ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                          .toISOString().slice(0, 10),
      description:      input.description,
      externalReference: input.externalReference,
    })

    if (input.method === "PIX") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pix = await asaasRequest<any>(`/payments/${charge.id}/pixQrCode`, "GET")
      return {
        method:    "PIX",
        gatewayId: charge.id as string,
        qrCode:    pix.encodedImage as string,
        copyPaste: pix.payload as string,
        expiresAt: new Date(pix.expirationDate as string),
      }
    }

    if (input.method === "BOLETO") {
      return {
        method:    "BOLETO",
        gatewayId: charge.id as string,
        boletoUrl: charge.bankSlipUrl as string,
        barCode:   charge.nossoNumero  as string,
        dueDate:   new Date(charge.dueDate as string),
      }
    }

    // Cartão → link do checkout hospedado
    return {
      method:      billingType as "CREDIT_CARD" | "DEBIT_CARD",
      gatewayId:   charge.id as string,
      checkoutUrl: charge.invoiceUrl as string,
    }
  },

  async cancelCharge(gatewayId: string): Promise<void> {
    await asaasRequest(`/payments/${gatewayId}`, "DELETE")
  },

  parseWebhook(body: unknown): WebhookPayload {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = body as any
    const payment = b?.payment ?? {}
    return {
      event:      b.event as string,
      gatewayId:  payment.id as string,
      status:     mapStatus(payment.status as AsaasStatus),
      paidAt:     payment.confirmedDate ? new Date(payment.confirmedDate as string) : undefined,
      amount:     payment.value as number | undefined,
      rawPayload: body,
    }
  },
}
