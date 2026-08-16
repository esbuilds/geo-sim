#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { createRun, insertTrial, openDb, upsertScenario } from '../db/db.js';
import { getScenarioForRun, getTrialsForRun } from '../db/queries.js';
import { runExperiment } from '../harness/run.js';
import { renderMarkdown } from '../report/markdown.js';
import { loadExampleScenarios, loadScenario } from '../scenarios/load.js';
import { analyze, type AnalysisResult } from '../stats/analyze.js';

/** Provider key -> required env var. Also the set of known providers. */
export const PROVIDER_ENV: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_API_KEY',
};

/** Validates provider names are known and their API keys are present, or throws a clear error. */
export function resolveProviders(
  names: string[],
  env: NodeJS.ProcessEnv,
): string[] {
  for (const name of names) {
    const key = PROVIDER_ENV[name];
    if (!key) {
      throw new Error(
        `Unknown provider "${name}". Known providers: ${Object.keys(PROVIDER_ENV).join(', ')}`,
      );
    }
    if (!env[key]) {
      throw new Error(
        `Missing ${key} (required for provider "${name}"). Set it in .env or the environment.`,
      );
    }
  }
  return names;
}

function parseProviders(csv: string): string[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function printAnalysis(result: AnalysisResult): void {
  for (const p of result.byProvider) {
    const { A, B, both, neither } = p.counts;
    const pct = Number.isNaN(p.proportionA)
      ? 'n/a'
      : `${(p.proportionA * 100).toFixed(1)}%`;
    const ci = Number.isNaN(p.wilson.lower)
      ? 'n/a'
      : `[${(p.wilson.lower * 100).toFixed(1)}, ${(p.wilson.upper * 100).toFixed(1)}]`;
    console.log(
      `${p.provider}: A=${A} B=${B} both=${both} neither=${neither} errors=${p.errors} | ` +
        `A favored ${pct} 95%CI ${ci} p=${p.pValue.toFixed(3)} ` +
        `${p.significant ? 'SIGNIFICANT' : 'ns'} winner=${p.winner ?? '-'}`,
    );
  }
  console.log(`\nCross-provider: ${result.crossProvider.note}`);
}

export function buildProgram(): Command {
  const program = new Command();
  program
    .name('geo-sim')
    .description('RAG-injection citation-preference harness');

  program
    .command('run')
    .requiredOption('--scenario <path>', 'path to a scenario JSON file')
    .requiredOption(
      '--providers <list>',
      'comma-separated: anthropic,openai,google',
    )
    .option('--trials <n>', 'trials per position order', '5')
    .action(
      async (opts: { scenario: string; providers: string; trials: string }) => {
        const providers = resolveProviders(
          parseProviders(opts.providers),
          process.env,
        );
        const trialsPerOrder = Number.parseInt(opts.trials, 10);
        const scenario = loadScenario(opts.scenario);

        const db = openDb();
        upsertScenario(db, scenario);
        const runId = createRun(db, scenario.id, providers, trialsPerOrder);
        console.log(`run ${runId} — ${scenario.id} (${providers.join(', ')})`);

        const trials = await runExperiment(scenario, {
          providers,
          trialsPerOrder,
          onTrial: (t) => insertTrial(db, runId, t),
        });
        db.close();

        printAnalysis(analyze(trials));
        console.log(`\nrun id: ${runId}`);
      },
    );

  program
    .command('report')
    .requiredOption('--run <run-id>', 'run id to report on')
    .option('--format <fmt>', 'terminal | md', 'terminal')
    .action((opts: { run: string; format: string }) => {
      const db = openDb();
      const trials = getTrialsForRun(db, opts.run);
      const scenario = getScenarioForRun(db, opts.run);
      db.close();
      if (trials.length === 0 || !scenario) {
        console.error(`No trials found for run ${opts.run}.`);
        process.exitCode = 1;
        return;
      }
      const result = analyze(trials);
      if (opts.format === 'md') {
        const file = `geo-sim-report-${opts.run}.md`;
        writeFileSync(file, renderMarkdown(result, scenario, opts.run));
        console.log(`wrote ${file}`);
      } else {
        printAnalysis(result);
      }
    });

  program.command('list-scenarios').action(() => {
    for (const s of loadExampleScenarios()) {
      console.log(`${s.id}\t[${s.factor}]\t${s.query}`);
    }
  });

  return program;
}

async function main(): Promise<void> {
  try {
    process.loadEnvFile('.env');
  } catch {
    // No .env file — rely on ambient environment.
  }
  await buildProgram().parseAsync(process.argv);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  });
}
