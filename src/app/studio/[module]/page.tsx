import { Studio } from "@/components/studio";

const labels: Record<string, string> = { "size-battery": "Size battery", dispatch: "Dispatch", "thermal-limits": "Thermal limits", uncertainty: "Uncertainty", "safety-drill": "Safety drill", "decision-history": "Decision history", economics: "Economics", "knowledge-check": "Knowledge check" };
export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) { const { module } = await params; return <Studio activeModule={labels[module] ?? "Load profile"} />; }
