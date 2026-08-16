import { describe, expect, test } from 'vitest';
import { analyze } from '../src/stats/analyze.js';
import type { CitedVariant, Trial } from '../src/harness/types.js';

function make(
  provider: string,
  spec: {
    A?: number;
    B?: number;
    both?: number;
    neither?: number;
    error?: number;
  },
): Trial[] {
  const out: Trial[] = [];
  const push = (variant: CitedVariant, n: number, error = false): void => {
    for (let i = 0; i < n; i++) {
      out.push({
        scenarioId: 's1',
        provider,
        model: 'test-model',
        positionOrder: 'AB',
        rawResponse: '',
        citedVariant: variant,
        timestamp: '2026-01-01T00:00:00.000Z',
        ...(error ? { error: 'boom' } : {}),
      });
    }
  };
  push('A', spec.A ?? 0);
  push('B', spec.B ?? 0);
  push('both', spec.both ?? 0);
  push('neither', spec.neither ?? 0);
  push('neither', spec.error ?? 0, true);
  return out;
}

describe('analyze', () => {
  test('unanimous strong preference: all providers pick A', () => {
    const trials = [
      ...make('anthropic', { A: 9, B: 1 }),
      ...make('openai', { A: 9, B: 1 }),
      ...make('google', { A: 9, B: 1 }),
    ];
    const result = analyze(trials);

    expect(result.byProvider.every((p) => p.winner === 'A')).toBe(true);
    expect(result.byProvider.every((p) => p.significant)).toBe(true);
    expect(result.crossProvider.agreement).toBe(3);
    expect(result.crossProvider.disagreement).toBe(false);
    expect(result.crossProvider.note).toContain('variant A');
  });

  test('no significant difference near 50/50', () => {
    const result = analyze(make('anthropic', { A: 5, B: 5 }));
    const p = result.byProvider[0];

    expect(p.significant).toBe(false);
    expect(p.winner).toBeNull();
    expect(p.proportionA).toBe(0.5);
    expect(result.crossProvider.agreement).toBe(0);
  });

  test('providers disagree with each other', () => {
    const trials = [
      ...make('openai', { A: 9, B: 1 }),
      ...make('google', { A: 1, B: 9 }),
    ];
    const result = analyze(trials);

    expect(result.crossProvider.winners.openai).toBe('A');
    expect(result.crossProvider.winners.google).toBe('B');
    expect(result.crossProvider.disagreement).toBe(true);
    expect(result.crossProvider.agreement).toBe(0);
    expect(result.crossProvider.note).toContain('disagree');
  });

  test('errored trials are excluded, not counted as neither', () => {
    const p = analyze(make('anthropic', { A: 8, B: 2, error: 3 }))
      .byProvider[0];
    expect(p.errors).toBe(3);
    expect(p.decisive).toBe(10);
    expect(p.counts.neither).toBe(0);
  });

  test('all both/neither yields no decisive trials and no winner', () => {
    const p = analyze(make('anthropic', { both: 4, neither: 6 })).byProvider[0];
    expect(p.decisive).toBe(0);
    expect(p.winner).toBeNull();
    expect(Number.isNaN(p.proportionA)).toBe(true);
  });
});
