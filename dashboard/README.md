# geo-sim dashboard

A plain read-only viewer for geo-sim runs. Reads the harness's SQLite file
directly; it never writes.

```bash
cd dashboard
pnpm install
GEO_SIM_DB=../geo-sim.sqlite pnpm dev   # defaults to ../geo-sim.sqlite if unset
```

Pages:

- `/` — all runs, newest first
- `/runs/[id]` — per-provider counts and variant-A win rate for a run
- `/scenarios/[id]` — variant-A win-rate trend across a scenario's runs (needs >1 run)

Full statistics (Wilson interval, binomial significance) live in the CLI:
`geo-sim report --run <id>`. This dashboard intentionally shows only counts and
win rate.

Same non-goal as the harness: this reports citation preference **given
retrieval**, not whether content is retrieved in production.
