import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Scenario } from '../src/harness/types.js';

const generateContent = vi.hoisted(() => vi.fn());
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({ models: { generateContent } })),
}));

const { googleProvider } = await import('../src/providers/google.js');

const scenario: Scenario = {
  id: 's1',
  factor: 'test',
  query: 'q?',
  variantA: { id: 'a', label: 'A', text: 'alpha' },
  variantB: { id: 'b', label: 'B', text: 'beta' },
};

function mockText(text: string): void {
  generateContent.mockResolvedValue({ text });
}

describe('googleProvider.runTrial', () => {
  beforeEach(() => generateContent.mockReset());

  test('doc 1 cited -> A (AB order), preserves raw response', async () => {
    mockText('The answer.\n<cited>1</cited>');
    const trial = await googleProvider.runTrial(scenario, 'AB');
    expect(trial.citedVariant).toBe('A');
    expect(trial.provider).toBe('google');
    expect(trial.rawResponse).toContain('<cited>1</cited>');
  });

  test('doc 2 cited -> B (AB order)', async () => {
    mockText('<cited>2</cited>');
    expect((await googleProvider.runTrial(scenario, 'AB')).citedVariant).toBe(
      'B',
    );
  });

  test('both', async () => {
    mockText('<cited>both</cited>');
    expect((await googleProvider.runTrial(scenario, 'AB')).citedVariant).toBe(
      'both',
    );
  });

  test('neither (also covers a missing/empty response)', async () => {
    mockText('<cited>neither</cited>');
    expect((await googleProvider.runTrial(scenario, 'AB')).citedVariant).toBe(
      'neither',
    );
  });
});
