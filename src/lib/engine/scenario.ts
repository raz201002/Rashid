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

export type DispatchHour = { hour: number; loadKw: number; batteryKw: number; gridKw: number; stateOfChargeKwh: number };
export type SimulationResult = { hours: DispatchHour[]; baselinePeakKw: number; shavedPeakKw: number; peakReductionKw: number; technicalFeasible: boolean; monthlyDemandChargeSavings: number };

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
