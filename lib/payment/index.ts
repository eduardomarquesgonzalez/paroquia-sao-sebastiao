import { PaymentProvider } from "./types"
import { asaasProvider }   from "./asaas"

export * from "./types"

type ProviderName = "asaas"

/** Retorna o provider configurado via PAYMENT_PROVIDER env (padrão: asaas). */
export function getPaymentProvider(name?: ProviderName): PaymentProvider {
  const provider = name ?? (process.env.PAYMENT_PROVIDER as ProviderName | undefined) ?? "asaas"

  switch (provider) {
    case "asaas":
      return asaasProvider
    default:
      throw new Error(`Provider de pagamento não suportado: ${provider}`)
  }
}
