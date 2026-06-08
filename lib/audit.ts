import { prisma } from "@/lib/prisma"

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "PAYMENT" | "VIEW"

interface AuditOptions {
  userId?:   string | null
  action:    AuditAction
  entity:    string
  entityId?: string
  oldData?:  unknown
  newData?:  unknown
  request?:  Request
}

/** Registra uma entrada de auditoria. Nunca lança — falhas são apenas logadas. */
export async function audit(opts: AuditOptions): Promise<void> {
  try {
    let ipAddress: string | undefined
    let userAgent: string | undefined

    if (opts.request) {
      const h = opts.request.headers
      ipAddress =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        h.get("x-real-ip") ??
        undefined
      userAgent = h.get("user-agent") ?? undefined
    }

    await prisma.auditLog.create({
      data: {
        userId:    opts.userId  ?? null,
        action:    opts.action,
        entity:    opts.entity,
        entityId:  opts.entityId  ?? null,
        oldData:   opts.oldData != null ? (JSON.parse(JSON.stringify(opts.oldData)) as object) : undefined,
        newData:   opts.newData != null ? (JSON.parse(JSON.stringify(opts.newData)) as object) : undefined,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    })
  } catch (err) {
    console.error("[AuditLog] Falha ao registrar entrada:", err)
  }
}
