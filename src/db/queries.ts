import type {
  CitedVariant,
  PositionOrder,
  Scenario,
  Trial,
} from '../harness/types.js';
import type { DB } from './db.js';

interface TrialRow {
  provider: string;
  /** NULL for trials written before the model column existed. */
  model: string | null;
  position_order: string;
  raw_response: string;
  cited_variant: string;
  error: string | null;
  created_at: string;
  run_id: string;
}

function rowToTrial(row: TrialRow, scenarioId: string): Trial {
  return {
    scenarioId,
    provider: row.provider,
    model: row.model ?? 'unknown',
    positionOrder: row.position_order as PositionOrder,
    rawResponse: row.raw_response,
    citedVariant: row.cited_variant as CitedVariant,
    timestamp: row.created_at,
    ...(row.error !== null ? { error: row.error } : {}),
  };
}

/** All trials for a run, in completion order, mapped back to Trial objects. */
export function getTrialsForRun(db: DB, runId: string): Trial[] {
  const run = db
    .prepare('SELECT scenario_id FROM runs WHERE id = ?')
    .get(runId) as { scenario_id: string } | undefined;
  if (!run) return [];
  const rows = db
    .prepare('SELECT * FROM trials WHERE run_id = ? ORDER BY created_at')
    .all(runId) as TrialRow[];
  return rows.map((r) => rowToTrial(r, run.scenario_id));
}

interface ScenarioRow {
  id: string;
  query: string;
  factor: string;
  variantA: string;
  variantB: string;
  notes: string | null;
}

/** The scenario a run was executed against, or undefined if the run is unknown. */
export function getScenarioForRun(db: DB, runId: string): Scenario | undefined {
  const row = db
    .prepare(
      `SELECT s.* FROM scenarios s
       JOIN runs r ON r.scenario_id = s.id
       WHERE r.id = ?`,
    )
    .get(runId) as ScenarioRow | undefined;
  if (!row) return undefined;
  return {
    id: row.id,
    query: row.query,
    factor: row.factor,
    variantA: JSON.parse(row.variantA),
    variantB: JSON.parse(row.variantB),
    ...(row.notes !== null ? { notes: row.notes } : {}),
  };
}
