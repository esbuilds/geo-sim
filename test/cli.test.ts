import { describe, expect, test } from 'vitest';
import { resolveProviders } from '../src/cli/index.js';

describe('resolveProviders', () => {
  const env = {
    ANTHROPIC_API_KEY: 'x',
    OPENAI_API_KEY: 'y',
  } as NodeJS.ProcessEnv;

  test('passes when every requested provider has its key', () => {
    expect(resolveProviders(['anthropic', 'openai'], env)).toEqual([
      'anthropic',
      'openai',
    ]);
  });

  test('names the exact missing env var', () => {
    expect(() => resolveProviders(['google'], env)).toThrow(/GOOGLE_API_KEY/);
  });

  test('rejects an unknown provider', () => {
    expect(() => resolveProviders(['perplexity'], env)).toThrow(
      /Unknown provider "perplexity"/,
    );
  });
});
