export interface LeituraItem {
  referencia: string;
  titulo?: string;
  texto: string;
}

export interface SalmoItem {
  referencia: string;
  refrao: string;
  texto: string;
}

export interface LiturgiaDiariaData {
  data: string;
  liturgia: string;
  cor: string;
  santo?: string;
  leituras: {
    primeiraLeitura: LeituraItem[];
    salmo: SalmoItem[];
    segundaLeitura: LeituraItem[];
    evangelho: LeituraItem[];
    extras?: unknown[];
  };
  oracoes?: {
    coleta?: string;
    oferendas?: string;
    comunhao?: string;
  };
  antifonas?: {
    entrada?: string;
    comunhao?: string;
  };
}
