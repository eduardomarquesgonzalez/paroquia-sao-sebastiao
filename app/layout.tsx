import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Providers from '@/components/Providers';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

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
      <body className={`${inter.variable} ${playfair.variable} ${inter.className}`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
