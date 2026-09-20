import { afterEach, describe, expect, test } from 'vitest';
import { runExperiment } from '../src/harness/run.js';
import { providers } from '../src/providers/registry.js';
import type { Provider } from '../src/providers/types.js';
import type { PositionOrder, Scenario, Trial } from '../src/harness/types.js';

const scenario: Scenario = {
  id: 's1',
  factor: 'test',
  query: 'q?',
  variantA: { id: 'a', label: 'A', text: 'alpha' },
  variantB: { id: 'b', label: 'B', text: 'beta' },
};

function fakeTrial(name: string, order: PositionOrder): Trial {
  return {
    scenarioId: scenario.id,
    provider: name,
    model: 'test-model',
    positionOrder: order,
    rawResponse: '<cited>1</cited>',
    citedVariant: order === 'AB' ? 'A' : 'B',
    timestamp: '2026-01-01T00:00:00.000Z',
  };
}

const injected: string[] = [];
function register(name: string, provider: Provider): void {
  providers[name] = provider;
  injected.push(name);
}

afterEach(() => {
  for (const name of injected) delete providers[name];
  injected.length = 0;
});

describe('runExperiment', () => {
  test('counterbalances: trialsPerOrder each of AB and BA', async () => {
    register('fake', {
      name: 'fake',
      defaultModel: 'test-model',
      runTrial: async (_s, order) => fakeTrial('fake', order),
    });

    const trials = await runExperiment(scenario, {
      providers: ['fake'],
      trialsPerOrder: 3,
    });

    expect(trials).toHaveLength(6);
    expect(trials.filter((t) => t.positionOrder === 'AB')).toHaveLength(3);
    expect(trials.filter((t) => t.positionOrder === 'BA')).toHaveLength(3);
    expect(trials.every((t) => t.error === undefined)).toBe(true);
  });

  test('retries 429s then succeeds', async () => {
    let calls = 0;
    register('flaky', {
      name: 'flaky',
      defaultModel: 'test-model',
      runTrial: async (_s, order) => {
        calls += 1;
        if (calls < 3) throw { status: 429 };
        return fakeTrial('flaky', order);
      },
    });

    const trials = await runExperiment(scenario, {
      providers: ['flaky'],
      trialsPerOrder: 1,
      retryBaseMs: 1,
    });

    // 2 orders, first one failed twice then succeeded -> 4 total calls, no errors
    expect(calls).toBe(4);
    expect(trials.every((t) => t.error === undefined)).toBe(true);
  });

  test('records a failure after exhausting retries instead of throwing', async () => {
    register('dead', {
      name: 'dead',
      defaultModel: 'test-model',
      runTrial: async () => {
        throw { status: 429, message: 'rate limited' };
      },
    });

    const trials = await runExperiment(scenario, {
      providers: ['dead'],
      trialsPerOrder: 1,
      retryBaseMs: 1,
    });

    expect(trials).toHaveLength(2);
    expect(trials.every((t) => typeof t.error === 'string')).toBe(true);
  });

  test('skips unknown providers without throwing', async () => {
    const trials = await runExperiment(scenario, {
      providers: ['does-not-exist'],
      trialsPerOrder: 2,
    });
    expect(trials).toHaveLength(0);
  });

  test('--model override reaches the provider and is recorded on each trial', async () => {
    const seen: (string | undefined)[] = [];
    providers.recorder = {
      name: 'recorder',
      defaultModel: 'default-model',
      runTrial: async (_s, order, model) => {
        seen.push(model);
        return {
          ...fakeTrial('recorder', order),
          model: model ?? 'default-model',
        };
      },
    };

    const overridden = await runExperiment(scenario, {
      providers: ['recorder'],
      trialsPerOrder: 1,
      model: 'override-model',
    });
    expect(seen).toEqual(['override-model', 'override-model']);
    expect(overridden.every((t) => t.model === 'override-model')).toBe(true);

    seen.length = 0;
    const defaulted = await runExperiment(scenario, {
      providers: ['recorder'],
      trialsPerOrder: 1,
    });
    expect(seen).toEqual([undefined, undefined]);
    expect(defaulted.every((t) => t.model === 'default-model')).toBe(true);
  });

  test('errored trials still record the model that was attempted', async () => {
    providers.deadmodel = {
      name: 'deadmodel',
      defaultModel: 'default-model',
      runTrial: async () => {
        throw new Error('boom');
      },
    };

    const trials = await runExperiment(scenario, {
      providers: ['deadmodel'],
      trialsPerOrder: 1,
      retryBaseMs: 1,
      model: 'override-model',
    });
    expect(trials.every((t) => t.model === 'override-model')).toBe(true);
  });
});
