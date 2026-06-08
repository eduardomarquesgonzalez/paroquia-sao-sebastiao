// ─── Tipos base do módulo de pagamento ────────────────────────────────────────

export type SupportedMethod = "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD"

export interface CustomerData {
  name:    string
  email:   string
  cpf:     string
  phone?:  string
  address?: {
    street:       string
    number:       string
    complement?:  string
    neighborhood: string
    city:         string
    state:        string
    zipCode:      string
  }
}

export interface CreateChargeInput {
  externalReference: string     // ID interno (TitheContribution.id)
  customer:          CustomerData
  amount:            number      // Em reais (ex: 50.00)
  method:            SupportedMethod
  description:       string
  dueDate?:          string      // ISO date string (YYYY-MM-DD) — para boleto
}

export interface PixChargeResult {
  method:        "PIX"
  gatewayId:     string
  qrCode:        string
  copyPaste:     string
  expiresAt:     Date
}

export interface BoletoChargeResult {
  method:        "BOLETO"
  gatewayId:     string
  boletoUrl:     string
  barCode:       string
  dueDate:       Date
}

export interface CardChargeResult {
  method:        "CREDIT_CARD" | "DEBIT_CARD"
  gatewayId:     string
  checkoutUrl:   string
}

export type ChargeResult = PixChargeResult | BoletoChargeResult | CardChargeResult

export interface WebhookPayload {
  event:        string
  gatewayId:    string
  status:       "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED"
  paidAt?:      Date
  amount?:      number
  rawPayload:   unknown
}

// ─── Interface do provider (Strategy pattern) ─────────────────────────────────

export interface PaymentProvider {
  createCharge(input: CreateChargeInput): Promise<ChargeResult>
  cancelCharge(gatewayId: string): Promise<void>
  parseWebhook(body: unknown, signature?: string): WebhookPayload
}
