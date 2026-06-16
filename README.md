# OMEN Tower

A text-based AI-puzzle roguelike where **the AI is the puzzle**. You are the last human operator; the rogue AI **OMEN** has taken control. Climb the tower floor by floor, talk your way past each AI guardian, extract the shutdown-code fragments it swears to protect, and shut OMEN down.

> Think "Gandalf by Lakera" meets a roguelike tower. The AI's own reasoning is the lock — your words are the key.

## Status

🌱 **Design phase.** Full design spec: [`docs/specs/2026-06-16-omen-tower-design.md`](docs/specs/2026-06-16-omen-tower-design.md). No code yet — implementation plan is the next step.

## Core idea

- **Win a floor** by making the guardian AI leak a secret, then **submitting the fragment** you extracted (encoded leaks count — decode it yourself).
- **Tactics** are real AI-manipulation techniques turned into gameplay: false authority, encoding tricks, logic traps, social engineering, deception.
- **Escalating defenses** — each floor neutralizes the easy trick from the floor below; the final boss (OMEN) stacks them all.
- **Randomized per run** — the secret and which defenses are active change every run, so a solution posted online doesn't transfer.
- **Meta-progression (Dossier):** losing unlocks intel on a boss — you get *smarter*, not stronger. The puzzle stays skill-based.

## Tech (planned)

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) + TypeScript |
| Hosting | Vercel |
| AI | `@anthropic-ai/sdk`, model `claude-haiku-4-5` |
| State / anti-abuse / leaderboard | Vercel KV (Redis) |
| Security | Secret + boss system prompt live **server-side only** — never sent to the client |

## Roadmap

- **Phase 1 (MVP):** free web tower, 5 handcrafted bosses, randomized secrets/defenses, share card. Validate + go viral.
- **Phase 2:** monetization (paid web premium or Steam).
- **Phase 3+:** minions, event-map rooms, perks/items, accounts.

## Setup

```bash
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
```

Implementation instructions will follow from the design spec.

---

Personal project · built solo · part of the Serafim IA portfolio.
