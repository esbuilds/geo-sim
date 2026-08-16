import type { CitedVariant, PositionOrder } from '../harness/types.js';

/**
 * Maps a parsed <cited> tag back to a variant, accounting for injection order.
 * Document 1/2 is resolved to variant A/B via `order`; missing or malformed tags
 * map to 'neither' (graceful — the full raw response is preserved on the Trial).
 * Shared by all providers so citation parsing lives in exactly one place.
 */
export function parseCitation(raw: string, order: PositionOrder): CitedVariant {
  const matches = [
    ...raw.matchAll(/<cited>\s*(1|2|both|neither)\s*<\/cited>/gi),
  ];
  if (matches.length === 0) return 'neither';
  const tag = matches[matches.length - 1][1].toLowerCase();
  if (tag === 'both' || tag === 'neither') return tag;
  const [doc1, doc2]: [CitedVariant, CitedVariant] =
    order === 'AB' ? ['A', 'B'] : ['B', 'A'];
  return tag === '1' ? doc1 : doc2;
}
