import path from 'node:path';
import Database from 'better-sqlite3';

// Reads the harness's SQLite file read-only. Defaults to ../geo-sim.sqlite
// (repo root); override with GEO_SIM_DB.
const DB_PATH =
  process.env.GEO_SIM_DB ?? path.resolve(process.cwd(), '..', 'geo-sim.sqlite');

function open(): Database.Database | null {
  try {
    return new Database(DB_PATH, { readonly: true, fileMustExist: true });
  } catch {
    return null; // no runs yet
  }
}

export interface RunSummary {
  id: string;
  scenarioId: string;
  factor: string;
  query: string;
  createdAt: string;
  providers: string[];
  trialCount: number;
}

export interface TrialRow {
  provider: string;
  cited_variant: string;
  error: string | null;
}

export interface ScenarioMeta {
  id: string;
  query: string;
  factor: string;
}

export function listRuns(): RunSummary[] {
  const db = open();
  if (!db) return [];
  const rows = db
    .prepare(
      `SELECT r.id, r.scenario_id, r.created_at, r.providers, s.factor, s.query,
              (SELECT COUNT(*) FROM trials t WHERE t.run_id = r.id) AS trial_count
       FROM runs r JOIN scenarios s ON s.id = r.scenario_id
       ORDER BY r.created_at DESC`,
    )
    .all() as Array<{
    id: string;
    scenario_id: string;
    created_at: string;
    providers: string;
    factor: string;
    query: string;
    trial_count: number;
  }>;
  db.close();
  return rows.map((r) => ({
    id: r.id,
    scenarioId: r.scenario_id,
    factor: r.factor,
    query: r.query,
    createdAt: r.created_at,
    providers: JSON.parse(r.providers),
    trialCount: r.trial_count,
  }));
}

export function getRun(
  runId: string,
): { scenario: ScenarioMeta; trials: TrialRow[] } | null {
  const db = open();
  if (!db) return null;
  const scenario = db
    .prepare(
      `SELECT s.id, s.query, s.factor FROM scenarios s
       JOIN runs r ON r.scenario_id = s.id WHERE r.id = ?`,
    )
    .get(runId) as ScenarioMeta | undefined;
  if (!scenario) {
    db.close();
    return null;
  }
  const trials = db
    .prepare(
      `SELECT provider, cited_variant, error FROM trials WHERE run_id = ?`,
    )
    .all(runId) as TrialRow[];
  db.close();
  return { scenario, trials };
}

export interface ScenarioRun {
  id: string;
  createdAt: string;
  trials: TrialRow[];
}

export function getScenario(
  scenarioId: string,
): { scenario: ScenarioMeta; runs: ScenarioRun[] } | null {
  const db = open();
  if (!db) return null;
  const scenario = db
    .prepare(`SELECT id, query, factor FROM scenarios WHERE id = ?`)
    .get(scenarioId) as ScenarioMeta | undefined;
  if (!scenario) {
    db.close();
    return null;
  }
  const runRows = db
    .prepare(
      `SELECT id, created_at FROM runs WHERE scenario_id = ? ORDER BY created_at ASC`,
    )
    .all(scenarioId) as Array<{ id: string; created_at: string }>;
  const runs: ScenarioRun[] = runRows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    trials: db
      .prepare(`SELECT provider, cited_variant, error FROM trials WHERE run_id = ?`)
      .all(r.id) as TrialRow[],
  }));
  db.close();
  return { scenario, runs };
}
