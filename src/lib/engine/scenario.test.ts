import { describe, expect, it } from "vitest";
import { simulatePeakShaving, starterScenario } from "./scenario";

describe("simulatePeakShaving", () => {
  it("uses the same scenario to calculate a non-negative peak reduction", () => {
    const result = simulatePeakShaving(starterScenario);
    expect(result.hours).toHaveLength(24);
    expect(result.peakReductionKw).toBeGreaterThanOrEqual(0);
    expect(result.monthlyDemandChargeSavings).toBe(result.peakReductionKw * starterScenario.demandChargePerKw);
  });
});
