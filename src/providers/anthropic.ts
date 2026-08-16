import Anthropic from '@anthropic-ai/sdk';
import type { PositionOrder, Scenario, Trial } from '../harness/types.js';
import { INSTRUCTIONS, documentBlocks, queryLine } from './framing.js';
import { parseCitation } from './parseCitation.js';
import type { Provider } from './types.js';

// ponytail: model is a constant, not config — swap the string when v1 needs it.
const DEFAULT_MODEL = 'claude-opus-4-8';

export const anthropicProvider: Provider = {
  name: 'anthropic',
  async runTrial(
    scenario: Scenario,
    positionOrder: PositionOrder,
  ): Promise<Trial> {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      // No temperature (Opus 4.x rejects it; default sampling is what we want —
      // repeated trials capture the model's own variance). No tools, no web search.
      system: INSTRUCTIONS,
      messages: [
        {
          role: 'user',
          content: `${documentBlocks(scenario, positionOrder)}\n\n${queryLine(scenario)}`,
        },
      ],
    });

    const rawResponse = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return {
      scenarioId: scenario.id,
      provider: 'anthropic',
      positionOrder,
      rawResponse,
      citedVariant: parseCitation(rawResponse, positionOrder),
      timestamp: new Date().toISOString(),
    };
  },
};
