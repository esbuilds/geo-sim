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

## Results so far

Two scenarios have been run at volume. Raw trials are in `geo-sim.sqlite`.

**1. Concrete detail beat generic benefit copy, 120 trials to 0.**
`examples/scenarios/specificity.json`, claude-opus-4-8, query: _"I'm looking for
skin tightening at a med spa in Irvine. What does this clinic offer and what
should I expect?"_ Two ~120-word descriptions of the same fictional clinic and
the same services. One is the generic benefit copy that real med spa pages in
the area actually publish ("advanced technology," "personalized treatment
plans"). The other names the devices (Sofwave, Morpheus8, Thermage FLX), the
nurse practitioner, session counts, and prices. The specific variant was cited
in 120 of 120 trials, 60 in each presentation order. Unanimous and
order-invariant.

**2. One model cited whatever came first, in a scenario where nothing should
have won.** `examples/scenarios/position.json` is a null control: two equally
correct, equal-length paraphrases of "the capital of Australia is Canberra."
There is no content effect available to find. claude-sonnet-5 cited the
first-listed document in 59 of 60 trials. claude-opus-4-8 did not do this; it
preferred one phrasing 30 of 40 times regardless of where it sat.

The second result is the reason the first one is worth anything. Any citation
test that does not counterbalance document order can produce a confident,
reproducible, entirely fake finding on at least one current frontier model. The
harness swaps AB/BA by construction for this reason.

### What these results do not establish

Single model family, two scenarios, one fictional business. The specificity
result is a statement about citation preference given retrieval, not about
whether a page gets retrieved in the first place, and not a general law of AI
search. It is a reason to test your own copy, not a checklist item to ship.

**Status:** early WIP. The scenarios above are run; freshness, price, and
relevance are scaffolded but under-sampled.

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
