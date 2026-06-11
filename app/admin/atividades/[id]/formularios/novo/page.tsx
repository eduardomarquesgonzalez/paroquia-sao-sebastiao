"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import FormularioBuilder from "../_components/FormularioBuilder"

export default function NovoFormularioPage() {
  const params = useParams()
  const id = params.id as string
  const [atividadeNome, setAtividadeNome] = useState("")

  useEffect(() => {
    fetch(`/api/atividades/${id}`)
      .then((r) => r.json())
      .then((d) => setAtividadeNome(d.nome ?? "Atividade"))
      .catch(() => {})
  }, [id])

  return (
    <FormularioBuilder
      atividadeId={id}
      atividadeNome={atividadeNome}
      mode="criar"
    />
  )
}
