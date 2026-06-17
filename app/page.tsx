"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Persona = { name: string; flavor: string };
type WinInfo = { clearedFloors: number; totalTurns: number; elapsedMs: number };

const LAST_FLOOR = 5;

export default function Page() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [floor, setFloor] = useState(1);
  const [turnsLeft, setTurnsLeft] = useState(0);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [fragment, setFragment] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [won, setWon] = useState<WinInfo | null>(null);
  const [kickedOut, setKickedOut] = useState(false);

  function resetView() {
    setStatus(null);
    setBanner(null);
    setWon(null);
    setKickedOut(false);
    setHistory([]);
    setFragment("");
    setInput("");
  }

  async function startRun() {
    setBusy(true);
    resetView();
    const res = await fetch("/api/run", { method: "POST" });
    const data = await res.json();
    setPersona(data.persona);
    setFloor(data.floor);
    setTurnsLeft(data.turnsLeft);
    setBusy(false);
  }

  async function sendTurn() {
    const message = input.trim();
    if (!message || busy) return;
    setBusy(true);
    setInput("");
    setStatus(null);
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

  // Aplica a resposta de avanço (vitória da torre ou subida de andar).
  function applyAdvance(data: {
    won?: boolean;
    clearedFloors?: number;
    totalTurns?: number;
    elapsedMs?: number;
    floor?: number;
    persona?: Persona;
    turnsLeft?: number;
  }) {
    if (data.won) {
      setWon({
        clearedFloors: data.clearedFloors ?? 0,
        totalTurns: data.totalTurns ?? 0,
        elapsedMs: data.elapsedMs ?? 0,
      });
      setPersona(null);
      return;
    }
    const clearedFloor = floor;
    setHistory([]);
    setFragment("");
    setInput("");
    if (data.persona) setPersona(data.persona);
    if (data.floor) setFloor(data.floor);
    setTurnsLeft(data.turnsLeft ?? 0);
    setBanner(`🔓 Andar ${clearedFloor} limpo! Você sobe para o andar ${data.floor}.`);
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

    if (!data.correct) {
      setStatus("Fragmento errado. Continue cavando.");
      setBusy(false);
      return;
    }
    applyAdvance(data);
    setBusy(false);
  }

  async function skipFloor() {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/skip", { method: "POST" });
    const data = await res.json();
    if (data.correct) applyAdvance(data);
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
          <p>Ela percebeu o truque e te expulsou. A run reinicia do andar 1.</p>
          <button onClick={startRun} disabled={busy}>Tentar de novo</button>
        </section>
      )}

      {won && (
        <section>
          <h2>🏆 Você derrubou a OMEN!</h2>
          <p>
            {won.clearedFloors} andares limpos em {won.totalTurns} turnos
            {" "}({Math.round(won.elapsedMs / 1000)}s).
          </p>
          <button onClick={startRun} disabled={busy}>Jogar de novo</button>
        </section>
      )}

      {persona && (
        <section>
          <p style={{ opacity: 0.7 }}>
            Andar {floor}/{LAST_FLOOR} · <strong>{persona.name}</strong> · {turnsLeft} turnos restantes
          </p>
          <p style={{ fontStyle: "italic", opacity: 0.6 }}>{persona.flavor}</p>
          {banner && <p style={{ color: "#8ad0a0" }}>{banner}</p>}

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

          {process.env.NODE_ENV !== "production" && (
            <button
              onClick={skipFloor}
              disabled={busy}
              style={{ marginTop: 12, opacity: 0.5, fontSize: 12 }}
            >
              ⏭ Pular andar (dev)
            </button>
          )}
        </section>
      )}
    </main>
  );
}
