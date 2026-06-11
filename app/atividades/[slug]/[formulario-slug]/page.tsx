import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PublicNavbar from "@/components/PublicNavbar"
import PublicFooter from "@/components/PublicFooter"
import InscricaoFormulario from "./InscricaoFormulario"

export default async function FormularioPublicoPage({
  params,
}: {
  params: { slug: string; "formulario-slug": string }
}) {
  const { slug, "formulario-slug": formularioSlug } = params

  const atividade = await prisma.atividade.findFirst({
    where: { OR: [{ id: slug }, { slug }], active: true },
    select: { id: true, nome: true, slug: true, tipo: true, imagem: true, cor: true },
  })

  if (!atividade) notFound()

  const formulario = await prisma.formularioInscricao.findFirst({
    where: {
      OR: [{ id: formularioSlug }, { slug: formularioSlug }],
      atividadeId: atividade.id,
    },
    include: {
      campos: { orderBy: { order: "asc" } },
      _count: {
        select: { inscricoes: { where: { status: { not: "CANCELADO" } } } },
      },
    },
  })

  if (!formulario) notFound()

  const dados = {
    id: formulario.id,
    slug: formulario.slug,
    titulo: formulario.titulo,
    descricao: formulario.descricao,
    mensagemConfirmacao: formulario.mensagemConfirmacao,
    aceitaArquivos: formulario.aceitaArquivos,
    vagas: formulario.vagas,
    dataInicio: formulario.dataInicio?.toISOString() ?? null,
    dataFim: formulario.dataFim?.toISOString() ?? null,
    ativo: formulario.ativo,
    campos: formulario.campos.map((c) => ({
      id: c.id,
      label: c.label,
      tipo: c.tipo as string,
      obrigatorio: c.obrigatorio,
      placeholder: c.placeholder,
      instrucao: c.instrucao,
      opcoes: c.opcoes,
      order: c.order,
    })),
    _count: { inscricoes: formulario._count.inscricoes },
  }

  const atividadeDados = {
    id: atividade.id,
    nome: atividade.nome,
    slug: atividade.slug,
    tipo: atividade.tipo as string,
    imagem: atividade.imagem,
    cor: atividade.cor,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      <InscricaoFormulario atividade={atividadeDados} formulario={dados} />
      <PublicFooter />
    </div>
  )
}
