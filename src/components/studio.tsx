"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { readScenario, saveScenario } from "@/lib/session";
import { simulatePeakShaving, starterScenario, type Scenario } from "@/lib/engine/scenario";

const modules = ["Load profile", "Size battery", "Dispatch", "Thermal limits", "Uncertainty", "Safety drill", "Decision history", "Economics", "Knowledge check"];

export function Studio({ activeModule = "Load profile" }: { activeModule?: string }) {
  const [scenario, setScenario] = useState<Scenario>(starterScenario);
  useEffect(() => {
    const timer = window.setTimeout(() => setScenario(readScenario()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const result = useMemo(() => simulatePeakShaving(scenario), [scenario]);
  const update = (field: "batteryKwh" | "batteryKw" | "thresholdKw", value: number) => {
    const next = { ...scenario, [field]: value };
    setScenario(next); saveScenario(next);
  };
  return <main className="min-h-screen p-4 md:p-8"><div className="mx-auto max-w-6xl">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><Link className="text-2xl font-black tracking-tight" href="/">GRIDWISE <span className="text-teal-700">STUDIO</span></Link><span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">Educational simulator · not a controller</span></header>
    <div className="grid gap-6 md:grid-cols-[220px_1fr]"><nav aria-label="Learning modules" className="rounded-2xl bg-white p-3 shadow-sm">{modules.map((module, index) => <a key={module} href={module === "Load profile" ? "/" : `/studio/${module.toLowerCase().replaceAll(" ", "-")}`} className={`mb-1 block rounded-xl px-3 py-2 text-sm ${activeModule === module ? "bg-teal-700 font-bold text-white" : "hover:bg-stone-100"}`}>{index + 1}. {module}</a>)}</nav>
      <section><p className="mb-2 text-sm font-bold uppercase tracking-widest text-teal-700">Guided learning</p><h1 className="text-4xl font-black">{activeModule}</h1><p className="mt-2 max-w-2xl text-slate-600">Explore a transparent peak-shaving scenario. Every module uses the same calculation engine and clearly separates technical performance from financial estimates.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">{([ ["batteryKwh", "Battery energy (kWh)"], ["batteryKw", "Battery power (kW)"], ["thresholdKw", "Grid threshold (kW)"]] as const).map(([field,label]) => <label key={field} className="rounded-2xl bg-white p-4 shadow-sm"><span className="block text-sm font-semibold">{label}</span><input aria-label={label} className="mt-3 w-full rounded-lg border border-slate-300 p-2" type="number" min="0" value={scenario[field]} onChange={(event) => update(field, Number(event.target.value))}/></label>)}</div>
        <div className="mt-6 grid gap-4 md:grid-cols-3"><Metric label="Baseline peak" value={`${result.baselinePeakKw.toFixed(0)} kW`} /><Metric label="Peak after dispatch" value={`${result.shavedPeakKw.toFixed(0)} kW`} /><Metric label="Estimated monthly demand savings" value={`$${result.monthlyDemandChargeSavings.toFixed(0)}`} /></div>
        <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-bold">24-hour dispatch evidence</h2><p className="text-sm text-slate-500">Load vs. grid import after battery discharge</p></div><div className="mt-5 h-72" role="img" aria-label="Twenty-four hour chart comparing building load with grid import after battery dispatch"><ResponsiveContainer width="100%" height="100%"><AreaChart data={result.hours}><defs><linearGradient id="load" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#f4a261" stopOpacity={0.65}/><stop offset="1" stopColor="#f4a261" stopOpacity={0.08}/></linearGradient><linearGradient id="grid" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#006d77" stopOpacity={0.75}/><stop offset="1" stopColor="#006d77" stopOpacity={0.1}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`}/><YAxis unit=" kW"/><Tooltip labelFormatter={(hour) => `${hour}:00`} formatter={(value, name) => [`${Number(value ?? 0).toFixed(0)} kW`, name === "loadKw" ? "Building load" : "Grid import"]}/><Area type="monotone" dataKey="loadKw" name="loadKw" stroke="#e76f51" fill="url(#load)"/><Area type="monotone" dataKey="gridKw" name="gridKw" stroke="#006d77" fill="url(#grid)"/></AreaChart></ResponsiveContainer></div></div>
        <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Decision evidence</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><p><strong>Technical feasibility:</strong> {result.technicalFeasible ? "Threshold achieved for this 24-hour sample." : "Threshold not achieved — energy or power is constrained."}</p><p><strong>Financial viability:</strong> Not yet determined. Review capex, degradation, tariff terms, and financing in Economics.</p></div><p className="mt-4 text-sm text-slate-600">Assumption: the battery starts full, has no charging window or efficiency loss in this foundation model, and dispatches only above the threshold. Later modules will make these assumptions explicit and adjustable.</p></div>
      </section></div></div></main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-slate-900 p-5 text-white"><p className="text-sm text-slate-300">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>; }
