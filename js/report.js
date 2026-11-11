/* Decision report preview, client-side PDF, and in-site (non-sending) compose. */

const FILENAME = "Ag-Compass-Planting-Decision-Report.pdf";

function $(sel, root = document) { return root.querySelector(sel); }

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function demandWord(dir) {
  if (dir === "up") return "▲";
  if (dir === "down") return "▼";
  if (dir === "flat") return "▬";
  return "—";
}

export function reportInnerHtml(snap, { demo = false } = {}) {
  const best = snap.ranked[0];
  const runner = snap.ranked.length >= 3 ? snap.ranked[1] : null;
  const avoid = snap.ranked.length >= 2 ? snap.ranked[snap.ranked.length - 1] : null;
  const sample = snap.sampleEdits || [];
  const rows = snap.ranked.map((r, i) => `
    <tr class="${i === 0 ? "is-best" : ""}">
      <td>${esc(r.name)}</td>
      <td class="num">${esc(r.fmt.netAF)}</td>
      <td class="num">${esc(r.fmt.netA)}</td>
      <td class="num">${esc(r.fmt.farm)}</td>
      <td class="num">${esc(r.fmt.plantable)} ac</td>
      <td class="num">${esc(r.fmt.af)}</td>
      <td class="num">${demandWord(r.demand)}</td>
    </tr>`).join("");
  const pending = (snap.pending || []).map((p) =>
    `<tr><td>${esc(p.name)}</td><td colspan="6" class="muted">No AZ FOB — not ranked</td></tr>`
  ).join("");
  const sampleLine = sample.length
    ? `<p class="rpt-sample"><span class="sample-tag">sample data</span> ${sample.map((s) =>
        `${s.crop ? esc(s.crop) + " " : ""}${esc(s.label)} ${esc(s.display)}`).join(" · ")}.</p>`
    : "";
  const demoBanner = demo
    ? `<p class="rpt-banner"><span class="sample-tag">sample data</span> Demonstration farm. Planning estimate, not a quote or a credit decision.</p>`
    : "";

  return `
    <header class="rpt-mast">
      <img class="rpt-logo" src="assets/ag_compass_logo_copper.png" width="64" height="64" alt="Ag Compass copper compass rose">
      <div>
        <p class="rpt-brand">Ag Compass</p>
        <h1>Ag Compass Planting Decision Report</h1>
        <p class="rpt-tag">Arizona’s market board for what Chicago doesn’t trade.</p>
      </div>
    </header>
    ${demoBanner}
    <p class="rpt-farm">
      <strong>${esc(snap.farmName)}</strong>
      ${demo || (snap.sampleEdits || []).some((s) => s.key === "farm") ? '<span class="sample-tag">sample data</span>' : ""}
      · ${esc(snap.zoneName)} · ${snap.acres} acres · ${snap.allot} AF allotment
    </p>
    <p class="rpt-asof">Snapshot ${esc(snap.asOf)} · ${esc(snap.demandMeta)}</p>
    <div class="rpt-leaders">
      ${best ? `<div class="rpt-card best"><div class="rpt-k">Best bet</div><div class="rpt-crop">${esc(best.name)}</div><div class="rpt-val">${esc(best.fmt.netAF)}</div><div class="rpt-unit">net / AF</div><div class="rpt-sub">${esc(best.fmt.netA)} / acre · ${esc(best.fmt.farm)} farm total · ${esc(best.fmt.plantable)} ac within cap</div></div>` : ""}
      ${runner ? `<div class="rpt-card"><div class="rpt-k">Runner-up</div><div class="rpt-crop">${esc(runner.name)}</div><div class="rpt-val">${esc(runner.fmt.netAF)}</div><div class="rpt-unit">net / AF</div></div>` : ""}
      ${avoid ? `<div class="rpt-card avoid"><div class="rpt-k">Avoid</div><div class="rpt-crop">${esc(avoid.name)}</div><div class="rpt-val">${esc(avoid.fmt.netAF)}</div><div class="rpt-unit">net / AF</div></div>` : ""}
    </div>
    ${sampleLine}
    <table class="rpt-table">
      <thead>
        <tr>
          <th>Crop</th>
          <th class="num">Net / AF</th>
          <th class="num">Net / acre</th>
          <th class="num">Farm total</th>
          <th class="num">Within cap</th>
          <th class="num">AF / ac</th>
          <th class="num">Demand</th>
        </tr>
      </thead>
      <tbody>${rows}${pending}</tbody>
    </table>
    <p class="rpt-note">Planning estimate, not agronomic, water-rights, or financial advice. Ranked by net dollars per acre-foot. Prices, yields, water, and default costs are sourced University of Arizona and USDA figures; method is in Sources &amp; method on the board. Demand arrows are national conventional ad counts from AMS FVWRETAIL (Southwest region), Nov 6, 2026.</p>
    <footer class="rpt-foot">
      <span>Leave the drought to nature, not your bank account.</span>
      <span>agcompass</span>
    </footer>
  `;
}

export function defaultEmail(snap) {
  const best = snap.ranked[0];
  const farm = snap.farmName || "Sample Farm";
  const subject = `${farm} planting plan — Ag Compass decision report`;
  const sampleNote = (snap.sampleEdits || []).length
    ? `Diesel and irrigation figures marked in the report are sample data for this walk-through, not a quoted supplier price.\n\n`
    : "";
  const body = best
    ? `Please find the Ag Compass Planting Decision Report for ${farm} (${snap.zoneName}, ${snap.acres} acres, ${snap.allot} AF allotment).\n\nBest bet on a net-per-acre-foot basis: ${best.name} at ${best.fmt.netAF} net / AF (${best.fmt.netA} net / acre, ${best.fmt.farm} farm total, ${best.fmt.plantable} acres within the water cap).\n\n${sampleNote}This is a planning estimate, not a credit decision, rate quote, or endorsement.\n\nThe one-page report is attached.`
    : `Please find the Ag Compass Planting Decision Report for ${farm}. This is a planning estimate, not a credit decision. The one-page report is attached.`;
  return {
    to: "loan.officer@example.com",
    subject,
    body
  };
}

/* ---- Minimal one-page PDF (Helvetica, letter) ---- */
function latin(s) {
  return String(s ?? "").replace(/[^\x20-\x7E]/g, (ch) => {
    const map = {
      "—": "-", "–": "-", "’": "'", "‘": "'", "“": '"', "”": '"',
      "×": "x", "é": "e", "á": "a", "í": "i", "ó": "o", "ú": "u",
      "ñ": "n", "°": " deg", "•": "-", "▲": "^", "▼": "v", "▬": "-",
      " ": " ", " ": " ", "â": "a", "ö": "o"
    };
    return map[ch] || " ";
  });
}

function pdfEsc(s) {
  return latin(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildReportPdf(snap, { demo = false } = {}) {
  const best = snap.ranked[0];
  const runner = snap.ranked.length >= 3 ? snap.ranked[1] : null;
  const avoid = snap.ranked.length >= 2 ? snap.ranked[snap.ranked.length - 1] : null;
  const ops = [];
  const navy = "0.094 0.157 0.251";
  const copper = "0.722 0.451 0.200";
  const cream = "0.957 0.937 0.902";
  const ink = "0.102 0.122 0.153";
  const line = "0.82 0.80 0.76";
  const soft = "0.97 0.95 0.92";
  const muted = "0.40 0.36 0.32";

  function rect(x, y, w, h, rgb, stroke) {
    if (stroke) ops.push(`${rgb} RG 1.2 w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
    else ops.push(`${rgb} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }
  function text(x, y, str, size, rgb, bold) {
    const font = bold ? "F2" : "F1";
    ops.push(`BT /${font} ${size} Tf ${rgb} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEsc(str)}) Tj ET`);
  }
  function wrap(str, max) {
    const words = latin(str).split(/\s+/);
    const lines = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? cur + " " + w : w;
      if (next.length > max) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  rect(0, 720, 612, 72, navy);
  rect(0, 716, 612, 4, copper);
  text(36, 758, "AG COMPASS", 11, cream, true);
  text(36, 736, "Planting Decision Report", 20, cream, true);
  text(400, 758, "Arizona agriculture", 9, copper, false);

  let y = 698;
  if (demo) {
    rect(36, y - 4, 540, 16, copper);
    text(42, y, "DEMO  -  SAMPLE DATA    Planning estimate, not a quote or a credit decision.", 8, cream, true);
    y -= 22;
  }
  text(36, y, `${snap.farmName}  ·  ${snap.zoneName}  ·  ${snap.acres} acres  ·  ${snap.allot} AF allotment`, 11, ink, true);
  y -= 14;
  text(36, y, `Snapshot ${snap.asOf}  ·  ${snap.demandMeta}`, 8, muted, false);
  y -= 22;

  function cardBox(x, label, crop, val, unit) {
    rect(x, y - 52, 170, 64, soft);
    rect(x, y - 52, 170, 64, copper, true);
    text(x + 10, y, label.toUpperCase(), 7, copper, true);
    text(x + 10, y - 16, crop || "—", 11, ink, true);
    text(x + 10, y - 34, val || "—", 14, navy, true);
    text(x + 10, y - 46, unit || "", 7, muted, false);
  }
  cardBox(36, "Best bet", best?.name, best?.fmt.netAF, "net / AF");
  if (runner) cardBox(221, "Runner-up", runner.name, runner.fmt.netAF, "net / AF");
  if (avoid) cardBox(406, "Avoid", avoid.name, avoid.fmt.netAF, "net / AF");
  y -= 74;
  if (best) {
    text(36, y, `${best.name}  ${best.fmt.netA} net/acre   ${best.fmt.farm} farm total   ${best.fmt.plantable} ac within cap`, 9, ink, false);
    y -= 16;
  }

  const sample = snap.sampleEdits || [];
  if (sample.length) {
    const line = "SAMPLE DATA  " + sample.map((s) => `${s.crop ? s.crop + " " : ""}${s.label} ${s.display}`).join("  ·  ");
    for (const ln of wrap(line, 96)) {
      text(36, y, ln, 8, copper, true);
      y -= 11;
    }
    y -= 4;
  }

  // Table header
  rect(36, y - 6, 540, 16, navy);
  const cols = [
    [40, "Crop", false],
    [200, "Net / AF", true],
    [270, "Net / acre", true],
    [350, "Farm total", true],
    [430, "Within cap", true],
    [500, "AF/ac", true],
    [548, "Dem.", true]
  ];
  cols.forEach(([x, lab]) => text(x, y, lab, 7, cream, true));
  y -= 18;

  snap.ranked.forEach((r, i) => {
    if (y < 90) return;
    if (i === 0) rect(36, y - 5, 540, 14, "0.93 0.86 0.76");
    else if (i % 2) rect(36, y - 5, 540, 14, soft);
    text(40, y, r.name, 8, ink, i === 0);
    text(200, y, r.fmt.netAF, 8, ink, false);
    text(270, y, r.fmt.netA, 8, ink, false);
    text(350, y, r.fmt.farm, 8, ink, false);
    text(430, y, `${r.fmt.plantable} ac`, 8, ink, false);
    text(500, y, r.fmt.af, 8, ink, false);
    const d = r.demand === "up" ? "^" : r.demand === "down" ? "v" : r.demand === "flat" ? "-" : "—";
    text(552, y, d, 8, ink, false);
    y -= 14;
  });
  (snap.pending || []).forEach((p) => {
    if (y < 90) return;
    text(40, y, p.name, 8, muted, false);
    text(200, y, "No AZ FOB - not ranked", 8, muted, false);
    y -= 14;
  });

  y -= 8;
  const note = "Planning estimate, not agronomic, water-rights, or financial advice. Ranked by net dollars per acre-foot. Prices, yields, water, and default costs are sourced University of Arizona and USDA figures. Demand arrows are AMS FVWRETAIL national conventional ad counts (Southwest region), Nov 6, 2026.";
  for (const ln of wrap(note, 98)) {
    if (y < 56) break;
    text(36, y, ln, 7, muted, false);
    y -= 10;
  }
  rect(0, 0, 612, 40, navy);
  text(36, 18, "Leave the drought to nature, not your bank account.", 8, cream, false);
  text(470, 18, "Ag Compass", 8, copper, true);

  const stream = ops.join("\n") + "\n";
  const streamBytes = new TextEncoder().encode(stream);

  function obj(n, body) {
    return `${n} 0 obj\n${body}\nendobj\n`;
  }
  const parts = [];
  parts.push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const bodies = [
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>"),
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>"),
    obj(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    obj(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
    `6 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`
  ];

  // Build with byte offsets
  const enc = new TextEncoder();
  const chunks = [enc.encode("%PDF-1.4\n%\xff\xff\xff\xff\n")];
  const offsets = [0];
  function push(u8) {
    chunks.push(u8);
  }
  function pushStr(s) {
    chunks.push(enc.encode(s));
  }
  function sizeSoFar() {
    return chunks.reduce((n, c) => n + c.length, 0);
  }
  for (const b of [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  ]) {
    offsets.push(sizeSoFar());
    pushStr(`${offsets.length} 0 obj\n${b}\nendobj\n`);
  }
  // fix: offsets.length after push is the object number, but we pushed after recording offset with wrong n.
  // Redo more carefully below - I'll reconstruct from scratch in a cleaner loop.
  // (This function continues with a clean builder.)
  return buildPdfFromOps(ops);
}

function buildPdfFromOps(ops) {
  const stream = ops.join("\n") + "\n";
  const enc = new TextEncoder();
  const streamBytes = enc.encode(stream);
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  ];
  const chunks = [];
  const offsets = [0];
  const push = (u8) => chunks.push(typeof u8 === "string" ? enc.encode(u8) : u8);
  push("%PDF-1.4\n%\xff\xff\xff\xff\n");
  objs.forEach((body, i) => {
    offsets.push(chunks.reduce((n, c) => n + c.length, 0));
    push(`${i + 1} 0 obj\n${body}\nendobj\n`);
  });
  offsets.push(chunks.reduce((n, c) => n + c.length, 0));
  push(`6 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`);
  push(streamBytes);
  push("\nendstream\nendobj\n");
  const xrefAt = chunks.reduce((n, c) => n + c.length, 0);
  let xref = `xref\n0 7\n0000000000 65535 f \n`;
  for (let i = 1; i <= 6; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  push(xref);
  push(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`);
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return new Blob([out], { type: "application/pdf" });
}

export function downloadReportPdf(snap, { demo = false } = {}) {
  const blob = buildReportPdf(snap, { demo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { blob, filename: FILENAME };
}

/* ---- UI shells ---- */
let reportRoot, composeRoot, lastSnap = null, lastDemo = false, lastPdf = null;

export function lastReportAttachment() {
  return lastPdf;
}

export function mountReport() {
  if (reportRoot) return;
  reportRoot = document.createElement("div");
  reportRoot.id = "report-stage";
  reportRoot.className = "report-stage";
  reportRoot.hidden = true;
  reportRoot.innerHTML = `
    <div class="report-toolbar">
      <p class="report-toolbar-title">Print preview</p>
      <div class="report-toolbar-actions">
        <button type="button" class="btn" id="rpt-btn-pdf">Save as PDF</button>
        <button type="button" class="btn" id="rpt-btn-print">Print</button>
        <button type="button" class="btn primary" id="rpt-btn-email">Attach to email</button>
        <button type="button" class="btn" id="rpt-btn-close">Close</button>
      </div>
    </div>
    <div class="report-desk">
      <article class="report-sheet" id="report-sheet"></article>
    </div>
    <div class="save-dialog" id="save-dialog" hidden>
      <div class="save-dialog-card">
        <p class="save-kicker">Ag Compass</p>
        <h2>Save as PDF</h2>
        <label class="field">File name<input id="save-filename" type="text" value="${FILENAME}" readonly></label>
        <p class="save-status" id="save-status" hidden></p>
        <div class="save-actions">
          <button type="button" class="btn" id="save-cancel">Cancel</button>
          <button type="button" class="btn primary" id="save-confirm">Save</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(reportRoot);

  composeRoot = document.createElement("div");
  composeRoot.id = "compose-stage";
  composeRoot.className = "compose-stage";
  composeRoot.hidden = true;
  composeRoot.innerHTML = `
    <div class="compose-card" role="dialog" aria-labelledby="compose-title">
      <header class="compose-head">
        <img src="assets/ag_compass_logo_copper.png" width="36" height="36" alt="">
        <div>
          <p class="compose-kicker">Ag Compass message</p>
          <h2 id="compose-title">New message</h2>
        </div>
        <button type="button" class="compose-x" id="compose-close" aria-label="Close">×</button>
      </header>
      <p class="compose-demo-note"><span class="sample-tag">sample data</span> Demo only — this does not send a message.</p>
      <label class="compose-field">To
        <input id="compose-to" type="text" autocomplete="off">
      </label>
      <label class="compose-field">Subject
        <input id="compose-subject" type="text" autocomplete="off">
      </label>
      <label class="compose-field">Message
        <textarea id="compose-body" rows="8"></textarea>
      </label>
      <div class="compose-attach" id="compose-attach" hidden>
        <span class="compose-clip" aria-hidden="true">📎</span>
        <div>
          <div class="compose-file" id="compose-file">${FILENAME}</div>
          <div class="compose-file-meta" id="compose-file-meta">PDF attached</div>
        </div>
      </div>
      <div class="compose-actions">
        <button type="button" class="btn primary" id="compose-send">Send</button>
        <button type="button" class="btn" id="compose-cancel">Cancel</button>
      </div>
      <div class="compose-sent" id="compose-sent" hidden>
        <div class="compose-check">✓</div>
        <h3>Sent (demo)</h3>
        <p>Nothing was transmitted. This confirmation is part of the walk-through.</p>
        <button type="button" class="btn" id="compose-sent-close">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(composeRoot);

  $("#rpt-btn-close", reportRoot).addEventListener("click", closeReport);
  $("#rpt-btn-print", reportRoot).addEventListener("click", () => {
    document.body.classList.add("print-decision");
    window.print();
    setTimeout(() => document.body.classList.remove("print-decision"), 400);
  });
  $("#rpt-btn-pdf", reportRoot).addEventListener("click", () => openSaveDialog());
  $("#rpt-btn-email", reportRoot).addEventListener("click", () => {
    if (!lastSnap) return;
    ensurePdf();
    openCompose(lastSnap, { demo: lastDemo });
  });
  $("#save-cancel", reportRoot).addEventListener("click", () => {
    $("#save-dialog", reportRoot).hidden = true;
  });
  $("#save-confirm", reportRoot).addEventListener("click", () => {
    doSavePdf();
  });
  $("#compose-close", composeRoot).addEventListener("click", closeCompose);
  $("#compose-cancel", composeRoot).addEventListener("click", closeCompose);
  $("#compose-sent-close", composeRoot).addEventListener("click", closeCompose);
  $("#compose-send", composeRoot).addEventListener("click", () => simulateSend());

  window.addEventListener("resize", () => fitReportSheet());

  document.addEventListener("agcompass:report", (ev) => {
    if (ev.detail) openReport(ev.detail, { demo: document.body.classList.contains("demo-running") });
  });
}

function ensurePdf() {
  if (!lastSnap) return null;
  lastPdf = {
    filename: FILENAME,
    blob: buildReportPdf(lastSnap, { demo: lastDemo })
  };
  return lastPdf;
}

export function openSaveDialog() {
  const dlg = $("#save-dialog", reportRoot);
  if (!dlg) return;
  $("#save-status", reportRoot).hidden = true;
  $("#save-status", reportRoot).textContent = "";
  $("#save-confirm", reportRoot).disabled = false;
  dlg.hidden = false;
}

export function doSavePdf() {
  if (!lastSnap) return;
  const status = $("#save-status", reportRoot);
  const btn = $("#save-confirm", reportRoot);
  if (status) {
    status.hidden = false;
    status.textContent = "Saving…";
  }
  if (btn) btn.disabled = true;
  const result = downloadReportPdf(lastSnap, { demo: lastDemo });
  lastPdf = { filename: result.filename, blob: result.blob };
  if (status) status.textContent = `Saved ${result.filename}`;
  return result;
}

export function closeSaveDialog() {
  const dlg = $("#save-dialog", reportRoot);
  if (dlg) dlg.hidden = true;
}

export function openReport(snap, { demo = false } = {}) {
  mountReport();
  lastSnap = snap;
  lastDemo = demo;
  lastPdf = null;
  const sheet = $("#report-sheet", reportRoot);
  sheet.innerHTML = reportInnerHtml(snap, { demo });
  reportRoot.hidden = false;
  document.body.classList.add("report-open");
  closeSaveDialog();
  const desk = reportRoot.querySelector(".report-desk");
  if (desk) desk.scrollTop = 0;
  fitReportSheet();
  requestAnimationFrame(fitReportSheet);
}

export function fitReportSheet() {
  if (!reportRoot || reportRoot.hidden) return;
  const desk = reportRoot.querySelector(".report-desk");
  const sheet = $("#report-sheet", reportRoot);
  if (!desk || !sheet) return;
  sheet.style.transform = "none";
  sheet.style.marginBottom = "0";
  const availW = Math.max(200, desk.clientWidth - 32);
  const availH = Math.max(200, desk.clientHeight - 24);
  const w = sheet.offsetWidth || 816;
  const h = sheet.offsetHeight || 1056;
  const s = Math.min(1, availW / w, availH / h);
  sheet.style.transformOrigin = "top center";
  if (s < 0.995) {
    sheet.style.transform = "scale(" + s + ")";
    sheet.style.marginBottom = ((s - 1) * h) + "px";
  } else {
    sheet.style.transform = "none";
  }
}

export function closeReport() {
  if (!reportRoot) return;
  reportRoot.hidden = true;
  document.body.classList.remove("report-open", "print-decision");
  closeSaveDialog();
}

export function isReportOpen() {
  return reportRoot && !reportRoot.hidden;
}

export function openCompose(snap, { demo = true, prefill = true } = {}) {
  mountReport();
  const mail = defaultEmail(snap || lastSnap || { ranked: [], farmName: "Sample Farm", zoneName: "Yuma", acres: 0, allot: 0, sampleEdits: [] });
  composeRoot.hidden = false;
  document.body.classList.add("compose-open");
  $("#compose-sent", composeRoot).hidden = true;
  $(".compose-card", composeRoot).classList.remove("is-sent");
  $("#compose-attach", composeRoot).hidden = !lastPdf;
  if (lastPdf) {
    const kb = Math.max(1, Math.round((lastPdf.blob.size || 12000) / 1024));
    $("#compose-file", composeRoot).textContent = lastPdf.filename;
    $("#compose-file-meta", composeRoot).textContent = `PDF · ${kb} KB · attached`;
    $("#compose-attach", composeRoot).hidden = false;
  }
  if (prefill) {
    $("#compose-to", composeRoot).value = mail.to;
    $("#compose-subject", composeRoot).value = mail.subject;
    $("#compose-body", composeRoot).value = mail.body;
  } else {
    $("#compose-to", composeRoot).value = "";
    $("#compose-subject", composeRoot).value = "";
    $("#compose-body", composeRoot).value = "";
  }
  return mail;
}

export function fillCompose(fields) {
  if (fields.to != null) $("#compose-to", composeRoot).value = fields.to;
  if (fields.subject != null) $("#compose-subject", composeRoot).value = fields.subject;
  if (fields.body != null) $("#compose-body", composeRoot).value = fields.body;
}

export function showAttachment() {
  if (!composeRoot) return;
  if (!lastPdf && lastSnap) ensurePdf();
  if (lastPdf) {
    const kb = Math.max(1, Math.round((lastPdf.blob.size || 12000) / 1024));
    $("#compose-file", composeRoot).textContent = lastPdf.filename;
    $("#compose-file-meta", composeRoot).textContent = `PDF · ${kb} KB · attached`;
    $("#compose-attach", composeRoot).hidden = false;
    $("#compose-attach", composeRoot).classList.add("is-in");
  }
}

export function simulateSend() {
  if (!composeRoot) return Promise.resolve();
  const btn = $("#compose-send", composeRoot);
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sending…";
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      $(".compose-card", composeRoot).classList.add("is-sent");
      $("#compose-sent", composeRoot).hidden = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Send";
      }
      resolve();
    }, 900);
  });
}

export function closeCompose() {
  if (!composeRoot) return;
  composeRoot.hidden = true;
  document.body.classList.remove("compose-open");
  const btn = $("#compose-send", composeRoot);
  if (btn) {
    btn.disabled = false;
    btn.textContent = "Send";
  }
  $("#compose-sent", composeRoot)?.setAttribute("hidden", "");
  $(".compose-card", composeRoot)?.classList.remove("is-sent");
}

export function isComposeOpen() {
  return composeRoot && !composeRoot.hidden;
}

export { FILENAME as REPORT_FILENAME };
