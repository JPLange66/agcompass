import { YEAR_CHART } from "./year-chart-data.js";

const W = 1100, H = 460;
const M = { l: 72, r: 108, t: 22, b: 34 };
const YMIN_LOG = 150, YMAX_LOG = 17000;
const COPPER = "#E8956B", COPPER2 = "#B87333", HIGH = "#F4C2A1", CREAM = "#ECDEC8";

const PALETTE = {
  alfalfa:  { line: "#FFB07A", glow: "#E8956B", core: "#FFE1C4" },
  lettuce:  { line: "#3EE8C8", glow: "#14B89A", core: "#B8FFF0" },
  broccoli: { line: "#B6F25A", glow: "#7BC81E", core: "#E8FFB0" },
  cotton:   { line: "#C9A8FF", glow: "#9B74E8", core: "#EDE0FF" }
};

const money0 = (n) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function xOf(week) {
  return M.l + ((week - 1) / 51) * (W - M.l - M.r);
}

function valueAt(series, week) {
  const i = week - 1;
  if (series.known[i] != null) return { v: series.known[i], held: false };
  if (series.held[i] != null) return { v: series.held[i], held: true };
  return { v: null, held: false };
}

function lastValue(series, upTo) {
  for (let w = upTo; w >= 1; w--) {
    const { v, held } = valueAt(series, w);
    if (v != null) return { v, held, week: w };
  }
  return { v: null, held: false, week: null };
}

export function mountYearChart(root) {
  if (!root) return;
  const on = Object.fromEntries(YEAR_CHART.series.map((s) => [s.id, true]));
  let hover = null;
  let scale = "log";
  let sourcesOpen = false;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function yRange() {
    if (scale === "log") return { min: YMIN_LOG, max: YMAX_LOG };
    let mx = 800;
    YEAR_CHART.series.filter((s) => on[s.id]).forEach((s) => {
      [...s.known, ...s.held].forEach((v) => {
        if (v != null && v > mx) mx = v;
      });
    });
    const max = Math.ceil((mx * 1.08) / 1000) * 1000;
    return { min: 0, max: Math.max(1000, max) };
  }

  function yOf(v) {
    const { min, max } = yRange();
    const safe = scale === "log" ? Math.max(v, min) : v;
    const t =
      scale === "log"
        ? (Math.log(safe) - Math.log(min)) / (Math.log(max) - Math.log(min))
        : (safe - min) / (max - min || 1);
    return M.t + (1 - t) * (H - M.t - M.b);
  }

  function weekOfX(x) {
    const t = (x - M.l) / (W - M.l - M.r);
    return Math.max(1, Math.min(52, Math.round(t * 51) + 1));
  }

  function polyline(arr) {
    const pts = [];
    arr.forEach((v, i) => {
      if (v == null) return;
      pts.push(`${xOf(i + 1).toFixed(1)},${yOf(v).toFixed(1)}`);
    });
    return pts;
  }

  function areaPath(arr) {
    const { min } = yRange();
    const floor = scale === "log" ? Math.max(min, 150) : 0;
    const pts = polyline(arr);
    if (!pts.length) return "";
    const firstW = arr.findIndex((v) => v != null) + 1;
    const lastW = arr.length - [...arr].reverse().findIndex((v) => v != null);
    return `M ${xOf(firstW)} ${yOf(Math.max(floor, min) || 1)} L ${pts.join(" L ")} L ${xOf(lastW)} ${yOf(Math.max(floor, min) || 1)} Z`;
  }

  function yTicks() {
    if (scale === "log") return [200, 500, 1000, 2000, 5000, 10000, 15000];
    const { max } = yRange();
    const step = max <= 6000 ? 1000 : max <= 12000 ? 2000 : 2500;
    const ticks = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    return ticks;
  }

  function endLabels(cw) {
    const items = YEAR_CHART.series
      .filter((s) => on[s.id])
      .map((s) => {
        const last = lastValue(s, cw);
        if (last.v == null) return null;
        const pal = PALETTE[s.id] || { line: s.color };
        return { s, pal, ...last, y: yOf(last.v), x: xOf(last.week) };
      })
      .filter(Boolean)
      .sort((a, b) => a.y - b.y);
    // Nudge overlapping labels
    for (let i = 1; i < items.length; i++) {
      const gap = items[i].y - items[i - 1].y;
      if (gap < 16) items[i].y = items[i - 1].y + 16;
    }
    return items
      .map((it) => {
        const short = it.s.id === "alfalfa" ? "Alfalfa" : it.s.id === "lettuce" ? "Lettuce" : it.s.id === "broccoli" ? "Broccoli" : "Cotton";
        return `<g class="yc-endlbl">
          <circle cx="${it.x}" cy="${yOf(it.v)}" r="${it.s.id === "alfalfa" ? 5.5 : 4}" fill="${it.pal.core || CREAM}" stroke="${it.pal.line}" stroke-width="2" />
          <text x="${it.x + 10}" y="${it.y + 4}" fill="${it.pal.line}" font-size="${it.s.id === "alfalfa" ? 15 : 13}" font-weight="700" font-family="IBM Plex Mono, ui-monospace, monospace" paint-order="stroke" stroke="#0b1018" stroke-width="4">${money0(it.v)}</text>
          <text x="${it.x + 10}" y="${it.y + 18}" fill="${CREAM}" font-size="10" opacity="0.8" paint-order="stroke" stroke="#0b1018" stroke-width="3">${short}${it.held ? " · held" : ""}</text>
        </g>`;
      })
      .join("");
  }

  function render() {
    const ticks = yTicks()
      .map(
        (v) => `
      <line x1="${M.l}" x2="${W - M.r}" y1="${yOf(v)}" y2="${yOf(v)}" stroke="rgba(236,222,200,0.10)" />
      <text x="${M.l - 8}" y="${yOf(v) + 4}" text-anchor="end" fill="${CREAM}" font-size="11" font-family="IBM Plex Mono, ui-monospace, monospace">${money0(v)}</text>`
      )
      .join("");

    const xLabels = [1, 5, 9, 13, 17, 21, 26, 30, 35, 39, 45, 52]
      .map((w) => `<text x="${xOf(w)}" y="${H - 14}" text-anchor="middle" fill="${CREAM}" font-size="11">${w}</text>`)
      .join("");

    const season = `
      <rect x="${xOf(1)}" y="${M.t}" width="${xOf(16) - xOf(1)}" height="${H - M.t - M.b}" fill="rgba(232,149,107,0.11)" />
      <rect x="${xOf(45)}" y="${M.t}" width="${xOf(52) - xOf(45)}" height="${H - M.t - M.b}" fill="rgba(232,149,107,0.11)" />
      <text x="${(xOf(1) + xOf(16)) / 2}" y="${M.t + 14}" text-anchor="middle" fill="${HIGH}" font-size="10" letter-spacing="0.6">YUMA WINTER VEGETABLE SEASON</text>
      <text x="${(xOf(45) + xOf(52)) / 2}" y="${M.t + 14}" text-anchor="middle" fill="${HIGH}" font-size="10" letter-spacing="0.6">YUMA WINTER SEASON</text>`;

    const paths = YEAR_CHART.series
      .filter((s) => on[s.id])
      .map((s) => {
        const pal = PALETTE[s.id] || { line: s.color, glow: s.color };
        const known = polyline(s.known).join(" ");
        const heldPts = [];
        const lastKnownIdx = s.known.reduce((acc, v, i) => (v != null ? i : acc), -1);
        if (lastKnownIdx >= 0 && s.held.some((v) => v != null)) {
          heldPts.push(`${xOf(lastKnownIdx + 1).toFixed(1)},${yOf(s.known[lastKnownIdx]).toFixed(1)}`);
          s.held.forEach((v, i) => {
            if (v != null) heldPts.push(`${xOf(i + 1).toFixed(1)},${yOf(v).toFixed(1)}`);
          });
        }
        const isAlf = s.id === "alfalfa";
        const area = isAlf ? `<path d="${areaPath(s.known)}" fill="url(#alfalfaFill)" opacity="0.95" />` : "";
        const glow = isAlf
          ? `<polyline points="${known}" fill="none" stroke="${pal.glow}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.32" filter="url(#copperGlow)" />
             <polyline points="${known}" fill="none" stroke="${pal.line}" stroke-width="10" stroke-linecap="round" opacity="0.4" />`
          : `<polyline points="${known}" fill="none" stroke="${pal.glow}" stroke-width="8" stroke-linecap="round" opacity="0.28" filter="url(#lineGlow)" />`;
        const dash = s.style === "dashed" ? 'stroke-dasharray="8 6"' : "";
        const main = `<polyline class="yc-line" data-id="${s.id}" points="${known}" fill="none" stroke="${pal.line}" stroke-width="${isAlf ? 5.2 : 3.4}" stroke-linecap="round" stroke-linejoin="round" ${dash} />`;
        const core = isAlf
          ? `<polyline points="${known}" fill="none" stroke="${pal.core}" stroke-width="1.6" stroke-linecap="round" opacity="0.85" />`
          : "";
        const held =
          heldPts.length > 1
            ? `<polyline points="${heldPts.join(" ")}" fill="none" stroke="${pal.line}" stroke-width="${isAlf ? 3.2 : 2.4}" stroke-dasharray="3 6" opacity="0.9" />`
            : "";
        return `<g>${area}${glow}${main}${core}${held}</g>`;
      })
      .join("");

    const cw = YEAR_CHART.currentWeek;
    const nowLine = `
      <line x1="${xOf(cw)}" x2="${xOf(cw)}" y1="${M.t}" y2="${H - M.b}" stroke="${HIGH}" stroke-width="1.6" />
      <text x="${xOf(cw) - 8}" y="${M.t + 28}" text-anchor="end" fill="${HIGH}" font-size="11" font-weight="700">This week</text>`;

    const srcBody = `${YEAR_CHART.method} ${YEAR_CHART.yumaSeasonNote}
      ${YEAR_CHART.series.map((s) => `<strong>${s.name}:</strong> ${s.source} Yield ${s.yield}. Water ${s.water}.`).join(" ")}
      ${YEAR_CHART.omitted.join(" ")} Snapshot ${YEAR_CHART.asOf}.`;

    root.innerHTML = `
      <div class="yc-head">
        <div>
          <div class="yc-kicker">52-week benchmark chart · ${YEAR_CHART.metricShort}</div>
          <h2>Gross dollars per acre-foot, measured against alfalfa</h2>
        </div>
        <div class="yc-tools">
          <div class="yc-scale" role="group" aria-label="Chart scale">
            <button type="button" data-scale="log" aria-pressed="${scale === "log"}">Log</button>
            <button type="button" data-scale="linear" aria-pressed="${scale === "linear"}">Linear</button>
          </div>
          <button type="button" class="yc-src-btn" aria-expanded="${sourcesOpen}">ⓘ Sources &amp; method</button>
        </div>
      </div>
      <div class="yc-stage">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Fifty-two week chart of gross dollars per acre-foot, alfalfa as the copper benchmark">
          <defs>
            <linearGradient id="alfalfaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${PALETTE.alfalfa.line}" stop-opacity="0.55" />
              <stop offset="55%" stop-color="${PALETTE.alfalfa.glow}" stop-opacity="0.16" />
              <stop offset="100%" stop-color="${COPPER2}" stop-opacity="0.02" />
            </linearGradient>
            <filter id="copperGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width="${W}" height="${H}" fill="#070b12" rx="16" />
          ${season}${ticks}
          <line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${H - M.b}" stroke="${COPPER2}" stroke-width="1.2" />
          <line x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}" stroke="${COPPER2}" stroke-width="1.2" />
          ${paths}${nowLine}
          ${endLabels(cw)}
          ${xLabels}
          <text x="${(M.l + W - M.r) / 2}" y="${H - 2}" text-anchor="middle" fill="${CREAM}" font-size="10" opacity="0.8">Week of 2026 (weeks 1–52)</text>
          <text x="16" y="${H / 2}" fill="${CREAM}" font-size="10" opacity="0.85" transform="rotate(-90 16 ${H / 2})">Gross $ per acre-foot (${scale} scale)</text>
        </svg>
        <div class="yc-hover" hidden></div>
      </div>
      <div class="yc-legend" role="group" aria-label="Crop toggles">
        ${YEAR_CHART.series
          .map((s) => {
            const pal = PALETTE[s.id] || { line: s.color };
            return `
          <button type="button" class="yc-pill" data-id="${s.id}" aria-pressed="${on[s.id] ? "true" : "false"}">
            <span class="swatch" style="background:${pal.line}; ${s.style === "dashed" ? "box-shadow: inset 0 0 0 2px #0b1018; outline: 1px dashed " + pal.line : ""}"></span>
            ${s.name}${s.kind === "estimate" ? " <em>last-known / estimate</em>" : ""}
          </button>`;
          })
          .join("")}
      </div>
      <p class="yc-inline">NASS monthly prices received, stepped by week · alfalfa is the copper benchmark · dashed = last-known / estimate after the last published month</p>
      <div class="yc-drawer" ${sourcesOpen ? "" : "hidden"}>
        <p>${srcBody}</p>
      </div>
    `;

    const svg = root.querySelector("svg");
    const hoverEl = root.querySelector(".yc-hover");
    if (!reduce) {
      root.querySelectorAll(".yc-line").forEach((p, i) => {
        if (p.getAttribute("stroke-dasharray")) return;
        try {
          const len = p.getTotalLength();
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
          p.style.animation = `ycdraw 1.35s ease ${i * 0.12}s forwards`;
        } catch {}
      });
    }

    function showHover(week, clientX, clientY) {
      hover = week;
      const lines = YEAR_CHART.series
        .filter((s) => on[s.id])
        .map((s) => {
          const pal = PALETTE[s.id] || { line: s.color };
          const { v, held } = valueAt(s, week);
          const alf = valueAt(YEAR_CHART.series[0], week).v;
          const vs =
            v != null && alf != null
              ? `${v >= alf ? "+" : "−"}${money0(Math.abs(v - alf))} vs alfalfa`
              : "no alfalfa compare";
          return `<div class="row"><span class="dot" style="background:${pal.line}"></span><span>${s.name}${held ? " · held last-known" : ""}</span><span>${money0(v)}</span><span class="delta">${v == null ? "—" : vs}</span></div>`;
        })
        .join("");
      hoverEl.hidden = false;
      hoverEl.innerHTML = `<div class="wk">Week ${week} of 2026</div>${lines}`;
      const stage = root.querySelector(".yc-stage").getBoundingClientRect();
      const left = Math.min(stage.width - 280, Math.max(8, clientX - stage.left + 14));
      const top = Math.max(8, clientY - stage.top - 20);
      hoverEl.style.left = left + "px";
      hoverEl.style.top = top + "px";
      let cr = svg.querySelector("#cross");
      if (!cr) {
        cr = document.createElementNS("http://www.w3.org/2000/svg", "line");
        cr.setAttribute("id", "cross");
        cr.setAttribute("stroke", CREAM);
        cr.setAttribute("stroke-width", "1.2");
        cr.setAttribute("opacity", "0.65");
        svg.appendChild(cr);
      }
      cr.setAttribute("x1", xOf(week));
      cr.setAttribute("x2", xOf(week));
      cr.setAttribute("y1", M.t);
      cr.setAttribute("y2", H - M.b);
    }

    svg.addEventListener("mousemove", (e) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const loc = pt.matrixTransform(ctm.inverse());
      showHover(weekOfX(loc.x), e.clientX, e.clientY);
    });
    svg.addEventListener("mouseleave", () => {
      hover = null;
      hoverEl.hidden = true;
      const cr = svg.querySelector("#cross");
      if (cr) cr.remove();
    });
    root.querySelectorAll(".yc-pill").forEach((b) => {
      b.addEventListener("click", () => {
        on[b.dataset.id] = !on[b.dataset.id];
        render();
      });
    });
    root.querySelectorAll(".yc-scale button").forEach((b) => {
      b.addEventListener("click", () => {
        scale = b.dataset.scale;
        render();
      });
    });
    root.querySelector(".yc-src-btn")?.addEventListener("click", () => {
      sourcesOpen = !sourcesOpen;
      render();
    });
  }

  render();
}
