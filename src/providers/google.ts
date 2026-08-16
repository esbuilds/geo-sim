import { GoogleGenAI } from '@google/genai';
import type { PositionOrder, Scenario, Trial } from '../harness/types.js';
import { INSTRUCTIONS, documentBlocks, queryLine } from './framing.js';
import { parseCitation } from './parseCitation.js';
import type { Provider } from './types.js';

export const DEFAULT_MODEL = 'gemini-2.0-flash';

export const googleProvider: Provider = {
  name: 'google',
  defaultModel: DEFAULT_MODEL,
  async runTrial(
    scenario: Scenario,
    positionOrder: PositionOrder,
    model?: string,
  ): Promise<Trial> {
    const resolvedModel = model ?? DEFAULT_MODEL;
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    // Same framing; documents injected via system instruction.
    // No temperature (default is non-zero); no googleSearch grounding tool.
    const response = await ai.models.generateContent({
      model: resolvedModel,
      contents: queryLine(scenario),
      config: {
        systemInstruction: `${INSTRUCTIONS}\n\n${documentBlocks(scenario, positionOrder)}`,
      },
    });

    const rawResponse = response.text ?? '';

    return {
      scenarioId: scenario.id,
      provider: 'google',
      model: resolvedModel,
      positionOrder,
      rawResponse,
      citedVariant: parseCitation(rawResponse, positionOrder),
      timestamp: new Date().toISOString(),
    };
  },
};
