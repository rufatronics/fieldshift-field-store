import { CROPS, RULES, calculatePlan, demoProfile, makeClimate, scoreRotation, summarizePlan } from "/shared/decision-engine.mjs";
import { evaluateStoreReading, fakeAlert, readingQuality, translateFieldReading, validateDeviceMessage } from "/shared/device-contract.mjs";
import { SCENARIOS, scenarioMessage } from "/shared/simulator.mjs";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
const round = value => Math.round(Number(value));
const percent = (value, max = 100) => `${Math.max(0, Math.min(100, Number(value) / max * 100))}%`;
const timeLabel = iso => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const dateLabel = iso => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
const cropName = id => CROPS[id]?.n || id;
const profile = demoProfile();
const demoPlan = calculatePlan(profile);

const state = {
  view: "plan",
  scenario: "normalField",
  latestField: scenarioMessage("normalField", new Date().toISOString()),
  latestStore: scenarioMessage("safeStore", new Date().toISOString()),
  fieldTranslation: translateFieldReading(scenarioMessage("normalField", new Date().toISOString())),
  storeEvaluation: evaluateStoreReading(scenarioMessage("safeStore", new Date().toISOString())),
  alerts: [],
  queue: [],
  plan: demoPlan
};

try {
  const saved = JSON.parse(localStorage.getItem("fieldshift-fs-state") || "{}");
  if (saved.latestField) state.latestField = saved.latestField;
  if (saved.latestStore) state.latestStore = saved.latestStore;
  if (Array.isArray(saved.alerts)) state.alerts = saved.alerts.slice(0, 6);
} catch {}
state.fieldTranslation = translateFieldReading(state.latestField);
state.storeEvaluation = evaluateStoreReading(state.latestStore);

function persist() {
  try { localStorage.setItem("fieldshift-fs-state", JSON.stringify({ latestField: state.latestField, latestStore: state.latestStore, alerts: state.alerts, queue: state.queue.slice(-8) })); } catch {}
}

function showBanner(title, message) {
  const banner = $("#banner");
  banner.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>`;
  banner.classList.remove("hidden");
  clearTimeout(showBanner.timer);
  showBanner.timer = setTimeout(() => banner.classList.add("hidden"), 4500);
}

function setView(view) {
  state.view = view;
  $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  $$(".view").forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  const title = ({ plan: "Plan", field: "Live field", store: "Store watch", devices: "Devices", demo: "Demo mode", technical: "Technical evidence" })[view];
  $("#view-title").textContent = title;
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
}

function renderPlan() {
  const { current, alternatives, climate } = state.plan;
  const currentScore = round(current.score);
  const top = alternatives[0];
  $("#plan-score").textContent = currentScore;
  $("#plan-alt-score").textContent = top ? round(top.score) : "—";
  $("#plan-alt-name").textContent = top ? top.sequence.map(cropName).join(" → ") : "No safe option yet";
  $("#plan-metrics").innerHTML = [
    ["PROFILE", "Malam Sani", "fictional example"],
    ["ZONE", "Kano", "coarse context only"],
    ["SEASON WINDOW", `${climate.season} days`, "50+ mm months"],
    ["ENGINE STATUS", "Deterministic", "shared module"]
  ].map(([label, value, note]) => `<div class="metric-cell"><span class="metric-label">${label}</span><span class="metric-value">${value}</span><span class="metric-note">${note}</span></div>`).join("");
  const status = current.gated ? "GATED — review safety rule" : currentScore >= 75 ? "Strong under this context" : currentScore >= 55 ? "Needs attention" : "Weak under this context";
  $("#rotation-card").innerHTML = `<div class="rotation-output"><div class="rotation-score-line"><div class="rotation-score">${currentScore}</div><small>/ 100<br>${status}</small></div><div class="score-meter"><i style="width:${currentScore}%"></i></div><div class="rotation-sequence">${current.sequence.map((id, index) => `<div class="rotation-season"><span>SEASON ${index + 1}</span><strong>${escapeHtml(cropName(id))}</strong><small>${escapeHtml(CROPS[id].fam)} · ${CROPS[id].cyc} days</small></div>`).join("")}</div><ul class="rule-list">${current.notes.length ? current.notes.map(note => `<li class="rule-chip">${note.id} · ${escapeHtml(note.evidence)}</li>`).join("") : `<li class="rule-chip ok">No active sequence warnings</li>`}</ul></div>`;
  const maxRain = Math.max(...climate.rain, 1);
  $("#climate-chart").innerHTML = climate.rain.map((value, index) => `<div class="rain-bar-col"><small>${round(value)}</small><i class="rain-bar ${value >= 50 ? "wet" : ""}" style="height:${Math.max(3, Number(value) / maxRain * 100)}%"></i><small>${["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}</small></div>`).join("");
  $("#alternatives-list").innerHTML = alternatives.slice(0, 3).map((rotation, index) => `<article class="alternative-card"><div class="alt-score">${round(rotation.score)}<small>/100</small></div><div class="alt-seq">${rotation.sequence.map(cropName).join(" → ")}</div><div class="alt-evidence">${rotation.notes.length ? rotation.notes.map(note => note.id).join(" · ") : "No safety gate fired in this context."}</div><ul class="rule-list"><li class="rule-chip ok">${index === 0 ? "highest safe candidate" : "safe candidate"}</li></ul></article>`).join("");
}

function renderField() {
  const message = state.latestField;
  const quality = readingQuality(message);
  const readings = message.readings;
  const translation = state.fieldTranslation;
  const qualityClass = quality.stale ? "pill-warning" : "pill-live";
  $("#field-quality-title").textContent = SCENARIOS[state.scenario]?.type === "field" ? SCENARIOS[state.scenario].label : "Field node";
  $("#field-quality-sub").textContent = `${message.deviceId} · ${quality.stale ? "last-known reading retained" : "message accepted locally"}`;
  $("#field-quality-pill").className = `pill ${qualityClass}`;
  $("#field-quality-pill").innerHTML = `<span class="status-dot"></span> ${quality.label.toUpperCase()} / ${message.connection.toUpperCase()}`;
  $("#field-age").textContent = `${quality.ageMinutes} min old`;
  const fieldMetrics = [
    ["SOIL MOISTURE", `${round(readings.soilMoisturePct)}%`, readings.soilMoisturePct, 100, readings.soilMoisturePct < 25],
    ["AIR TEMPERATURE", `${Number(readings.airTemperatureC).toFixed(1)}°C`, readings.airTemperatureC, 50, readings.airTemperatureC >= 35],
    ["RAINFALL / 24H", `${Number(readings.rainfallMm24h).toFixed(1)} mm`, readings.rainfallMm24h, 100, readings.rainfallMm24h >= 50],
    ["WATER LEVEL", `${Number(readings.waterLevelCm).toFixed(1)} cm`, readings.waterLevelCm, 20, readings.waterLevelCm >= 5]
  ];
  $("#field-metrics").innerHTML = fieldMetrics.map(([label, value, raw, max, warn]) => `<div class="metric-card ${warn ? "warn" : ""}"><span class="metric-label">${label}</span><span class="metric-value">${value}</span><div class="metric-bar"><i style="width:${percent(raw, max)}"></i></div></div>`).join("");
  const chartRows = [
    ["soil moisture", readings.soilMoisturePct, 100, false, `${round(readings.soilMoisturePct)}%`],
    ["air temp", readings.airTemperatureC, 50, true, `${Number(readings.airTemperatureC).toFixed(1)}°C`],
    ["humidity", readings.relativeHumidityPct, 100, false, `${round(readings.relativeHumidityPct)}%`],
    ["rain / 24h", readings.rainfallMm24h, 100, true, `${Number(readings.rainfallMm24h).toFixed(1)} mm`],
    ["water level", readings.waterLevelCm, 20, true, `${Number(readings.waterLevelCm).toFixed(1)} cm`]
  ];
  $("#field-chart").innerHTML = chartRows.map(([label, raw, max, orange, value]) => `<div class="telemetry-row"><label>${label}</label><div class="telemetry-track"><i class="${orange ? "orange" : ""}" style="width:${percent(raw, max)}"></i></div><span class="telemetry-value">${value}</span></div>`).join("");
  const rules = translation.affectedRules;
  $("#field-rules").innerHTML = rules.length ? rules.map(rule => `<div class="rule-callout"><span class="rule-id">${rule}</span><div><strong>${rule === "R-WATER-01" ? "Water context changed" : rule === "R-HEAT-03" ? "Heat context changed" : "Flood context changed"}</strong><small>Measurement is visible; the deterministic gate remains in force.</small></div></div>`).join("") : `<div class="rule-callout"><span class="rule-id">NO RULE</span><div><strong>No threshold crossed</strong><small>The node is measuring conditions without changing the planner context.</small></div></div>`;
  const action = quality.stale ? { cls: "danger", kicker: "STALE / DISCONNECTED", title: "Use the last reading carefully.", copy: `The last field message is ${quality.ageMinutes} minutes old and the device is ${message.connection}. Reconnect or inspect the node before treating this as current.` } : readings.soilMoisturePct < 25 ? { cls: "danger", kicker: "FIELD ACTION", title: "Inspect soil moisture today.", copy: "Drying soil has affected the visible water context. The rule engine still decides which rotations are safe." } : readings.waterLevelCm >= 5 ? { cls: "danger", kicker: "FIELD ACTION", title: "Check low-plot flooding.", copy: "Water level is high enough to activate the flood context. Do not let a sensor reading remove the flood safety gate." } : { cls: "safe", kicker: "FIELD STATUS", title: "Conditions are within watch range.", copy: "The field node is supplying measurements. Keep the reading timestamp and calibration status with any decision." };
  $("#field-action").innerHTML = `<div class="action-card ${action.cls}"><span class="action-kicker">${action.kicker}</span><h3>${action.title}</h3><p>${action.copy}</p></div>`;
  $("#field-transform").textContent = JSON.stringify({ rawReadings: message.readings, quality, plannerPatch: translation.plannerPatch, affectedRules: translation.affectedRules, transformations: translation.transformations }, null, 2);
}

function renderStore() {
  const message = state.latestStore;
  const quality = readingQuality(message);
  const evaluation = state.storeEvaluation;
  const risk = quality.stale ? "watch" : evaluation.risk;
  const title = quality.stale ? "Last-known store conditions" : risk === "high" ? "High storage risk" : risk === "watch" ? "Storage conditions need attention" : "Store is within watch range";
  const copy = quality.stale ? `The store node is ${quality.ageMinutes} minutes old. Keep the last value visible and check the store locally.` : evaluation.alert?.message || "Humidity and temperature are below the local demonstration thresholds. Keep checking the store.";
  $("#store-risk-banner").className = `store-risk-banner ${risk}`;
  $("#store-risk-banner").innerHTML = `<div class="risk-level">${quality.stale ? "STALE / CHECK" : evaluation.risk.toUpperCase()}</div><div><strong>${title}</strong><p>${copy}</p></div>`;
  const readings = message.readings;
  $("#store-metrics").innerHTML = [["TEMPERATURE", `${Number(readings.temperatureC).toFixed(1)}°C`, readings.temperatureC, 45, readings.temperatureC >= 32], ["RELATIVE HUMIDITY", `${Number(readings.relativeHumidityPct).toFixed(1)}%`, readings.relativeHumidityPct, 100, readings.relativeHumidityPct >= 70]].map(([label, value, raw, max, warn]) => `<div class="metric-card ${warn ? "warn" : ""}"><span class="metric-label">${label}</span><span class="metric-value">${value}</span><div class="metric-bar"><i style="width:${percent(raw, max)}"></i></div></div>`).join("");
  $("#store-history").innerHTML = [["TEMPERATURE", `${Number(readings.temperatureC).toFixed(1)}°C`, `${message.connection} · ${timeLabel(message.observedAt)}`], ["HUMIDITY", `${Number(readings.relativeHumidityPct).toFixed(1)}%`, `${message.connection} · ${dateLabel(message.observedAt)}`]].map(([label, value, note]) => `<div class="history-row"><span class="history-label">${label}</span><strong>${value}</strong><small>${note}</small></div>`).join("");
  const alerts = state.alerts.length ? state.alerts : [{ sentAt: message.observedAt, event: { message: "No alert issued. The local adapter is quiet." }, ruleId: "—" }];
  $("#alert-log").innerHTML = alerts.map(item => `<div class="alert-item"><span class="alert-time">${timeLabel(item.sentAt)}</span><div><strong>${escapeHtml(item.event?.ruleId || item.ruleId || "LOCAL")}</strong><p>${escapeHtml(item.event?.message || item.message || "Local status recorded")}</p></div></div>`).join("");
}

function renderDevices() {
  const fieldQuality = readingQuality(state.latestField);
  const storeQuality = readingQuality(state.latestStore);
  const devices = [["FIELD NODE", "field-kano-coop-01", "FN", fieldQuality, state.latestField.batteryPct, "Capacitive moisture · BME280 · water-level", state.latestField.quality.calibrated], ["STORE NODE", "store-kano-coop-01", "SN", storeQuality, state.latestStore.batteryPct, "Temperature / relative humidity", state.latestStore.quality.calibrated]];
  $("#device-list").innerHTML = devices.map(([label, id, icon, quality, battery, sensors, calibrated]) => `<article class="device-card"><div class="device-card-head"><div><p class="eyebrow">${label}</p><h2>${id}</h2><div class="device-id">same JSON message contract as the simulator</div></div><div class="device-icon">${icon}</div></div><div class="device-facts"><div class="device-fact"><span>CONNECTION</span><strong>${quality.label} · ${quality.disconnected ? "offline" : "local"}</strong></div><div class="device-fact"><span>BATTERY</span><strong>${battery ?? "—"}%</strong></div><div class="device-fact"><span>LAST SEEN</span><strong>${quality.ageMinutes} min ago</strong></div><div class="device-fact"><span>READING QUALITY</span><strong>${calibrated ? "Calibrated" : "Uncalibrated demo"}</strong></div></div><div class="device-calibration">SENSORS · ${sensors}</div></article>`).join("");
}

function renderDemo() {
  const keys = Object.keys(SCENARIOS);
  $("#scenario-grid").innerHTML = keys.map((id, index) => `<button class="scenario-button ${state.scenario === id ? "active" : ""}" data-scenario="${id}"><span class="scenario-no">${String(index + 1).padStart(2, "0")}</span><strong>${SCENARIOS[id].label}</strong><small>${SCENARIOS[id].type === "field" ? "field node" : "store node"}</small></button>`).join("");
  $$(".scenario-button").forEach(button => button.addEventListener("click", () => simulate(button.dataset.scenario)));
  $$(".sequence-step").forEach(button => button.classList.toggle("active", button.dataset.scenario === state.scenario));
  const index = keys.indexOf(state.scenario);
  $("#demo-step").textContent = String(Math.max(0, index + 1)).padStart(2, "0");
  $("#demo-step-label").textContent = SCENARIOS[state.scenario].label.toUpperCase();
  $("#demo-readout-title").textContent = SCENARIOS[state.scenario].label;
  $("#demo-readout-pill").textContent = "SYNTHETIC INPUT";
  const message = SCENARIOS[state.scenario].type === "field" ? state.latestField : state.latestStore;
  const validation = validateDeviceMessage(message);
  const quality = readingQuality(message);
  const translation = SCENARIOS[state.scenario].type === "field" ? state.fieldTranslation : state.storeEvaluation;
  $("#demo-readout-body").innerHTML = `<div class="demo-message"><span class="message-type">${message.deviceType.toUpperCase()} / ${quality.label.toUpperCase()}</span><div><strong>${validation.ok ? "Message accepted by local schema" : "Message rejected"}</strong><p>${validation.ok ? `${message.deviceId} · ${Object.keys(message.readings).length} readings · ${quality.ageMinutes} minutes old. ${SCENARIOS[state.scenario].type === "field" ? `${translation.affectedRules.length ? `Affected: ${translation.affectedRules.join(", ")}.` : "No rule threshold crossed."}` : `Storage risk: ${translation.risk}.`}` : validation.errors.join(" · ")}</p></div></div>`;
}

function renderTechnical() {
  $("#rule-registry").innerHTML = RULES.map(([id, kind, description]) => `<div class="registry-row"><code>${id}</code><span class="rule-kind">${kind}</span><p>${description}</p></div>`).join("");
  const latest = SCENARIOS[state.scenario].type === "field" ? state.latestField : state.latestStore;
  $("#raw-payload").textContent = JSON.stringify(latest, null, 2);
  const fieldPlan = calculatePlan({ ...profile, ...state.fieldTranslation.plannerPatch, low: state.fieldTranslation.plannerPatch.low ?? profile.low });
  $("#planner-trace").textContent = JSON.stringify({ sensorToRule: state.fieldTranslation, fieldPlan: summarizePlan(fieldPlan), storeEvaluation: state.storeEvaluation, boundary: { rulesDecide: true, aiAdvisoryOnly: true, forecastAdvisoryOnly: true, exactLocationStored: false } }, null, 2);
}

function renderAll() { renderPlan(); renderField(); renderStore(); renderDevices(); renderDemo(); renderTechnical(); }

function simulate(id) {
  const scenario = SCENARIOS[id];
  if (!scenario) return;
  const message = scenarioMessage(id, new Date().toISOString());
  const checked = validateDeviceMessage(message);
  if (!checked.ok) { showBanner("Message rejected", checked.errors.join(" · ")); return; }
  state.scenario = id;
  if (scenario.type === "field") {
    state.latestField = message;
    state.fieldTranslation = translateFieldReading(message);
    state.queue.push({ type: "field", observedAt: message.observedAt, deviceId: message.deviceId });
    if (readingQuality(message).stale || readingQuality(message).disconnected) showBanner("Last-known reading retained", "This device is stale or disconnected. The app will not treat it as a fresh measurement.");
    else if (state.fieldTranslation.affectedRules.length) showBanner("Field reading applied", `${state.fieldTranslation.affectedRules.join(" · ")} is visible in the evidence trace.`);
  } else {
    state.latestStore = message;
    state.storeEvaluation = evaluateStoreReading(message);
    state.queue.push({ type: "store", observedAt: message.observedAt, deviceId: message.deviceId });
    if (state.storeEvaluation.alert) { const alert = fakeAlert({ ...state.storeEvaluation.alert, ruleId: "R-STORE-05" }); state.alerts.unshift(alert); state.alerts = state.alerts.slice(0, 6); showBanner("Store alert recorded", state.storeEvaluation.alert.message); }
  }
  persist();
  renderAll();
}

$$('.nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
$$('[data-view-target]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewTarget)));
$$('.sequence-step').forEach(button => button.addEventListener('click', () => simulate(button.dataset.scenario)));
$("#reset-demo").addEventListener("click", () => { state.scenario = "normalField"; state.latestField = scenarioMessage("normalField", new Date().toISOString()); state.latestStore = scenarioMessage("safeStore", new Date().toISOString()); state.fieldTranslation = translateFieldReading(state.latestField); state.storeEvaluation = evaluateStoreReading(state.latestStore); state.alerts = []; state.queue = []; persist(); renderAll(); showBanner("Demo reset", "Malam Sani's fictional starting state is back on this device."); });

renderAll();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
