/* Live NOAA NESDIS GOES-19 (GOES-East) Southern Rockies GeoColor,
   cropped to Arizona and Sonora. Frames are official 5-minute 1200×1200
   JPGs; the rolling 600×600 GIF is a fallback. */

const BASE = "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/sr/GEOCOLOR";
const LATEST = `${BASE}/1200x1200.jpg`;
const LOOP_GIF = `${BASE}/GOES19-SR-GEOCOLOR-600x600.gif`;
const SECTOR_PAGE = "https://www.star.nesdis.noaa.gov/GOES/sector.php?sat=G19&sector=sr";
const LOCAL_STILL = new URL("../assets/goes-az-sonora-fallback.jpg", import.meta.url).href;

const FRAME_COUNT = 24; // 2 hours at 5 minutes
const FRAME_MS = 180;
const HOLD_LAST_MS = 900;
const REFRESH_MS = 5 * 60 * 1000;

function pad(n, w = 2) {
  return String(n).padStart(w, "0");
}

function doyUTC(d) {
  const y = d.getUTCFullYear();
  return Math.floor((Date.UTC(y, d.getUTCMonth(), d.getUTCDate()) - Date.UTC(y, 0, 1)) / 86400000) + 1;
}

function frameName(d) {
  return `${d.getUTCFullYear()}${pad(doyUTC(d), 3)}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}_GOES19-ABI-sr-GEOCOLOR-1200x1200.jpg`;
}

function frameUrl(d) {
  return `${BASE}/${frameName(d)}`;
}

function floorToSlot(d) {
  const t = new Date(d.getTime());
  t.setUTCSeconds(0, 0);
  const m = t.getUTCMinutes();
  const rem = m % 5;
  const adj = rem === 1 ? 0 : rem === 0 ? 4 : rem - 1;
  return new Date(t.getTime() - adj * 60000);
}

function candidateTimes(count = FRAME_COUNT) {
  // Filenames land on minutes ending in 1 or 6 (01, 06, … 56). Leave a 5-minute
  // cushion so the newest slot has usually landed on the CDN.
  let t = new Date(floorToSlot(new Date()).getTime() - 5 * 60000);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(new Date(t.getTime() - i * 5 * 60000));
  }
  return out.reverse();
}

function formatArizona(d) {
  if (!d || Number.isNaN(d.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t)?.value || "";
  return `${g("month")} ${g("day")}, ${g("year")}, ${g("hour")}:${g("minute")} ${g("dayPeriod")} Arizona time`;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load failed"));
    img.src = url;
  });
}

export function mountGoes(root) {
  if (!root) return;
  const viewport = root.querySelector(".goes-viewport");
  const img = root.querySelector("#cab-goes");
  const stamp = root.querySelector("#goes-stamp");
  const toggle = root.querySelector("#goes-toggle");
  if (!viewport || !img) return;

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let frames = []; // { url, time }
  let idx = 0;
  let timer = 0;
  let playing = !reduced;
  let currentTime = null;

  function setStamp(d, looping, label) {
    currentTime = d;
    if (!stamp) return;
    const when = label || formatArizona(d);
    const mode = label ? "Cached" : (looping ? "Loop" : "Latest");
    stamp.innerHTML = `${when} <sup class="plant-src" title="NOAA NESDIS STAR GOES-19 (GOES-East) Southern Rockies GeoColor, cropped on the board to Arizona and Sonora. Official 5-minute frames. ${SECTOR_PAGE}">NOAA</sup><span class="goes-mode">${mode}</span>`;
  }

  async function showLocalFallback() {
    try {
      await loadImage(LOCAL_STILL);
      show(LOCAL_STILL, null, false);
      setStamp(null, false, "Cached NOAA frame (offline)");
      return true;
    } catch (_) {
      return false;
    }
  }

  function show(url, time, looping) {
    if (img.src !== url) img.src = url;
    setStamp(time, looping);
  }

  function tick() {
    if (!playing || frames.length < 2) return;
    const last = idx === frames.length - 1;
    const hold = last ? HOLD_LAST_MS : FRAME_MS;
    timer = window.setTimeout(() => {
      idx = (idx + 1) % frames.length;
      const f = frames[idx];
      show(f.url, f.time, true);
      tick();
    }, hold);
  }

  function startLoop() {
    window.clearTimeout(timer);
    if (reduced || !playing || frames.length < 2) return;
    tick();
  }

  function stopLoop() {
    window.clearTimeout(timer);
    timer = 0;
  }

  async function loadFrames() {
    const times = candidateTimes();
    const found = [];
    await Promise.all(
      times.map((t) =>
        loadImage(frameUrl(t))
          .then(() => found.push({ url: frameUrl(t), time: t }))
          .catch(() => null)
      )
    );
    found.sort((a, b) => a.time - b.time);
    if (found.length) {
      frames = found;
      idx = frames.length - 1;
      show(frames[idx].url, frames[idx].time, playing && frames.length > 1);
      if (playing) startLoop();
      return true;
    }
    return false;
  }

  async function loadLatestStill() {
    const cacheBust = `${LATEST}?t=${Date.now()}`;
    try {
      await loadImage(cacheBust);
      let when = new Date();
      try {
        const head = await fetch(cacheBust, { method: "HEAD", mode: "cors" });
        const lm = head.headers.get("Last-Modified");
        if (lm) when = new Date(lm);
      } catch (_) {
        /* timestamp stays as fetch time if HEAD is blocked */
      }
      if (!frames.length) show(cacheBust, when, false);
      return when;
    } catch (_) {
      return null;
    }
  }

  async function fallbackGif() {
    const url = `${LOOP_GIF}?t=${Date.now()}`;
    img.src = url;
    let when = new Date();
    try {
      const head = await fetch(url, { method: "HEAD", mode: "cors" });
      const lm = head.headers.get("Last-Modified");
      if (lm) when = new Date(lm);
    } catch (_) {}
    setStamp(when, true);
  }

  toggle?.addEventListener("click", () => {
    playing = !playing;
    toggle.textContent = playing ? "Pause" : "Play";
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    if (playing) startLoop();
    else {
      stopLoop();
      if (frames.length) {
        idx = frames.length - 1;
        show(frames[idx].url, frames[idx].time, false);
      }
    }
  });

  if (toggle) {
    toggle.hidden = !!reduced;
    toggle.textContent = playing ? "Pause" : "Play";
  }

  img.alt = "NOAA GOES-19 Southern Rockies GeoColor, cropped to Arizona and Sonora, Mexico";
  img.title = "NOAA NESDIS STAR GOES-19 (GOES-East) Southern Rockies GeoColor. Cropped to Arizona and Sonora. Official 5-minute frames, auto-refreshing.";

  (async () => {
    const still = await loadLatestStill();
    const ok = await loadFrames();
    const broken = !img.complete || img.naturalWidth === 0;
    if (!ok && !still) {
      const gifOk = await new Promise((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = `${LOOP_GIF}?t=${Date.now()}`;
        setTimeout(() => resolve(false), 4000);
      });
      if (gifOk) await fallbackGif();
      else await showLocalFallback();
    } else if (broken && !ok) {
      await showLocalFallback();
    }
    window.setInterval(async () => {
      const ok2 = await loadFrames();
      if (!ok2) {
        const still2 = await loadLatestStill();
        if (!still2 && (!img.complete || img.naturalWidth === 0)) await showLocalFallback();
      }
    }, REFRESH_MS);
  })();
}

export const GOES_SOURCE =
  "NOAA NESDIS STAR GOES-19 (GOES-East) Southern Rockies GeoColor, official 5-minute frames and rolling loop at https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/sr/GEOCOLOR/. The board crops that fixed sector to Arizona and Sonora (not the Pacific Southwest California/Nevada frame). Timestamp is converted from the frame’s UTC scan time to America/Phoenix. Sector page: https://www.star.nesdis.noaa.gov/GOES/sector.php?sat=G19&sector=sr";
