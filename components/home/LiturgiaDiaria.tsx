"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Music,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import type { LiturgiaDiariaData } from "@/lib/liturgia";

/* ── Mapeamento de cores litúrgicas ── */
const CORES: Record<string, { badge: string; strip: string; label: string }> = {
  verde:    { badge: "bg-green-500 text-white",  strip: "bg-green-500",  label: "Verde"    },
  vermelho: { badge: "bg-red-500 text-white",    strip: "bg-red-500",    label: "Vermelho" },
  branco:   { badge: "bg-slate-200 text-slate-600 border border-slate-300", strip: "bg-slate-300", label: "Branco" },
  roxo:     { badge: "bg-purple-600 text-white", strip: "bg-purple-600", label: "Roxo"     },
  rosa:     { badge: "bg-pink-400 text-white",   strip: "bg-pink-400",   label: "Rosa"     },
};

function corKey(cor: string) {
  return cor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/* ── Ícone de Cruz SVG ── */
function CruzIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="9" x2="22" y2="9" />
    </svg>
  );
}

/* ── Skeleton ── */
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-parish-primary/40 rounded-lg animate-pulse ${className ?? ""}`} />
  );
}

function SkeletonLiturgia() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-parish-border space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-parish-border overflow-hidden">
            <div className="h-1 bg-parish-primary/40" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Card de leitura expansível ── */
interface LeituraCardProps {
  tipo: "primeira" | "salmo" | "segunda" | "evangelho";
  referencia: string;
  titulo?: string;
  refrao?: string;
  texto: string;
  isEspecial?: boolean;
}

const TIPO_CONFIG = {
  primeira:  { label: "1ª Leitura",        Icon: BookOpen, accent: "bg-parish-navy/8 text-parish-navy" },
  salmo:     { label: "Salmo Responsorial", Icon: Music,    accent: "bg-parish-gold/10 text-parish-gold-dark" },
  segunda:   { label: "2ª Leitura",         Icon: BookOpen, accent: "bg-parish-navy/8 text-parish-navy" },
  evangelho: { label: "Evangelho",          Icon: CruzIcon, accent: "bg-parish-gold/15 text-parish-gold-dark" },
};

const LIMITE_CHARS = 440;

function LeituraCard({ tipo, referencia, titulo, refrao, texto, isEspecial }: LeituraCardProps) {
  const [expandido, setExpandido] = useState(false);
  const { label, Icon, accent } = TIPO_CONFIG[tipo];
  const textoLongo = texto.length > LIMITE_CHARS;
  const textoExibido = textoLongo && !expandido ? texto.slice(0, LIMITE_CHARS) + "…" : texto;

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-parish ${
        isEspecial
          ? "border-parish-gold/30"
          : "border-parish-border"
      }`}
    >
      {/* Faixa colorida */}
      <div className={`h-1 ${isEspecial ? "bg-parish-gold" : "bg-parish-navy/20"}`} />

      <div className="flex-1 flex flex-col p-6">
        {/* Badge tipo */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-parish-text-light">
            {label}
          </span>
        </div>

        {/* Referência */}
        <p className="text-sm font-semibold text-parish-navy mb-2">{referencia}</p>

        {/* Título */}
        {titulo && (
          <p className="text-xs text-parish-text-light italic mb-3 leading-relaxed">{titulo}</p>
        )}

        {/* Refrão do salmo */}
        {refrao && (
          <div className="bg-parish-gold/10 border-l-2 border-parish-gold rounded-r-lg px-4 py-2.5 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-parish-gold-dark mb-1">
              Refrão
            </p>
            <p className="text-sm font-medium text-parish-text leading-relaxed italic">
              {refrao}
            </p>
          </div>
        )}

        {/* Texto */}
        <p className="text-sm text-parish-text-light leading-relaxed flex-1 whitespace-pre-line">
          {textoExibido}
        </p>

        {/* Expandir */}
        {textoLongo && (
          <button
            onClick={() => setExpandido((v) => !v)}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-parish-gold hover:text-parish-gold-dark transition-colors"
            aria-label={expandido ? "Recolher texto" : "Ler completo"}
          >
            {expandido ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Recolher</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Ler completo</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Botões de compartilhamento ── */
function BotoesCompartilhar({ liturgia, data }: { liturgia: string; data: string }) {
  const texto = encodeURIComponent(
    `📖 Liturgia do Dia — ${data}\n${liturgia}\n\nAcompanhe a Palavra de Deus na Paróquia São Sebastião`
  );
  const url = encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : ""
  );

  const abrir = (href: string) =>
    window.open(href, "_blank", "noopener,noreferrer");

  return (
    <div className="flex flex-wrap items-center gap-3 justify-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-parish-text-light flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5" /> Compartilhar
      </span>

      <button
        onClick={() => abrir(`https://wa.me/?text=${texto}`)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
        aria-label="Compartilhar no WhatsApp"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.528 5.845L.057 23.5l5.818-1.527A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.663-.523-5.172-1.428l-.371-.22-3.451.904.921-3.363-.242-.388A9.956 9.956 0 012 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z" />
        </svg>
        WhatsApp
      </button>

      <button
        onClick={() => abrir(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${texto}`)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        aria-label="Compartilhar no Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </button>

      <button
        onClick={() => abrir(`https://t.me/share/url?url=${url}&text=${texto}`)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        aria-label="Compartilhar no Telegram"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        Telegram
      </button>
    </div>
  );
}

/* ── Componente principal ── */
export default function LiturgiaDiaria() {
  const [dados, setDados] = useState<LiturgiaDiariaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const buscar = useCallback(() => {
    setLoading(true);
    setErro(false);
    fetch("/api/liturgia")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: LiturgiaDiariaData & { error?: string }) => {
        if (d.error) throw new Error();
        setDados(d);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    buscar();
  }, [buscar]);

  const chave = dados ? corKey(dados.cor) : "";
  const corInfo = CORES[chave];

  /* Extrai primeiro elemento de cada array de leitura */
  const primeiraLeitura = dados?.leituras.primeiraLeitura[0];
  const salmo           = dados?.leituras.salmo[0];
  const evangelho       = dados?.leituras.evangelho[0];
  const segundaLeitura  = dados?.leituras.segundaLeitura[0];

  return (
    <section
      className="py-24 bg-parish-background relative overflow-hidden"
      aria-label="Liturgia do Dia"
    >
      {/* Decoração de fundo */}
      <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-parish-gold/4 rounded-full -translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-parish-navy/4 rounded-full translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Cabeçalho da seção */}
        <div className="text-center mb-12 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-parish-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-parish-gold">
              A Palavra de Deus
            </span>
            <div className="w-8 h-px bg-parish-gold" />
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-parish-navy-dark leading-tight">
            Liturgia do Dia
          </h2>
          <p className="text-parish-text-light mt-2 text-sm md:text-base max-w-md mx-auto">
            A Palavra de Deus para hoje
          </p>
        </div>

        {/* Estado de erro */}
        {erro && !loading && (
          <div className="flex flex-col items-center gap-5 py-20 bg-white rounded-3xl border border-parish-border text-center">
            <div className="w-16 h-16 rounded-2xl bg-parish-navy/6 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-parish-navy/40" />
            </div>
            <div>
              <p className="font-semibold text-parish-text mb-1">
                Não foi possível carregar a Liturgia Diária
              </p>
              <p className="text-sm text-parish-text-light">Tente novamente mais tarde</p>
            </div>
            <button
              onClick={buscar}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-parish-navy text-white rounded-lg text-sm font-semibold hover:bg-parish-navy-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && <SkeletonLiturgia />}

        {/* Conteúdo */}
        {dados && !loading && !erro && (
          <div className="animate-on-scroll space-y-8">
            {/* Info strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Data */}
              <div className="bg-white rounded-2xl p-4 border border-parish-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-parish-text-light mb-1">
                  Data
                </p>
                <p className="text-sm font-semibold text-parish-navy-dark capitalize">
                  {dados.data}
                </p>
              </div>

              {/* Tempo litúrgico */}
              <div className="bg-white rounded-2xl p-4 border border-parish-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-parish-text-light mb-1">
                  Tempo Litúrgico
                </p>
                <p className="text-sm font-semibold text-parish-navy-dark leading-snug">
                  {dados.liturgia}
                </p>
              </div>

              {/* Cor litúrgica */}
              <div className="bg-white rounded-2xl p-4 border border-parish-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-parish-text-light mb-1.5">
                  Cor Litúrgica
                </p>
                {corInfo ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${corInfo.badge}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                    {corInfo.label}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-parish-navy-dark capitalize">
                    {dados.cor}
                  </span>
                )}
              </div>
            </div>

            {/* Santo do dia — apenas quando presente na resposta */}
            {dados.santo && (
              <div className="bg-parish-gold/8 border border-parish-gold/25 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-parish-gold/15 flex items-center justify-center flex-shrink-0">
                  <CruzIcon className="w-4 h-4 text-parish-gold-dark" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-parish-gold-dark mb-0.5">
                    Santo do Dia
                  </p>
                  <p className="text-sm font-semibold text-parish-navy-dark">
                    {dados.santo}
                  </p>
                </div>
              </div>
            )}

            {/* Cards das leituras — grid 3 colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {primeiraLeitura && (
                <LeituraCard
                  tipo="primeira"
                  referencia={primeiraLeitura.referencia}
                  titulo={primeiraLeitura.titulo}
                  texto={primeiraLeitura.texto}
                />
              )}
              {salmo && (
                <LeituraCard
                  tipo="salmo"
                  referencia={salmo.referencia}
                  refrao={salmo.refrao}
                  texto={salmo.texto}
                  isEspecial
                />
              )}
              {evangelho && (
                <LeituraCard
                  tipo="evangelho"
                  referencia={evangelho.referencia}
                  titulo={evangelho.titulo}
                  texto={evangelho.texto}
                  isEspecial
                />
              )}
            </div>

            {/* Segunda leitura — apenas quando presente */}
            {segundaLeitura && (
              <div className="max-w-2xl mx-auto w-full">
                <LeituraCard
                  tipo="segunda"
                  referencia={segundaLeitura.referencia}
                  titulo={segundaLeitura.titulo}
                  texto={segundaLeitura.texto}
                />
              </div>
            )}

            {/* Mensagem final + compartilhamento */}
            <div className="flex flex-col items-center gap-8 pt-4">
              <div className="relative max-w-2xl mx-auto text-center">
                <span className="absolute -left-2 top-0 text-parish-gold/25 font-playfair text-7xl leading-none select-none">
                  "
                </span>
                <p className="font-playfair text-lg md:text-xl text-parish-text italic leading-relaxed px-8">
                  A Palavra de Deus ilumina nossos passos e fortalece nossa
                  caminhada de fé.
                </p>
                <span className="absolute -right-2 bottom-0 text-parish-gold/25 font-playfair text-7xl leading-none select-none">
                  "
                </span>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <div className="w-10 h-px bg-parish-gold/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-parish-gold" />
                  <div className="w-10 h-px bg-parish-gold/50" />
                </div>
              </div>

              <BotoesCompartilhar liturgia={dados.liturgia} data={dados.data} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
