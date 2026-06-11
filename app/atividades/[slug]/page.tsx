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
      formularios: {
        where: { ativo: true },
        orderBy: { order: "asc" },
        include: {
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
    formularios: atividade.formularios.map((f) => ({
      id: f.id,
      slug: f.slug,
      titulo: f.titulo,
      descricao: f.descricao,
      vagas: f.vagas,
      dataInicio: f.dataInicio?.toISOString() ?? null,
      dataFim: f.dataFim?.toISOString() ?? null,
      ativo: f.ativo,
      _count: { inscricoes: f._count.inscricoes },
    })),
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      <AtividadeDetalhes atividade={dados} />
      <PublicFooter />
    </div>
  )
}
