import {
  PLANT_CROPS, PLANT_ZONES, DEMAND_META, PLANT_METHOD, PLANT_AS_OF, defaultEdits
} from "./plant-data.js";

const money0 = (n) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const money2 = (n) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const num = (n, d = 0) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const EDIT_KEYS = ["price", "yield", "af", "seed", "fert", "diesel", "labor", "irrig", "other"];
const EDIT_LABELS = {
  price: "Price",
  yield: "Yield / acre",
  af: "AF / acre",
  seed: "Seed",
  fert: "Fertilizer",
  diesel: "Diesel",
  labor: "Labor",
  irrig: "Irrigation",
  other: "Other"
};

function arrow(dir) {
  if (dir === "up") return { glyph: "▲", cls: "up", word: "Up" };
  if (dir === "down") return { glyph: "▼", cls: "down", word: "Down" };
  if (dir === "flat") return { glyph: "▬", cls: "flat", word: "Flat" };
  return { glyph: "–", cls: "none", word: "—" };
}

function srcMark(title) {
  const t = String(title || "").replace(/"/g, "&quot;");
  return `<sup class="plant-src" title="${t}">ⓘ</sup>`;
}

function demandBadge(d) {
  if (!d) return "";
  const a = arrow(d.dir);
  const date = d.dir ? `<span class="plant-demand-d">Nov 6</span>` : "";
  return `<span class="plant-demand ${a.cls}" title="${String(d.tip || "").replace(/"/g, "&quot;")}"><span class="plant-arrow">${a.glyph}</span>${date}</span>`;
}

function cropTip(c) {
  return [
    c.priceSrc, c.yieldSrc, c.waterSrc,
    c.seedSrc, c.fertSrc, c.dieselSrc, c.laborSrc, c.irrigSrc, c.otherSrc
  ].filter(Boolean).join(" ");
}

function inputsOf(e) {
  return (e.seed || 0) + (e.fert || 0) + (e.diesel || 0) + (e.labor || 0) + (e.irrig || 0) + (e.other || 0);
}

function compute(state) {
  const acres = Math.max(0, Number(state.acres) || 0);
  const allot = Math.max(0, Number(state.allot) || 0);
  const ranked = [];
  const pending = [];
  for (const c of PLANT_CROPS) {
    const e = state.edits[c.id] || defaultEdits()[c.id];
    const price = e.price;
    const yld = e.yield;
    const af = e.af;
    const d = c.demand || {};
    const canRank = price > 0 && yld > 0 && af > 0;
    if (!canRank) {
      pending.push({ c, d, e });
      continue;
    }
    const rev = price * yld;
    const inputs = inputsOf(e);
    const netA = rev - inputs;
    const netAF = af > 0 ? netA / af : null;
    const plantable = Math.min(acres, af > 0 ? allot / af : 0);
    const farm = netA * plantable;
    ranked.push({ c, d, e, rev, inputs, netA, netAF, plantable, farm, waterNeed: acres * af });
  }
  ranked.sort((a, b) => (b.netAF ?? -1e12) - (a.netAF ?? -1e12));
  return { ranked, pending, acres, allot };
}

function card(row, kind) {
  const label = kind === "best" ? "Best bet" : kind === "runner" ? "Runner-up" : "Avoid";
  const tip = cropTip(row.c);
  return `
    <article class="plant-card plant-card-${kind}" data-crop="${row.c.id}" data-kind="${kind}" title="${String(tip).replace(/"/g, "&quot;")}">
      <div class="plant-card-top">
        <span class="plant-badge">${label}</span>
        ${demandBadge(row.d)}
      </div>
      <h3 class="plant-crop">${row.c.name}${srcMark(tip)}</h3>
      <div class="plant-metric plant-metric-lead">
        <div class="plant-val">${money0(row.netAF)}</div>
        <div class="plant-unit">net / AF</div>
      </div>
      <div class="plant-split">
        <div><div class="plant-val-sm">${money0(row.netA)}</div><div class="plant-unit">net / acre</div></div>
        <div><div class="plant-val-sm">${money0(row.farm)}</div><div class="plant-unit">farm total</div></div>
        <div><div class="plant-val-sm">${num(row.plantable, 0)} ac</div><div class="plant-unit">within cap</div></div>
      </div>
    </article>`;
}

function rowHtml(row) {
  const tip = cropTip(row.c);
  return `
    <div class="plant-row" data-crop="${row.c.id}" title="${String(tip).replace(/"/g, "&quot;")}">
      <div class="plant-row-name">${row.c.name}${srcMark(tip)}</div>
      <div class="plant-row-v">${money0(row.netAF)}<span> / AF</span></div>
      <div class="plant-row-v">${money0(row.netA)}<span> / ac</span></div>
      <div class="plant-row-v">${money0(row.farm)}<span> farm</span></div>
      <div class="plant-row-v">${num(row.plantable, 0)} ac</div>
      <div class="plant-row-d">${demandBadge(row.d)}</div>
    </div>`;
}

function pendingHtml(p) {
  return `
    <div class="plant-pending" data-crop="${p.c.id}">
      <div class="plant-row-name">${p.c.name}${srcMark(p.c.priceSrc)}</div>
      <div class="plant-pending-note">No AZ FOB</div>
      <div class="plant-row-d">${demandBadge(p.d)}</div>
    </div>`;
}

function fieldVal(n) {
  if (n == null || !Number.isFinite(n)) return "";
  return String(n);
}

function cropOf(id) {
  return PLANT_CROPS.find((c) => c.id === id) || PLANT_CROPS[0];
}

function isDirtyFor(state, id) {
  const c = cropOf(id);
  const e = state.edits[id];
  if (!e) return false;
  return EDIT_KEYS.some((k) => Number(e[k]) !== Number(c[k]));
}

function isSample(state, id, key, value) {
  const flag = state.sampleFlags?.[id]?.[key];
  if (flag == null) return false;
  if (typeof flag === "number") return Number(value) === Number(flag);
  return String(value) === String(flag);
}

function collectSampleEdits(state) {
  const out = [];
  if (state.sampleFlags?.farmName && state.farmName && isSample(state, "farm", "name", state.farmName)) {
    out.push({ crop: "", cropId: "", key: "farm", label: "Farm name", value: state.farmName, display: state.farmName });
  }
  for (const c of PLANT_CROPS) {
    const e = state.edits[c.id] || {};
    for (const k of EDIT_KEYS) {
      if (isSample(state, c.id, k, e[k])) {
        const n = Number(e[k]);
        out.push({
          crop: c.name,
          cropId: c.id,
          key: k,
          label: EDIT_LABELS[k],
          value: n,
          display: k === "yield" || k === "af" ? num(n, 2) : money2(n)
        });
      }
    }
  }
  return out;
}

function snapshotOf(state) {
  const { ranked, pending, acres, allot } = compute(state);
  const zone = PLANT_ZONES.find((z) => z.id === state.zone) || PLANT_ZONES[0];
  const pack = (row) => ({
    id: row.c.id,
    name: row.c.name,
    unit: row.c.unit || "",
    price: row.e.price,
    yield: row.e.yield,
    af: row.e.af,
    netA: row.netA,
    netAF: row.netAF,
    plantable: row.plantable,
    farm: row.farm,
    demand: row.d?.dir || "",
    demandTip: row.d?.tip || "",
    fmt: {
      netA: money0(row.netA),
      netAF: money0(row.netAF),
      farm: money0(row.farm),
      plantable: num(row.plantable, 0),
      price: money2(row.e.price),
      yield: num(row.e.yield, 2),
      af: num(row.e.af, 2)
    }
  });
  return {
    farmName: (state.farmName || "").trim() || "Untitled farm",
    farmNameRaw: (state.farmName || "").trim(),
    zoneId: state.zone,
    zoneName: zone.name,
    acres,
    allot,
    selected: state.selected,
    ranked: ranked.map(pack),
    pending: pending.map((p) => ({ id: p.c.id, name: p.c.name, reason: "No AZ FOB" })),
    sampleEdits: collectSampleEdits(state),
    asOf: PLANT_AS_OF,
    demandMeta: `Southwest grocer demand · ${DEMAND_META.issued}`
  };
}

let api = null;

export function getPlantApi() {
  return api;
}

export function mountPlant(root) {
  if (!root) return;
  const state = {
    farmName: "",
    zone: "yuma",
    acres: 120,
    allot: 600,
    selected: "iceberg",
    edits: defaultEdits(),
    sampleFlags: {},
    srcOpen: false
  };

  function isDirty(id) {
    return isDirtyFor(state, id);
  }

  function render() {
    const { ranked, pending, acres, allot } = compute(state);
    const zoneName = (PLANT_ZONES.find((z) => z.id === state.zone) || PLANT_ZONES[0]).name;
    const best = ranked[0];
    const runner = ranked.length >= 3 ? ranked[1] : null;
    const avoid = ranked.length >= 2 ? ranked[ranked.length - 1] : null;
    const mid = ranked.length > 3 ? ranked.slice(2, -1) : [];
    const vs = ranked.find((r) => r.c.id === "alfalfa" && best && best.c.id !== "alfalfa") || avoid;
    const rec = best && vs
      ? `With ${num(allot, 0)} AF in ${zoneName}, ${best.c.name.toLowerCase()} nets about ${money0(best.netAF)}/AF vs ${vs.c.name.toLowerCase()} ${money0(vs.netAF)}/AF.`
      : "";

    const sel = cropOf(state.selected);
    const e = state.edits[sel.id];
    const dirty = isDirty(sel.id);
    const anyDirty = PLANT_CROPS.some((c) => isDirty(c.id));
    const farmSample = isSample(state, "farm", "name", state.farmName);

    const cropChips = PLANT_CROPS.map((c) => {
      const pressed = state.selected === c.id;
      const mark = isDirty(c.id) ? " •" : "";
      return `<button type="button" class="plant-chip" data-crop="${c.id}" aria-pressed="${pressed}">${c.name}${mark}</button>`;
    }).join("");

    const demandStrip = [...ranked, ...pending].map((r) => {
      const d = r.d || {};
      const a = arrow(d.dir);
      return `<span class="plant-demand-pill ${a.cls}" title="${String(d.tip || "").replace(/"/g, "&quot;")}"><b>${r.c.name}</b> <span class="plant-arrow">${a.glyph}</span> <span class="plant-demand-d">${d.dir ? "Nov 6" : ""}</span></span>`;
    }).join("");

    const field = (key, label, title) => {
      const sample = isSample(state, sel.id, key, e[key]);
      return `<label class="plant-field" title="${String(title || "").replace(/"/g, "&quot;")}">${label}${srcMark(title)}${sample ? '<span class="sample-tag">sample data</span>' : ""}
         <input id="plant-${key}" type="number" min="0" step="0.01" value="${fieldVal(e[key])}">
       </label>`;
    };

    root.innerHTML = `
      <div class="plant-head">
        <div>
          <p class="plant-kicker">Decision board</p>
          <h2>What should I plant?</h2>
        </div>
        <div class="plant-head-actions">
          <button type="button" class="plant-report-btn" id="plant-report">Decision report</button>
          <button type="button" class="yc-src-btn plant-src-btn" aria-expanded="${state.srcOpen}">ⓘ Sources &amp; method</button>
        </div>
      </div>
      <div class="plant-controls">
        <label class="plant-field">Farm${farmSample ? '<span class="sample-tag">sample data</span>' : ""}
          <input id="plant-farm" type="text" maxlength="80" autocomplete="off" placeholder="Farm name" value="${String(state.farmName || "").replace(/"/g, "&quot;")}">
        </label>
        <label class="plant-field">Zone
          <select id="plant-zone">${PLANT_ZONES.map((z) => `<option value="${z.id}" ${z.id === state.zone ? "selected" : ""}>${z.name}</option>`).join("")}</select>
        </label>
        <label class="plant-field">Acres
          <input id="plant-acres" type="number" min="0" step="1" value="${state.acres === "" || state.acres == null ? "" : state.acres}">
        </label>
        <label class="plant-field">Allotment
          <input id="plant-allot" type="number" min="0" step="1" value="${state.allot === "" || state.allot == null ? "" : state.allot}"><span class="plant-suffix">AF</span>
        </label>
      </div>
      <div class="plant-costs">
        <div class="plant-cost-head">
          <span>${sel.name}${dirty ? " · edited" : ""}</span>
          <div class="plant-reset-row">
            <button type="button" class="plant-reset" id="plant-reset-one" ${dirty ? "" : "disabled"}>Reset defaults</button>
            <button type="button" class="plant-reset" id="plant-reset-all" ${anyDirty ? "" : "disabled"}>Reset all</button>
          </div>
        </div>
        <div class="plant-chips plant-crop-picks">${cropChips}</div>
        <div class="plant-cost-grid plant-edit-grid">
          ${field("price", "Price", sel.priceSrc)}
          ${field("yield", "Yield / acre", sel.yieldSrc)}
          ${field("af", "AF / acre", sel.waterSrc)}
          ${field("seed", "Seed", sel.seedSrc)}
          ${field("fert", "Fertilizer", sel.fertSrc)}
          ${field("diesel", "Diesel", sel.dieselSrc)}
          ${field("labor", "Labor", sel.laborSrc)}
          ${field("irrig", "Irrigation", sel.irrigSrc)}
          ${field("other", "Other", sel.otherSrc)}
        </div>
      </div>
      ${rec ? `<p class="plant-rec">${rec}</p>` : ""}
      <div class="plant-leaders">
        ${best ? card(best, "best") : ""}
        ${runner ? card(runner, "runner") : ""}
        ${avoid && avoid !== best ? card(avoid, "avoid") : ""}
      </div>
      ${mid.length ? `<div class="plant-rest">${mid.map(rowHtml).join("")}</div>` : ""}
      <div class="plant-demand-layer">
        <div class="plant-demand-k">Grocer demand <span class="plant-demand-d">Southwest · Nov 6</span>${srcMark(DEMAND_META.region + " " + DEMAND_META.method)}</div>
        <div class="plant-demand-row">${demandStrip}</div>
      </div>
      ${pending.length ? `<div class="plant-pending-list">${pending.map(pendingHtml).join("")}</div>` : ""}
      <p class="plant-disclaimer">Planning estimate, not advice. Snapshot ${PLANT_AS_OF}.</p>
      <div class="yc-drawer plant-drawer" ${state.srcOpen ? "" : "hidden"}>
        <p>${PLANT_METHOD}</p>
        <p>${DEMAND_META.report}, issued ${DEMAND_META.issued}, ads for ${DEMAND_META.adsFor}. ${DEMAND_META.region} ${DEMAND_META.method}</p>
        ${PLANT_CROPS.map((c) => `<p><strong>${c.name}:</strong> ${cropTip(c)} ${c.demand?.tip || ""}</p>`).join("")}
      </div>
    `;

    const bindNum = (id, apply) => {
      const el = root.querySelector(id);
      if (!el) return;
      el.addEventListener("input", () => {
        const v = parseFloat(el.value);
        apply(Number.isFinite(v) ? v : 0);
        render();
        const again = root.querySelector(id);
        if (again) {
          again.focus();
          try { again.setSelectionRange(again.value.length, again.value.length); } catch (_) {}
        }
      });
    };
    root.querySelector("#plant-farm")?.addEventListener("input", (ev) => {
      state.farmName = ev.target.value;
    });
    root.querySelector("#plant-zone")?.addEventListener("change", (e2) => {
      state.zone = e2.target.value;
      render();
    });
    bindNum("#plant-acres", (v) => { state.acres = v; });
    bindNum("#plant-allot", (v) => { state.allot = v; });
    EDIT_KEYS.forEach((key) => {
      bindNum(`#plant-${key}`, (v) => {
        state.edits[state.selected][key] = v;
      });
    });
    root.querySelectorAll("[data-crop]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-crop");
        if (!id) return;
        if (el.classList.contains("plant-card") || el.classList.contains("plant-row") || el.classList.contains("plant-pending")) return;
        state.selected = id;
        render();
      });
    });
    root.querySelector("#plant-reset-one")?.addEventListener("click", () => {
      const c = cropOf(state.selected);
      state.edits[c.id] = {
        price: c.price, yield: c.yield, af: c.af,
        seed: c.seed, fert: c.fert, diesel: c.diesel, labor: c.labor, irrig: c.irrig, other: c.other
      };
      if (state.sampleFlags[c.id]) delete state.sampleFlags[c.id];
      render();
    });
    root.querySelector("#plant-reset-all")?.addEventListener("click", () => {
      state.edits = defaultEdits();
      state.sampleFlags = {};
      render();
    });
    root.querySelector(".plant-src-btn")?.addEventListener("click", () => {
      state.srcOpen = !state.srcOpen;
      render();
    });
    root.querySelector("#plant-report")?.addEventListener("click", () => {
      root.dispatchEvent(new CustomEvent("agcompass:report", { bubbles: true, detail: snapshotOf(state) }));
    });
  }

  api = {
    root,
    snapshot() { return snapshotOf(state); },
    getState() { return state; },
    setFarmName(name) { state.farmName = name; const el = root.querySelector("#plant-farm"); if (el) el.value = name; },
    setZone(id) { state.zone = id; render(); },
    setAcres(n) { state.acres = n; render(); },
    setAllot(n) { state.allot = n; render(); },
    selectCrop(id) { state.selected = id; render(); },
    setEdit(key, val) { state.edits[state.selected][key] = val; render(); },
    markSample(scope, key, value) {
      if (!state.sampleFlags[scope]) state.sampleFlags[scope] = {};
      state.sampleFlags[scope][key] = value;
      render();
    },
    resetForDemo() {
      state.farmName = "";
      state.zone = "yuma";
      state.acres = "";
      state.allot = "";
      state.selected = "iceberg";
      state.edits = defaultEdits();
      state.sampleFlags = {};
      state.srcOpen = false;
      render();
    },
    highlight(kind) {
      root.querySelectorAll(".plant-card").forEach((c) => c.classList.remove("demo-spotlight"));
      const el = root.querySelector(`.plant-card-${kind}`) || root.querySelector(`[data-kind="${kind}"]`);
      if (el) {
        el.classList.add("demo-spotlight");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    clearHighlight() {
      root.querySelectorAll(".plant-card").forEach((c) => c.classList.remove("demo-spotlight"));
    },
    render
  };

  render();
}
