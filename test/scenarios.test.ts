import { describe, expect, test } from 'vitest';
import { loadExampleScenarios } from '../src/scenarios/load.js';

const scenarios = loadExampleScenarios();

describe('example scenarios', () => {
  test('cover the content factors plus a position sanity check', () => {
    const factors = scenarios.map((s) => s.factor).sort();
    expect(factors).toEqual([
      'freshness',
      'position',
      'price',
      'relevance',
      'specificity',
    ]);
  });

  test.each(scenarios)('$id: variants are within ~5% length', (scenario) => {
    const a = scenario.variantA.text.length;
    const b = scenario.variantB.text.length;
    expect(Math.abs(a - b) / Math.max(a, b)).toBeLessThanOrEqual(0.05);
  });

  test.each(scenarios)('$id: shape is valid and IDs are unique', (scenario) => {
    expect(scenario.query.length).toBeGreaterThan(0);
    expect(scenario.variantA.id).not.toBe(scenario.variantB.id);
  });
});
