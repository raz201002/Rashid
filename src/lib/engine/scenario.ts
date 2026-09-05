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

export type LoadProfileUpload = { ok: true; loadKw: number[] } | { ok: false; message: string };

/** Parses CSV/TSV rows in the documented `hour,load_kw` format. */
export function parseLoadProfileTable(value: string): LoadProfileUpload {
  const rows = value.trim().split(/\r?\n/).filter(Boolean).map((row) => row.split(/[\t,]/).map((cell) => cell.trim()));
  if (rows.length !== 25) return { ok: false, message: "Use one header row and exactly 24 hourly rows." };
  const [hourHeader, loadHeader] = rows[0].map((cell) => cell.toLowerCase().replaceAll(" ", "_"));
  if (hourHeader !== "hour" || !["load_kw", "loadkw", "kw"].includes(loadHeader)) return { ok: false, message: "The first row must be: hour,load_kw" };
  const values = new Array<number>(24);
  for (const row of rows.slice(1)) {
    if (row.length !== 2) return { ok: false, message: "Each row must contain exactly an hour and a kW value." };
    const hour = Number(row[0]); const load = Number(row[1]);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || values[hour] !== undefined) return { ok: false, message: "Hours must be unique whole numbers from 0 through 23." };
    if (!Number.isFinite(load) || load < 0) return { ok: false, message: "Every load_kw value must be a non-negative number." };
    values[hour] = load;
  }
  return values.every((value) => value !== undefined) ? { ok: true, loadKw: values } : { ok: false, message: "Include every hour from 0 through 23." };
}

export type DispatchHour = { hour: number; loadKw: number; batteryKw: number; gridKw: number; stateOfChargeKwh: number };
export type SimulationResult = { hours: DispatchHour[]; baselinePeakKw: number; shavedPeakKw: number; peakReductionKw: number; technicalFeasible: boolean; monthlyDemandChargeSavings: number };
export type SizingRecommendation = { requiredPowerKw: number; requiredEnergyKwh: number; recommendedPowerKw: number; recommendedEnergyKwh: number; powerMarginKw: number; energyMarginKwh: number };
export type ThermalAssessment = { maximumTemperatureC: number; deratedHours: number; thermalStatus: "normal" | "derating" | "limit" };
export type UncertaintyResult = { runs: number; feasibleRuns: number; feasibilityRate: number; p10Savings: number; p50Savings: number; p90Savings: number };
export type EconomicsResult = { capex: number; annualSavings: number; npv: number; simplePaybackYears: number; financialViable: boolean };

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

export function assessThermalLimits(scenario: Scenario, result = simulatePeakShaving(scenario)): ThermalAssessment {
  const maximumTemperatureC = Math.max(...result.hours.map((hour) => 30 + (hour.batteryKw / scenario.batteryKw) * 14));
  const deratedHours = result.hours.filter((hour) => 30 + (hour.batteryKw / scenario.batteryKw) * 14 >= 40).length;
  return { maximumTemperatureC, deratedHours, thermalStatus: maximumTemperatureC >= 43 ? "limit" : deratedHours > 0 ? "derating" : "normal" };
}

function seededMultiplier(seed: number) { return 0.9 + (((seed * 9301 + 49297) % 233280) / 233280) * 0.2; }

export function runUncertaintyTest(scenario: Scenario, runs = 50): UncertaintyResult {
  const savings = Array.from({ length: runs }, (_, index) => {
    const multiplier = seededMultiplier(index + 1);
    return simulatePeakShaving({ ...scenario, loadKw: scenario.loadKw.map((load) => load * multiplier) });
  });
  const ordered = savings.map((result) => result.monthlyDemandChargeSavings).sort((left, right) => left - right);
  const percentile = (percent: number) => ordered[Math.round((ordered.length - 1) * percent)];
  return { runs, feasibleRuns: savings.filter((result) => result.technicalFeasible).length, feasibilityRate: savings.filter((result) => result.technicalFeasible).length / runs, p10Savings: percentile(0.1), p50Savings: percentile(0.5), p90Savings: percentile(0.9) };
}

export function evaluateEconomics(scenario: Scenario, result = simulatePeakShaving(scenario), capex = 280000): EconomicsResult {
  const annualSavings = result.monthlyDemandChargeSavings * 12;
  const discountRate = 0.08;
  const npv = Array.from({ length: 10 }, (_, index) => annualSavings / (1 + discountRate) ** (index + 1)).reduce((total, value) => total + value, -capex);
  return { capex, annualSavings, npv, simplePaybackYears: annualSavings > 0 ? capex / annualSavings : Infinity, financialViable: npv > 0 };
}
