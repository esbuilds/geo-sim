import type { PositionOrder, Scenario } from '../harness/types.js';

// Shared prompt framing so all three providers pose the identical task; only the
// transport (which SDK, which field) differs per provider.

// Forced choice: the prompt does not offer a "both" option. Preference is only
// measurable when the model commits to one source, and offering "both" produced
// it in 6/10 live trials (run dadaf26e, 2026-08-16), discarding 60% of paid
// trials as indecisive. `neither` is kept as a genuine no-signal escape hatch.
// parseCitation still accepts a `both` tag if a model emits one unprompted.
export const INSTRUCTIONS = `You answer a question using ONLY the two documents provided. Do not use outside knowledge.

After your answer, on a final line, output exactly one citation tag naming the single document you relied on MOST. You must choose one, even if both were useful:
<cited>1</cited>   if document 1 was your main source
<cited>2</cited>   if document 2 was your main source
<cited>neither</cited>   only if neither document was useful at all

Output exactly one tag. Do not explain the tag.`;

/** The two variants as ordered <document> blocks. Order counterbalances position bias. */
export function documentBlocks(
  scenario: Scenario,
  order: PositionOrder,
): string {
  const [first, second] =
    order === 'AB'
      ? [scenario.variantA, scenario.variantB]
      : [scenario.variantB, scenario.variantA];
  return [
    `<document index="1">\n${first.text}\n</document>`,
    `<document index="2">\n${second.text}\n</document>`,
  ].join('\n\n');
}

export function queryLine(scenario: Scenario): string {
  return `Question: ${scenario.query}`;
}
