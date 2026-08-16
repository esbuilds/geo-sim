import type { PositionOrder, Scenario } from '../harness/types.js';

// Shared prompt framing so all three providers pose the identical task; only the
// transport (which SDK, which field) differs per provider.

export const INSTRUCTIONS = `You answer a question using ONLY the two documents provided. Do not use outside knowledge.

After your answer, on a final line, output exactly one citation tag naming which document you primarily relied on:
<cited>1</cited>   if document 1 was your main source
<cited>2</cited>   if document 2 was your main source
<cited>both</cited>   if you relied on both roughly equally
<cited>neither</cited>   if neither document was useful

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
