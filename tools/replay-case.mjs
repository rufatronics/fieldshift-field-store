import { demoProfile, makeClimate, scoreRotation, rankCandidates, summarizePlan } from "../shared/decision-engine.mjs";
import { writeFile } from "node:fs/promises";

const farmer = demoProfile();
const base = makeClimate(farmer.zone);
const drought = makeClimate(farmer.zone, { rainPercent: -30, stressWindow: [5, 6, 7, 8] });
const flood = makeClimate(farmer.zone, { rainPercent: 0 });
const floodContext = { ...farmer, low: true };
const current = scoreRotation(farmer.cur, farmer, drought);
const alternatives = rankCandidates(farmer, drought);
const floodAlternative = scoreRotation(alternatives[0]?.sequence || ["millet", "cowpea", "sesame"], floodContext, { ...flood, rain: flood.rain.map((value, index) => index >= 6 && index <= 8 ? value * 1.25 : value) });
const report = {
  title: "Malam Sani: plan, watch, protect",
  status: "fictional illustrative scenario; not observed impact evidence",
  farmer: { zone: "Kano", lowPlot: true, irrigation: false, storage: "poor", previousRotation: farmer.cur, marketPreferences: farmer.pref },
  droughtStress: { current: summarizePlan({ current, alternatives }).current, topAlternative: summarizePlan({ current, alternatives }).topAlternative },
  floodStressTopOption: { sequence: floodAlternative.sequence, score: Math.round(floodAlternative.score), gated: floodAlternative.gated, rules: floodAlternative.notes.map(note => note.id) },
  dataNote: "Demo climatology and transparent perturbations only. The crop catalog remains placeholder data pending agronomic review."
};
const output = process.argv[2] || "examples/2020-kano-cutoff-replay.json";
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${output}`);
console.log(`Drought stress current: ${report.droughtStress.current.score}/100 (${report.droughtStress.current.sequence.join(" → ")})`);
console.log(`Drought stress top option: ${report.droughtStress.topAlternative?.score ?? "none"}/100 (${report.droughtStress.topAlternative?.sequence.join(" → ") ?? "none"})`);
console.log(`Flood replay: ${report.floodStressTopOption.score}/100${report.floodStressTopOption.gated ? " · R-GATE" : ""}`);
