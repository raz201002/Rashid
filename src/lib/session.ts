import { z } from "zod";
import { starterScenario, type Scenario } from "@/lib/engine/scenario";

const storageKey = "bess-learning-studio/v1";
const scenarioSchema = z.object({ name: z.string(), batteryKwh: z.number().positive(), batteryKw: z.number().positive(), thresholdKw: z.number().nonnegative(), demandChargePerKw: z.number().nonnegative(), loadKw: z.array(z.number().nonnegative()).length(24) });

export function readScenario(): Scenario {
  if (typeof window === "undefined") return starterScenario;
  try { return scenarioSchema.parse(JSON.parse(window.localStorage.getItem(storageKey) ?? "null")); }
  catch { return starterScenario; }
}

export function saveScenario(scenario: Scenario) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(scenario));
}
