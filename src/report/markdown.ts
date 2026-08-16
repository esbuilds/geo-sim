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

  lines.push('\n## Position check');
  lines.push(
    'Which document *slot* got cited, ignoring which variant sat there. The variant table above cannot show this: the AB/BA swap cancels position bias exactly, so a model that always cites document 1 and a model with no position preference both produce A ≈ B.',
  );
  lines.push(
    '\n| Provider | doc 1 | doc 2 | cited first | 95% CI | p | Position bias |',
  );
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const p of result.byProvider) {
    const pos = p.position;
    const ci = Number.isNaN(pos.wilson.lower)
      ? 'n/a'
      : `[${pct(pos.wilson.lower)}, ${pct(pos.wilson.upper)}]`;
    lines.push(
      `| ${p.provider} | ${pos.doc1} | ${pos.doc2} | ${pct(pos.proportionDoc1)} | ${ci} | ${pos.pValue.toFixed(3)} | ${pos.biased ? '**yes**' : 'no'} |`,
    );
  }
  if (result.byProvider.some((p) => p.position.biased)) {
    lines.push(
      '\n> **Position bias detected.** At least one provider cited by slot rather than by content. On an equal-content control scenario that is the intended finding. On a real scenario, treat the variant result as entangled with position: check that the winning variant wins under *both* AB and BA before reading it as a content effect.',
    );
  }

  lines.push(`\n**Cross-provider agreement:** ${result.crossProvider.note}`);
  lines.push(`\n---\n\n> **Disclaimer.** ${DISCLAIMER}`);
  return `${lines.join('\n')}\n`;
}
