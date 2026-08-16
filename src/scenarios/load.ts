import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Scenario } from '../harness/types.js';

// Future work: an LLM-assisted generateVariantPair(query, factor) helper —
// mirroring Vishwakarma et al.'s GPT-4o anonymization/generation step — could
// synthesize scenarios programmatically. Not built now: hand-authored scenarios
// are more trustworthy for v1, and they prove the harness works first.

export const EXAMPLES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../examples/scenarios',
);

function assertVariant(v: unknown, where: string): void {
  const o = v as Record<string, unknown>;
  for (const key of ['id', 'label', 'text']) {
    if (typeof o?.[key] !== 'string') {
      throw new Error(`${where}: variant is missing string field "${key}"`);
    }
  }
}

/** Parses and shape-validates a scenario JSON file. Throws on malformed input. */
export function loadScenario(filePath: string): Scenario {
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as Scenario;
  for (const key of ['id', 'query', 'factor'] as const) {
    if (typeof raw[key] !== 'string') {
      throw new Error(`${filePath}: missing string field "${key}"`);
    }
  }
  assertVariant(raw.variantA, `${filePath} variantA`);
  assertVariant(raw.variantB, `${filePath} variantB`);
  return raw;
}

/** Loads every *.json scenario in examples/scenarios/. */
export function loadExampleScenarios(): Scenario[] {
  return readdirSync(EXAMPLES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => loadScenario(path.join(EXAMPLES_DIR, f)));
}
