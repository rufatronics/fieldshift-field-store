export const PLACEHOLDER = true;

export const ZONES = {
  kano: { name: "Kano", rain: [0, 0, 2, 12, 70, 120, 200, 290, 150, 25, 0, 0], tmax: [31, 34, 37, 38, 36, 33, 30, 29, 31, 34, 33, 31], rh: [25, 20, 20, 30, 45, 60, 72, 78, 70, 45, 32, 28], lowPos: 0.5, slope: 1.2 },
  katsina: { name: "Katsina", rain: [0, 0, 2, 10, 55, 100, 180, 270, 130, 20, 0, 0], tmax: [31, 34, 37, 39, 37, 34, 31, 30, 32, 35, 34, 31], rh: [24, 19, 19, 28, 42, 58, 70, 76, 68, 42, 30, 26], lowPos: 0.5, slope: 1.5 },
  sokoto: { name: "Sokoto", rain: [0, 0, 2, 8, 45, 85, 140, 230, 110, 15, 0, 0], tmax: [33, 36, 39, 41, 40, 36, 32, 31, 33, 37, 36, 33], rh: [22, 17, 17, 24, 38, 52, 66, 72, 62, 36, 26, 24], lowPos: 0.5, slope: 0.9 }
};

export const CROPS = {
  millet: { n: "Pearl millet", fam: "cereal", cyc: 90, w: [300, 450], pm: 6, heat: 5, dry: 5, flood: 1, rot: 2, nfix: 0, ero: 3 },
  sorghum: { n: "Sorghum", fam: "cereal", cyc: 115, w: [450, 650], pm: 6, heat: 4, dry: 4, flood: 3, rot: 2, nfix: 0, ero: 3 },
  maize: { n: "Maize", fam: "cereal", cyc: 105, w: [500, 800], pm: 6, heat: 3, dry: 2, flood: 2, rot: 4, nfix: 0, ero: 2 },
  cowpea: { n: "Cowpea", fam: "legume", cyc: 75, w: [300, 500], pm: 7, heat: 4, dry: 4, flood: 1, rot: 3, nfix: 1, ero: 4 },
  groundnut: { n: "Groundnut", fam: "legume", cyc: 105, w: [450, 650], pm: 6, heat: 3, dry: 3, flood: 1, rot: 5, nfix: 1, ero: 4 },
  rice: { n: "Rainfed rice", fam: "cereal", cyc: 125, w: [900, 1200], pm: 6, heat: 3, dry: 1, flood: 5, rot: 3, nfix: 0, ero: 2 },
  sesame: { n: "Sesame", fam: "oilseed", cyc: 95, w: [300, 500], pm: 6, heat: 4, dry: 4, flood: 1, rot: 4, nfix: 0, ero: 3 },
  soybean: { n: "Soybean", fam: "legume", cyc: 105, w: [500, 750], pm: 6, heat: 3, dry: 2, flood: 2, rot: 3, nfix: 1, ero: 4 },
  onion: { n: "Onion", fam: "bulb", cyc: 120, w: [450, 700], pm: 7, heat: 3, dry: 2, flood: 1, rot: 3, nfix: 0, ero: 2 },
  tomato: { n: "Tomato", fam: "fruit", cyc: 100, w: [400, 650], pm: 7, heat: 2, dry: 2, flood: 1, rot: 4, nfix: 0, ero: 2 }
};

export const RULES = [
  ["R-WATER-01", "gate/penalty", "Seasonal rainfall plus irrigation context versus crop water need."],
  ["R-SEASON-02", "gate", "Crop cycle longer than the rain-supported season."],
  ["R-HEAT-03", "penalty", "Peak temperature versus crop heat limit."],
  ["R-FLOOD-04", "gate/penalty", "Peak rain and low-plot context versus flood tolerance."],
  ["R-STORE-05", "penalty", "Harvest-month humidity, crop rot sensitivity, and store quality."],
  ["R-SEQ-01", "-10", "Rotation has no legume."],
  ["R-SEQ-02", "-8 each", "The same crop repeats back to back."],
  ["R-SEQ-03", "+2 each", "The sequence switches crop family."],
  ["R-GATE", "flag", "A crop failed a gate, so the rotation is not presented as safe."]
];

export const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
export const sum = values => values.reduce((total, value) => total + value, 0);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const growingWindow = crop => [...Array(Math.ceil(crop.cyc / 30))].map((_, index) => (crop.pm - 1 + index) % 12);

export function makeClimate(zoneId = "kano", whatIf = {}) {
  const zone = ZONES[zoneId] || ZONES.kano;
  const rainFactor = 1 + Number(whatIf.rainPercent || 0) / 100;
  const temperatureDelta = Number(whatIf.temperatureC || 0);
  const stressWindow = Array.isArray(whatIf.stressWindow) ? new Set(whatIf.stressWindow) : null;
  const rain = zone.rain.map((value, index) => Math.max(0, value * (stressWindow && !stressWindow.has(index) ? 1 : rainFactor)));
  return { ...zone, rain, tmax: zone.tmax.map(value => value + temperatureDelta), season: rain.filter(value => value >= 50).length * 30 + 20 };
}

export function normalizeProfile(profile = {}) {
  return {
    zone: profile.zone || "kano",
    low: Boolean(profile.low),
    irr: Boolean(profile.irr),
    store: profile.store || "poor",
    cur: profile.cur || ["maize", "maize", "groundnut"],
    pref: profile.pref || ["cowpea", "millet", "sesame"],
    w: { water: 3, soil: 3, store: 3, cash: 3, ...(profile.w || {}) },
    dRain: Number(profile.dRain || 0),
    dT: Number(profile.dT || 0),
    stressWindow: Array.isArray(profile.stressWindow) ? profile.stressWindow : null
  };
}

export function scoreCrop(id, rawProfile, climate = makeClimate()) {
  const profile = normalizeProfile(rawProfile);
  const crop = CROPS[id];
  if (!crop) throw new Error(`Unknown crop: ${id}`);
  const window = growingWindow(crop);
  const rules = [];
  const rain = sum(window.map(month => climate.rain[month])) + (profile.irr ? 150 : 0);
  const peakTemperature = Math.max(...window.map(month => climate.tmax[month]));
  const peakRain = Math.max(...window.map(month => climate.rain[month]));
  const season = climate.rain.filter(value => value >= 50).length * 30 + 20;
  const add = (ruleId, type, evidence) => rules.push({ id: ruleId, type, evidence });
  const factors = {};
  factors.water = clamp((rain - crop.w[0] * 0.8) / (crop.w[1] - crop.w[0] * 0.8) * 100);
  if (rain < crop.w[0] * 0.8) add("R-WATER-01", "gate", `${Math.round(rain)} mm versus ${crop.w[0]} mm minimum`);
  else if (factors.water < 60) add("R-WATER-01", "penalty", `${Math.round(rain)} mm versus ${crop.w[0]}–${crop.w[1]} mm need`);
  factors.season = clamp(140 - 100 * crop.cyc / season);
  if (crop.cyc > season) add("R-SEASON-02", "gate", `${crop.cyc} days versus ${season}-day season`);
  const heatLimit = 27 + 2 * crop.heat;
  factors.heat = clamp(100 - (peakTemperature - heatLimit) * 15);
  if (factors.heat < 60) add("R-HEAT-03", "penalty", `${peakTemperature.toFixed(1)}°C versus ${heatLimit}°C limit`);
  const floodRisk = (profile.low ? 1 : 0.25) * clamp(peakRain / 3);
  factors.flood = clamp(100 - floodRisk * (5 - crop.flood) / 4);
  if (profile.low && factors.flood < 20) add("R-FLOOD-04", "gate", `peak rain ${peakRain} mm on low plot`);
  else if (factors.flood < 60) add("R-FLOOD-04", "penalty", `peak rain ${peakRain} mm`);
  const harvestMonth = (crop.pm - 1 + Math.ceil(crop.cyc / 30)) % 12;
  const harvestHumidity = climate.rh[harvestMonth];
  factors.store = clamp(100 - clamp((harvestHumidity - 45) * 2.5) * crop.rot / 5 * ({ good: 0.4, ok: 0.8, poor: 1.3 }[profile.store] || 1.3));
  if (factors.store < 60) add("R-STORE-05", "penalty", `${months[harvestMonth]} humidity ${harvestHumidity}%`);
  factors.soil = clamp(40 + 30 * crop.nfix + 6 * crop.ero);
  factors.market = profile.pref.includes(id) ? 100 : 55;
  const weights = { water: 1 + profile.w.water, heat: 1.5, season: 1.5, flood: 1.5, store: 1 + profile.w.store, soil: 1 + profile.w.soil, market: 0.5 + profile.w.cash * 0.5 };
  const gated = rules.some(rule => rule.type === "gate");
  const score = gated ? 0 : Object.keys(weights).reduce((total, key) => total + factors[key] * weights[key], 0) / sum(Object.values(weights));
  return { id, name: crop.n, score: Math.round(score), gated, factors, rules, observed: { rainMm: Math.round(rain), peakTemperatureC: Number(peakTemperature.toFixed(1)), peakRainMm: Math.round(peakRain), harvestHumidityPct: harvestHumidity }, requirements: crop, weights };
}

export function scoreRotation(sequence, rawProfile, climate = makeClimate()) {
  const profile = normalizeProfile(rawProfile);
  const crops = sequence.map(id => scoreCrop(id, profile, climate));
  let score = sum(crops.map(crop => crop.score)) / crops.length;
  const notes = [];
  if (!sequence.some(id => CROPS[id].fam === "legume")) { score -= 10; notes.push({ id: "R-SEQ-01", type: "penalty", evidence: "no legume" }); }
  let repeats = 0, switches = 0;
  sequence.forEach((id, index) => { const next = sequence[(index + 1) % sequence.length]; if (id === next) repeats += 1; else if (CROPS[id].fam !== CROPS[next].fam) switches += 1; });
  if (repeats) { score -= 8 * repeats; notes.push({ id: "R-SEQ-02", type: "penalty", evidence: `${repeats} repeated transition(s)` }); }
  if (switches) { score += 2 * switches; notes.push({ id: "R-SEQ-03", type: "bonus", evidence: `${switches} family switch(es)` }); }
  const gated = crops.some(crop => crop.gated);
  if (gated) notes.push({ id: "R-GATE", type: "flag", evidence: "a crop failed a safety gate" });
  return { sequence: [...sequence], score: clamp(score), crops, notes, gated };
}

export function rankCandidates(rawProfile, climate = makeClimate()) {
  const profile = normalizeProfile(rawProfile);
  const ids = Object.keys(CROPS), candidates = [];
  for (const a of ids) for (const b of ids) for (const c of ids) {
    if (new Set([a, b, c]).size < 3) continue;
    const rotation = scoreRotation([a, b, c], profile, climate);
    if (!rotation.crops.some(crop => crop.gated)) candidates.push(rotation);
  }
  const seen = new Set();
  return candidates.sort((a, b) => b.score - a.score).filter(rotation => { const key = [...rotation.sequence].sort().join(","); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 5);
}

export function calculatePlan(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const climate = makeClimate(profile.zone, { rainPercent: profile.dRain, temperatureC: profile.dT, stressWindow: profile.stressWindow });
  const current = scoreRotation(profile.cur, profile, climate);
  return { profile, climate, current, alternatives: rankCandidates(profile, climate) };
}

export function demoProfile() {
  return normalizeProfile({ zone: "kano", low: true, irr: false, store: "poor", cur: ["maize", "maize", "groundnut"], pref: ["cowpea", "millet", "sesame"], w: { water: 4, soil: 4, store: 4, cash: 3 }, dRain: -30, stressWindow: [5, 6, 7, 8] });
}

export function summarizePlan(plan) {
  return { current: { sequence: plan.current.sequence, score: Math.round(plan.current.score), rules: plan.current.notes.map(note => note.id) }, topAlternative: plan.alternatives[0] ? { sequence: plan.alternatives[0].sequence, score: Math.round(plan.alternatives[0].score), rules: plan.alternatives[0].notes.map(note => note.id) } : null, advisoryOnly: true };
}
