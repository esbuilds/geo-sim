import type { Scenario } from '../harness/types.js';
import type { AnalysisResult } from '../stats/analyze.js';

/**
 * Fixed disclaimer — identical on every report. This is the load-bearing sentence
 * of the whole project: geo-sim measures citation preference GIVEN retrieval, not
 * whether content gets retrieved. Do not soften or make it conditional.
 */
export const DISCLAIMER =
  "This result reflects citation preference when both variants are already present in the model's context. It does not predict whether either variant will be retrieved in production by ChatGPT, Perplexity, or Google AI Overviews — see README for why.";

function oneLine(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > 140 ? `${t.slice(0, 137)}...` : t;
}

function pct(x: number): string {
  return Number.isNaN(x) ? 'n/a' : `${(x * 100).toFixed(1)}%`;
}

export function renderMarkdown(
  result: AnalysisResult,
  scenario: Scenario,
  runId?: string,
): string {
  const lines: string[] = [];
  lines.push(`# geo-sim report: ${scenario.id}`);
  if (runId) lines.push(`\n_Run ${runId}_`);
  // Disclaimer at the top so it can't be missed, and again at the bottom.
  lines.push(`\n> **Read this first.** ${DISCLAIMER}`);

  lines.push('\n## Scenario');
  lines.push(`- **Query:** ${scenario.query}`);
  lines.push(`- **Factor tested:** ${scenario.factor}`);
  lines.push(
    `- **Variant A** (${scenario.variantA.label}): ${oneLine(scenario.variantA.text)}`,
  );
  lines.push(
    `- **Variant B** (${scenario.variantB.label}): ${oneLine(scenario.variantB.text)}`,
  );

  lines.push('\n## Results');
  lines.push(
    '| Provider | A | B | both | neither | errors | A win rate | 95% CI | p | Significant | Winner |',
  );
  lines.push(
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  );
  for (const p of result.byProvider) {
    const ci = Number.isNaN(p.wilson.lower)
      ? 'n/a'
      : `[${pct(p.wilson.lower)}, ${pct(p.wilson.upper)}]`;
    lines.push(
      `| ${p.provider} | ${p.counts.A} | ${p.counts.B} | ${p.counts.both} | ${p.counts.neither} | ${p.errors} | ${pct(p.proportionA)} | ${ci} | ${p.pValue.toFixed(3)} | ${p.significant ? 'yes' : 'no'} | ${p.winner ?? '–'} |`,
    );
  }

  lines.push(`\n**Cross-provider agreement:** ${result.crossProvider.note}`);
  lines.push(`\n---\n\n> **Disclaimer.** ${DISCLAIMER}`);
  return `${lines.join('\n')}\n`;
}
