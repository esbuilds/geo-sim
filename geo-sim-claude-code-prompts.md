# geo-sim — Claude Code Build Sequence

A controlled RAG-injection harness that feeds two content variants to an LLM as context for the same query and records which one gets cited. Tests citation preference *given retrieval* — not whether either variant gets retrieved in the first place. That distinction should survive every phase below; it's the thing most likely to get flattened into an overclaim once this is public.

## How to use this

Run these roughly in order — each phase leaves the repo in a working state the next one builds on, so don't skip ahead if the "Done when" isn't actually true yet. Some phases pair naturally into one sitting (2+3, 8+9); treat the phase breaks as save points, not mandatory session boundaries. If you open a fresh Claude Code session partway through, point it at `CLAUDE.md` first so it inherits conventions instead of re-deriving them.

Keep `--trials` low (3–5) until a phase's plumbing is proven. Three live providers × repeated trials adds up fast in API spend if you're scaling trial counts before the harness is actually correct.

## Decisions locked in below

So Claude Code doesn't relitigate these every session, or drift toward different answers in different sessions:

- **Name:** `geo-sim` — placeholder, rename freely once you've settled whether this lives under Crawlspace Labs branding
- **Language/runtime:** TypeScript on Node
- **Package manager:** pnpm
- **v1 providers:** Anthropic, OpenAI, Gemini — chosen because grounding/web-search can be fully disabled on all three, leaving pure context injection. Perplexity's Sonar models call live retrieval by default and Perplexity's actual production pipeline isn't accessible via API at all, so it's a deliberate phase-2 addition at best, not v1 scope.
- **Storage:** SQLite via `better-sqlite3`
- **CLI framework:** `commander`
- **Testing:** `vitest`
- **License:** MIT

## Sequence at a glance

**Core (do these in order):**
1. Repo scaffold + `CLAUDE.md`
2. Core types + first working provider call (Anthropic)
3. Provider abstraction — add OpenAI + Gemini
4. Harness runner — repeated trials + position counterbalancing
5. Statistics layer
6. Scenario generators for the four gatekeeper factors
7. SQLite persistence
8. CLI
9. Markdown report with the disclaimer baked in
10. README + OSS hygiene

**Stretch (only once the above feels solid):**
11. Publish to npm
12. Web dashboard

---

## Prompt 1 — Repo scaffold + CLAUDE.md

*Why:* Gets the skeleton and the persistent-memory file in place before any real logic exists, so every later session — especially ones that start fresh — inherits the same context instead of guessing.

```
Set up a new TypeScript/Node project called geo-sim (placeholder name, fine to keep for now). Use pnpm, strict TypeScript, eslint + prettier, and vitest for testing. Add an MIT license and a sensible .gitignore.

Create this folder structure:
- src/harness/
- src/providers/
- src/stats/
- src/scenarios/
- src/db/
- src/cli/
- src/report/
- test/
- examples/scenarios/

Create a CLAUDE.md at the repo root documenting:
1. What this project is, in one paragraph: a controlled RAG-injection harness that feeds two content variants to an LLM as context for the same query and records which one gets cited — used to test which version of a page "wins" when both are already present in a model's context.
2. What this project explicitly is NOT: a predictor of whether content will be retrieved by ChatGPT, Perplexity, or Google AI Overviews in production. It tests citation preference given retrieval, not retrieval itself. This distinction should be preserved in every user-facing surface later (CLI output, reports, README) — flag it if a later change would blur it.
3. The two papers this methodology is drawn from — Aggarwal et al., "GEO: Generative Engine Optimization," KDD 2024, and Vishwakarma et al., "What Gets Cited: Competitive GEO in AI Answer Engines," SIGIR 2026 — with a placeholder note that I'll paste the actual URLs/DOIs in.
4. A living "conventions" section (naming, folder structure, how trials get logged) that future sessions should read first and update if they make a structural decision.

Create a placeholder README with the same one-paragraph description, the explicit non-goal statement, a "status: early WIP" line, and an empty TODO/roadmap list.

Create .env.example with OPENAI_API_KEY, ANTHROPIC_API_KEY, and GOOGLE_API_KEY as empty placeholders, and confirm .env itself is gitignored.
```

**Done when:** `pnpm install && pnpm test` runs clean (empty test suite is fine), `pnpm lint` passes, and `CLAUDE.md` + `README.md` exist with the content above.

---

## Prompt 2 — Core types + first working provider (Anthropic)

*Why:* Get one real, live-API-tested path working end to end before generalizing to three providers. Easier to debug one integration than three at once.

```
Define the core types in src/harness/types.ts:
- ContentVariant: { id: string, label: string, text: string }
- Scenario: { id: string, query: string, variantA: ContentVariant, variantB: ContentVariant, factor: string, notes?: string }
- Trial: { scenarioId: string, provider: string, positionOrder: 'AB' | 'BA', rawResponse: string, citedVariant: 'A' | 'B' | 'both' | 'neither', timestamp: string }

Implement src/providers/anthropic.ts with a function runTrial(scenario, positionOrder) that:
- Calls the Claude Messages API
- Injects both variants as separate <document> blocks, ordered according to positionOrder
- Instructs the model, in the system prompt, to answer the query using only the provided documents and to end its answer with a citation tag — <cited>1</cited>, <cited>2</cited>, <cited>both</cited>, or <cited>neither</cited>
- Does NOT enable web search or any tool use — context injection only
- Uses the provider's default non-zero temperature. Do not set temperature to 0 — the whole point of running repeated trials later is to capture the model's actual sampling variance, and a deterministic model would make repetition meaningless.
- Parses the <cited> tag and maps it back to variant A/B/both/neither
- Returns a Trial with the full raw response text preserved, not just the parsed verdict

Write a unit test that mocks the API response and checks the parsing logic against all four citation outcomes, plus a malformed/missing-tag case that should fail gracefully rather than throw.

Write a small manual script (scripts/manual-test-anthropic.ts, excluded from the test suite) that runs one real trial against the live API with two short dummy documents, so I can sanity-check it against my own key.
```

**Done when:** unit tests pass, and the manual script run against my real API key returns a parsed `Trial` with a sensible `citedVariant`.

---

## Prompt 3 — Provider abstraction: add OpenAI + Gemini

*Why:* Same interface across all three providers means the harness, stats, and CLI never need to know which model they're talking to.

```
Extract a shared interface in src/providers/types.ts:
  Provider = { name: string, runTrial(scenario: Scenario, positionOrder: 'AB' | 'BA'): Promise<Trial> }
Refactor the Anthropic implementation from the last step to satisfy this interface without changing its behavior.

Implement src/providers/openai.ts against the same interface:
- Chat Completions (or Responses) API
- Same <document> + <cited> tag framing, injected into the system message
- Do NOT include the web_search tool
- Same non-zero temperature rule

Implement src/providers/google.ts against the same interface using the Gemini API:
- Same framing, injected via system instruction
- Do NOT configure the googleSearch grounding tool
- Same non-zero temperature rule

Extract the shared <cited> tag parsing logic into src/providers/parseCitation.ts so all three providers call one implementation instead of three copies.

Add src/providers/registry.ts exporting a Record<string, Provider> keyed by 'anthropic' | 'openai' | 'google'.

Write unit tests for the OpenAI and Google implementations mirroring the Anthropic ones — same four outcome cases, mocked responses.
```

**Done when:** the same `Scenario` object runs through all three providers via the shared interface, each returns a normalized `Trial`, and all unit tests pass.

---

## Prompt 4 — Harness runner: repeated trials + position counterbalancing

*Why:* This is the actual experiment. Single trials tell you nothing — you need repetition to see the model's real variance, and order-swapping to make sure you're not just measuring "the model prefers whichever document comes first."

```
Build src/harness/run.ts with:
  runExperiment(scenario: Scenario, options: { providers: string[], trialsPerOrder: number }): Promise<Trial[]>

For each requested provider, it should:
- Run trialsPerOrder trials with positionOrder 'AB' and trialsPerOrder trials with positionOrder 'BA'
- Cap concurrency per provider (something like 3–5 in-flight requests, not everything at once)
- Retry on 429 rate-limit errors with exponential backoff, give up after a few attempts and record the failure rather than crashing the whole run
- Log progress to the console as trials complete (e.g. "anthropic AB 4/10")
- Return the full array of Trial results once done

For now, only actually run this against whichever provider I have a key configured for — don't assume all three are ready.
```

**Done when:** `runExperiment(scenario, { providers: ['anthropic'], trialsPerOrder: 5 })` against a real scenario produces 10 trial records without crashing, with visible progress in the console.

---

## Prompt 5 — Statistics layer

*Why:* Raw trial counts don't tell you if a result is real or noise. This is the layer that turns "B won 7 of 10 times" into something you can actually stand behind.

```
Build src/stats/analyze.ts with:
  analyze(trials: Trial[]): AnalysisResult

Grouped by provider, it should:
- Count citations for A, B, both, and neither
- Compute a Wilson score confidence interval on the proportion of decisive trials (A or B only, excluding both/neither) favoring variant A vs B
- Flag statistical significance at alpha = 0.05 using a two-sided binomial test against a 50/50 null
- Produce a cross-provider summary: how many of the tested providers agreed on the same winning variant, and call out any disagreement explicitly

Leave a clearly marked comment noting that Vishwakarma et al. used a full logistic GLMM with nested random effects across scenario/query/model — a reasonable v2 upgrade if the simple binomial approach isn't precise enough, but don't build that now.

Write unit tests with synthetic trial arrays covering: unanimous strong preference, no significant difference (near 50/50), and a case where providers disagree with each other.
```

**Done when:** tests pass, and running `analyze()` on real output from Prompt 4 produces a readable `AnalysisResult` you can sanity-check by eye.

---

## Prompt 6 — Scenario generators for the four gatekeeper factors

*Why:* Vishwakarma et al. found four factors with strong, unanimous effects across all six models tested — topic relevance, price/spec presence, timestamp freshness, and source position. Those are the highest-confidence place to start; the "differentiator" tier (hedged language, comparisons, evidence) was noisier and model-dependent, so it's worth building on top of a working foundation rather than leading with it.

```
Build example scenarios in examples/scenarios/ for three of the four gatekeeper factors — topic relevance/mismatch, price-or-spec presence vs. absence, and timestamp freshness (recent vs. stale). The fourth factor, position, is already handled by the harness's AB/BA swap — for that one, just write a scenario where position is the only thing that could plausibly matter, as a sanity check that the harness itself isn't introducing its own bias.

For each scenario:
- Both variants answer the same query
- Content length held within about 5% of each other
- All facts identical except the one factor under test
- The factor difference should be unambiguous — e.g. for freshness, one variant says "Updated March 2026," the other "Updated 2019," everything else word-for-word the same

Hand-author these rather than generating them programmatically — more trustworthy for v1. Leave a comment noting that an LLM-assisted generateVariantPair() helper, mirroring Vishwakarma's GPT-4o anonymization/generation step, is a reasonable future addition once the manual scenarios prove the harness works.
```

**Done when:** three example scenarios exist, one per factor, and each runs end to end through `runExperiment()` and `analyze()`.

---

## Prompt 7 — SQLite persistence

*Why:* Every trial's raw response is the raw material for a future validation study (does sandbox citation preference actually predict real-world citation shift?) — that data is worthless if it isn't saved in full.

```
Add a persistence layer in src/db/ using better-sqlite3.

Schema:
- scenarios: id, query, factor, variantA (json), variantB (json), notes, created_at
- runs: id, scenario_id, created_at, providers (json), trials_per_order
- trials: id, run_id, provider, position_order, raw_response (full text), cited_variant, created_at

Wire src/harness/run.ts to write each trial to the trials table as soon as it completes, not just at the end of the whole run — if the process crashes partway through, trials that already finished shouldn't be lost. Store the full raw_response text, not just the parsed verdict.

Add src/db/queries.ts with helpers to fetch all trials for a run, and all runs for a scenario.
```

**Done when:** after running an experiment, opening the `.sqlite` file directly (DB Browser for SQLite or similar) shows every individual trial row with the raw response intact.

---

## Prompt 8 — CLI

*Why:* Turns the library into something usable without writing a script every time — and the thing you'll actually want other people to try if this goes public.

```
Build a CLI in src/cli/index.ts using commander, exposed as a geo-sim bin in package.json.

Commands:
- geo-sim run --scenario <path> --providers anthropic,openai,google --trials <n> — loads a scenario file, runs the experiment, persists to SQLite, prints a short summary and the run id
- geo-sim report --run <run-id> — loads a run's trials from SQLite and prints the analyze() output to the terminal
- geo-sim list-scenarios — lists example scenarios found in examples/scenarios/

Load API keys from .env. If a requested provider's key is missing, fail with a clear message naming exactly which env var is missing, not a raw API error.
```

**Done when:** from a clean checkout with only `ANTHROPIC_API_KEY` set, `pnpm geo-sim run --scenario examples/scenarios/freshness.json --providers anthropic --trials 5` works end to end, and `geo-sim report --run <id>` shows a sensible summary.

---

## Prompt 9 — Markdown report with the disclaimer baked in

*Why:* This is where the "content quality given retrieval, not a retrieval predictor" framing either survives or gets lost. It needs to live in the artifact itself, not just the README.

```
Build src/report/markdown.ts: a function that takes an AnalysisResult plus scenario metadata and produces a markdown report string with:
- Scenario description (query, factor tested, one-line description of each variant)
- A results table: per-provider win rate for A vs B, confidence interval, significance flag
- A cross-provider agreement line (e.g. "3/3 models preferred variant B")
- A fixed disclaimer block, unchanged run to run: "This result reflects citation preference when both variants are already present in the model's context. It does not predict whether either variant will be retrieved in production by ChatGPT, Perplexity, or Google AI Overviews — see README for why."

Wire this into geo-sim report --format md (default stays the terminal output from Prompt 8; md writes a .md file next to the run).
```

**Done when:** a generated report reads clearly to someone who's never seen the codebase, and the disclaimer isn't buried — it should be genuinely hard to miss.

---

## Prompt 10 — README + OSS hygiene

*Why:* The difference between a repo you built for yourself and one someone else can actually pick up.

```
Replace the placeholder README with the real one. Include:
- What this is and what it deliberately does not claim to do (pull the non-goal language from CLAUDE.md)
- Quickstart: install, set one API key, run the example freshness scenario, see a report
- Methodology section citing Aggarwal et al. (KDD 2024) and Vishwakarma et al. (SIGIR 2026) by name with links [I'll paste the actual URLs/DOIs here]
- A short architecture overview — an ASCII diagram of scenario → harness → providers → stats → report is enough
- Contribution guide: how to add a new scenario, how to add a new provider
- MIT license section

Add a GitHub Actions workflow running lint + unit tests on every PR. Don't run the live-API manual scripts in CI — they need real keys and shouldn't be part of the automated suite.

Add CONTRIBUTING.md and two issue templates: bug report, propose a new scenario.
```

**Done when:** someone cloning the repo fresh could get from `git clone` to their first report in under five minutes using only the README, and opening a PR triggers the CI workflow.

---

## Prompt 11 — Publish to npm *(stretch)*

```
Prepare package.json for publishing: files field limited to dist/ and examples/, a bin entry pointing at the built CLI, and an exports map so the harness and stats pieces are importable separately from the CLI. Set up a build step (tsup or tsc) producing dist/. Run npm publish --dry-run and show me the file list before we publish for real.
```

## Prompt 12 — Web dashboard *(stretch — don't start until the CLI feels trustworthy)*

```
Scaffold a separate Next.js app (own folder or separate repo, your call) that reads from the SQLite file — or a hosted Postgres/Supabase if this needs to be multi-user — and shows historical runs: a list view, drill-in to a run's per-provider results, and a simple trend view once a scenario has more than one run. Keep the visual style as plain as Schema Watch rather than over-designing it.
```

---

## One more time, because it's worth repeating

The result of any of this is a statement about citation preference *inside a sandbox where both variants are already in the model's context*. It is not evidence about whether either variant gets retrieved by a real search or answer engine. Every prompt above tries to keep that line intact in the code and the docs — worth checking it hasn't quietly disappeared by the time Prompt 10 ships.
