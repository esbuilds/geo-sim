import type { PositionOrder, Scenario, Trial } from '../harness/types.js';

/** Every provider normalizes its SDK to this shape; the harness never sees SDK specifics. */
export interface Provider {
  name: string;
  /** Model used when a run doesn't override it. Also names the model on errored trials. */
  defaultModel: string;
  runTrial(
    scenario: Scenario,
    positionOrder: PositionOrder,
    model?: string,
  ): Promise<Trial>;
}
