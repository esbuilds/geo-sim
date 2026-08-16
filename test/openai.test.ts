import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Scenario } from '../src/harness/types.js';

const create = vi.hoisted(() => vi.fn());
vi.mock('openai', () => ({
  default: vi.fn(() => ({ chat: { completions: { create } } })),
}));

const { openaiProvider } = await import('../src/providers/openai.js');

const scenario: Scenario = {
  id: 's1',
  factor: 'test',
  query: 'q?',
  variantA: { id: 'a', label: 'A', text: 'alpha' },
  variantB: { id: 'b', label: 'B', text: 'beta' },
};

function mockContent(text: string): void {
  create.mockResolvedValue({ choices: [{ message: { content: text } }] });
}

describe('openaiProvider.runTrial', () => {
  beforeEach(() => create.mockReset());

  test('doc 1 cited -> A (AB order), preserves raw response', async () => {
    mockContent('The answer.\n<cited>1</cited>');
    const trial = await openaiProvider.runTrial(scenario, 'AB');
    expect(trial.citedVariant).toBe('A');
    expect(trial.provider).toBe('openai');
    expect(trial.rawResponse).toContain('<cited>1</cited>');
  });

  test('doc 2 cited -> B (AB order)', async () => {
    mockContent('<cited>2</cited>');
    expect((await openaiProvider.runTrial(scenario, 'AB')).citedVariant).toBe(
      'B',
    );
  });

  test('both', async () => {
    mockContent('<cited>both</cited>');
    expect((await openaiProvider.runTrial(scenario, 'AB')).citedVariant).toBe(
      'both',
    );
  });

  test('neither (also covers a missing/empty response)', async () => {
    mockContent('<cited>neither</cited>');
    expect((await openaiProvider.runTrial(scenario, 'AB')).citedVariant).toBe(
      'neither',
    );
  });
});
