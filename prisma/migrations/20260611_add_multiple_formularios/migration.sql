-- ──────────────────────────────────────────────────────────────────────────────
-- Migração: Múltiplos formulários por atividade
-- Data: 2026-06-11
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Adicionar enum NUMERO ao TipoCampo
ALTER TYPE "TipoCampo" ADD VALUE IF NOT EXISTS 'NUMERO';

-- 2. Remover a constraint UNIQUE de atividadeId em formularios_inscricao
--    (transição de 1:1 para 1:N)
ALTER TABLE "formularios_inscricao" DROP CONSTRAINT IF EXISTS "formularios_inscricao_atividadeId_key";

-- 3. Adicionar slug ao formulários (único globalmente)
ALTER TABLE "formularios_inscricao"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "mensagemConfirmacao" TEXT,
  ADD COLUMN IF NOT EXISTS "aceitaArquivos" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

-- 4. Preencher slug para registros existentes (baseado no id)
UPDATE "formularios_inscricao" SET "slug" = 'formulario-' || id WHERE "slug" IS NULL;

-- 5. Tornar slug NOT NULL e UNIQUE após preenchimento
ALTER TABLE "formularios_inscricao"
  ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "formularios_inscricao"
  ADD CONSTRAINT "formularios_inscricao_slug_key" UNIQUE ("slug");

-- 6. Adicionar protocolo e documentos à tabela de inscrições
ALTER TABLE "inscricoes"
  ADD COLUMN IF NOT EXISTS "protocolo" TEXT,
  ADD COLUMN IF NOT EXISTS "documentos" TEXT[] NOT NULL DEFAULT '{}';

-- 7. Constraint UNIQUE no protocolo
ALTER TABLE "inscricoes"
  ADD CONSTRAINT "inscricoes_protocolo_key" UNIQUE ("protocolo");

-- 8. Índices
CREATE INDEX IF NOT EXISTS "formularios_inscricao_atividadeId_idx" ON "formularios_inscricao"("atividadeId");
CREATE INDEX IF NOT EXISTS "formularios_inscricao_slug_idx" ON "formularios_inscricao"("slug");
CREATE INDEX IF NOT EXISTS "inscricoes_protocolo_idx" ON "inscricoes"("protocolo");
