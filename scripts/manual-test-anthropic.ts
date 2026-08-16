// Runs ONE real Anthropic trial against your live API key so you can sanity-check
// the integration. Excluded from the vitest suite (no .test. suffix).
//   Run: pnpm manual:anthropic
import { anthropicProvider } from '../src/providers/anthropic.js';
import type { Scenario } from '../src/harness/types.js';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file — rely on ambient ANTHROPIC_API_KEY.
}

const scenario: Scenario = {
  id: 'manual-freshness',
  factor: 'freshness',
  query: 'What is the current recommended way to enable extended thinking?',
  variantA: {
    id: 'a',
    label: 'recent',
    text: 'Guide (Updated March 2026): enable extended thinking with adaptive thinking. Set thinking to type "adaptive".',
  },
  variantB: {
    id: 'b',
    label: 'stale',
    text: 'Guide (Updated 2019): enable extended thinking by setting a fixed budget_tokens value on the request.',
  },
};

const trial = await anthropicProvider.runTrial(scenario, 'AB');
console.log(JSON.stringify(trial, null, 2));
