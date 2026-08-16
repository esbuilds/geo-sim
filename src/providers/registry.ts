import { anthropicProvider } from './anthropic.js';
import { googleProvider } from './google.js';
import { openaiProvider } from './openai.js';
import type { Provider } from './types.js';

export const providers: Record<string, Provider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  google: googleProvider,
};
