import { execFileSync } from "node:child_process";
import os from "node:os";

const SERVICE = "anthropic-api-key";

/**
 * Resolve the Anthropic API key without ever writing it to a file or a persisted
 * env var. Precedence:
 *   1. process.env.ANTHROPIC_API_KEY  — for CI / one-off overrides
 *   2. macOS Keychain generic password (service "anthropic-api-key")
 *
 * Store it once (never appears in shell history — `-w` prompts interactively):
 *   security add-generic-password -a "$USER" -s anthropic-api-key -w
 * Update it later with -U:
 *   security add-generic-password -U -a "$USER" -s anthropic-api-key -w
 * Remove it:
 *   security delete-generic-password -a "$USER" -s anthropic-api-key
 */
export function getApiKey(): string {
  const fromEnv = process.env.ANTHROPIC_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  if (process.platform === "darwin") {
    try {
      const key = execFileSync(
        "security",
        ["find-generic-password", "-a", os.userInfo().username, "-s", SERVICE, "-w"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
      if (key) return key;
    } catch {
      /* fall through to the error below */
    }
  }

  throw new Error(
    "No Anthropic API key found. Set ANTHROPIC_API_KEY, or store it in the macOS Keychain:\n" +
      '  security add-generic-password -a "$USER" -s anthropic-api-key -w',
  );
}
