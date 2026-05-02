import { describe, it, expect } from 'vitest';
import { bayesianScore, BAYESIAN_C } from '../../technicians.repository.js';

describe('bayesianScore', () => {
  const m = 4; // global mean rating used for these pure-function tests

  it('uses C=5 as the smoothing constant', () => {
    expect(BAYESIAN_C).toBe(5);
  });

  it('5★ with 1 review collapses toward global mean', () => {
    // (5 * 4 + 5) / (5 + 1) = 25 / 6 ≈ 4.1667
    expect(bayesianScore({ sum_ratings: 5, review_count: 1 }, m)).toBeCloseTo(4.1667, 3);
  });

  it('4.7★ with 200 reviews stays close to actual avg', () => {
    // sum = 4.7 * 200 = 940; (5 * 4 + 940) / (5 + 200) = 960 / 205 ≈ 4.6829
    expect(bayesianScore({ sum_ratings: 940, review_count: 200 }, m)).toBeCloseTo(4.6829, 3);
  });

  it('high-volume tech outranks low-volume tech with same nominal stars', () => {
    const lowVol = bayesianScore({ sum_ratings: 5, review_count: 1 }, m);
    const highVol = bayesianScore({ sum_ratings: 940, review_count: 200 }, m);
    expect(highVol).toBeGreaterThan(lowVol);
  });

  it('zero-review technician scores exactly the global mean', () => {
    // (5 * m + 0) / (5 + 0) = m
    expect(bayesianScore({ sum_ratings: 0, review_count: 0 }, m)).toBe(m);
  });

  it('zero-review tech scores below any tech with at least one positive review when m < that rating', () => {
    const zero = bayesianScore({ sum_ratings: 0, review_count: 0 }, m);
    // avg = 25/5 = 5; score = (5*4 + 25)/(5+5) = 45/10 = 4.5 > 4 (the global mean)
    const someReviews = bayesianScore({ sum_ratings: 25, review_count: 5 }, m);
    expect(someReviews).toBeGreaterThan(zero);
  });
});
