// Public library API. The CLI (src/cli) is a separate entrypoint (the geo-sim bin).
export type {
  CitedVariant,
  ContentVariant,
  PositionOrder,
  Scenario,
  Trial,
} from './harness/types.js';
export { runExperiment, type RunOptions } from './harness/run.js';
export {
  analyze,
  type AnalysisResult,
  type ProviderAnalysis,
} from './stats/analyze.js';
export { providers } from './providers/registry.js';
export type { Provider } from './providers/types.js';
export { DISCLAIMER, renderMarkdown } from './report/markdown.js';
export { loadExampleScenarios, loadScenario } from './scenarios/load.js';
