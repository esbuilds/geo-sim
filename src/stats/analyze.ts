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
  /**
   * Which *slot* got cited, ignoring which variant sat there.
   *
   * The variant-level stats above cannot see position bias: the AB/BA swap
   * cancels it exactly, so a model that always cites document 1 and a model
   * with no position preference both produce A ≈ B. Distinguishing them needs
   * this second aggregation. Observed on claude-sonnet-5 (run dd37c021):
   * document 1 won 59/60 on two equal-quality paraphrases while the
   * variant-level test read p=0.897, ns.
   */
  position: PositionAnalysis;
}

export interface PositionAnalysis {
  /** Decisive trials where the cited variant was injected first. */
  doc1: number;
  /** Decisive trials where the cited variant was injected second. */
  doc2: number;
  /** Proportion of decisive trials citing document 1. NaN if none. */
  proportionDoc1: number;
  wilson: { lower: number; upper: number };
  /** Two-sided exact binomial p-value against a 50/50 null. */
  pValue: number;
  /**
   * True when slot choice departs significantly from chance — i.e. the model
   * is picking by position, not content. On a controlled equal-content
   * scenario this is the finding; on a real scenario it means content and
   * position are entangled and the variant result needs care.
   */
  biased: boolean;
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
  // Clamp to [0,1]: at x=0 or x=n the interval can round just past the bounds
  // and print as "-0.0%", which reads as a bug in a published report.
  return {
    lower: Math.max(0, center - half),
    upper: Math.min(1, center + half),
  };
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

/** True when the cited variant occupied document slot 1 for this trial's order. */
function citedFirstSlot(
  order: Trial['positionOrder'],
  cited: 'A' | 'B',
): boolean {
  return order === 'AB' ? cited === 'A' : cited === 'B';
}

function analyzeProvider(provider: string, trials: Trial[]): ProviderAnalysis {
  const counts = { A: 0, B: 0, both: 0, neither: 0 };
  let errors = 0;
  let doc1 = 0;
  let doc2 = 0;
  for (const t of trials) {
    if (t.error !== undefined) {
      errors += 1;
      continue;
    }
    counts[t.citedVariant] += 1;
    if (t.citedVariant === 'A' || t.citedVariant === 'B') {
      if (citedFirstSlot(t.positionOrder, t.citedVariant)) doc1 += 1;
      else doc2 += 1;
    }
  }

  const slots = doc1 + doc2;
  const positionP = binomialTwoSidedP(doc1, slots);
  const position: PositionAnalysis = {
    doc1,
    doc2,
    proportionDoc1: slots === 0 ? NaN : doc1 / slots,
    wilson: wilson(doc1, slots),
    pValue: positionP,
    biased: slots > 0 && positionP < ALPHA,
  };

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
    position,
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
