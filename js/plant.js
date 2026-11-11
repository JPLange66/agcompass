import {
  PLANT_CROPS, PLANT_ZONES, COST_SETS, DEMAND_META, PLANT_METHOD, PLANT_AS_OF
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

function compute(state) {
  const acres = Math.max(0, state.acres);
  const allot = Math.max(0, state.allot);
  const custom = state.costSet !== "bycrop";
  const customSum = state.seed + state.fert + state.diesel + state.labor + state.irrig;
  const ranked = [];
  const pending = [];
  for (const c of PLANT_CROPS) {
    const canRank = c.rankable !== false && c.price > 0 && c.yield > 0 && c.af > 0;
    const d = c.demand || {};
    if (!canRank) {
      pending.push({ c, d });
      continue;
    }
    const rev = c.price * c.yield;
    const inputs = custom ? customSum : c.other + state.irrig;
    const netA = rev - inputs;
    const netAF = c.af > 0 ? netA / c.af : null;
    const plantable = Math.min(acres, c.af > 0 ? allot / c.af : 0);
    const farm = netA * plantable;
    ranked.push({ c, d, rev, inputs, netA, netAF, plantable, farm, waterNeed: acres * c.af });
  }
  ranked.sort((a, b) => (b.netAF ?? -1e12) - (a.netAF ?? -1e12));
  return { ranked, pending, custom, acres, allot };
}

function card(row, kind) {
  const label = kind === "best" ? "Best bet" : kind === "runner" ? "Runner-up" : "Avoid";
  const tip = [
    row.c.priceSrc,
    row.c.yieldSrc,
    row.c.waterSrc,
    row.c.costSrc
  ].filter(Boolean).join(" ");
  return `
    <article class="plant-card plant-card-${kind}" title="${String(tip).replace(/"/g, "&quot;")}">
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
  const tip = [row.c.priceSrc, row.c.yieldSrc, row.c.waterSrc, row.c.costSrc].filter(Boolean).join(" ");
  return `
    <div class="plant-row" title="${String(tip).replace(/"/g, "&quot;")}">
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
    <div class="plant-pending">
      <div class="plant-row-name">${p.c.name}${srcMark(p.c.priceSrc)}</div>
      <div class="plant-pending-note">No AZ FOB</div>
      <div class="plant-row-d">${demandBadge(p.d)}</div>
    </div>`;
}

export function mountPlant(root) {
  if (!root) return;
  const start = COST_SETS.bycrop;
  const state = {
    zone: "yuma",
    acres: 120,
    allot: 600,
    costSet: "bycrop",
    seed: start.seed,
    fert: start.fert,
    diesel: start.diesel,
    labor: start.labor,
    irrig: start.irrig,
    srcOpen: false
  };

  function applySet(id, fromEdit) {
    if (fromEdit) {
      state.costSet = "custom";
      return;
    }
    const set = COST_SETS[id];
    if (!set) return;
    state.costSet = id;
    state.seed = set.seed;
    state.fert = set.fert;
    state.diesel = set.diesel;
    state.labor = set.labor;
    state.irrig = set.irrig;
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
    const chips = [
      ["bycrop", "By crop"],
      ["alfalfa", "Alfalfa"],
      ["cotton", "Cotton"],
      ["durum", "Durum"],
      ["produce", "Produce"],
      ...(state.costSet === "custom" ? [["custom", "My costs"]] : [])
    ].map(([id, label]) => {
      const pressed = state.costSet === id;
      return `<button type="button" class="plant-chip" data-set="${id}" aria-pressed="${pressed}">${label}</button>`;
    }).join("");

    const demandStrip = [...ranked, ...pending].map((r) => {
      const d = r.d || {};
      const a = arrow(d.dir);
      return `<span class="plant-demand-pill ${a.cls}" title="${String(d.tip || "").replace(/"/g, "&quot;")}"><b>${r.c.name}</b> <span class="plant-arrow">${a.glyph}</span> <span class="plant-demand-d">${d.dir ? "Nov 6" : ""}</span></span>`;
    }).join("");

    const setNote = COST_SETS[state.costSet === "custom" ? "bycrop" : state.costSet];

    root.innerHTML = `
      <div class="plant-head">
        <div>
          <p class="plant-kicker">Decision board</p>
          <h2>What should I plant?</h2>
        </div>
        <button type="button" class="yc-src-btn plant-src-btn" aria-expanded="${state.srcOpen}">ⓘ Sources &amp; method</button>
      </div>
      <div class="plant-controls">
        <label class="plant-field">Zone
          <select id="plant-zone">${PLANT_ZONES.map((z) => `<option value="${z.id}" ${z.id === state.zone ? "selected" : ""}>${z.name}</option>`).join("")}</select>
        </label>
        <label class="plant-field">Acres
          <input id="plant-acres" type="number" min="0" step="1" value="${state.acres}">
        </label>
        <label class="plant-field">Allotment
          <input id="plant-allot" type="number" min="0" step="1" value="${state.allot}"><span class="plant-suffix">AF</span>
        </label>
      </div>
      <div class="plant-costs">
        <div class="plant-cost-head">
          <span>Costs / acre</span>
          <div class="plant-chips">${chips}</div>
        </div>
        <div class="plant-cost-grid">
          <label class="plant-field">Seed <input id="plant-seed" type="number" min="0" step="0.01" value="${state.seed}"></label>
          <label class="plant-field">Fertilizer <input id="plant-fert" type="number" min="0" step="0.01" value="${state.fert}"></label>
          <label class="plant-field">Diesel <input id="plant-diesel" type="number" min="0" step="0.01" value="${state.diesel}"></label>
          <label class="plant-field">Labor <input id="plant-labor" type="number" min="0" step="0.01" value="${state.labor}"></label>
          <label class="plant-field">Irrigation <input id="plant-irrig" type="number" min="0" step="0.01" value="${state.irrig}"></label>
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
        ${setNote ? `<p>${setNote.note}</p>` : ""}
        ${PLANT_CROPS.map((c) => `<p><strong>${c.name}:</strong> ${c.priceSrc} ${c.yieldSrc} ${c.waterSrc} ${c.costSrc} ${c.demand?.tip || ""}</p>`).join("")}
      </div>
    `;

    const bindNum = (id, key) => {
      const el = root.querySelector(id);
      if (!el) return;
      el.addEventListener("input", () => {
        const v = parseFloat(el.value);
        state[key] = Number.isFinite(v) ? v : 0;
        if (["seed", "fert", "diesel", "labor", "irrig"].includes(key) && state.costSet === "bycrop") {
          state.costSet = "custom";
        }
        render();
        const again = root.querySelector(id);
        if (again) {
          again.focus();
          try { again.setSelectionRange(again.value.length, again.value.length); } catch (_) {}
        }
      });
    };
    root.querySelector("#plant-zone")?.addEventListener("change", (e) => {
      state.zone = e.target.value;
      render();
    });
    bindNum("#plant-acres", "acres");
    bindNum("#plant-allot", "allot");
    bindNum("#plant-seed", "seed");
    bindNum("#plant-fert", "fert");
    bindNum("#plant-diesel", "diesel");
    bindNum("#plant-labor", "labor");
    bindNum("#plant-irrig", "irrig");
    root.querySelectorAll("[data-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-set");
        if (id === "custom") return;
        applySet(id);
        render();
      });
    });
    root.querySelector(".plant-src-btn")?.addEventListener("click", () => {
      state.srcOpen = !state.srcOpen;
      render();
    });
  }

  render();
}
