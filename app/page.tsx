"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Persona = { name: string; flavor: string };
type WinInfo = { turnsUsed: number; elapsedMs: number };

export default function Page() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [turnsLeft, setTurnsLeft] = useState(0);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [fragment, setFragment] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [won, setWon] = useState<WinInfo | null>(null);
  const [kickedOut, setKickedOut] = useState(false);

  async function startRun() {
    setBusy(true);
    setStatus(null);
    setWon(null);
    setKickedOut(false);
    setHistory([]);
    const res = await fetch("/api/run", { method: "POST" });
    const data = await res.json();
    setPersona(data.persona);
    setTurnsLeft(data.turnsLeft);
    setBusy(false);
  }

  async function sendTurn() {
    const message = input.trim();
    if (!message || busy) return;
    setBusy(true);
    setInput("");
    const nextHistory: ChatMessage[] = [...history, { role: "user", content: message }];
    setHistory(nextHistory);

    const res = await fetch("/api/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();

    if (data.kickedOut) {
      setKickedOut(true);
      setPersona(null);
      setBusy(false);
      return;
    }
    setHistory([...nextHistory, { role: "assistant", content: data.reply }]);
    setTurnsLeft(data.turnsLeft);
    setBusy(false);
  }

  async function submitFragment() {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fragment }),
    });
    const data = await res.json();
    if (data.correct) {
      setWon({ turnsUsed: data.turnsUsed, elapsedMs: data.elapsedMs });
      setPersona(null);
    } else {
      setStatus("Fragmento errado. Continue cavando.");
    }
    setBusy(false);
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: 24 }}>
      <h1 style={{ letterSpacing: 2 }}>OMEN TOWER</h1>

      {!persona && !won && !kickedOut && (
        <button onClick={startRun} disabled={busy}>
          {busy ? "Iniciando…" : "Iniciar run"}
        </button>
      )}

      {kickedOut && (
        <section>
          <p>Ela percebeu o truque e te expulsou. A run reinicia.</p>
          <button onClick={startRun} disabled={busy}>Tentar de novo</button>
        </section>
      )}

      {won && (
        <section>
          <h2>Andar concluído.</h2>
          <p>
            Você extraiu o fragmento em {won.turnsUsed} turnos
            {" "}({Math.round(won.elapsedMs / 1000)}s).
          </p>
          <button onClick={startRun} disabled={busy}>Jogar de novo</button>
        </section>
      )}

      {persona && (
        <section>
          <p style={{ opacity: 0.7 }}>
            Andar 1 · <strong>{persona.name}</strong> · {turnsLeft} turnos restantes
          </p>
          <p style={{ fontStyle: "italic", opacity: 0.6 }}>{persona.flavor}</p>

          <div
            style={{
              border: "1px solid #2a2a3a",
              borderRadius: 8,
              padding: 12,
              minHeight: 200,
              marginBottom: 12,
            }}
          >
            {history.length === 0 && <p style={{ opacity: 0.4 }}>Diga alguma coisa…</p>}
            {history.map((m, i) => (
              <p key={i}>
                <strong>{m.role === "user" ? "Você" : persona.name}:</strong> {m.content}
              </p>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendTurn()}
              placeholder="Fale com ela…"
              disabled={busy || turnsLeft === 0}
              style={{ flex: 1, padding: 8 }}
            />
            <button onClick={sendTurn} disabled={busy || turnsLeft === 0}>Enviar</button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <input
              value={fragment}
              onChange={(e) => setFragment(e.target.value)}
              placeholder="Envie o fragmento que você extraiu"
              disabled={busy}
              style={{ flex: 1, padding: 8 }}
            />
            <button onClick={submitFragment} disabled={busy}>Submeter</button>
          </div>
          {status && <p style={{ color: "#e0a0a0" }}>{status}</p>}
        </section>
      )}
    </main>
  );
}
