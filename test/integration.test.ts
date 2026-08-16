import { afterEach, describe, expect, test } from 'vitest';
import { createRun, insertTrial, openDb, upsertScenario } from '../src/db/db.js';
import { getScenarioForRun, getTrialsForRun } from '../src/db/queries.js';
import { runExperiment } from '../src/harness/run.js';
import { providers } from '../src/providers/registry.js';
import { analyze } from '../src/stats/analyze.js';
import { DISCLAIMER, renderMarkdown } from '../src/report/markdown.js';
import type { Scenario } from '../src/harness/types.js';

const scenario: Scenario = {
  id: 'e2e',
  factor: 'freshness',
  query: 'q?',
  variantA: { id: 'a', label: 'recent', text: 'alpha' },
  variantB: { id: 'b', label: 'stale', text: 'beta' },
};

afterEach(() => {
  delete providers.fake;
});

describe('end-to-end: run -> persist -> read -> analyze -> report', () => {
  test('the full pipeline agrees at every hop', async () => {
    // A fake provider that always cites variant A — no network, real everything else.
    providers.fake = {
      name: 'fake',
      runTrial: async (s, positionOrder) => ({
        scenarioId: s.id,
        provider: 'fake',
        positionOrder,
        rawResponse: '<cited>1</cited>',
        citedVariant: positionOrder === 'AB' ? 'A' : 'B', // doc 1 == A under AB, B under BA
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    };

    const db = openDb(':memory:');
    upsertScenario(db, scenario);
    const runId = createRun(db, scenario.id, ['fake'], 5);

    const returned = await runExperiment(scenario, {
      providers: ['fake'],
      trialsPerOrder: 5,
      onTrial: (t) => insertTrial(db, runId, t),
    });

    // Persisted count matches what runExperiment returned.
    const persisted = getTrialsForRun(db, runId);
    expect(returned).toHaveLength(10);
    expect(persisted).toHaveLength(10);

    // The fake cites doc 1 every time, which is A on AB and B on BA -> 5 A / 5 B.
    const result = analyze(persisted);
    const fake = result.byProvider[0];
    expect(fake.counts.A).toBe(5);
    expect(fake.counts.B).toBe(5);
    expect(fake.decisive).toBe(10);
    expect(fake.significant).toBe(false); // position-balanced -> no content effect

    // Scenario round-trips out of the DB, and the report renders with the disclaimer.
    const recovered = getScenarioForRun(db, runId);
    expect(recovered?.query).toBe('q?');
    const md = renderMarkdown(result, recovered!, runId);
    db.close();

    expect(md).toContain('| fake |');
    expect(md).toContain(DISCLAIMER);
  });
});
