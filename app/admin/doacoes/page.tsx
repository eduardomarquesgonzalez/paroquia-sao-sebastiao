import { Heart, Construction } from "lucide-react";

export default function DoacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-parish-text">Doações</h1>
        <p className="text-parish-text-light mt-1">Gerenciamento de doações e dízimos</p>
      </div>

      <div className="bg-parish-surface rounded-lg border border-parish-border p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-parish-gold/10 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-parish-gold" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Construction className="w-5 h-5 text-parish-text-light" />
          <h2 className="text-xl font-semibold text-parish-text">Em construção</h2>
        </div>
        <p className="text-parish-text-light max-w-md">
          O módulo de doações e gestão de dízimo está sendo desenvolvido e estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
