"use client";

import { useMemo, useState } from "react";
import { assessThermalLimits, evaluateEconomics, runUncertaintyTest, type Scenario, type SimulationResult } from "@/lib/engine/scenario";

export function LearningPanel({ module, scenario, simulation }: { module: string; scenario: Scenario; simulation: SimulationResult }) {
  if (module === "Dispatch") return <DispatchPanel simulation={simulation} />;
  if (module === "Thermal limits") return <ThermalPanel scenario={scenario} simulation={simulation} />;
  if (module === "Uncertainty") return <UncertaintyPanel scenario={scenario} />;
  if (module === "Safety drill") return <SafetyPanel />;
  if (module === "Decision history") return <HistoryPanel scenario={scenario} simulation={simulation} />;
  if (module === "Economics") return <EconomicsPanel scenario={scenario} simulation={simulation} />;
  if (module === "Knowledge check") return <KnowledgePanel />;
  return null;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">{title}</h2>{children}</section>; }

function DispatchPanel({ simulation }: { simulation: SimulationResult }) {
  const [hour, setHour] = useState(0); const point = simulation.hours[hour];
  return <Panel title="Step through the dispatch"><p className="mt-1 text-sm text-slate-600">At each hour, the engine supplies only the power required above the grid threshold, subject to battery power and remaining energy.</p><label className="mt-6 block font-semibold" htmlFor="dispatch-hour">Hour {hour}:00<input id="dispatch-hour" className="mt-3 w-full accent-teal-700" type="range" min="0" max="23" value={hour} onChange={(event) => setHour(Number(event.target.value))}/></label><div className="mt-5 grid gap-3 sm:grid-cols-4">{[["Building load", `${point.loadKw.toFixed(0)} kW`], ["Battery output", `${point.batteryKw.toFixed(0)} kW`], ["Grid import", `${point.gridKw.toFixed(0)} kW`], ["Energy left", `${point.stateOfChargeKwh.toFixed(0)} kWh`]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}</div></Panel>;
}

function ThermalPanel({ scenario, simulation }: { scenario: Scenario; simulation: SimulationResult }) {
  const thermal = useMemo(() => assessThermalLimits(scenario, simulation), [scenario, simulation]);
  return <Panel title="Thermal operating envelope"><div className="mt-4 grid gap-4 sm:grid-cols-3"><Tile label="Peak estimated cell temperature" value={`${thermal.maximumTemperatureC.toFixed(1)} °C`} /><Tile label="Hours at derating threshold" value={`${thermal.deratedHours} h`} /><Tile label="Status" value={thermal.thermalStatus} /></div><p className="mt-5 text-sm text-slate-600">Training model: 30 °C ambient baseline and an illustrative load-dependent rise. A real design needs manufacturer data, cooling design, site ambient records, and protection settings.</p></Panel>;
}

function UncertaintyPanel({ scenario }: { scenario: Scenario }) {
  const uncertainty = useMemo(() => runUncertaintyTest(scenario), [scenario]);
  return <Panel title="50-run uncertainty check"><p className="mt-1 text-sm text-slate-600">Deterministic ±10% load variation avoids misleading randomness while showing the range of outcomes.</p><div className="mt-5 grid gap-4 sm:grid-cols-4"><Tile label="Technically feasible" value={`${uncertainty.feasibleRuns}/${uncertainty.runs}`} /><Tile label="P10 monthly savings" value={`$${uncertainty.p10Savings.toFixed(0)}`} /><Tile label="P50 monthly savings" value={`$${uncertainty.p50Savings.toFixed(0)}`} /><Tile label="P90 monthly savings" value={`$${uncertainty.p90Savings.toFixed(0)}`} /></div></Panel>;
}

function SafetyPanel() { return <Panel title="Fault-response training"><p className="mt-1 text-sm text-slate-600">This is a learning drill, not a live safety procedure. Site procedures and qualified personnel always take precedence.</p><div className="mt-5 grid gap-3">{[["High temperature", "Stop dispatch request, isolate per site procedure, escalate to qualified operations staff."], ["Communication loss", "Hold a predefined safe state; log the event; do not assume battery state is current."], ["State-of-charge mismatch", "Pause optimization, reconcile telemetry, and investigate measurement or controller faults."]].map(([fault, response]) => <div key={fault} className="rounded-xl border border-rose-100 p-4"><strong>{fault}</strong><p className="mt-1 text-sm text-slate-600">{response}</p></div>)}</div></Panel>; }

function HistoryPanel({ scenario, simulation }: { scenario: Scenario; simulation: SimulationResult }) { return <Panel title="Current decision snapshot"><div className="mt-4 rounded-xl bg-slate-50 p-5"><p className="font-bold">{scenario.name}</p><p className="mt-2 text-sm text-slate-600">Threshold {scenario.thresholdKw} kW · battery {scenario.batteryKwh} kWh / {scenario.batteryKw} kW · predicted reduction {simulation.peakReductionKw.toFixed(0)} kW.</p><p className="mt-3 text-sm font-semibold">Snapshot rule: changes are persisted locally in this browser; formal design approval belongs in your GitHub case record.</p></div></Panel>; }

function EconomicsPanel({ scenario, simulation }: { scenario: Scenario; simulation: SimulationResult }) {
  const economics = useMemo(() => evaluateEconomics(scenario, simulation), [scenario, simulation]);
  return <Panel title="Economics—screen, not approval"><div className="mt-4 grid gap-4 sm:grid-cols-4"><Tile label="Illustrative capex" value={`$${economics.capex.toLocaleString()}`} /><Tile label="Annual demand savings" value={`$${economics.annualSavings.toFixed(0)}`} /><Tile label="10-year NPV at 8%" value={`$${economics.npv.toFixed(0)}`} /><Tile label="Simple payback" value={`${economics.simplePaybackYears.toFixed(1)} years`} /></div><p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-950"><strong>Financial viability: {economics.financialViable ? "positive NPV under these assumptions" : "not demonstrated under these assumptions"}.</strong> This excludes energy arbitrage, tax, degradation, O&M, financing, and tariff changes. It is an educational starting point, not an investment decision.</p></Panel>;
}

function KnowledgePanel() { const [answer, setAnswer] = useState<"power" | "energy" | "both" | "">(""); const correct = answer === "both"; return <Panel title="Check your understanding"><fieldset className="mt-4"><legend className="font-semibold">To keep grid import below a threshold for several peak hours, what may constrain the battery?</legend>{([ ["power", "Power only"], ["energy", "Energy only"], ["both", "Both power and energy"]] as const).map(([value, label]) => <label key={value} className="mt-3 flex gap-2 rounded-lg border p-3"><input type="radio" name="knowledge" value={value} checked={answer === value} onChange={() => setAnswer(value)}/>{label}</label>)}</fieldset>{answer && <p role="status" className={`mt-4 rounded-lg p-3 ${correct ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>{correct ? "Correct. Power covers the instantaneous gap; energy covers how long the gap can be covered." : "Not quite. Review the sizing module: both instantaneous power and duration energy can bind."}</p>}</Panel>; }

function Tile({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-2 text-xl font-black capitalize">{value}</p></div>; }
