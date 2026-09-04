import { describe, expect, it } from "vitest";
import { parseTwentyFourHourProfile, simulatePeakShaving, sizeForThreshold, starterScenario } from "./scenario";

describe("simulatePeakShaving", () => {
  it("uses the same scenario to calculate a non-negative peak reduction", () => {
    const result = simulatePeakShaving(starterScenario);
    expect(result.hours).toHaveLength(24);
    expect(result.peakReductionKw).toBeGreaterThanOrEqual(0);
    expect(result.monthlyDemandChargeSavings).toBe(result.peakReductionKw * starterScenario.demandChargePerKw);
  });

  it("accepts exactly twenty-four non-negative load readings", () => {
    expect(parseTwentyFourHourProfile(starterScenario.loadKw.join(","))).toHaveLength(24);
    expect(parseTwentyFourHourProfile("1,2,3")).toBeNull();
    expect(parseTwentyFourHourProfile(`${starterScenario.loadKw.slice(0, 23).join(",")},-1`)).toBeNull();
  });

  it("sizes energy and power from the selected threshold", () => {
    const sizing = sizeForThreshold(starterScenario);
    expect(sizing.requiredPowerKw).toBe(100);
    expect(sizing.requiredEnergyKwh).toBe(801);
    expect(sizing.recommendedEnergyKwh).toBeGreaterThan(sizing.requiredEnergyKwh);
  });
});
