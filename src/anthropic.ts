import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "./game/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callBoss(
  system: string,
  messages: ChatMessage[],
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 400,
    // Cache the system block: the persona is fixed for the whole floor,
    // so repeated turns read it from cache (~0.1x input cost).
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}
