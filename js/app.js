import {
  BUILD, DIESEL, FERTILIZER, DISTRICTS, CROPS, DEMO_FARM, INPUTS,
  CONTEXT_STATS, IMPORT_REALITY, SPONSOR_TIERS, FORECAST, SOURCES,
  GOES, AZMET_SNAPSHOT, MAILER, DAIRY, CATTLE, REFERENCE, PRODUCE_CARDS,
  BORDER_LINES, BORDER_NOTE, ZONES, PURPOSE,
} from "./data.js";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "agcompass-state-v3";

function cropState(useDefaults = false) {
  return Object.fromEntries(CROPS.map((c) => [c.id, {
    acres: String(useDefaults ? c.defaultAcres : 0),
    yield: String(c.yield),
    price: String(c.price),
    af: String(c.af),
    other: String(c.other),
  }]));
}
function inputState() {
  return Object.fromEntries(INPUTS.map((i) => [i.id, {
    supplier: i.supplier,
    price: String(i.price),
    qty: String(i.qty),
  }]));
}

function defaultState() {
  const d = DISTRICTS[0];
  return {
    farmName: "Arizona statewide plan",
    districtId: d.id,
    farmAcres: "0",
    assessment: String(d.assessment),
    includedAF: String(d.includedAF),
    extraAF: String(d.extraAF),
    allocationAf: "0",
    crops: cropState(false),
    inputs: inputState(),
    includeInputs: false,
    loanAmount: 250000,
    loanRate: 8,
    loanTerm: 12,
    sponsorLine: "Saguaro Founding Sponsor slot -- AgWest Farm Credit (pitched, not signed)",
    useJimAlfalfa: true,
    zoneId: "az",
  };
}
function yumaDemoState() {
  const d = DISTRICTS.find((x) => x.id === DEMO_FARM.districtId) || DISTRICTS[0];
  const acres = DEMO_FARM.farmAcres;
  return {
    ...defaultState(),
    farmName: DEMO_FARM.name,
    districtId: d.id,
    farmAcres: String(acres),
    assessment: String(d.assessment),
    includedAF: String(d.includedAF),
    extraAF: String(d.extraAF),
    allocationAf: String(acres * d.includedAF),
    crops: cropState(true),
    zoneId: "yuma",
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let state = defaultState();
const saved = loadState();
if (saved) {
  state = {
    ...defaultState(),
    ...saved,
    crops: { ...cropState(false), ...(saved.crops || {}) },
    inputs: { ...inputState(), ...(saved.inputs || {}) },
    zoneId: saved.zoneId || "az",
  };
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function cropById(id) { return CROPS.find((c) => c.id === id); }
function districtById(id) { return DISTRICTS.find((d) => d.id === id); }
function parse(s, fallback = 0) {
  const v = parseFloat(String(s).replace(/,/g, "").trim());
  return Number.isFinite(v) ? v : fallback;
}
function money(n, digits = 0) {
  if (n == null || Number.isNaN(n) || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits });
}
function num(n, d = 1) {
  if (n == null || Number.isNaN(n) || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
}
function kindFlag(kind) {
  const k = kind || "assumption";
  return `<span class="flag ${k}">${k}</span>`;
}

function applyDistrict(id) {
  const d = districtById(id) || DISTRICTS[0];
  state.districtId = id;
  state.assessment = String(d.assessment);
  state.includedAF = String(d.includedAF);
  state.extraAF = String(d.extraAF);
  const a = parse(state.farmAcres, 0);
  if (d.includedAF > 0 && a > 0) state.allocationAf = String(a * d.includedAF);
}

function resetDemo() {
  state = yumaDemoState();
  persist();
  render();
}

function planSummary() {
  const farmAcres = parse(state.farmAcres, 0);
  const assess = parse(state.assessment, 0);
  const incAF = parse(state.includedAF, 0);
  const extra = parse(state.extraAF, 0);
  const allocation = parse(state.allocationAf, 0);
  const rows = CROPS.map((c) => {
    const st = state.crops[c.id] || {};
    const a = parse(st.acres, 0);
    const y = parse(st.yield, 0);
    const p = parse(st.price, 0);
    const w = parse(st.af, 0);
    const o = parse(st.other, 0);
    return { c, a, y, p, w, o, revenue: a * y * p, waterAF: a * w, otherCost: a * o };
  });
  const planted = rows.reduce((s, r) => s + r.a, 0);
  const waterUsed = rows.reduce((s, r) => s + r.waterAF, 0);
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const otherCost = rows.reduce((s, r) => s + r.otherCost, 0);
  const includedWater = farmAcres * incAF;
  const extraWater = Math.max(0, waterUsed - includedWater);
  const waterBill = farmAcres * assess + extraWater * extra;
  const inputTotal = INPUTS.reduce((s, i) => {
    const st = state.inputs[i.id] || {};
    return s + parse(st.price, 0) * parse(st.qty, 0);
  }, 0);
  const addedInputs = state.includeInputs ? inputTotal : 0;
  const totalCost = otherCost + waterBill + addedInputs;
  const profit = revenue - totalCost;
  const profitAc = planted > 0 ? profit / planted : null;
  const profitAf = waterUsed > 0 ? profit / waterUsed : null;
  const overAcres = planted - farmAcres;
  const overWater = waterUsed - allocation;
  const overPlan = overAcres > 0.001 || overWater > 0.001;
  const ranked = rows.map((r) => {
    const waterShare = waterUsed > 0 ? (r.waterAF / waterUsed) * waterBill : 0;
    const inputShare = planted > 0 && state.includeInputs ? (r.a / planted) * addedInputs : 0;
    const cost = r.otherCost + waterShare + inputShare;
    const net = r.revenue - cost;
    const perA = r.a > 0 ? net / r.a : null;
    const perW = r.waterAF > 0 ? net / r.waterAF : null;
    return { ...r, cost, net, perA, perW };
  }).sort((a, b) => (b.perW ?? -1e12) - (a.perW ?? -1e12));
  return { farmAcres, assess, incAF, extra, allocation, rows, planted, waterUsed, revenue, otherCost, includedWater, extraWater, waterBill, inputTotal, addedInputs, totalCost, profit, profitAc, profitAf, overAcres, overWater, overPlan, ranked };
}

function loanSheet() {
  const sum = planSummary();
  const loanAmt = Number(state.loanAmount) || 0;
  const loanRate = (Number(state.loanRate) || 0) / 100;
  const loanTerm = Number(state.loanTerm) || 0;
  const interest = loanAmt * loanRate * (loanTerm / 12);
  const debtService = loanAmt + interest;
  const coverage = debtService > 0 ? (sum.profit + interest) / debtService : null;
  return { loanAmt, loanRate, loanTerm, interest, debtService, coverage, sum };
}

/* ---------- Gauges ---------- */
function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}
function gaugeSVG(value, min, max, label, display, { invert = false, caption = "" } = {}) {
  const start = 135, sweep = 270;
  const tval = Math.max(0, Math.min(1, (Number(value) - min) / (max - min || 1)));
  const angle = start + tval * sweep;
  const cx = 80, cy = 86, r = 58;
  const finite = Number.isFinite(Number(value));
  const color = !finite
    ? "#8a7f70"
    : invert
      ? (tval > 0.85 ? "#e07a6a" : tval > 0.6 ? "#e3b15a" : "#c49a6c")
      : (tval > 0.66 ? "#c49a6c" : tval > 0.33 ? "#e3b15a" : "#e07a6a");
  const [nx, ny] = polar(cx, cy, r - 14, angle);
  const [hx, hy] = polar(cx, cy, 10, angle + 180);
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const a = start + (sweep * i) / 10;
    const major = i % 2 === 0;
    const [x1, y1] = polar(cx, cy, r - (major ? 4 : 1), a);
    const [x2, y2] = polar(cx, cy, r - (major ? 14 : 9), a);
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${major ? "#ECDEC8" : "#8a7a68"}" stroke-width="${major ? 2 : 1}"/>`;
  }
  return `<div class="gauge">
    <svg viewBox="0 0 160 148" width="100%" aria-hidden="true">
      <circle cx="${cx}" cy="${cy}" r="72" fill="#0d1520" stroke="#8a6a45" stroke-width="5"/>
      <circle cx="${cx}" cy="${cy}" r="66" fill="none" stroke="#2a3a50" stroke-width="7"/>
      <path d="${arcPath(cx, cy, r, start, start + sweep)}" fill="none" stroke="#2A3F5F" stroke-width="8" stroke-linecap="round"/>
      <path d="${arcPath(cx, cy, r, start, start + tval * sweep)}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>
      ${ticks}
      <line x1="${hx}" y1="${hy}" x2="${nx}" y2="${ny}" stroke="#ECDEC8" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="6" fill="#A97F5B" stroke="#ECDEC8" stroke-width="1"/>
      <text x="${cx}" y="138" text-anchor="middle" fill="#ECDEC8" font-size="15" font-weight="700" font-family="IBM Plex Mono, ui-monospace, monospace">${display}</text>
    </svg>
    <div class="g-label">${label}</div>
    ${caption ? `<div class="g-caption">${caption}</div>` : ""}
  </div>`;
}

function renderCab() {
  const sum = planSummary();
  const diesel = DIESEL.eiaWestCoastLessCA;
  const usedPct = sum.allocation > 0 ? (sum.waterUsed / sum.allocation) * 100 : null;
  if (!$("gauges")) {
    renderCommand();
    return;
  }
  $("gauges").innerHTML = [
    gaugeSVG(diesel, 3, 9, "AZ ag diesel", money(diesel, 3) + "/gal", { invert: true, caption: "EIA regional · West Coast less CA · on-highway, not a bunker price · week of " + DIESEL.weekOf + " " + kindFlag("sourced") }),
    gaugeSVG(AZMET_SNAPSHOT.soil4F, 32, 100, "Soil temperature", `${num(AZMET_SNAPSHOT.soil4F, 1)}°F`, { invert: false, caption: "AZMET Yuma Valley, 4 in. · " + AZMET_SNAPSHOT.date + " snapshot " + kindFlag("sourced") }),
    gaugeSVG(usedPct ?? 0, 0, 120, "Water vs allocation", usedPct == null ? "Enter cap" : `${num(usedPct, 0)}%`, { invert: true, caption: `${num(sum.waterUsed, 1)} AF used of ${num(sum.allocation, 0)} AF district cap` }),
  ].join("");
  const el = $("hero-profit");
  const ok = sum.profitAf != null;
  const cls = !ok ? "" : sum.profitAf >= 0 ? "good" : "bad";
  el.innerHTML = `
    <div class="eyebrow">Profit per acre-foot</div>
    <div class="money ${cls}">${ok ? money(sum.profitAf, 0) : "—"}</div>
    <div class="sub">per acre-foot of water used · per acre ${sum.profitAc == null ? "—" : money(sum.profitAc, 0)} · whole-farm ${money(sum.profit, 0)}</div>
    <div class="sub">${num(sum.planted, 0)} ac planted · ${num(sum.waterUsed, 1)} AF of ${num(sum.allocation, 0)} AF cap</div>
  `;
  const d = districtById(state.districtId);
  const yumaish = d && ["ycwua","ymidd","wmidd","unitb","ngila","sgila"].includes(d.id);
  $("rain-panel").innerHTML = `
    <div class="lcd">
      <div class="lcd-label">Rain total · irrigation district</div>
      <div class="lcd-value">${num(AZMET_SNAPSHOT.rainIn, 2)} <span>in</span></div>
      <div class="lcd-sub">${d ? d.name : "—"} · ${AZMET_SNAPSHOT.date} daily</div>
      <div class="lcd-note">${yumaish ? "AZMET Yuma Valley (az02) snapshot, used as the Yuma-area rain readout." : "No live rain feed is wired for this district. Figure shown is the AZMET Yuma Valley (az02) snapshot, not this district’s station."} ${kindFlag("sourced")}</div>
    </div>
    <div class="lcd">
      <div class="lcd-label">Last measurable rain</div>
      <div class="lcd-value lcd-date">${AZMET_SNAPSHOT.lastRain.replace(", ", "<br>")}</div>
      <div class="lcd-sub">AZMET Yuma Valley · Oct 10–Nov 9 table</div>
      <div class="lcd-note">Snapshot, not a live station feed. Air ${num(AZMET_SNAPSHOT.maxF, 1)}° / ${num(AZMET_SNAPSHOT.minF, 1)}°F · soil 20 in. ${num(AZMET_SNAPSHOT.soil20F, 1)}°F.</div>
    </div>
  `;
  const over = $("water-warning");
  if (sum.overPlan) {
    over.className = "callout bad";
    over.hidden = false;
    over.innerHTML = `<strong>This plan is over the cap.</strong> Planted acres are ${num(sum.planted, 1)} of ${num(sum.farmAcres, 1)} farm acres. Planned water is ${num(sum.waterUsed, 1)} AF of a ${num(sum.allocation, 1)} AF allocation. Cut acres or shift to lower-water crops before treating this as a decision.`;
  } else {
    over.hidden = true;
  }
  const img = $("cab-goes");
  if (img && !img.dataset.bound) {
    img.dataset.bound = "1";
    img.addEventListener("error", () => {
      if (img.dataset.fallback === "done") {
        img.replaceWith(Object.assign(document.createElement("p"), { className: "muted", textContent: "Satellite image could not be loaded. Use the NESDIS links on the Sources tab." }));
        return;
      }
      img.dataset.fallback = "done";
      img.src = GOES.sp19_1200;
    });
  }
}

function spark(values, color) {
  if (!values?.length) return "";
  const w = 160, h = 36, pad = 2;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"/></svg>`;
}

function tickerItems() {
  return [
    { k: "Class III", v: "$15.16/cwt", d: "Oct 2026 final · CLS-1026 Nov 4" },
    { k: "Class IV", v: "$20.54/cwt", d: "Oct 2026 final · CLS-1026 Nov 4" },
    { k: "AZ Order 131 Class I", v: "$22.87/cwt", d: "November · DMN Vol. 93 Rpt 45" },
    { k: "AZ all-milk", v: "$19.00/cwt", d: "Sept 2026 · NASS agpr1026" },
    { k: "Iceberg 24s", v: "$27.75–$30.75", d: "WA film-wrapped · IX_FV120 Nov 10" },
    { k: "Romaine 24s", v: "$24.75–$27.75", d: "Western AZ · IX_FV120 Nov 10" },
    { k: "Hearts 12 3-ct", v: "$27.50–$30.75", d: "Western AZ · IX_FV120 Nov 10" },
    { k: "Alfalfa hay", v: "$210/ton", d: "AZ prices received Sept · NASS" },
    { k: "Steers 750 lb", v: "$342.66/cwt", d: "AMS_2940 week ending Oct 30" },
    { k: "Steers 800 lb", v: "$325.48/cwt", d: "Southwest direct, not a single AZ auction" },
    { k: "Tomatoes", v: "no WA FOB", d: "IX_FV120 Nov 10 · enter a shed price" },
    { k: "Diesel", v: "$6.429/gal", d: "EIA West Coast less CA, week of Nov 9" },
    { k: "Cotton (ref.)", v: "$0.733/lb", d: "U.S. upland Sept · not a local board" },
    { k: "Wheat (ref.)", v: "$6.30/bu", d: "U.S. all wheat Sept · not a local board" },
  ];
}

function renderTicker() {
  const el = $("ticker-track");
  if (!el) return;
  const html = tickerItems().map((x) => `<span class="ticker-item"><span class="ticker-k">${x.k}</span><span class="ticker-v">${x.v}</span><span class="ticker-d">${x.d}</span></span>`).join("");
  el.innerHTML = html + html;
}

function renderCommand() {
  renderTicker();
  const sum = planSummary();
  const kpi = $("kpi-grid");
  if (kpi) {
    kpi.innerHTML = `
      <div class="kpi"><div class="k">Class III milk</div><div class="v">$${DAIRY.classIII.value.toFixed(2)}</div>${spark(DAIRY.classIIISpark, "#A97F5B")}<div class="s">${DAIRY.classIII.month} · ${DAIRY.classIII.change < 0 ? "" : "+"}$${DAIRY.classIII.change.toFixed(2)} · ${DAIRY.classIII.source}</div></div>
      <div class="kpi"><div class="k">Class IV milk</div><div class="v">$${DAIRY.classIV.value.toFixed(2)}</div>${spark(DAIRY.classIVSpark, "#ECDEC8")}<div class="s">${DAIRY.classIV.month} · +$${DAIRY.classIV.change.toFixed(2)} · AMS CLS-1026</div></div>
      <div class="kpi"><div class="k">AZ Order 131 Class I</div><div class="v">$${DAIRY.azOrder131.novClassI.toFixed(2)}</div><div class="s">November announced · Oct was $${DAIRY.azOrder131.octClassI.toFixed(2)} · differential $${DAIRY.azOrder131.differential.toFixed(2)} · ${DAIRY.azOrder131.source}</div></div>
      <div class="kpi"><div class="k">Profit per acre-foot</div><div class="v">${sum.profitAf == null ? "—" : money(sum.profitAf, 0)}</div><div class="s">From the current zone plan · per acre ${sum.profitAc == null ? "—" : money(sum.profitAc, 0)} · ${num(sum.planted, 0)} ac planted</div></div>
    `;
  }
  const map = $("az-map");
  if (map && !map.dataset.drawn) {
    map.dataset.drawn = "1";
    const base = `<path d="M 20 18 L 168 18 L 200 118 L 188 214 L 28 218 L 12 140 L 20 80 Z" fill="#182840" stroke="#A97F5B" stroke-width="2"/>`;
    map.innerHTML = base + ZONES.filter(z => z.id !== "az").map((z) =>
      `<path data-zone="${z.id}" d="${z.path}" fill="rgba(169,127,91,0.18)" stroke="#ECDEC8" stroke-width="1" style="cursor:pointer"><title>${z.name}</title></path>`
    ).join("");
    map.addEventListener("click", (e) => {
      const path = e.target.closest("[data-zone]");
      if (path) applyZone(path.getAttribute("data-zone"));
    });
  }
  document.querySelectorAll("#az-map [data-zone]").forEach((p) => {
    p.setAttribute("fill", p.getAttribute("data-zone") === state.zoneId ? "rgba(169,127,91,0.55)" : "rgba(169,127,91,0.18)");
  });
  const pills = $("zone-pills");
  if (pills) {
    pills.innerHTML = ZONES.map((z) =>
      `<button type="button" data-zone="${z.id}" aria-pressed="${state.zoneId === z.id ? "true" : "false"}">${z.name}</button>`
    ).join("");
    if (!pills.dataset.bound) {
      pills.dataset.bound = "1";
      pills.addEventListener("click", (e) => {
        const b = e.target.closest("[data-zone]");
        if (b) applyZone(b.getAttribute("data-zone"));
      });
    }
  }
  const blurb = $("zone-blurb");
  const z = ZONES.find((x) => x.id === state.zoneId) || ZONES[0];
  if (blurb) blurb.textContent = z.blurb;
}

function applyZone(id) {
  const z = ZONES.find((x) => x.id === id);
  if (!z) return;
  state.zoneId = id;
  if (z.districtId) applyDistrict(z.districtId);
  if (z.farmAcres) {
    state.farmAcres = String(z.farmAcres);
    const d = districtById(state.districtId);
    if (d) state.allocationAf = String(z.farmAcres * d.includedAF);
  }
  if (z.crops) {
    Object.entries(z.crops).forEach(([cid, acres]) => {
      if (!state.crops[cid]) state.crops[cid] = {};
      state.crops[cid].acres = String(acres);
    });
  }
  persist();
  renderCommand();
  const view = document.querySelector("nav button[aria-current='page']")?.dataset.view;
  if (view === "plan") renderPlan();
  else if (view === "dashboard") renderDashboard();
}

function renderDashboard() {
  renderCab();
  renderCommand();
  const markets = $("market-cards");
  if (markets) {
    markets.innerHTML = PRODUCE_CARDS.map((c) => `
      <div class="mcard"><div class="k">${c.name}</div><div class="v" style="font-size:28px;font-weight:700;margin:6px 0">${c.value}</div><div class="s">${c.range}<br>${c.source}</div></div>
    `).join("") + `
      <div class="mcard"><div class="k">Cattle · reference regional</div><div class="v" style="font-size:22px;font-weight:700;margin:6px 0">${CATTLE.steers.map(s => s.wt + " lb $" + s.price).join(" · ")}</div><div class="s">${CATTLE.report}. ${CATTLE.note}</div></div>
      <div class="mcard"><div class="k">Cotton (CME reference only)</div><div class="v" style="font-size:28px;font-weight:700;margin:6px 0">$${REFERENCE.cotton.value}/lb</div><div class="s">${REFERENCE.cotton.month}. ${REFERENCE.cotton.source}</div></div>
      <div class="mcard"><div class="k">Wheat (CME reference only)</div><div class="v" style="font-size:28px;font-weight:700;margin:6px 0">$${REFERENCE.wheat.value.toFixed(2)}/bu</div><div class="s">${REFERENCE.wheat.month}. ${REFERENCE.wheat.source}. ${REFERENCE.note}</div></div>
    `;
  }
  const dairy = $("dairy-box");
  if (dairy) {
    dairy.innerHTML = `
      <div class="mcard">
        <p><strong>Arizona is dairy-intensive.</strong> These are last-known announced Federal Milk Marketing Order and NASS prices, not a live CME cash ticker. November Class III and IV finals have not been announced (typically early December).</p>
        <p>Base Class I November $${DAIRY.baseClassI.value.toFixed(2)}/cwt (${DAIRY.baseClassI.source}). Advanced Class III skim $${DAIRY.advIIISkim.toFixed(2)}; Advanced Class IV skim $${DAIRY.advIVSkim.toFixed(2)}.</p>
        <p>Arizona all-milk September 2026 $${DAIRY.azAllMilk.value.toFixed(2)}/cwt, fat ${DAIRY.azAllMilk.fat}% (August $${DAIRY.azAllMilk.aug.toFixed(2)}; September 2025 $${DAIRY.azAllMilk.yearAgo.toFixed(2)}). Milk cows October 2026 $${DAIRY.azCows.value.toLocaleString()}/head. ${DAIRY.azAllMilk.source}.</p>
        <p class="s">${DAIRY.note}</p>
      </div>`;
  }
  const border = $("border-cards");
  if (border) {
    border.innerHTML = BORDER_LINES.map((b) => `
      <div class="mcard"><div class="k">${b.port}</div><div class="v" style="font-size:22px;font-weight:700;margin:6px 0">${b.crop}</div><div class="s">Season-to-date ${b.std.toLocaleString()} ${b.unit} · that week ${b.week}</div></div>
    `).join("") + `<p class="s" style="grid-column:1/-1">${BORDER_NOTE}</p>`;
  }
  $("context-cards").innerHTML = CONTEXT_STATS.map((s) => `
    <div class="card"><div class="stat">${s.value}</div><h3>${s.label}</h3><p class="muted">${s.source}</p></div>
  `).join("");
  $("import-box").innerHTML = `
    <div class="callout warn"><strong>Mexico import share — do not use an unverified 80% claim.</strong> ${IMPORT_REALITY.jimClaim}</div>
    <ul class="muted">${IMPORT_REALITY.sourced.map((x) => `<li>${x}</li>`).join("")}</ul>
  `;
  $("diesel-readout").innerHTML = `
    <div class="card">
      <h3>Arizona-relevant diesel feed</h3>
      <div class="stat">${money(DIESEL.eiaWestCoastLessCA, 3)}/gal</div>
      <p class="muted">EIA West Coast less California, week of ${DIESEL.weekOf}, released ${DIESEL.released}. ${kindFlag("sourced")}</p>
      <p class="muted">${DIESEL.series}</p>
      <p class="muted">${DIESEL.illinoisNote}</p>
    </div>
  `;
}

function renderPlan() {
  renderCab();
  const d = districtById(state.districtId);
  const sum = planSummary();
  $("district-select").innerHTML = DISTRICTS.map((x) => `<option value="${x.id}" ${x.id === state.districtId ? "selected" : ""}>${x.name}</option>`).join("");
  $("farm-name").value = state.farmName || "";
  $("farm-acres").value = state.farmAcres ?? "";
  $("assessment").value = state.assessment ?? "";
  $("included-af").value = state.includedAF ?? "";
  $("extra-af").value = state.extraAF ?? "";
  $("alloc-af").value = state.allocationAf ?? "";
  $("district-note").innerHTML = d ? `${kindFlag(d.costKind)} ${d.region}. ${d.note} Source: ${d.source}.` : "";
  $("plan-metrics").innerHTML = `
    <div class="card"><div class="stat">${num(sum.planted, 1)}</div><h3>Planted acres</h3><p class="muted">of ${num(sum.farmAcres, 1)} farm acres</p></div>
    <div class="card"><div class="stat">${num(sum.waterUsed, 1)} AF</div><h3>Water planned</h3><p class="muted">of ${num(sum.allocation, 1)} AF cap</p></div>
    <div class="card"><div class="stat">${money(sum.waterBill, 0)}</div><h3>District water bill</h3><p class="muted">${money(sum.assess, 2)}/ac + ${num(sum.extraWater, 1)} extra AF × ${money(sum.extra, 2)}</p></div>
    <div class="card"><div class="stat">${sum.profitAf == null ? "—" : money(sum.profitAf, 0)}</div><h3>Headline profit / AF</h3></div>
  `;

  const profitMap = Object.fromEntries(sum.ranked.map((r) => [r.c.id, r]));
  $("plan-table").innerHTML = `
    <thead><tr>
      <th>Crop</th><th class="num">Acres</th><th class="num">Yield</th>
      <th class="num">Price $</th><th class="num">AF/acre</th><th class="num">Non-water $/acre</th>
      <th class="num">Revenue</th><th class="num">Water AF</th>
      <th class="num">Profit/acre*</th><th class="num">Profit/AF*</th>
    </tr></thead>
    <tbody>
      ${sum.rows.map((r) => {
        const p = profitMap[r.c.id];
        const st = state.crops[r.c.id];
        return `<tr>
          <td>${r.c.name}<div class="muted">${r.c.unit} · ${kindFlag(r.c.priceKind)} price · ${kindFlag(r.c.yieldKind)} yield · ${kindFlag(r.c.waterKind)} water</div></td>
          <td class="num"><input type="number" min="0" step="0.1" data-crop="${r.c.id}" data-k="acres" value="${st.acres}"></td>
          <td class="num"><input type="number" min="0" step="0.01" data-crop="${r.c.id}" data-k="yield" value="${st.yield}"></td>
          <td class="num"><input type="number" min="0" step="0.01" data-crop="${r.c.id}" data-k="price" value="${st.price}"></td>
          <td class="num"><input type="number" min="0" step="0.01" data-crop="${r.c.id}" data-k="af" value="${st.af}"></td>
          <td class="num"><input type="number" min="0" step="0.01" data-crop="${r.c.id}" data-k="other" value="${st.other}"></td>
          <td class="num">${money(r.revenue, 0)}</td>
          <td class="num">${num(r.waterAF, 1)}</td>
          <td class="num">${p && p.perA != null ? money(p.perA, 0) : "—"}</td>
          <td class="num">${p && p.perW != null ? money(p.perW, 0) : "—"}</td>
        </tr>`;
      }).join("")}
    </tbody>
    <tfoot><tr>
      <th>Plan total</th>
      <th class="num">${num(sum.planted, 1)}</th>
      <th colspan="3"></th>
      <th></th>
      <th class="num">${money(sum.revenue, 0)}</th>
      <th class="num">${num(sum.waterUsed, 1)} AF</th>
      <th class="num">${money(sum.profit, 0)}</th>
      <th class="num">${sum.profitAf == null ? "—" : money(sum.profitAf, 0)}</th>
    </tr></tfoot>
  `;
  $("crop-notes").innerHTML = `<p class="muted">Tomato price defaults to $0 because no Western Arizona tomato FOB appeared on the Nov 9 shipping-point report. Carrot price starts from a Kern County, California quote, not a Yuma quote. Alfalfa price starts at Jim’s $135/ton example; NASS Arizona alfalfa was $210/ton in September 2026. Starred profit columns allocate the district water bill, and input-line totals if that toggle is on, in proportion to water use or acres. Planning split only, not an audit.</p>` +
    CROPS.map((c) => `<div class="card"><h3>${c.name}</h3>
      <p class="muted"><strong>Price.</strong> ${c.priceNote}</p>
      <p class="muted"><strong>Yield.</strong> ${c.yieldNote}</p>
      <p class="muted"><strong>Water.</strong> ${c.waterNote}</p>
      <p class="muted"><strong>Non-water cost.</strong> ${c.otherNote}</p></div>`).join("");

  $("input-table").innerHTML = `
    <thead><tr><th>Input</th><th>Supplier / sponsor slot</th><th class="num">Quoted price</th><th class="num">Quantity</th><th class="num">Line total</th><th>Tier slot</th></tr></thead>
    <tbody>${INPUTS.map((i) => {
      const st = state.inputs[i.id];
      const line = parse(st.price, 0) * parse(st.qty, 0);
      return `<tr>
        <td>${i.name}</td>
        <td><input type="text" data-inp="${i.id}" data-k="supplier" value="${st.supplier || ""}" placeholder="Enter supplier"></td>
        <td class="num"><input type="number" min="0" step="0.001" data-inp="${i.id}" data-k="price" value="${st.price}"></td>
        <td class="num"><input type="number" min="0" step="0.01" data-inp="${i.id}" data-k="qty" value="${st.qty}"></td>
        <td class="num">${money(line, 0)}</td>
        <td class="sponsor-slot">${i.sponsor}</td>
      </tr>`;
    }).join("")}
    <tr>
      <td>Irrigation (district bill)</td>
      <td>Selected irrigation district</td>
      <td class="num">${money(sum.waterUsed > 0 ? sum.waterBill / sum.waterUsed : 0, 2)} / AF equiv.</td>
      <td class="num">${num(sum.waterUsed, 1)} AF planned</td>
      <td class="num">${money(sum.waterBill, 0)}</td>
      <td class="sponsor-slot">Saguaro / water or lender slot</td>
    </tr></tbody>`;
  $("include-inputs").checked = !!state.includeInputs;
  $("jim-alfalfa").checked = !!state.useJimAlfalfa;
  const tomatoZero = parse(state.crops.tomatoes?.price, 0) === 0 && parse(state.crops.tomatoes?.acres, 0) > 0;
  const carrotZero = parse(state.crops.carrots?.price, 0) === 0 && parse(state.crops.carrots?.acres, 0) > 0;
  if (tomatoZero || carrotZero) {
    $("tomato-warning").hidden = false;
    $("tomato-warning").innerHTML = `<strong>Tomato and carrot prices start at $0.</strong> No Western Arizona tomato or carrot FOB was on the Nov 10 shipping-point report (IX_FV120), so those revenue lines stay at zero until you enter a contract or shed price.`;
  } else {
    $("tomato-warning").hidden = true;
  }
}

function renderOpportunity() {
  renderCab();
  const sum = planSummary();
  const profitMap = Object.fromEntries(sum.ranked.map((r) => [r.c.id, r]));
  $("opp-cards").innerHTML = CROPS.map((c) => {
    const r = profitMap[c.id];
    const inPlan = r && r.a > 0;
    const p = inPlan ? r.perW : null;
    const cls = p == null ? "" : p >= 0 ? "good" : "bad";
    return `<article class="${inPlan && p != null && r === sum.ranked.find((x) => x.a > 0) ? "best" : ""}">
      <div class="muted">${c.group === "produce" ? "Higher-value / typically lower-water class" : "Often water-intensive field crop"} · ${c.season}</div>
      <h3>${c.name}</h3>
      <div class="paf ${cls}">${inPlan && p != null ? money(p, 0) : "Not in plan"}<span class="muted" style="font-size:13px"> / AF</span></div>
      <div class="muted">Per acre ${inPlan && r.perA != null ? money(r.perA, 0) : "—"} · Starting price ${money(parse(state.crops[c.id].price, 0), 2)} · ${num(parse(state.crops[c.id].af, 0), 1)} AF/ac</div>
      <p class="muted">${c.priceNote}</p>
      <p class="muted">${c.importNote}</p>
      <p class="muted">${c.otherNote}</p>
    </article>`;
  }).join("");
  $("import-box-cards").innerHTML = `
    <div class="callout warn"><strong>What the sources actually say.</strong> ${IMPORT_REALITY.jimClaim}</div>
    <ul class="muted">${IMPORT_REALITY.sourced.map((x) => `<li>${x}</li>`).join("")}</ul>
    <p class="muted">The useful decision point is commodity-specific: tomatoes and several other winter vegetables are import-heavy, while U.S. (including Yuma) lettuce still supplies most domestic availability.</p>
  `;
}

function renderLender() {
  renderCab();
  const { loanAmt, loanRate, loanTerm, interest, debtService, coverage, sum } = loanSheet();
  $("loan-amount").value = state.loanAmount;
  $("loan-rate").value = state.loanRate;
  $("loan-years").value = state.loanTerm;
  $("lender-metrics").innerHTML = `
    <div class="card"><div class="stat">${money(sum.revenue, 0)}</div><h3>Plan revenue</h3></div>
    <div class="card"><div class="stat">${money(sum.totalCost, 0)}</div><h3>Plan costs</h3><p class="muted">Crop operating + district water${state.includeInputs ? " + input lines" : ""}</p></div>
    <div class="card"><div class="stat">${money(sum.profit, 0)}</div><h3>Plan profit</h3><p class="muted">${money(sum.profitAc, 0)}/acre · ${sum.profitAf == null ? "—" : money(sum.profitAf, 0)}/AF</p></div>
    <div class="card"><div class="stat">${coverage == null ? "—" : num(coverage, 2) + "×"}</div><h3>Simple coverage of principal-plus-interest</h3><p class="muted">(profit + displayed interest) ÷ (principal + interest). Interest ${money(interest, 0)} · principal plus interest ${money(debtService, 0)}. Typed rate, not an AgWest quote.</p></div>
  `;
  const inPlan = sum.ranked.filter((r) => r.a > 0);
  $("lender-path").innerHTML = `
    <div class="callout">
      <strong>Recommended path (board math only, not advice).</strong>
      ${inPlan[0] && inPlan[0].perW != null ? `On the current assumptions, ${inPlan[0].c.name} shows the highest profit per acre-foot among crops in this plan at ${money(inPlan[0].perW, 0)}/AF.` : "Enter water and prices so the board can rank crops."}
      Allocation cap is ${num(sum.allocation, 1)} AF.
    </div>
    <p class="muted">Built for an AgWest-type operating-loan conversation. Not a loan application, quote, or commitment. AgWest’s published operating-loan product notes (as cited in the financing memo) include revolving and non-revolving structures, 1- to 3-year terms, variable rates, and no prepayment fee. Farm Credit Arizona figures cited in that memo — 1,127 Arizona customers, $3.4 billion in Arizona loan volume, and $25.6 million in patronage dividends as of December 31, 2024 — come from Farm Credit’s Arizona at a glance and are not a credit decision about this farm or about Ag Compass.</p>
  `;
  $("lender-table").innerHTML = `
    <thead><tr><th>Rank</th><th>Crop</th><th class="num">Acres</th><th class="num">Profit / acre</th><th class="num">Profit / AF</th></tr></thead>
    <tbody>${inPlan.map((r, i) => `<tr>
      <td>${i + 1}</td><td>${r.c.name}</td><td class="num">${num(r.a, 1)}</td>
      <td class="num">${r.perA == null ? "—" : money(r.perA, 0)}</td>
      <td class="num">${r.perW == null ? "—" : money(r.perW, 0)}</td>
    </tr>`).join("")}</tbody>`;
}

function renderSponsors() {
  renderCab();
  $("tiers").innerHTML = SPONSOR_TIERS.map((t) => `
    <div class="card">
      <h3>${t.name}</h3>
      <p class="muted">${t.level}</p>
      <div class="stat">${money(t.year1, 0)} <span class="muted" style="font-size:13px">Y1 assumption</span></div>
      <p class="muted">${t.note} ${kindFlag("assumption")}</p>
    </div>
  `).join("");
  const rows = FORECAST.years;
  const tot = (y) => y.subs + y.sponsors + y.ads;
  const three = rows.reduce((s, y) => s + tot(y), 0);
  $("forecast-table").innerHTML = `
    <thead><tr><th>Stream</th>${rows.map((y) => `<th class="num">${y.year}</th>`).join("")}<th class="num">3-year</th><th>Basis</th></tr></thead>
    <tbody>
      <tr><td>Farmer subscriptions (new, low buy-in)</td>
        ${rows.map((y) => `<td class="num">${money(y.subs, 0)}<div class="muted">${y.subsAccounts} paid farms</div></td>`).join("")}
        <td class="num">${money(rows.reduce((s, y) => s + y.subs, 0), 0)}</td>
        <td>${FORECAST.subscriptionNote}</td></tr>
      <tr><td>Advertising / inventory</td>
        ${rows.map((y) => `<td class="num">${money(y.ads, 0)}</td>`).join("")}
        <td class="num">${money(rows.reduce((s, y) => s + y.ads, 0), 0)}</td>
        <td>Same dollar path as the financing memo’s advertising line, still a forecast.</td></tr>
      <tr><td>Sponsor packages (new mix)</td>
        ${rows.map((y) => `<td class="num">${money(y.sponsors, 0)}</td>`).join("")}
        <td class="num">${money(rows.reduce((s, y) => s + y.sponsors, 0), 0)}</td>
        <td>See tier assumptions. No sponsor is signed.</td></tr>
      <tr><th>New-model total</th>
        ${rows.map((y) => `<th class="num">${money(tot(y), 0)}</th>`).join("")}
        <th class="num">${money(three, 0)}</th>
        <td>Illustrative. Lower than the old $1.09M three-year total because subscriptions were cut sharply.</td></tr>
    </tbody>`;
  const o = FORECAST.oldDoc;
  $("old-forecast").innerHTML = `
    <p class="muted">${FORECAST.note}</p>
    <table>
      <thead><tr><th>Institutional Financing PDF (subscription-led)</th><th class="num">Year 1</th><th class="num">Year 2</th><th class="num">Year 3</th><th class="num">3-year</th></tr></thead>
      <tbody>
        <tr><td>User subscriptions</td><td class="num">${money(o.y1.subs, 0)}</td><td class="num">${money(o.y2.subs, 0)}</td><td class="num">${money(o.y3.subs, 0)}</td><td class="num">${money(o.y1.subs + o.y2.subs + o.y3.subs, 0)}</td></tr>
        <tr><td>Advertising / sponsor inventory</td><td class="num">${money(o.y1.ads, 0)}</td><td class="num">${money(o.y2.ads, 0)}</td><td class="num">${money(o.y3.ads, 0)}</td><td class="num">${money(o.y1.ads + o.y2.ads + o.y3.ads, 0)}</td></tr>
        <tr><td>Primary sponsor packages</td><td class="num">${money(o.y1.primary, 0)}</td><td class="num">${money(o.y2.primary, 0)}</td><td class="num">${money(o.y3.primary, 0)}</td><td class="num">${money(o.y1.primary + o.y2.primary + o.y3.primary, 0)}</td></tr>
        <tr><th>Total</th><th class="num">${money(o.y1.total, 0)}</th><th class="num">${money(o.y2.total, 0)}</th><th class="num">${money(o.y3.total, 0)}</th><th class="num">${money(o.threeYear, 0)}</th></tr>
      </tbody>
    </table>
    <p class="muted">${o.source} The new Year 1 total is lower than the memo on purpose: the old plan asked farmers to carry the revenue. Until a founding sponsor is signed, treat Year 1 sponsor dollars as a target, not cash. The $150,000 AgWest facility request in that memo is a later, separate conversation, not a commitment.</p>
  `;
  $("sponsor-line").value = state.sponsorLine || "";
  $("mailer-box").innerHTML = `
    <div class="mailer-card">
      <img src="assets/mailer-qr.svg" width="196" height="196" alt="Illustrative QR code for Ag Compass mailer tracking code ${MAILER.code}">
      <div>
        <h3>Tracking code ${MAILER.code}</h3>
        <p class="muted">${MAILER.status}</p>
        <p class="muted">QR payload (illustrative until a public host URL is chosen): “${MAILER.payload}”</p>
        <p><a href="setup.html?src=${encodeURIComponent(MAILER.code)}">Open the desktop / laptop setup page</a> (this is the page a hosted QR would open).</p>
      </div>
    </div>
  `;
}

function renderSources() {
  renderCab();
  $("source-list").innerHTML = SOURCES.map((s) => `
    <div class="card"><h3>${s.title}</h3><p class="muted">${s.detail}</p></div>
  `).join("");
}

function buildReport(kind) {
  const { loanAmt, loanRate, loanTerm, interest, debtService, coverage, sum } = loanSheet();
  const d = districtById(state.districtId);
  const inPlan = sum.ranked.filter((r) => r.a > 0);
  let html = `
    <div class="report-brand">
      <img src="assets/ag_compass_logo.png" width="48" height="48" alt="Ag Compass logo">
      <div>
        <div class="report-name">Ag Compass</div>
        <p class="tag">Leave the drought to nature, not your bank account.</p>
      </div>
    </div>
    <div class="sponsor-strip">
      <div><div class="eyebrow">Sponsor slot</div>${state.sponsorLine}</div>
      <div class="muted">Mailer code ${MAILER.code}<br>Concept -- not a live tracker</div>
    </div>
    <p class="muted">${BUILD.disclaimer}</p>
    <p><strong>${state.farmName}</strong> · ${d ? d.name : ""} · Printed ${BUILD.dateLabel} · ${kind === "farmer" ? "Farmer crop-plan report" : "Lender budget and loan worksheet"}</p>
    <div class="cards">
      <div class="card"><div class="stat">${sum.profitAf == null ? "—" : money(sum.profitAf, 0)}</div><h3>Profit per acre-foot</h3></div>
      <div class="card"><div class="stat">${sum.profitAc == null ? "—" : money(sum.profitAc, 0)}</div><h3>Profit per acre</h3></div>
      <div class="card"><div class="stat">${money(sum.profit, 0)}</div><h3>Plan profit</h3></div>
      <div class="card"><div class="stat">${num(sum.waterUsed, 1)} / ${num(sum.allocation, 0)} AF</div><h3>Water used / allocation</h3></div>
    </div>
    <p>Farm ${num(sum.farmAcres, 0)} acres · planted ${num(sum.planted, 0)} · water bill ${money(sum.waterBill, 0)} · revenue ${money(sum.revenue, 0)} · costs ${money(sum.totalCost, 0)}.</p>
    ${sum.overPlan ? "<p><strong>Plan exceeds the acre or water cap. Reallocate before presenting this report.</strong></p>" : ""}
    <h2>Crop plan</h2>
    <table><thead><tr><th>Crop</th><th class="num">Acres</th><th class="num">Yield</th><th class="num">Price</th><th class="num">AF/ac</th><th class="num">Revenue</th><th class="num">Water AF</th><th class="num">Profit/ac*</th><th class="num">Profit/AF*</th></tr></thead><tbody>
    ${inPlan.map((r) => `<tr><td>${r.c.name}</td><td class="num">${num(r.a, 1)}</td><td class="num">${num(r.y, 2)} ${r.c.unit}</td><td class="num">${money(r.p, 2)}</td><td class="num">${num(r.w, 2)}</td><td class="num">${money(r.revenue, 0)}</td><td class="num">${num(r.waterAF, 1)}</td><td class="num">${r.perA == null ? "—" : money(r.perA, 0)}</td><td class="num">${r.perW == null ? "—" : money(r.perW, 0)}</td></tr>`).join("")}
    </tbody></table>
    <p class="muted">*Crop profit allocates the district water bill, and input-line totals if that toggle is on, in proportion to water use or acres. Planning split only, not an audit.</p>
  `;
  if (kind === "farmer") {
    html += `<h2>Opportunity cards (ranked by profit per acre-foot in this plan)</h2>
      <ol>${inPlan.map((r) => `<li><strong>${r.c.name}</strong> — ${r.perW == null ? "—" : money(r.perW, 0)} per AF. ${r.c.priceNote}</li>`).join("")}</ol>`;
  } else {
    html += `<h2>Operating-loan worksheet (illustrative — not an AgWest quote or commitment)</h2>
      <p>Requested operating loan ${money(loanAmt, 0)} · illustrative rate ${num(loanRate * 100, 2)}% · term ${num(loanTerm, 0)} months · estimated interest ${money(interest, 0)} · principal plus interest ${money(debtService, 0)} · plan profit ${money(sum.profit, 0)} · simple coverage ${coverage == null ? "—" : num(coverage, 2) + "×"}.</p>
      <p>Recommended path is the crop mix already entered, ranked by profit per acre-foot. Mention of AgWest does not imply endorsement, partnership, or approval.</p>`;
  }
  html += `<p class="muted">The sponsor line and mailer code are inventory and pitch placements. They are not an AgWest endorsement and they do not change the profit math. ${BUILD.disclaimer}</p>`;
  return html;
}

function printReport(kind) {
  $("print-body").innerHTML = buildReport(kind);
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("print-show", "active"));
  $("view-print").classList.add("active", "print-show");
  window.print();
}

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active", "print-show"));
  const el = $("view-" + name);
  if (el) el.classList.add("active");
  document.querySelectorAll("nav button[data-view]").forEach((b) => {
    b.setAttribute("aria-current", b.dataset.view === name ? "page" : "false");
  });
  const renderers = { dashboard: renderDashboard, plan: renderPlan, opportunity: renderOpportunity, lender: renderLender, sponsors: renderSponsors, sources: renderSources };
  renderers[name]?.();
  persist();
}

function render() {
  const current = document.querySelector("nav button[aria-current='page']")?.dataset.view || "dashboard";
  showView(current);
}

function bind() {
  document.querySelectorAll("nav button[data-view]").forEach((b) => {
    b.addEventListener("click", () => showView(b.dataset.view));
  });
  $("btn-demo").addEventListener("click", resetDemo);
  const sub = $("btn-subscribe");
  if (sub) sub.addEventListener("click", () => {
    const n = $("sub-note");
    if (n) n.hidden = !n.hidden;
  });
  $("btn-print-farmer").addEventListener("click", () => printReport("farmer"));
  $("btn-print-banker").addEventListener("click", () => printReport("lender"));

  $("district-select").addEventListener("change", (e) => {
    applyDistrict(e.target.value);
    persist(); renderPlan(); renderCab();
  });
  const bindVal = (id, key, ev = "input") => {
    $(id).addEventListener(ev, (e) => {
      const t = e.target;
      if (t.type === "checkbox") state[key] = t.checked;
      else if (t.type === "number") state[key] = t.value === "" ? "" : (["loanAmount", "loanRate", "loanTerm"].includes(key) ? Number(t.value) : t.value);
      else state[key] = t.value;
      if (key === "farmAcres") {
        const a = parse(t.value, 0);
        const inc = parse(state.includedAF, 0);
        if (inc > 0 && a > 0) state.allocationAf = String(a * inc);
      }
      if (key === "includedAF") {
        const inc = parse(t.value, 0);
        const a = parse(state.farmAcres, 0);
        if (inc > 0 && a > 0) state.allocationAf = String(a * inc);
      }
      if (key === "useJimAlfalfa") {
        const c = cropById("alfalfa");
        state.crops.alfalfa.price = t.checked ? String(c.jimPrice) : String(c.nassPrice);
      }
      persist();
      const view = document.querySelector("nav button[aria-current='page']")?.dataset.view;
      if (view === "plan") renderPlan();
      else if (view === "lender") renderLender();
      else if (view === "sponsors") renderSponsors();
      else render();
      renderCab();
    });
  };
  bindVal("farm-name", "farmName");
  bindVal("farm-acres", "farmAcres");
  bindVal("assessment", "assessment");
  bindVal("included-af", "includedAF");
  bindVal("extra-af", "extraAF");
  bindVal("alloc-af", "allocationAf");
  bindVal("include-inputs", "includeInputs", "change");
  bindVal("jim-alfalfa", "useJimAlfalfa", "change");
  bindVal("loan-amount", "loanAmount");
  bindVal("loan-rate", "loanRate");
  bindVal("loan-years", "loanTerm");
  bindVal("sponsor-line", "sponsorLine");

  $("plan-table").addEventListener("input", (e) => {
    const t = e.target;
    if (!t.dataset.crop) return;
    if (!state.crops[t.dataset.crop]) state.crops[t.dataset.crop] = {};
    state.crops[t.dataset.crop][t.dataset.k] = t.value;
    persist(); renderPlan(); renderCab();
  });
  $("input-table").addEventListener("input", (e) => {
    const t = e.target;
    if (!t.dataset.inp) return;
    if (!state.inputs[t.dataset.inp]) state.inputs[t.dataset.inp] = { supplier: "", price: "0", qty: "0" };
    state.inputs[t.dataset.inp][t.dataset.k] = t.value;
    persist(); renderPlan(); renderCab();
  });
}

bind();
showView("dashboard");
// Show mailer code if arriving from a QR/setup link
const params = new URLSearchParams(location.search);
if (params.get("src")) {
  const note = document.createElement("div");
  note.className = "callout good";
  note.innerHTML = `<strong>Mailer code ${params.get("src")}.</strong> This would be tallied once live tracking is hosted. Nothing is being counted on this local board.`;
  document.querySelector(".command .wrap")?.appendChild(note);
}
