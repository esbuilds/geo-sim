// Core types for the geo-sim RAG-injection harness.
// A Scenario feeds two content variants to a model as context for one query;
// a Trial records which variant the model cited on a single run.

export interface ContentVariant {
  id: string;
  label: string;
  text: string;
}

export interface Scenario {
  id: string;
  query: string;
  variantA: ContentVariant;
  variantB: ContentVariant;
  /** The gatekeeper factor under test, e.g. "freshness" | "price" | "relevance" | "position". */
  factor: string;
  notes?: string;
}

/** Which variant is injected as document 1 vs document 2. Counterbalances position bias. */
export type PositionOrder = 'AB' | 'BA';

export type CitedVariant = 'A' | 'B' | 'both' | 'neither';

export interface Trial {
  scenarioId: string;
  provider: string;
  /**
   * The exact model id that produced this trial. Recorded per-trial, not
   * per-run: citation preference and position bias are properties of a
   * specific model, so trials from different models are not poolable and a
   * run without this is uninterpretable once --model is in use.
   */
  model: string;
  positionOrder: PositionOrder;
  /** Full raw response text, preserved for later validation studies. */
  rawResponse: string;
  citedVariant: CitedVariant;
  /** ISO 8601. */
  timestamp: string;
  /**
   * Set only when the trial failed after retries (e.g. persistent 429). The
   * trial is still returned so a run isn't lost; downstream analysis should
   * skip trials where this is present rather than count citedVariant.
   */
  error?: string;
}
