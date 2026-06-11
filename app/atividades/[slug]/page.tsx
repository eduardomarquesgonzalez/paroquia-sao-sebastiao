import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PublicNavbar from "@/components/PublicNavbar"
import PublicFooter from "@/components/PublicFooter"
import AtividadeDetalhes from "./AtividadeDetalhes"

export default async function AtividadePublicaPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  const atividade = await prisma.atividade.findFirst({
    where: { OR: [{ id: slug }, { slug }] },
    include: {
      formulario: {
        include: {
          campos: { orderBy: { order: "asc" } },
          _count: {
            select: {
              inscricoes: { where: { status: { not: "CANCELADO" } } },
            },
          },
        },
      },
    },
  })

  if (!atividade || !atividade.active) {
    notFound()
  }

  const dados = {
    id: atividade.id,
    nome: atividade.nome,
    slug: atividade.slug,
    descricao: atividade.descricao,
    descricaoCompleta: atividade.descricaoCompleta,
    tipo: atividade.tipo as string,
    imagem: atividade.imagem,
    cor: atividade.cor,
    textoBotao: atividade.textoBotao,
    linkExterno: atividade.linkExterno,
    local: atividade.local,
    responsavel: atividade.responsavel,
    contato: atividade.contato,
    horarios: atividade.horarios,
    aceitaInscricoes: atividade.aceitaInscricoes,
    active: atividade.active,
    formulario: atividade.formulario
      ? {
          id: atividade.formulario.id,
          titulo: atividade.formulario.titulo,
          descricao: atividade.formulario.descricao,
          vagas: atividade.formulario.vagas,
          dataInicio: atividade.formulario.dataInicio?.toISOString() ?? null,
          dataFim: atividade.formulario.dataFim?.toISOString() ?? null,
          ativo: atividade.formulario.ativo,
          campos: atividade.formulario.campos.map((c) => ({
            id: c.id,
            label: c.label,
            tipo: c.tipo as string,
            obrigatorio: c.obrigatorio,
            placeholder: c.placeholder,
            instrucao: c.instrucao,
            opcoes: c.opcoes,
            order: c.order,
          })),
          _count: { inscricoes: atividade.formulario._count.inscricoes },
        }
      : null,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      <AtividadeDetalhes atividade={dados} />
      <PublicFooter />
    </div>
  )
}
