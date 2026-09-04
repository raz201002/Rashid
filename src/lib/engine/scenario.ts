export type Scenario = {
  name: string;
  batteryKwh: number;
  batteryKw: number;
  thresholdKw: number;
  demandChargePerKw: number;
  loadKw: number[];
};

export const starterScenario: Scenario = {
  name: "Harbour Office — weekday",
  batteryKwh: 500,
  batteryKw: 250,
  thresholdKw: 390,
  demandChargePerKw: 19.5,
  loadKw: [245, 232, 224, 219, 218, 229, 268, 331, 405, 438, 461, 472, 490, 483, 465, 451, 468, 489, 458, 401, 345, 302, 274, 256]
};

export const sampleScenarios: Record<string, Scenario> = {
  office: starterScenario,
  retail: {
    name: "Neighbourhood retail — evening peak",
    batteryKwh: 650,
    batteryKw: 300,
    thresholdKw: 430,
    demandChargePerKw: 19.5,
    loadKw: [155, 143, 137, 132, 131, 146, 189, 248, 301, 337, 359, 377, 392, 415, 448, 476, 501, 525, 538, 487, 391, 284, 222, 179]
  },
  warehouse: {
    name: "Cold-store warehouse — compressor cycles",
    batteryKwh: 420,
    batteryKw: 220,
    thresholdKw: 350,
    demandChargePerKw: 19.5,
    loadKw: [286, 279, 274, 271, 276, 289, 315, 341, 362, 348, 338, 354, 379, 398, 382, 364, 391, 422, 447, 414, 368, 333, 312, 298]
  }
};

export function parseTwentyFourHourProfile(value: string): number[] | null {
  const values = value.split(/[\s,;]+/).filter(Boolean).map(Number);
  return values.length === 24 && values.every((item) => Number.isFinite(item) && item >= 0) ? values : null;
}

export type DispatchHour = { hour: number; loadKw: number; batteryKw: number; gridKw: number; stateOfChargeKwh: number };
export type SimulationResult = { hours: DispatchHour[]; baselinePeakKw: number; shavedPeakKw: number; peakReductionKw: number; technicalFeasible: boolean; monthlyDemandChargeSavings: number };
export type SizingRecommendation = { requiredPowerKw: number; requiredEnergyKwh: number; recommendedPowerKw: number; recommendedEnergyKwh: number; powerMarginKw: number; energyMarginKwh: number };

export function sizeForThreshold(scenario: Scenario): SizingRecommendation {
  const aboveThreshold = scenario.loadKw.map((loadKw) => Math.max(0, loadKw - scenario.thresholdKw));
  const requiredPowerKw = Math.max(...aboveThreshold);
  const requiredEnergyKwh = aboveThreshold.reduce((total, value) => total + value, 0);
  return {
    requiredPowerKw,
    requiredEnergyKwh,
    recommendedPowerKw: Math.ceil(requiredPowerKw * 1.1),
    recommendedEnergyKwh: Math.ceil(requiredEnergyKwh * 1.15),
    powerMarginKw: scenario.batteryKw - requiredPowerKw,
    energyMarginKwh: scenario.batteryKwh - requiredEnergyKwh
  };
}

export function simulatePeakShaving(scenario: Scenario): SimulationResult {
  let stateOfChargeKwh = scenario.batteryKwh;
  const hours = scenario.loadKw.map((loadKw, hour) => {
    const requestedKw = Math.max(0, loadKw - scenario.thresholdKw);
    const availableKw = Math.min(scenario.batteryKw, stateOfChargeKwh);
    const batteryKw = Math.min(requestedKw, availableKw);
    stateOfChargeKwh = Math.max(0, stateOfChargeKwh - batteryKw);
    return { hour, loadKw, batteryKw, gridKw: loadKw - batteryKw, stateOfChargeKwh };
  });
  const baselinePeakKw = Math.max(...scenario.loadKw);
  const shavedPeakKw = Math.max(...hours.map((hour) => hour.gridKw));
  const peakReductionKw = baselinePeakKw - shavedPeakKw;
  return {
    hours,
    baselinePeakKw,
    shavedPeakKw,
    peakReductionKw,
    technicalFeasible: shavedPeakKw <= scenario.thresholdKw,
    monthlyDemandChargeSavings: peakReductionKw * scenario.demandChargePerKw
  };
}
