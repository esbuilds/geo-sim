# Live API testing checklist

Everything except the actual LLM API calls is already verified (43 automated tests,
plus the real CLI + SQLite report pipeline). The only thing left is confirming the
three providers' live `runTrial` HTTP round-trips. Do this when you have keys.

**Anthropic: verified 2026-08-16.** Steps 1 and 2 pass end to end (run
`1fc821d5`, `A=10 B=0 both=0 neither=0 errors=0`, p=0.002, `winner=A`, A favored
under both AB and BA order). OpenAI and Google round-trips are still unconfirmed.

An earlier run of step 2 that same day (`dadaf26e`) returned `both` on 6 of 10
trials and therefore `ns`. That was the prompt offering a `both` option, not a
statistics bug; the instructions are now forced choice. If a scenario ever comes
back mostly `both` again, look at the framing before buying more trials.

## Setup

```bash
cd ~/Desktop/geo-sim
cp .env.example .env         # if not already present
# Edit .env and set at least ANTHROPIC_API_KEY:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=...        (only if testing openai)
#   GOOGLE_API_KEY=...        (only if testing google)
```

## 1. Smoke-test one provider directly

Fastest sanity check — one real Anthropic trial with dummy documents:

```bash
pnpm manual:anthropic
```

Expect a JSON `Trial` with a sensible `citedVariant` (should be `"A"` — the
"Updated March 2026" variant beats the "2019" one).

## 2. Full run + report (Anthropic only)

```bash
pnpm geo-sim run --scenario examples/scenarios/freshness.json --providers anthropic --trials 5
```

Expect:

- progress lines (`anthropic AB 1/10` ... `anthropic BA 10/10`)
- a per-provider summary and a printed **run id**
- likely `winner=A` and `SIGNIFICANT` on the freshness scenario

Then report on it:

```bash
pnpm geo-sim report --run <run-id-from-above>
pnpm geo-sim report --run <run-id> --format md   # writes geo-sim-report-<id>.md
```

Inspect the SQLite file directly if you want (every raw response is stored):

```bash
# DB Browser for SQLite, or:
sqlite3 geo-sim.sqlite "SELECT provider, cited_variant, substr(raw_response,1,60) FROM trials;"
```

## 3. All three providers (optional, costs more)

Only if OPENAI_API_KEY and GOOGLE_API_KEY are set. Keep `--trials` low.

```bash
pnpm geo-sim run --scenario examples/scenarios/price.json --providers anthropic,openai,google --trials 3
pnpm geo-sim report --run <run-id>
```

Watch the **cross-provider** line — it flags agreement or disagreement across models.

## 4. Dashboard (optional)

```bash
cd dashboard
pnpm install                 # first time only
GEO_SIM_DB=../geo-sim.sqlite pnpm dev
# open http://localhost:3000
```

`/` lists runs, `/runs/<id>` shows per-provider counts, `/scenarios/<id>` shows the
win-rate trend (needs more than one run for that scenario).

## Cost note

Three live providers times repeated trials adds up fast. Keep `--trials` at 3-5
until a scenario's plumbing is proven.

## Things to sanity-check while testing

- Freshness/price/relevance scenarios should show a clear winner. For the
  **position** scenario, read the `position:` line, not the variant line.
  Both variants say the same thing, so `doc1` should land near 50%; a
  `POSITION BIAS` flag there means the model is choosing by slot rather than
  by content.

  Do **not** judge the position scenario by "no variant winner" — that was the
  original check here and it cannot work. The AB/BA swap cancels position bias
  exactly, so a model with no position preference and a model that always cites
  document 1 both produce A ≈ B. Measured 2026-08-16 on `claude-sonnet-5`
  (run `dd37c021`): `doc1=59 doc2=1`, near-total position bias, while the
  variant line read `p=0.897 ns` — the old check would have called that a pass.

- On a real scenario, a significant variant winner is only a content effect if
  it wins under **both** orders. Run `1fc821d5` (freshness, `claude-opus-4-8`)
  is the good case: `winner=A` with `doc1=5 doc2=5`, so A won from either slot.
- Errored trials (rate limits, etc.) are stored with an `error` and excluded from
  the stats, not counted as `neither`.
