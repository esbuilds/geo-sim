# geo-sim — project conventions & context

Read this file first at the start of every session. Update the Conventions
section below if you make a structural decision, so future sessions inherit it
instead of re-deriving it.

## 1. What this project is

geo-sim is a controlled RAG-injection harness that feeds two content variants
to an LLM as context for the same query and records which one gets cited. It is
used to test which version of a page "wins" when both are already present in a
model's context.

## 2. What this project is NOT

geo-sim is **not** a predictor of whether content will be retrieved by ChatGPT,
Perplexity, or Google AI Overviews in production. It tests **citation
preference given retrieval**, not retrieval itself. Both variants are already
in the model's context by construction; the experiment never touches the
retrieval step that decides what enters that context in the real world.

This distinction must be preserved in every user-facing surface (CLI output,
reports, README). If a later change would blur it, flag it rather than shipping
the change.

## 3. Methodology sources

- Aggarwal et al., "GEO: Generative Engine Optimization," KDD 2024.
  [PLACEHOLDER — paste URL/DOI]
- Vishwakarma et al., "What Gets Cited: Competitive GEO in AI Answer Engines,"
  SIGIR 2026. [PLACEHOLDER — paste URL/DOI]

## 4. Conventions (living — update when you make a structural decision)

**Decisions locked in:**

- Language/runtime: TypeScript on Node, ESM (`"type": "module"`).
- Package manager: pnpm.
- Storage: SQLite via `better-sqlite3`.
- CLI framework: `commander`.
- Testing: `vitest`.
- License: MIT.
- v1 providers: Anthropic, OpenAI, Gemini — chosen because grounding/web-search
  can be fully disabled on all three, leaving pure context injection. Perplexity
  is phase-2 at best (Sonar calls live retrieval by default).

**Folder structure:**

- `src/harness/` — core types + experiment runner
- `src/providers/` — one file per provider, all satisfying a shared `Provider` interface
- `src/stats/` — statistical analysis of trial results
- `src/scenarios/` — scenario generators / loaders
- `src/db/` — SQLite persistence
- `src/cli/` — commander CLI
- `src/report/` — markdown report generation
- `test/` — vitest unit tests
- `examples/scenarios/` — hand-authored example scenarios
- `scripts/` — manual live-API scripts, excluded from the test suite

**How trials get logged:**

- Every trial preserves the full raw response text, not just the parsed verdict.
- Trials are written to SQLite as soon as each one completes, not batched at the
  end of a run, so a crash mid-run doesn't lose finished trials.
- Temperature is never set to 0. Repeated trials exist to capture sampling
  variance; a deterministic model makes repetition meaningless.
- **Citation elicitation is forced choice.** The prompt offers `1`, `2`, and
  `neither`, but not `both`. Preference is only measurable when the model commits
  to one source; offering `both` got it in 6/10 live trials and discarded 60% of
  paid trials as indecisive (2026-08-16). `neither` stays as a real no-signal
  option. `parseCitation` still accepts a `both` tag so older runs stay readable
  and an unprompted `both` isn't silently miscounted.
- This narrows the construct to *relative* preference between two sources. It
  does not measure whether a single document is independently sufficient, and it
  does not touch retrieval (see section 2).
