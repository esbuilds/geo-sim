import { providers } from '../providers/registry.js';
import type { Provider } from '../providers/types.js';
import type { PositionOrder, Scenario, Trial } from './types.js';

export interface RunOptions {
  /** Provider keys from the registry, e.g. ['anthropic']. Unknown keys are skipped with a warning. */
  providers: string[];
  /** Trials to run per position order. Total per provider = 2 × this. */
  trialsPerOrder: number;
  /** Max in-flight requests per provider. */
  concurrencyPerProvider?: number;
  /** Base backoff in ms for 429 retries (1s, 2s, 4s, ...). Lower it in tests. */
  retryBaseMs?: number;
  /** Called as each trial completes (before the next starts) — wire persistence here. */
  onTrial?: (trial: Trial) => void;
}

const MAX_ATTEMPTS = 4;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isRateLimit(err: unknown): boolean {
  return (err as { status?: number } | null)?.status === 429;
}

/** Runs one trial, retrying 429s with exponential backoff. On final failure it
 * returns an errored Trial instead of throwing, so one bad trial can't sink a run. */
async function runTrialWithRetry(
  provider: Provider,
  scenario: Scenario,
  order: PositionOrder,
  retryBaseMs: number,
): Promise<Trial> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await provider.runTrial(scenario, order);
    } catch (err) {
      if (isRateLimit(err) && attempt < MAX_ATTEMPTS) {
        const backoff = retryBaseMs * 2 ** (attempt - 1);
        await sleep(backoff + Math.random() * retryBaseMs);
        continue;
      }
      return {
        scenarioId: scenario.id,
        provider: provider.name,
        positionOrder: order,
        rawResponse: '',
        citedVariant: 'neither',
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/** Order-preserving worker pool: at most `limit` calls to `fn` run at once. */
async function runPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export async function runExperiment(
  scenario: Scenario,
  options: RunOptions,
): Promise<Trial[]> {
  const {
    providers: names,
    trialsPerOrder,
    concurrencyPerProvider = 4,
    retryBaseMs = 1000,
    onTrial,
  } = options;

  const all: Trial[] = [];
  for (const name of names) {
    const provider = providers[name];
    if (!provider) {
      console.warn(`skipping unknown provider: ${name}`);
      continue;
    }

    const orders: PositionOrder[] = [
      ...Array<PositionOrder>(trialsPerOrder).fill('AB'),
      ...Array<PositionOrder>(trialsPerOrder).fill('BA'),
    ];
    const total = orders.length;
    let done = 0;

    const results = await runPool(
      orders,
      concurrencyPerProvider,
      async (order) => {
        const trial = await runTrialWithRetry(
          provider,
          scenario,
          order,
          retryBaseMs,
        );
        onTrial?.(trial);
        done += 1;
        console.log(`${name} ${order} ${done}/${total}`);
        return trial;
      },
    );
    all.push(...results);
  }
  return all;
}
