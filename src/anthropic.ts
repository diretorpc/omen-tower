import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "./game/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callModel(opts: {
  model: string;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<string> {
  const response = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 400,
    // Cache the system block: it's fixed for the whole floor, so repeated
    // turns read it from cache (~0.1x input cost).
    system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function callBoss(
  system: string,
  messages: ChatMessage[],
): Promise<string> {
  return callModel({ model: "claude-haiku-4-5", system, messages });
}
