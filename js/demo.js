import { getPlantApi } from "./plant.js";
import {
  openReport, closeReport, openSaveDialog, doSavePdf, closeSaveDialog,
  openCompose, closeCompose, fillCompose, showAttachment, simulateSend,
  defaultEmail, isReportOpen, isComposeOpen, lastReportAttachment, REPORT_FILENAME
} from "./report.js";

const CURSOR_SVG = `<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
  <path d="M4 2.5 L4 24 L10.2 18.8 L14.8 29.2 L18.6 27.6 L14.1 17.4 L22.5 17.4 Z"
    fill="#E8D5C0" stroke="#182840" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M5.2 4.2 L5.2 21.4 L10.4 16.8 L14.8 26.6 L17.2 25.6 L12.8 15.8 L20.6 15.8 Z"
    fill="#B87333"/>
</svg>`;

function $(id) { return document.getElementById(id); }

function params() {
  const p = new URLSearchParams(location.search);
  const speed = Number(p.get("demoSpeed") || p.get("speed") || "1") || 1;
  return { auto: p.get("demo") === "1" || p.get("demo") === "true", speed: Math.min(4, Math.max(0.4, speed)) };
}

function pointOf(el, at = "center") {
  const r = el.getBoundingClientRect();
  if (at === "input") return { x: r.left + Math.min(48, r.width * 0.4), y: r.top + r.height * 0.62 };
  if (at === "right") return { x: r.right - 16, y: r.top + r.height / 2 };
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function mountDemo() {
  const cfg = params();
  let running = false;
  let paused = false;
  let abort = false;
  let skipFlag = false;
  let speed = cfg.speed;
  let cursor = null;
  let chrome = null;
  let closeCard = null;
  let cx = 80;
  let cy = 80;
  let startedAt = 0;
  let finishedAt = 0;
  let currentStep = "";

  function ensureChrome() {
    if (chrome) return chrome;
    chrome = document.createElement("div");
    chrome.id = "demo-chrome";
    chrome.className = "demo-chrome";
    chrome.innerHTML = `
      <div class="demo-badge"><span class="demo-badge-mark">Demo</span> — sample data</div>
      <p class="demo-caption" id="demo-caption" role="status" aria-live="polite"></p>
      <p class="demo-keys"><kbd>Space</kbd> pause <kbd>→</kbd> skip <kbd>Esc</kbd> exit</p>
      <button type="button" class="demo-exit" id="demo-exit-btn">Exit</button>
    `;
    chrome.hidden = true;
    document.body.appendChild(chrome);
    $("demo-exit-btn").addEventListener("click", stop);
    return chrome;
  }

  function ensureCursor() {
    if (cursor) return cursor;
    cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    cursor.className = "demo-cursor";
    cursor.innerHTML = `${CURSOR_SVG}<span class="demo-ripple" hidden></span>`;
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    place(cx, cy, 0);
    return cursor;
  }

  function ensureCloseCard() {
    if (closeCard) return closeCard;
    closeCard = document.createElement("div");
    closeCard.id = "demo-close-card";
    closeCard.className = "demo-close-card";
    closeCard.hidden = true;
    closeCard.innerHTML = `
      <img src="assets/ag_compass_logo_copper.png" width="160" height="160" alt="Ag Compass">
      <p class="demo-close-brand">Ag Compass</p>
      <p class="demo-close-tag">Arizona’s market board for what Chicago doesn’t trade.</p>
      <p class="demo-close-line">Leave the drought to nature, not your bank account.</p>
    `;
    document.body.appendChild(closeCard);
    return closeCard;
  }

  function place(x, y, ms) {
    cx = x;
    cy = y;
    if (!cursor) return;
    cursor.style.transition = ms
      ? `transform ${ms}ms cubic-bezier(.22,.68,.28,1)`
      : "none";
    cursor.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  function setCaption(text) {
    const el = $("demo-caption");
    if (el) el.textContent = text || "";
  }

  function setStep(id, phase) {
    currentStep = id;
    document.body.dataset.demoStep = id;
    document.body.dataset.demoPhase = phase || "run";
    document.dispatchEvent(new CustomEvent("agcompass:demo-step", { detail: { id, phase: phase || "run" } }));
  }

  function wait(ms) {
    const need = ms / speed;
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = () => {
        if (abort) return resolve("abort");
        if (skipFlag) return resolve("skip");
        if (paused) {
          requestAnimationFrame(tick);
          return;
        }
        if (performance.now() - start >= need) return resolve("ok");
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  async function hold(ms = 4000) {
    const r = await wait(ms);
    return r;
  }

  async function moveTo(el, at, ms = 780) {
    if (!el) return;
    const inOverlay = el.closest(".report-stage, .compose-stage, .save-dialog, .demo-close-card");
    if (!inOverlay) {
      el.scrollIntoView({ behavior: speed > 1.5 ? "auto" : "smooth", block: "center", inline: "nearest" });
      await wait(Math.min(320, ms * 0.4));
    }
    if (abort) return;
    const p = pointOf(el, at);
    if (skipFlag) {
      place(p.x, p.y, 0);
      return;
    }
    place(p.x, p.y, ms / speed);
    await wait(ms);
  }

  async function ripple() {
    if (!cursor) return;
    const r = cursor.querySelector(".demo-ripple");
    if (!r) return;
    r.hidden = false;
    r.classList.remove("is-on");
    void r.offsetWidth;
    r.classList.add("is-on");
    await wait(280);
    r.classList.remove("is-on");
  }

  async function clickEl(el, at) {
    if (!el) return;
    await moveTo(el, at);
    if (abort) return;
    await ripple();
    el.classList.add("demo-press");
    try { el.focus({ preventScroll: true }); } catch (_) { try { el.focus(); } catch (__) {} }
    el.click();
    await wait(160);
    el.classList.remove("demo-press");
  }

  async function typeInto(selector, text, { clear = true, mark } = {}) {
    const plant = getPlantApi();
    let el = document.querySelector(selector);
    if (!el) return;
    await moveTo(el, "input");
    await ripple();
    el.focus();
    if (clear) {
      el.value = "";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el = document.querySelector(selector) || el;
      el.focus();
    }
    if (skipFlag) {
      el = document.querySelector(selector) || el;
      el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      let acc = clear ? "" : String(el.value || "");
      for (const ch of String(text)) {
        if (abort) return;
        if (skipFlag) {
          acc = text;
          el = document.querySelector(selector) || el;
          el.value = acc;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          break;
        }
        acc += ch;
        el = document.querySelector(selector) || el;
        el.value = acc;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        try { el.focus({ preventScroll: true }); } catch (_) {}
        try { el.setSelectionRange(acc.length, acc.length); } catch (_) {}
        await wait(95);
      }
    }
    if (mark && plant) plant.markSample(mark.scope, mark.key, mark.value);
  }

  const steps = [
    {
      id: "intro",
      caption: "A sample Yuma farm — we’ll walk a planting decision, then save and attach a report.",
      run: async () => {
        const hero = document.querySelector(".hero-stage") || document.querySelector(".command");
        hero?.scrollIntoView({ behavior: "smooth", block: "start" });
        const logo = document.querySelector(".logo-hero") || document.querySelector(".mast-brand");
        if (logo) await moveTo(logo, "center", 700);
      },
      hold: 5500
    },
    {
      id: "farm",
      caption: "Sample Farm, Yuma. A demonstration farm, not a real operator.",
      run: async () => {
        const plant = getPlantApi();
        plant?.resetForDemo();
        const board = document.getElementById("plant-board");
        board?.scrollIntoView({ behavior: "smooth", block: "start" });
        await wait(400);
        await typeInto("#plant-farm", "Sample Farm", { mark: { scope: "farm", key: "name", value: "Sample Farm" } });
      },
      hold: 4500
    },
    {
      id: "zone",
      caption: "Zone is Yuma Valley.",
      run: async () => {
        const sel = document.querySelector("#plant-zone");
        if (sel) {
          await clickEl(sel, "input");
          sel.value = "yuma";
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          await wait(200);
        }
      },
      hold: 4000
    },
    {
      id: "acres",
      caption: "120 irrigable acres.",
      run: async () => {
        await typeInto("#plant-acres", "120");
      },
      hold: 4500
    },
    {
      id: "allot",
      caption: "A 600 acre-foot allotment.",
      run: async () => {
        await typeInto("#plant-allot", "600");
      },
      hold: 4500
    },
    {
      id: "iceberg",
      caption: "Iceberg lettuce costs — sourced defaults, still editable.",
      run: async () => {
        const chip = document.querySelector('.plant-chip[data-crop="iceberg"]');
        if (chip) await clickEl(chip);
      },
      hold: 4500
    },
    {
      id: "diesel",
      caption: "A sample diesel bill for this season — not a posted rack price.",
      run: async () => {
        await typeInto("#plant-diesel", "45", { mark: { scope: "iceberg", key: "diesel", value: 45 } });
      },
      hold: 5000
    },
    {
      id: "water",
      caption: "A sample irrigation charge — tagged as sample data.",
      run: async () => {
        await typeInto("#plant-irrig", "160", { mark: { scope: "iceberg", key: "irrig", value: 160 } });
      },
      hold: 5000
    },
    {
      id: "results",
      caption: "Iceberg is the best bet on a net-per-acre-foot basis.",
      run: async () => {
        const plant = getPlantApi();
        plant?.highlight("best");
        const card = document.querySelector(".plant-card-best");
        if (card) await moveTo(card, "center", 800);
        await wait(800);
        const runner = document.querySelector(".plant-card-runner");
        if (runner) await moveTo(runner, "center", 600);
        await wait(500);
        const avoid = document.querySelector(".plant-card-avoid");
        if (avoid) await moveTo(avoid, "center", 600);
        if (card) await moveTo(card, "center", 600);
      },
      hold: 6000
    },
    {
      id: "report",
      caption: "A one-page Planting Decision Report, with the copper and navy brand.",
      run: async () => {
        const btn = document.querySelector("#plant-report");
        const plant = getPlantApi();
        if (btn) await clickEl(btn);
        else if (plant) openReport(plant.snapshot(), { demo: true });
        await wait(400);
        const desk = document.querySelector(".report-desk");
        if (desk) desk.scrollTop = 0;
        const mast = document.querySelector(".rpt-logo") || document.querySelector(".rpt-mast");
        if (mast) await moveTo(mast, "center", 700);
      },
      hold: 6000
    },
    {
      id: "save-pdf",
      caption: "Save the report as a PDF — a real file, ready to keep.",
      run: async () => {
        const btn = document.querySelector("#rpt-btn-pdf");
        if (btn) await clickEl(btn);
        else openSaveDialog();
        await wait(400);
        const save = document.querySelector("#save-confirm");
        if (save) await clickEl(save);
        else doSavePdf();
        await wait(800);
      },
      hold: 5000
    },
    {
      id: "compose",
      caption: "Attach the report to a sample message for a lender. Nothing is sent.",
      run: async () => {
        closeSaveDialog();
        const btn = document.querySelector("#rpt-btn-email");
        const plant = getPlantApi();
        const snap = plant?.snapshot();
        if (btn) {
          await clickEl(btn);
        } else if (snap) {
          openCompose(snap, { demo: true, prefill: false });
        }
        const mail = defaultEmail(snap || { ranked: [], farmName: "Sample Farm", zoneName: "Yuma Valley", acres: 120, allot: 600, sampleEdits: [] });
        // Type To and Subject so the cursor work is visible even if the panel prefilled.
        const to = document.querySelector("#compose-to");
        if (to) {
          to.value = "";
          await typeInto("#compose-to", mail.to, { clear: true });
        }
        const sub = document.querySelector("#compose-subject");
        if (sub) {
          sub.value = "";
          await typeInto("#compose-subject", mail.subject, { clear: true });
        }
        const body = document.querySelector("#compose-body");
        if (body) {
          body.value = mail.body;
          body.dispatchEvent(new Event("input", { bubbles: true }));
        }
        showAttachment();
        const att = document.querySelector("#compose-attach");
        if (att) await moveTo(att, "center", 600);
      },
      hold: 6000
    },
    {
      id: "send",
      caption: "Send — demo only.",
      run: async () => {
        const btn = document.querySelector("#compose-send");
        if (btn) await clickEl(btn);
        else await simulateSend();
        // simulateSend already animates; if we clicked, the click handler fires it.
        await wait(1100);
      },
      hold: 5000
    },
    {
      id: "sent",
      caption: "Sent (demo). No message left this computer.",
      run: async () => {
        const box = document.querySelector("#compose-sent") || document.querySelector(".compose-card");
        if (box) await moveTo(box, "center", 500);
      },
      hold: 5000
    },
    {
      id: "close",
      caption: "Ag Compass — Arizona’s market board for what Chicago doesn’t trade.",
      run: async () => {
        closeCompose();
        closeReport();
        const card = ensureCloseCard();
        card.hidden = false;
        card.classList.add("is-on");
        const logo = card.querySelector("img");
        if (logo) await moveTo(logo, "center", 700);
        await wait(3500);
        card.classList.remove("is-on");
        await wait(400);
        card.hidden = true;
        const hero = document.getElementById("year-chart") || document.querySelector(".hero-stage");
        hero?.scrollIntoView({ behavior: "smooth", block: "center" });
        const ring = document.querySelector(".hero-stage") || hero;
        if (ring) await moveTo(ring, "center", 800);
        getPlantApi()?.clearHighlight();
      },
      hold: 5500
    }
  ];

  async function play() {
    if (running) return;
    running = true;
    abort = false;
    paused = false;
    skipFlag = false;
    startedAt = performance.now();
    finishedAt = 0;
    ensureChrome();
    ensureCursor();
    chrome.hidden = false;
    cursor.hidden = false;
    document.body.classList.add("demo-running");
    const playBtn = $("btn-play-demo");
    if (playBtn) {
      playBtn.textContent = "Demo running";
      playBtn.setAttribute("aria-pressed", "true");
    }
    setCaption("Starting the walk-through.");
    setStep("start", "run");
    // Place cursor on the Play demo button first, then go.
    const startBtn = $("btn-play-demo");
    if (startBtn) {
      const p = pointOf(startBtn);
      place(p.x, p.y, 0);
      await wait(300);
    }
    for (const step of steps) {
      if (abort) break;
      skipFlag = false;
      setStep(step.id, "run");
      setCaption(step.caption);
      try {
        await step.run();
      } catch (err) {
        console.warn("Demo step failed", step.id, err);
      }
      if (abort) break;
      setStep(step.id, "hold");
      skipFlag = false;
      await hold(step.hold ?? 4000);
    }
    if (!abort) setStep("done", "done");
    finishedAt = performance.now();
    running = false;
    if (cursor) cursor.hidden = true;
    if (!abort) {
      setCaption("End of demo. Esc exits. Play demo runs it again.");
      const playBtn2 = $("btn-play-demo");
      if (playBtn2) {
        playBtn2.textContent = "Replay demo";
        playBtn2.setAttribute("aria-pressed", "false");
      }
    } else {
      teardown();
    }
  }

  function teardown() {
    running = false;
    paused = false;
    document.body.classList.remove("demo-running", "demo-paused");
    delete document.body.dataset.demoStep;
    delete document.body.dataset.demoPhase;
    if (chrome) chrome.hidden = true;
    if (cursor) cursor.hidden = true;
    if (closeCard) {
      closeCard.hidden = true;
      closeCard.classList.remove("is-on");
    }
    closeSaveDialog();
    closeCompose();
    closeReport();
    getPlantApi()?.clearHighlight();
    const playBtn = $("btn-play-demo");
    if (playBtn) {
      playBtn.textContent = "Play demo";
      playBtn.setAttribute("aria-pressed", "false");
    }
    setStep("off", "off");
  }

  function stop() {
    if (!running && !document.body.classList.contains("demo-running")) {
      teardown();
      return;
    }
    abort = true;
    paused = false;
    // play() will teardown on abort at the end; if already finished, teardown now
    if (!running) teardown();
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    document.body.classList.toggle("demo-paused", paused);
    const cap = $("demo-caption");
    if (paused) {
      if (cap && !cap.dataset.prev) cap.dataset.prev = cap.textContent;
      setCaption("Paused. Space resumes.");
    } else if (cap?.dataset.prev) {
      setCaption(cap.dataset.prev);
      delete cap.dataset.prev;
    }
  }

  function skip() {
    if (!running) return;
    if (paused) {
      paused = false;
      document.body.classList.remove("demo-paused");
    }
    skipFlag = true;
  }

  function onKey(ev) {
    const active = running || document.body.classList.contains("demo-running");
    if (!active) return;
    if (ev.key === "Escape") {
      ev.preventDefault();
      stop();
      teardown();
      return;
    }
    if (ev.key === " " || ev.code === "Space") {
      ev.preventDefault();
      togglePause();
      return;
    }
    if (ev.key === "ArrowRight") {
      ev.preventDefault();
      skip();
    }
  }

  document.addEventListener("keydown", onKey);
  const btn = $("btn-play-demo");
  if (btn) btn.addEventListener("click", () => {
    if (running) return;
    play();
  });

  window.__agDemo = {
    start: play,
    stop: () => { stop(); teardown(); },
    pause: () => { if (!paused) togglePause(); },
    resume: () => { if (paused) togglePause(); },
    skip,
    get running() { return running; },
    get paused() { return paused; },
    get step() { return currentStep; },
    get elapsedMs() { return (finishedAt || performance.now()) - startedAt; }
  };

  if (cfg.auto) {
    window.setTimeout(() => { play(); }, 900);
  }
}
