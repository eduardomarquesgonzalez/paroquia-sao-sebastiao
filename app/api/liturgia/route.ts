import { NextResponse } from "next/server";

export const revalidate = 43200;

export async function GET() {
  try {
    const res = await fetch("https://liturgia.up.railway.app/v2/", {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[liturgia] API externa retornou status:", res.status);
      return NextResponse.json(
        { error: "Liturgia indisponível no momento" },
        { status: 503 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[liturgia] Erro ao buscar:", err);
    return NextResponse.json(
      { error: "Liturgia indisponível no momento" },
      { status: 503 }
    );
  }
}
