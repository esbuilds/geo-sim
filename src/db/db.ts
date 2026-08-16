import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import type { Scenario, Trial } from '../harness/types.js';

export type DB = Database.Database;

export function openDb(file = 'geo-sim.sqlite'): DB {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  migrate(db);
  return db;
}

function migrate(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      factor TEXT NOT NULL,
      variantA TEXT NOT NULL,
      variantB TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL REFERENCES scenarios(id),
      created_at TEXT NOT NULL,
      providers TEXT NOT NULL,
      trials_per_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trials (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id),
      provider TEXT NOT NULL,
      model TEXT,
      position_order TEXT NOT NULL,
      raw_response TEXT NOT NULL,
      cited_variant TEXT NOT NULL,
      error TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_trials_run ON trials(run_id);
    CREATE INDEX IF NOT EXISTS idx_runs_scenario ON runs(scenario_id);
  `);
  addTrialsModelColumn(db);
}

/** Adds trials.model to databases created before the column existed. Rows written
 * then stay NULL — their model is genuinely unknown, so reports say so rather
 * than backfilling a guess. */
function addTrialsModelColumn(db: DB): void {
  const columns = db.prepare('PRAGMA table_info(trials)').all() as {
    name: string;
  }[];
  if (!columns.some((c) => c.name === 'model')) {
    db.exec('ALTER TABLE trials ADD COLUMN model TEXT');
  }
}

/** Insert or update a scenario by its id. Variants are stored as JSON. */
export function upsertScenario(db: DB, s: Scenario): void {
  db.prepare(
    `INSERT INTO scenarios (id, query, factor, variantA, variantB, notes, created_at)
     VALUES (@id, @query, @factor, @variantA, @variantB, @notes, @created_at)
     ON CONFLICT(id) DO UPDATE SET
       query = excluded.query, factor = excluded.factor,
       variantA = excluded.variantA, variantB = excluded.variantB,
       notes = excluded.notes`,
  ).run({
    id: s.id,
    query: s.query,
    factor: s.factor,
    variantA: JSON.stringify(s.variantA),
    variantB: JSON.stringify(s.variantB),
    notes: s.notes ?? null,
    created_at: new Date().toISOString(),
  });
}

/** Creates a run row and returns its id. */
export function createRun(
  db: DB,
  scenarioId: string,
  providers: string[],
  trialsPerOrder: number,
): string {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO runs (id, scenario_id, created_at, providers, trials_per_order)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    id,
    scenarioId,
    new Date().toISOString(),
    JSON.stringify(providers),
    trialsPerOrder,
  );
  return id;
}

/** Persists a single trial. Called per-trial so a crash mid-run keeps finished trials. */
export function insertTrial(db: DB, runId: string, trial: Trial): void {
  db.prepare(
    `INSERT INTO trials
       (id, run_id, provider, model, position_order, raw_response, cited_variant, error, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    runId,
    trial.provider,
    trial.model,
    trial.positionOrder,
    trial.rawResponse,
    trial.citedVariant,
    trial.error ?? null,
    trial.timestamp,
  );
}
