import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const required = [
  "public/index.html", "public/app.css", "public/app.js", "public/sw.js", "public/manifest.webmanifest",
  "public/manus-routes.json", "shared/decision-engine.mjs", "shared/device-contract.mjs", "shared/simulator.mjs",
  "README.md", "ARCHITECTURE.md", "HARDWARE.md", "DEMO.md", "API.md", "VALIDATION.md", "SECURITY.md", "CHANGELOG.md", "AGENT.md"
];
for (const file of required) await access(file);
const routes = JSON.parse(await readFile("public/manus-routes.json", "utf8"));
if (!Array.isArray(routes.routes) || routes.routes.length < 1) throw new Error("route manifest is empty");
const html = await readFile("public/index.html", "utf8");
for (const marker of ["FieldShift Field + Store", "Plan", "Live field", "Store watch", "Technical evidence"]) {
  if (!html.includes(marker)) throw new Error(`missing UI marker: ${marker}`);
}
const syntax = ["public/app.js", "shared/decision-engine.mjs", "shared/device-contract.mjs", "shared/simulator.mjs"];
for (const file of syntax) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${file}: ${result.stderr}`);
}
console.log(`[fieldshift] build verified ${required.length} required files and ${routes.routes.length} route(s)`);
