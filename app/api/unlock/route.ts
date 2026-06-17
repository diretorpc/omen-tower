import { NextResponse } from "next/server";
import { getRunSession } from "@/src/session";
import { accessConfigured, codeMatches } from "@/src/access";

type UnlockBody = { code?: string };

export async function POST(request: Request) {
  // No gate configured → nothing to unlock.
  if (!accessConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json()) as UnlockBody;
  if (!codeMatches((body.code ?? "").trim())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const session = await getRunSession();
  session.unlocked = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
