# Contributing to geo-sim

Thanks for helping out. Before starting non-trivial work, open an issue so we can
agree on scope.

## Development

```bash
pnpm install
pnpm test        # vitest unit suite
pnpm lint        # eslint + prettier check
pnpm format      # apply prettier
```

Live-API scripts (`pnpm manual:anthropic`, real `geo-sim run`) need real keys and
are **not** part of the automated suite. CI runs only lint + unit tests.

Read `CLAUDE.md` first — it documents conventions and, importantly, the one claim
this project must never blur: geo-sim measures **citation preference given
retrieval**, not retrieval itself. If a change would weaken that framing in any
user-facing surface (CLI, report, README), flag it rather than shipping it.

## Adding a scenario

1. Create `examples/scenarios/<factor>.json` with:
   ```json
   {
     "id": "unique-id",
     "factor": "freshness | price | relevance | position | ...",
     "query": "the question both variants answer",
     "notes": "optional",
     "variantA": { "id": "a", "label": "short label", "text": "..." },
     "variantB": { "id": "b", "label": "short label", "text": "..." }
   }
   ```
2. Both variants must answer the same query, stay within ~5% of each other's
   length, and be identical except the single factor under test.
3. Hand-author it — more trustworthy than programmatic generation for now.

The scenario is picked up automatically by `list-scenarios` and validated by
`test/scenarios.test.ts` (shape + length).

## Adding a provider

1. Create `src/providers/<name>.ts` exporting a `Provider`:
   ```ts
   export const fooProvider: Provider = {
     name: 'foo',
     async runTrial(scenario, positionOrder) {
       /* call the SDK with INSTRUCTIONS + documentBlocks/queryLine,
          then parseCitation(rawResponse, positionOrder) */
     },
   };
   ```
   Reuse `framing.ts` and `parseCitation.ts` — do not re-implement the prompt or
   the tag parsing. Do not enable web search / grounding: this is context
   injection only. Do not set temperature to 0.
2. Register it in `src/providers/registry.ts`.
3. Add its API-key env var to `PROVIDER_ENV` in `src/cli/index.ts`.
4. Add `test/<name>.test.ts` mirroring the existing provider tests (mock the SDK,
   cover all four citation outcomes).

## Pull requests

- Keep the diff focused; one concern per PR.
- `pnpm lint` and `pnpm test` must pass.
- No emojis or em dashes in code, comments, or docs unless already present.
