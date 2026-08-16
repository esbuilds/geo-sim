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

describe('position analysis', () => {
  /** One trial per (order, citedVariant) pair, repeated n times. */
  function trial(
    positionOrder: 'AB' | 'BA',
    citedVariant: CitedVariant,
    n: number,
  ): Trial[] {
    return Array.from({ length: n }, () => ({
      scenarioId: 's1',
      provider: 'p',
      model: 'test-model',
      positionOrder,
      rawResponse: '',
      citedVariant,
      timestamp: '2026-01-01T00:00:00.000Z',
    }));
  }

  test('total position bias is invisible to the variant test but caught here', () => {
    // The shape observed on claude-sonnet-5 (run dd37c021): document 1 always
    // wins, so counterbalancing makes A and B come out even.
    const trials = [
      ...trial('AB', 'A', 30), // A is doc 1
      ...trial('BA', 'B', 30), // B is doc 1
    ];
    const [p] = analyze(trials).byProvider;

    // Variant level sees a perfect coin flip and reports nothing.
    expect(p.counts).toMatchObject({ A: 30, B: 30 });
    expect(p.significant).toBe(false);
    expect(p.winner).toBeNull();

    // Position level sees the truth.
    expect(p.position).toMatchObject({ doc1: 60, doc2: 0, biased: true });
    expect(p.position.proportionDoc1).toBe(1);
  });

  test('a real content effect wins from both slots and flags no position bias', () => {
    // The freshness shape (run 1fc821d5): A wins whether it is first or second.
    const trials = [
      ...trial('AB', 'A', 5), // A first, A cited  -> doc 1
      ...trial('BA', 'A', 5), // A second, A cited -> doc 2
    ];
    const [p] = analyze(trials).byProvider;

    expect(p.winner).toBe('A');
    expect(p.significant).toBe(true);
    expect(p.position).toMatchObject({ doc1: 5, doc2: 5, biased: false });
  });

  test('both/neither trials are excluded from the position counts', () => {
    const trials = [
      ...trial('AB', 'A', 3),
      ...trial('AB', 'both', 4),
      ...trial('BA', 'neither', 2),
    ];
    const [p] = analyze(trials).byProvider;
    expect(p.position).toMatchObject({ doc1: 3, doc2: 0 });
  });

  test('no decisive trials leaves position stats undefined rather than 0/0', () => {
    const [p] = analyze(make('p', { both: 4 })).byProvider;
    expect(p.position.doc1).toBe(0);
    expect(p.position.doc2).toBe(0);
    expect(Number.isNaN(p.position.proportionDoc1)).toBe(true);
    expect(p.position.biased).toBe(false);
  });
});

describe('wilson interval bounds', () => {
  test('unanimous results stay inside [0, 1]', () => {
    const allB = analyze(make('p', { B: 60 })).byProvider[0];
    expect(allB.wilson.lower).toBeGreaterThanOrEqual(0);
    expect(allB.wilson.upper).toBeLessThanOrEqual(1);
    expect(Object.is(allB.wilson.lower, -0)).toBe(false);

    const allA = analyze(make('p', { A: 60 })).byProvider[0];
    expect(allA.wilson.upper).toBeLessThanOrEqual(1);
    expect(allA.wilson.lower).toBeGreaterThanOrEqual(0);
  });
});
