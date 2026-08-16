import { describe, expect, test } from 'vitest';
import { parseCitation } from '../src/providers/parseCitation.js';

// Mocked raw model responses — the parsing logic is the unit under test.
describe('parseCitation', () => {
  test('doc 1 maps to A under AB order, B under BA order', () => {
    expect(parseCitation('answer\n<cited>1</cited>', 'AB')).toBe('A');
    expect(parseCitation('answer\n<cited>1</cited>', 'BA')).toBe('B');
  });

  test('doc 2 maps to B under AB order, A under BA order', () => {
    expect(parseCitation('answer\n<cited>2</cited>', 'AB')).toBe('B');
    expect(parseCitation('answer\n<cited>2</cited>', 'BA')).toBe('A');
  });

  test('both and neither pass through regardless of order', () => {
    expect(parseCitation('x <cited>both</cited>', 'AB')).toBe('both');
    expect(parseCitation('x <cited>neither</cited>', 'BA')).toBe('neither');
  });

  test('tolerates whitespace and casing in the tag', () => {
    expect(parseCitation('<CITED> 2 </CITED>', 'AB')).toBe('B');
  });

  test('missing tag fails gracefully to neither instead of throwing', () => {
    expect(parseCitation('I could not answer.', 'AB')).toBe('neither');
    expect(parseCitation('<cited>garbage</cited>', 'AB')).toBe('neither');
  });

  test('uses the last tag when several appear', () => {
    expect(
      parseCitation('<cited>1</cited> ... final <cited>2</cited>', 'AB'),
    ).toBe('B');
  });
});
