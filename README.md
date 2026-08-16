# geo-sim

A controlled RAG-injection harness that feeds two content variants to an LLM as
context for the same query and records which one gets cited. It is used to test
which version of a page "wins" when both are already present in a model's
context.

## What this deliberately does not claim to do

geo-sim does **not** predict whether content will be retrieved by ChatGPT,
Perplexity, or Google AI Overviews in production. It tests **citation preference
given retrieval**, not retrieval itself. Both variants are already in the model's
context by construction; the experiment never touches the retrieval step that
decides what enters that context in the real world.

Every result is a statement about which variant a model prefers to cite inside a
sandbox where both are already available. Treat it as content-quality signal, not
as evidence about ranking or retrieval.

**Status:** early WIP.

## Quickstart

Requires Node 22+ and pnpm.

```bash
pnpm install
cp .env.example .env          # then set at least one key
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> .env

# Run the freshness example against one provider, then read the report:
pnpm geo-sim run --scenario examples/scenarios/freshness.json --providers anthropic --trials 5
pnpm geo-sim report --run <run-id-printed-above>

# Write a markdown report next to the run instead of terminal output:
pnpm geo-sim report --run <run-id> --format md
```

Keep `--trials` low (3–5) until a scenario's plumbing is proven — three live
providers times repeated trials adds up fast in API spend.

Other commands:

```bash
pnpm geo-sim list-scenarios     # list bundled example scenarios
```

## Methodology

The design is drawn from two papers:

- Aggarwal et al., "GEO: Generative Engine Optimization," KDD 2024. <!-- TODO: paste URL/DOI -->
- Vishwakarma et al., "What Gets Cited: Competitive GEO in AI Answer Engines," SIGIR 2026. <!-- TODO: paste URL/DOI -->

For each scenario, the harness runs repeated trials per provider and swaps
document order (AB/BA) to counterbalance position bias. Per provider it computes
citation counts, a Wilson score interval on the proportion of decisive trials
favoring variant A, and a two-sided binomial test against a 50/50 null. A simple
per-provider binomial model is used deliberately; a logistic GLMM with nested
random effects (as in Vishwakarma et al.) is a possible v2 upgrade, not built
yet.

## Architecture

```
examples/scenarios/*.json
        │  loadScenario
        ▼
  harness/run  ── runExperiment (repeated trials, AB/BA swap, 429 backoff)
        │
        ├──► providers/{anthropic,openai,google}  (shared framing + parseCitation)
        │                     │
        │                     ▼
        │                   Trial
        │
        ├──► db/ (SQLite)  each Trial persisted as it completes
        │
        ▼
  stats/analyze  ──►  report/markdown  (terminal or .md, disclaimer baked in)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short:

**Add a scenario** — drop a JSON file in `examples/scenarios/` with the shape
`{ id, query, factor, variantA, variantB, notes? }`, where each variant is
`{ id, label, text }`. Keep the two variants within ~5% length and identical
except the one factor under test. It's picked up automatically by
`list-scenarios` and the scenario tests.

**Add a provider** — create `src/providers/<name>.ts` exporting a `Provider`
(`{ name, runTrial }`) that uses the shared `framing` + `parseCitation`, register
it in `src/providers/registry.ts`, add its API-key env var to `PROVIDER_ENV` in
`src/cli/index.ts`, and add a mirrored unit test with a mocked SDK.

## License

MIT — see [LICENSE](./LICENSE).
