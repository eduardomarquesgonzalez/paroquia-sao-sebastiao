"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import FormularioBuilder, { FormularioForm } from "../../_components/FormularioBuilder"

export default function EditarFormularioPage() {
  const params = useParams()
  const id = params.id as string
  const formularioId = params.formularioId as string

  const [loading, setLoading] = useState(true)
  const [atividadeNome, setAtividadeNome] = useState("")
  const [initialData, setInitialData] = useState<Partial<FormularioForm> | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/atividades/${id}`).then((r) => r.json()),
      fetch(`/api/atividades/${id}/formularios/${formularioId}`).then((r) => r.json()),
    ])
      .then(([at, f]) => {
        setAtividadeNome(at.nome ?? "Atividade")
        setInitialData({
          titulo: f.titulo ?? "",
          slug: f.slug ?? "",
          descricao: f.descricao ?? "",
          mensagemConfirmacao: f.mensagemConfirmacao ?? "",
          vagas: f.vagas != null ? String(f.vagas) : "",
          dataInicio: f.dataInicio ? f.dataInicio.slice(0, 16) : "",
          dataFim: f.dataFim ? f.dataFim.slice(0, 16) : "",
          aceitaArquivos: f.aceitaArquivos ?? false,
          ativo: f.ativo ?? true,
          order: f.order ?? 0,
          campos: (f.campos ?? []).map((c: any) => ({
            id: c.id,
            label: c.label,
            tipo: c.tipo,
            obrigatorio: c.obrigatorio,
            placeholder: c.placeholder ?? "",
            instrucao: c.instrucao ?? "",
            opcoes: c.opcoes ?? [],
            order: c.order,
          })),
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, formularioId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parish-gold" />
      </div>
    )
  }

  if (!initialData) return null

  return (
    <FormularioBuilder
      atividadeId={id}
      atividadeNome={atividadeNome}
      formularioId={formularioId}
      initialData={initialData}
      mode="editar"
    />
  )
}
