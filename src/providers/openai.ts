import OpenAI from 'openai';
import type { PositionOrder, Scenario, Trial } from '../harness/types.js';
import { INSTRUCTIONS, documentBlocks, queryLine } from './framing.js';
import { parseCitation } from './parseCitation.js';
import type { Provider } from './types.js';

const DEFAULT_MODEL = 'gpt-4o';

export const openaiProvider: Provider = {
  name: 'openai',
  async runTrial(
    scenario: Scenario,
    positionOrder: PositionOrder,
  ): Promise<Trial> {
    const client = new OpenAI();
    // Same framing as Anthropic; documents injected into the system message.
    // No temperature (default is non-zero); no web_search tool.
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `${INSTRUCTIONS}\n\n${documentBlocks(scenario, positionOrder)}`,
        },
        { role: 'user', content: queryLine(scenario) },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content ?? '';

    return {
      scenarioId: scenario.id,
      provider: 'openai',
      positionOrder,
      rawResponse,
      citedVariant: parseCitation(rawResponse, positionOrder),
      timestamp: new Date().toISOString(),
    };
  },
};
