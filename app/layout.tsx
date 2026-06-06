import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paróquia São Sebastião - Três Barras, Cuiabá-MT",
  description: "Site oficial da Paróquia São Sebastião do Bairro Três Barras em Cuiabá, Mato Grosso",
  keywords: ["paróquia", "igreja", "católica", "são sebastião", "três barras", "cuiabá", "mato grosso"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
