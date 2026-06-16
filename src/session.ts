import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { RunState } from "./game/types";

export type RunSession = { run?: RunState };

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD ?? "",
  cookieName: "omen_run",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getRunSession() {
  const { password } = sessionOptions;
  if (typeof password !== "string" || password.length < 32) {
    throw new Error("SESSION_PASSWORD missing or shorter than 32 characters");
  }
  return getIronSession<RunSession>(await cookies(), sessionOptions);
}
