import type { Review } from "./schemas.js";

export interface GateResult<T> {
  output: T;
  review: Review;
  iterations: number;
  overridden: boolean; // true if we proceeded despite CHANGES_REQUESTED
}

/**
 * Verdict gate: run a producer, then a critic; on CHANGES_REQUESTED re-run the
 * producer (it sees the review) and re-review, up to maxIter cycles. Then proceed
 * regardless so the autonomous loop never stalls — mirroring the constitution's
 * "at most max_gate_iterations, then proceed and note the override" rule.
 *
 * `produce(review)` gets the previous critic review (undefined on the first pass)
 * so the producer can address findings.
 */
export async function runGate<T>(
  produce: (review: Review | undefined) => Promise<T>,
  review: (output: T) => Promise<Review>,
  maxIter: number,
): Promise<GateResult<T>> {
  let lastReview: Review | undefined;
  let output!: T;

  for (let i = 1; i <= maxIter; i++) {
    output = await produce(lastReview);
    lastReview = await review(output);
    if (lastReview.verdict === "APPROVED") {
      return { output, review: lastReview, iterations: i, overridden: false };
    }
  }
  return { output, review: lastReview!, iterations: maxIter, overridden: true };
}
