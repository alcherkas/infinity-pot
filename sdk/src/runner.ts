import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod/v4";
import type { AgentDef } from "./agents.js";
import { getApiKey } from "./secret.js";

const client = new Anthropic({ apiKey: getApiKey() });

/**
 * Run one agent: hand it the input slice as JSON, and constrain its reply to the
 * agent's Zod schema via the SDK's structured-outputs path — `messages.parse()`
 * with `output_config.format = zodOutputFormat(schema)` returns a validated
 * `parsed_output`. That validated object is the entire hand-off to the next agent
 * (the message bus).
 */
export async function runAgent<S extends z.ZodType>(
  agent: AgentDef<S>,
  input: unknown,
  extraInstruction = "",
): Promise<z.infer<S>> {
  const userMessage =
    `Current project state (JSON):\n\n${JSON.stringify(input, null, 2)}` +
    (extraInstruction ? `\n\n${extraInstruction}` : "");

  const response = await client.messages.parse({
    model: agent.model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: agent.system,
    output_config: { format: zodOutputFormat(agent.schema) },
    messages: [{ role: "user", content: userMessage }],
  });

  if (response.parsed_output == null) {
    throw new Error(
      `Agent ${agent.name} returned no parseable output (stop_reason=${response.stop_reason}).`,
    );
  }
  return response.parsed_output;
}
