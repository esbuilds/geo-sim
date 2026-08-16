import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  createRun,
  insertTrial,
  openDb,
  upsertScenario,
  type DB,
} from '../src/db/db.js';
import { getTrialsForRun } from '../src/db/queries.js';
import type { Scenario, Trial } from '../src/harness/types.js';

const scenario: Scenario = {
  id: 'sc1',
  factor: 'freshness',
  query: 'q?',
  variantA: { id: 'a', label: 'A', text: 'alpha' },
  variantB: { id: 'b', label: 'B', text: 'beta' },
  notes: 'n',
};

function trial(over: Partial<Trial>): Trial {
  return {
    scenarioId: 'sc1',
    provider: 'anthropic',
    model: 'test-model',
    positionOrder: 'AB',
    rawResponse: 'full text <cited>1</cited>',
    citedVariant: 'A',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

describe('sqlite persistence', () => {
  let db: DB;
  beforeEach(() => {
    db = openDb(':memory:');
  });
  afterEach(() => db.close());

  test('per-trial writes survive and round-trip via queries', () => {
    upsertScenario(db, scenario);
    const runId = createRun(db, scenario.id, ['anthropic'], 5);

    insertTrial(db, runId, trial({ positionOrder: 'AB' }));
    insertTrial(
      db,
      runId,
      trial({ positionOrder: 'BA', timestamp: '2026-01-01T00:00:01.000Z' }),
    );

    const trials = getTrialsForRun(db, runId);
    expect(trials).toHaveLength(2);
    expect(trials[0].rawResponse).toBe('full text <cited>1</cited>');
    expect(trials.map((t) => t.positionOrder)).toEqual(['AB', 'BA']);
  });

  test('errored trial preserves the error column', () => {
    upsertScenario(db, scenario);
    const runId = createRun(db, scenario.id, ['anthropic'], 1);
    insertTrial(
      db,
      runId,
      trial({ rawResponse: '', citedVariant: 'neither', error: 'boom' }),
    );

    const [t] = getTrialsForRun(db, runId);
    expect(t.error).toBe('boom');
  });

  test('upsertScenario is idempotent on id', () => {
    upsertScenario(db, scenario);
    upsertScenario(db, { ...scenario, query: 'changed?' });
    const row = db
      .prepare('SELECT query FROM scenarios WHERE id = ?')
      .get('sc1') as { query: string };
    expect(row.query).toBe('changed?');
  });
});
