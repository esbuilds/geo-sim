import type { TrialRow } from './db';

export function fmtPct(x: number | null): string {
  return x === null ? 'n/a' : `${(x * 100).toFixed(1)}%`;
}

// Display-level counts only. The CLI `geo-sim report` remains the source of truth
// for full statistics (Wilson interval, binomial significance). ponytail: the
// dashboard shows counts + A win rate; it does not re-derive the inferential stats.

export interface ProviderCounts {
  provider: string;
  A: number;
  B: number;
  both: number;
  neither: number;
  errors: number;
  decisive: number;
  /** A / (A + B), or null when there are no decisive trials. */
  winRateA: number | null;
}

export function providerCounts(trials: TrialRow[]): ProviderCounts[] {
  const byProvider = new Map<string, ProviderCounts>();
  for (const t of trials) {
    const c =
      byProvider.get(t.provider) ??
      ({
        provider: t.provider,
        A: 0,
        B: 0,
        both: 0,
        neither: 0,
        errors: 0,
        decisive: 0,
        winRateA: null,
      } satisfies ProviderCounts);
    if (t.error !== null) c.errors += 1;
    else if (t.cited_variant === 'A') c.A += 1;
    else if (t.cited_variant === 'B') c.B += 1;
    else if (t.cited_variant === 'both') c.both += 1;
    else c.neither += 1;
    byProvider.set(t.provider, c);
  }
  return [...byProvider.values()].map((c) => {
    c.decisive = c.A + c.B;
    c.winRateA = c.decisive === 0 ? null : c.A / c.decisive;
    return c;
  });
}

/** Overall A win rate across all providers for a run, for the trend view. */
export function overallWinRateA(trials: TrialRow[]): number | null {
  let a = 0;
  let decisive = 0;
  for (const t of trials) {
    if (t.error !== null) continue;
    if (t.cited_variant === 'A') {
      a += 1;
      decisive += 1;
    } else if (t.cited_variant === 'B') {
      decisive += 1;
    }
  }
  return decisive === 0 ? null : a / decisive;
}
