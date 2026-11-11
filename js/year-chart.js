import { YEAR_CHART } from "./year-chart-data.js";

const W = 1100, H = 520;
const M = { l: 78, r: 24, t: 36, b: 44 };
const YMIN = 120, YMAX = 22000;
const COPPER = "#E8956B", COPPER2 = "#B87333", HIGH = "#F4C2A1", CREAM = "#ECDEC8";

const money0 = (n) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function xOf(week) {
  return M.l + ((week - 1) / 51) * (W - M.l - M.r);
}
function yOf(v) {
  const t = (Math.log(v) - Math.log(YMIN)) / (Math.log(YMAX) - Math.log(YMIN));
  return M.t + (1 - t) * (H - M.t - M.b);
}
function weekOfX(x) {
  const t = (x - M.l) / (W - M.l - M.r);
  return Math.max(1, Math.min(52, Math.round(t * 51) + 1));
}
function valueAt(series, week) {
  const i = week - 1;
  if (series.known[i] != null) return { v: series.known[i], held: false };
  if (series.held[i] != null) return { v: series.held[i], held: true };
  return { v: null, held: false };
}
function polyline(arr) {
  const pts = [];
  arr.forEach((v, i) => {
    if (v == null) return;
    pts.push(`${xOf(i + 1).toFixed(1)},${yOf(v).toFixed(1)}`);
  });
  return pts;
}
function areaPath(arr, floor = YMIN) {
  const pts = polyline(arr);
  if (!pts.length) return "";
  const firstW = arr.findIndex((v) => v != null) + 1;
  const lastW = arr.length - [...arr].reverse().findIndex((v) => v != null);
  return `M ${xOf(firstW)} ${yOf(floor)} L ${pts.join(" L ")} L ${xOf(lastW)} ${yOf(floor)} Z`;
}

export function mountYearChart(root) {
  if (!root) return;
  const on = Object.fromEntries(YEAR_CHART.series.map((s) => [s.id, true]));
  let hover = null;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function yTicks() {
    return [200, 500, 1000, 2000, 5000, 10000, 20000];
  }

  function render() {
    const ticks = yTicks()
      .map(
        (v) => `
      <line x1="${M.l}" x2="${W - M.r}" y1="${yOf(v)}" y2="${yOf(v)}" stroke="rgba(236,222,200,0.12)" />
      <text x="${M.l - 8}" y="${yOf(v) + 4}" text-anchor="end" fill="${CREAM}" font-size="11" font-family="IBM Plex Mono, ui-monospace, monospace">${money0(v)}</text>`
      )
      .join("");

    const xLabels = [1, 5, 9, 13, 17, 21, 26, 30, 35, 39, 45, 52]
      .map(
        (w) =>
          `<text x="${xOf(w)}" y="${H - 16}" text-anchor="middle" fill="${CREAM}" font-size="11">${w}</text>`
      )
      .join("");

    const season = `
      <rect x="${xOf(1)}" y="${M.t}" width="${xOf(16) - xOf(1)}" height="${H - M.t - M.b}" fill="rgba(232,149,107,0.10)" />
      <rect x="${xOf(45)}" y="${M.t}" width="${xOf(52) - xOf(45)}" height="${H - M.t - M.b}" fill="rgba(232,149,107,0.10)" />
      <text x="${(xOf(1) + xOf(16)) / 2}" y="${M.t + 16}" text-anchor="middle" fill="${COPPER}" font-size="11">Yuma winter vegetable season</text>
      <text x="${(xOf(45) + xOf(52)) / 2}" y="${M.t + 16}" text-anchor="middle" fill="${COPPER}" font-size="11">Yuma winter season</text>`;

    const paths = YEAR_CHART.series
      .filter((s) => on[s.id])
      .map((s) => {
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
          ? `<polyline points="${known}" fill="none" stroke="${s.glow || COPPER2}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.28" filter="url(#copperGlow)" />
             <polyline points="${known}" fill="none" stroke="${s.color}" stroke-width="8" stroke-linecap="round" opacity="0.35" />`
          : "";
        const dash = s.style === "dashed" ? 'stroke-dasharray="7 6"' : "";
        const main = `<polyline class="yc-line" data-id="${s.id}" points="${known}" fill="none" stroke="${s.color}" stroke-width="${isAlf ? 3.4 : 2.3}" stroke-linecap="round" stroke-linejoin="round" ${dash} />`;
        const held =
          heldPts.length > 1
            ? `<polyline points="${heldPts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="${isAlf ? 2.4 : 1.8}" stroke-dasharray="3 6" opacity="0.9" />`
            : "";
        return `<g>${area}${glow}${main}${held}</g>`;
      })
      .join("");

    const cw = YEAR_CHART.currentWeek;
    const nowLine = `
      <line x1="${xOf(cw)}" x2="${xOf(cw)}" y1="${M.t}" y2="${H - M.b}" stroke="${HIGH}" stroke-width="1.3" />
      <text x="${xOf(cw) - 8}" y="${M.t + 32}" text-anchor="end" fill="${HIGH}" font-size="11">This week</text>`;

    let tip = "";
    if (hover) {
      const hx = xOf(hover);
      tip = `<line x1="${hx}" x2="${hx}" y1="${M.t}" y2="${H - M.b}" stroke="${CREAM}" stroke-width="1" opacity="0.55" />`;
    }

    root.innerHTML = `
      <div class="yc-head">
        <div>
          <div class="yc-kicker">52-week benchmark chart</div>
          <h2>Gross dollars per acre-foot, measured against alfalfa</h2>
        </div>
      </div>
      <div class="yc-stage">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Fifty-two week chart of gross dollars per acre-foot, alfalfa as the copper benchmark">
          <defs>
            <linearGradient id="alfalfaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${COPPER}" stop-opacity="0.45" />
              <stop offset="100%" stop-color="${COPPER2}" stop-opacity="0.05" />
            </linearGradient>
            <filter id="copperGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width="${W}" height="${H}" fill="#0b1018" rx="16" />
          ${season}${ticks}
          <line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${H - M.b}" stroke="${COPPER2}" />
          <line x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}" stroke="${COPPER2}" />
          ${paths}${nowLine}${tip}
          ${xLabels}
          <text x="${(M.l + W - M.r) / 2}" y="${H - 2}" text-anchor="middle" fill="${CREAM}" font-size="11">Week of 2026 (weeks 1–52)</text>
          <text x="18" y="${H / 2}" fill="${CREAM}" font-size="11" transform="rotate(-90 18 ${H / 2})">Gross $ per acre-foot (log scale)</text>
        </svg>
        <div class="yc-hover" hidden></div>
      </div>
      <div class="yc-legend" role="group" aria-label="Crop toggles">
        ${YEAR_CHART.series
          .map(
            (s) => `
          <button type="button" class="yc-pill" data-id="${s.id}" aria-pressed="${on[s.id] ? "true" : "false"}">
            <span class="swatch" style="background:${s.color}; ${s.style === "dashed" ? "box-shadow: inset 0 0 0 2px #0b1018; outline: 1px dashed " + s.color : ""}"></span>
            ${s.name}${s.kind === "estimate" ? " <em>last-known / estimate</em>" : ""}
          </button>`
          )
          .join("")}
      </div>
      <p class="yc-note">${YEAR_CHART.method} ${YEAR_CHART.yumaSeasonNote} Log scale keeps the copper alfalfa benchmark readable against higher-value vegetables. Snapshot ${YEAR_CHART.asOf}.</p>
      <p class="yc-note muted">${YEAR_CHART.series.map((s) => `<strong>${s.name}:</strong> ${s.source} Yield ${s.yield}. Water ${s.water}.`).join(" ")} ${YEAR_CHART.omitted.join(" ")}</p>
    `;

    const svg = root.querySelector("svg");
    const hoverEl = root.querySelector(".yc-hover");
    if (!reduce) {
      root.querySelectorAll(".yc-line").forEach((p, i) => {
        try {
          const len = p.getTotalLength();
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
          p.style.animation = `ycdraw 1.25s ease ${i * 0.12}s forwards`;
        } catch {}
      });
    }

    function showHover(week, clientX, clientY) {
      hover = week;
      const lines = YEAR_CHART.series
        .filter((s) => on[s.id])
        .map((s) => {
          const { v, held } = valueAt(s, week);
          const alf = valueAt(YEAR_CHART.series[0], week).v;
          const vs =
            v != null && alf != null
              ? `${v >= alf ? "+" : "−"}${money0(Math.abs(v - alf))} vs alfalfa`
              : "no alfalfa compare";
          return `<div class="row"><span class="dot" style="background:${s.color}"></span><span>${s.name}${held ? " · held last-known" : ""}</span><span>${money0(v)}</span><span class="delta">${v == null ? "—" : vs}</span></div>`;
        })
        .join("");
      hoverEl.hidden = false;
      hoverEl.innerHTML = `<div class="wk">Week ${week} of 2026</div>${lines}`;
      const stage = root.querySelector(".yc-stage").getBoundingClientRect();
      const left = Math.min(stage.width - 280, Math.max(8, clientX - stage.left + 14));
      const top = Math.max(8, clientY - stage.top - 20);
      hoverEl.style.left = left + "px";
      hoverEl.style.top = top + "px";
      // redraw crosshair only: lightweight — skip full render to keep tooltip
      let cr = svg.querySelector("#cross");
      if (!cr) {
        cr = document.createElementNS("http://www.w3.org/2000/svg", "line");
        cr.setAttribute("id", "cross");
        cr.setAttribute("stroke", CREAM);
        cr.setAttribute("stroke-width", "1");
        cr.setAttribute("opacity", "0.55");
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
  }

  render();
}
