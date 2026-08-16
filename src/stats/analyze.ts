import type { Trial } from '../harness/types.js';

// v2 upgrade path: Vishwakarma et al. used a full logistic GLMM with nested
// random effects across scenario/query/model. This module intentionally uses a
// simpler per-provider binomial model — swap in a GLMM only if this proves too
// imprecise. Don't build that now.

export interface ProviderAnalysis {
  provider: string;
  counts: { A: number; B: number; both: number; neither: number };
  /** Trials excluded because they errored (see Trial.error). */
  errors: number;
  /** A + B (both/neither excluded). */
  decisive: number;
  /** Proportion of decisive trials favoring A. NaN if decisive === 0. */
  proportionA: number;
  /** Wilson 95% score interval for proportionA. */
  wilson: { lower: number; upper: number };
  /** Two-sided exact binomial p-value against a 50/50 null. */
  pValue: number;
  /** Significant at alpha = 0.05. */
  significant: boolean;
  /** Significant winner, or null if no significant preference / no decisive trials. */
  winner: 'A' | 'B' | null;
}

export interface AnalysisResult {
  byProvider: ProviderAnalysis[];
  crossProvider: {
    /** Per-provider significant winner. */
    winners: Record<string, 'A' | 'B' | null>;
    /** Number of providers sharing the single winning variant (0 if none are significant). */
    agreement: number;
    /** True if different providers picked different significant winners. */
    disagreement: boolean;
    note: string;
  };
}

const Z = 1.959964; // 95% two-sided normal quantile
const ALPHA = 0.05;

/** Wilson score interval for x successes in n trials. */
function wilson(x: number, n: number): { lower: number; upper: number } {
  if (n === 0) return { lower: NaN, upper: NaN };
  const p = x / n;
  const z2 = Z * Z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (Z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return { lower: center - half, upper: center + half };
}

/**
 * Two-sided exact binomial test of x successes in n trials against p = 0.5.
 * ponytail: naive exact sum — fine for the small trial counts this harness runs.
 * For very large n (0.5^n underflow), switch to a normal approximation.
 */
function binomialTwoSidedP(x: number, n: number): number {
  if (n === 0) return 1;
  const k = Math.min(x, n - x);
  let coeff = 1; // C(n, 0)
  let tail = 0;
  for (let i = 0; i <= k; i++) {
    if (i > 0) coeff = (coeff * (n - i + 1)) / i;
    tail += coeff * Math.pow(0.5, n);
  }
  return Math.min(1, 2 * tail);
}

function analyzeProvider(provider: string, trials: Trial[]): ProviderAnalysis {
  const counts = { A: 0, B: 0, both: 0, neither: 0 };
  let errors = 0;
  for (const t of trials) {
    if (t.error !== undefined) {
      errors += 1;
      continue;
    }
    counts[t.citedVariant] += 1;
  }

  const decisive = counts.A + counts.B;
  const proportionA = decisive === 0 ? NaN : counts.A / decisive;
  const pValue = binomialTwoSidedP(counts.A, decisive);
  const significant = decisive > 0 && pValue < ALPHA;
  const winner: 'A' | 'B' | null = significant
    ? proportionA > 0.5
      ? 'A'
      : 'B'
    : null;

  return {
    provider,
    counts,
    errors,
    decisive,
    proportionA,
    wilson: wilson(counts.A, decisive),
    pValue,
    significant,
    winner,
  };
}

export function analyze(trials: Trial[]): AnalysisResult {
  const byName = new Map<string, Trial[]>();
  for (const t of trials) {
    const list = byName.get(t.provider) ?? [];
    list.push(t);
    byName.set(t.provider, list);
  }

  const byProvider = [...byName.entries()].map(([name, list]) =>
    analyzeProvider(name, list),
  );

  const winners: Record<string, 'A' | 'B' | null> = {};
  for (const p of byProvider) winners[p.provider] = p.winner;

  const significantWinners = byProvider
    .map((p) => p.winner)
    .filter((w): w is 'A' | 'B' => w !== null);
  const distinct = new Set(significantWinners);
  const disagreement = distinct.size > 1;
  const agreement = disagreement ? 0 : significantWinners.length;

  let note: string;
  if (disagreement) {
    note = 'Providers disagree on the winning variant.';
  } else if (agreement === 0) {
    note = 'No provider showed a significant preference.';
  } else {
    const variant = [...distinct][0];
    note = `${agreement}/${byProvider.length} provider(s) preferred variant ${variant}.`;
  }

  return {
    byProvider,
    crossProvider: { winners, agreement, disagreement, note },
  };
}
