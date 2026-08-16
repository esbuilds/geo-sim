import Anthropic from '@anthropic-ai/sdk';
import type { PositionOrder, Scenario, Trial } from '../harness/types.js';
import { INSTRUCTIONS, documentBlocks, queryLine } from './framing.js';
import { parseCitation } from './parseCitation.js';
import type { Provider } from './types.js';

// Default when --model is not passed. Overridable per run because citation
// preference is model-specific: the model under test is a study-design choice,
// and cheap models are the right place to validate the harness itself.
export const DEFAULT_MODEL = 'claude-opus-4-8';

export const anthropicProvider: Provider = {
  name: 'anthropic',
  defaultModel: DEFAULT_MODEL,
  async runTrial(
    scenario: Scenario,
    positionOrder: PositionOrder,
    model?: string,
  ): Promise<Trial> {
    const resolvedModel = model ?? DEFAULT_MODEL;
    const client = new Anthropic();
    const message = await client.messages.create({
      model: resolvedModel,
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
      model: resolvedModel,
      positionOrder,
      rawResponse,
      citedVariant: parseCitation(rawResponse, positionOrder),
      timestamp: new Date().toISOString(),
    };
  },
};
