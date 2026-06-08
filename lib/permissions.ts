import { Session } from "next-auth"
import { NextResponse } from "next/server"

// ─── Hierarquia numérica de roles ─────────────────────────────────────────────

export const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN:       80,
  FINANCE:     60,
  SECRETARY:   50,
  EDITOR:      50,  // Deprecated — mesmo nível que SECRETARY
  COORDINATOR: 40,
  DIZIMISTA:   20,
  USER:        10,
}

// ─── Labels pt-BR ─────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN:  "Super Admin",
  ADMIN:        "Administrador",
  FINANCE:      "Financeiro",
  SECRETARY:    "Secretaria",
  COORDINATOR:  "Coordenador",
  DIZIMISTA:    "Dizimista",
  EDITOR:       "Editor",
  USER:         "Usuário",
}

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE:               "Ativo",
  INACTIVE:             "Inativo",
  SUSPENDED:            "Suspenso",
  PENDING_VERIFICATION: "Aguardando verificação",
}

// ─── Grupos de roles ───────────────────────────────────────────────────────────

export const ADMIN_ROLES     = ["SUPER_ADMIN", "ADMIN"]
export const CONTENT_ROLES   = ["SUPER_ADMIN", "ADMIN", "SECRETARY", "EDITOR"]
export const FINANCE_ROLES   = ["SUPER_ADMIN", "ADMIN", "FINANCE"]
export const DIZIMIST_ROLES  = ["SUPER_ADMIN", "ADMIN", "FINANCE", "DIZIMISTA"]

// ─── Funções de verificação ───────────────────────────────────────────────────

/** Verifica se userRole tem nível igual ou superior ao requiredRole. */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel     = ROLE_HIERARCHY[userRole]     ?? 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0
  return userLevel >= requiredLevel
}

/** Lança UnauthorizedError se não houver sessão. */
export function requireAuth(session: Session | null): asserts session is Session {
  if (!session?.user) throw new UnauthorizedError()
}

/** Lança UnauthorizedError / ForbiddenError conforme o caso. */
export function requireRole(session: Session | null, role: string): void {
  requireAuth(session)
  if (!hasRole(session.user.role, role)) throw new ForbiddenError()
}

// ─── Erros tipados ─────────────────────────────────────────────────────────────

export class UnauthorizedError extends Error {
  constructor(message = "Não autenticado") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Sem permissão para esta ação") {
    super(message)
    this.name = "ForbiddenError"
  }
}

/** Converte erros de permissão em NextResponse padronizados. */
export function handlePermissionError(error: unknown): NextResponse | null {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
  return null
}
