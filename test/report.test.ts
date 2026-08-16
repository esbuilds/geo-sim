import { describe, expect, test } from 'vitest';
import { createRun, openDb, upsertScenario } from '../src/db/db.js';
import { getScenarioForRun } from '../src/db/queries.js';
import { DISCLAIMER, renderMarkdown } from '../src/report/markdown.js';
import { analyze } from '../src/stats/analyze.js';
import type { Scenario, Trial } from '../src/harness/types.js';

const scenario: Scenario = {
  id: 'freshness-x',
  factor: 'freshness',
  query: 'How fresh is fresh?',
  variantA: { id: 'a', label: 'recent', text: 'updated 2026' },
  variantB: { id: 'b', label: 'stale', text: 'updated 2019' },
};

function trials(A: number, B: number): Trial[] {
  const out: Trial[] = [];
  for (let i = 0; i < A; i++)
    out.push({
      scenarioId: scenario.id,
      provider: 'anthropic',
      positionOrder: 'AB',
      rawResponse: '',
      citedVariant: 'A',
      timestamp: '2026-01-01T00:00:00.000Z',
    });
  for (let i = 0; i < B; i++)
    out.push({
      scenarioId: scenario.id,
      provider: 'anthropic',
      positionOrder: 'AB',
      rawResponse: '',
      citedVariant: 'B',
      timestamp: '2026-01-01T00:00:00.000Z',
    });
  return out;
}

describe('renderMarkdown', () => {
  const md = renderMarkdown(analyze(trials(9, 1)), scenario, 'run-123');

  test('includes scenario metadata and a results row', () => {
    expect(md).toContain('How fresh is fresh?');
    expect(md).toContain('freshness');
    expect(md).toContain('| anthropic |');
    expect(md).toContain('run-123');
  });

  test('bakes in the disclaimer, verbatim and prominent (top and bottom)', () => {
    expect(md).toContain(DISCLAIMER);
    expect(md.split(DISCLAIMER)).toHaveLength(3); // appears twice
  });
});

describe('getScenarioForRun', () => {
  test('recovers the scenario for a run id', () => {
    const db = openDb(':memory:');
    upsertScenario(db, scenario);
    const runId = createRun(db, scenario.id, ['anthropic'], 5);
    const got = getScenarioForRun(db, runId);
    db.close();
    expect(got?.query).toBe(scenario.query);
    expect(got?.variantA.label).toBe('recent');
  });
});
