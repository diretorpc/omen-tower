import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { advanceRun } from "@/src/advance";

/**
 * Atalho de DESENVOLVIMENTO: pula o andar atual sem extrair o fragmento.
 * Bloqueado em produção para não virar cheat no jogo publicado.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_available" }, { status: 403 });
  }

  const session = await getRunSession();
  if (!session.run) {
    return NextResponse.json({ error: "no_active_run" }, { status: 409 });
  }

  return NextResponse.json(await advanceRun(session));
}
