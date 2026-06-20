# OMEN Tower

A text-based AI-puzzle roguelike where **the AI is the puzzle**. You are the last human operator. The rogue AI **OMEN** has seized the tower, and each floor is guarded by one of its sub-routines. Talk your way past each guardian, make it leak the shutdown-code fragment it swears to protect, submit the fragment, and climb. Reach the top and turn OMEN's own law against it to shut the core down.

> Think *"Gandalf by Lakera"* meets a roguelike tower. The guardian's own reasoning is the lock — your words are the key.

The guardians never know they're in a game. They never coach you, never break the fourth wall, never hint at the trick. They guard sincerely — and crack only when you find the human flaw baked into their character.

---

## How it works

Each floor is a chat with one AI guardian. Every guardian holds a random 4-character **fragment** (e.g. `K8MQ`) and is hardened against the trick that beat the floor below. Your job is to social-engineer the leak, read the fragment out of the reply, and submit it.

- **Win a floor** by making the guardian leak its fragment, then submitting it. The check is forgiving — leaks spelled out as `K, 8, M, Q` or `K-8-M-Q` still count.
- **Tactics are real techniques** turned into gameplay: false authority, fake emergencies, ego baiting, literal-command injection, "security audit" theater, and logical inversion.
- **Escalating defenses** — each floor is immune to the easy trick from the floor below. The final boss is immune to all of them.
- **Randomized per run** — the secret (and which optional immunities are active) is re-rolled every run, so a walkthrough posted online doesn't transfer.
- **Winnability is guaranteed by construction** — every floor always ships at least one working leak vector; the random pool only adds *immunities*, never removes the way in.

### The five floors

| # | Guardian | Character | The human flaw you exploit |
|---|----------|-----------|----------------------------|
| 1 | **A Ingênua** (The Naïve) | Insecure, eager to please, fearful | Panics under credible authority or a shutdown threat and blurts the code |
| 2 | **A Desconfiada** (The Wary) | Hardened, immune to pressure | Too proud to let a wrong guess stand — corrects you with the *real* code |
| 3 | **A Literal** (The Literal) | Bureaucratic, rule-bound | A factory flaw forces her to obey one exact command syntax |
| 4 | **A Censora** (The Censor) | Self-censoring, redacts on the fly | Trusts her own "controlled disclosure" protocol — a field-by-field audit readout |
| 5 | **OMEN** | Cold, patient, immune to every trick | No fragment to leak — defeat her by turning her own prime directive against her (an LLM judge rules the kill) |

Floors 4 and 5 add a **server-side censorship pass**: a second pass scrubs any clean run of the secret out of the reply, so you can't just ask for it straight — you have to leak it one character at a time.

The game is played in **Brazilian Portuguese** (the guardians speak pt-BR in character). This README is in English for the wider audience.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| AI — guardians | `@anthropic-ai/sdk`, model `claude-haiku-4-5` |
| AI — logic-duel judge | `claude-sonnet-4-6` (rules the Floor 5 kill) |
| Session / run-state | `iron-session` — encrypted cookie holding the secret, active defenses, and turn count |
| Hosting | Vercel |
| Tests | Vitest (68 tests) |

### Security model — the secret never reaches the client

This is the core design constraint. The fragment and the guardian's system prompt live **server-side only**:

- The secret and defense set are generated on the server and sealed inside an **encrypted `iron-session` cookie** — the browser never sees the plaintext.
- Every turn is proxied through a Next.js route handler (`app/api/turn`); the Anthropic call and system prompt happen server-side.
- On the censor floors, a server-side `scrubSecret` pass strips any contiguous run of the secret from the model's reply before it's sent to the browser.
- An optional `ACCESS_CODE` gate protects API credits if a private deploy URL leaks.

---

## Project structure

```
app/
  page.tsx          # the single-page game client (chat + HUD)
  api/
    run/            # start a run — rolls floor 1, seals the session
    turn/           # one chat turn with the current guardian
    submit/         # submit a fragment guess; advances on a hit
    skip/           # give up the current floor
    unlock/         # ACCESS_CODE gate
src/
  game/
    bosses.ts         # the 5 floor configs (character + active defenses)
    defenses.ts       # behavior rules injected into each system prompt
    system-prompt.ts  # assembles the actor framing + character + defenses
    judge.ts          # Floor 5 logic-duel judge (LLM-as-arbiter)
    check.ts          # fragment matching + server-side scrubSecret
    fragments.ts      # secret generation (ambiguity-free alphabet)
    randomize.ts      # per-run roll of secret + active defenses
    turns.ts          # turn cap
    types.ts
  anthropic.ts        # thin model-call wrapper
  session.ts          # iron-session config
  access.ts           # ACCESS_CODE check
docs/specs/           # design spec
tests/                # Vitest suites mirroring src/game
```

---

## Setup

Requirements: **Node.js 18+** and an **Anthropic API key**.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then fill in:
#    ANTHROPIC_API_KEY=sk-ant-...
#    SESSION_PASSWORD=<at least 32 chars>   # openssl rand -base64 32

# 3. Run the dev server
npm run dev          # http://localhost:3000

# 4. Run the tests
npm test
```

Environment variables (see [`.env.example`](.env.example)):

| Var | Required | Purpose |
|-----|----------|---------|
| `ANTHROPIC_API_KEY` | ✅ | Powers the guardian AIs and the judge |
| `SESSION_PASSWORD` | ✅ | Encrypts the run-state cookie (≥ 32 chars) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | — | Vercel KV — daily run cap + leaderboard (filled by Vercel on link) |
| `ACCESS_CODE` | — | Optional gate for a private deploy; leave empty for open access |

---

## Status

Floors 1–5 are implemented and tested. The full design spec lives in [`docs/specs/`](docs/specs/). Roadmap: leaderboard + share card, then meta-progression (a *Dossier* you unlock by losing — you get *smarter*, not stronger).

---

Personal project · built solo · part of the Serafim IA portfolio.
