(() => {
  const API_URL = "https://data-asg.goldprice.org/dbXRates/USD";
  const FALLBACK_GOLD = "https://data-asg.goldprice.org/GetData/USD-XAU/1";
  const FALLBACK_SILVER = "https://data-asg.goldprice.org/GetData/USD-XAG/1";
  const OUNCE_IN_GRAMS = 31.1034768;
  const REFRESH_MS = 60_000;
  const MAX_POINTS = 90; // keep roughly 90 minutes of history

  const els = {
    goldOunce: document.getElementById("gold-ounce"),
    goldGram: document.getElementById("gold-gram"),
    goldChange: document.getElementById("gold-change"),
    silverOunce: document.getElementById("silver-ounce"),
    silverGram: document.getElementById("silver-gram"),
    silverChange: document.getElementById("silver-change"),
    lastUpdated: document.getElementById("last-updated"),
    status: document.getElementById("status"),
    refreshBtn: document.getElementById("refresh-btn"),
    chart: document.getElementById("price-chart"),
    gramsInput: document.getElementById("grams-input"),
    ouncesInput: document.getElementById("ounces-input"),
  };

  const history = [];
  let fetchInProgress = false;
  let refreshTimer;
  let suppressConverter = false;

  function formatMoney(value, decimals = 2) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatPercent(value) {
    if (value === null || Number.isNaN(value)) return "--%";
    const fixed = value.toFixed(2);
    const signed = value > 0 ? `+${fixed}` : fixed;
    return `${signed}%`;
  }

  function setStatus(message, isError = false) {
    if (!els.status) return;
    els.status.textContent = message;
    els.status.style.color = isError ? "#ef6f6f" : "var(--muted)";
  }

  function updateChangeChip(el, value) {
    if (!el) return;
    el.textContent = formatPercent(value);
    el.classList.remove("chip-muted", "positive", "negative");
    if (value === null || Number.isNaN(value)) {
      el.classList.add("chip-muted");
      return;
    }
    el.classList.add(value >= 0 ? "positive" : "negative");
  }

  function setLastUpdated(date) {
    if (!els.lastUpdated) return;
    const options = { hour: "2-digit", minute: "2-digit" };
    const stamp = date.toLocaleTimeString([], options);
    els.lastUpdated.textContent = `Updated ${stamp}`;
    els.lastUpdated.classList.remove("pill-muted");
  }

  async function fetchPrimary() {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const item = data?.items?.[0];
    if (!item) throw new Error("Feed missing payload");
    return {
      goldOunce: Number(item.xauPrice),
      silverOunce: Number(item.xagPrice),
      goldChange: Number(item.pcXau),
      silverChange: Number(item.pcXag),
      timestamp: new Date(Number(item.ts || data.ts) || Date.now()),
      source: "goldprice",
    };
  }

  async function fetchFallback() {
    const [goldRes, silverRes] = await Promise.all([
      fetch(FALLBACK_GOLD, { cache: "no-store" }),
      fetch(FALLBACK_SILVER, { cache: "no-store" }),
    ]);
    if (!goldRes.ok || !silverRes.ok) {
      throw new Error("Fallback feed unavailable");
    }
    const [goldJson, silverJson] = await Promise.all([
      goldRes.json(),
      silverRes.json(),
    ]);

    const parseLine = (entry) => {
      const line = Array.isArray(entry) ? entry[0] : entry;
      const [, price] = String(line).split(",");
      return Number(price);
    };

    return {
      goldOunce: parseLine(goldJson),
      silverOunce: parseLine(silverJson),
      goldChange: null,
      silverChange: null,
      timestamp: new Date(),
      source: "fallback",
    };
  }

  async function fetchPrices() {
    try {
      return await fetchPrimary();
    } catch (err) {
      console.warn("Primary feed failed, switching to fallback", err);
      return fetchFallback();
    }
  }

  function updateCards(payload) {
    const goldPerGram = payload.goldOunce / OUNCE_IN_GRAMS;
    const silverPerGram = payload.silverOunce / OUNCE_IN_GRAMS;

    els.goldOunce.textContent = formatMoney(payload.goldOunce, 2);
    els.goldGram.textContent = formatMoney(goldPerGram, 2);
    els.silverOunce.textContent = formatMoney(payload.silverOunce, 2);
    els.silverGram.textContent = formatMoney(silverPerGram, 3);

    updateChangeChip(els.goldChange, payload.goldChange);
    updateChangeChip(els.silverChange, payload.silverChange);
  }

  function appendHistory(payload) {
    const point = {
      time: payload.timestamp || new Date(),
      gold: payload.goldOunce,
      silver: payload.silverOunce,
    };

    history.push(point);
    if (history.length > MAX_POINTS) history.shift();
  }

  function drawChart() {
    const canvas = els.chart;
    if (!canvas || !history.length) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const values = history.flatMap((p) => [p.gold, p.silver]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.12 || 1;
    const top = max + padding;
    const bottom = min - padding;
    const margin = 40;

    const plotWidth = width - margin * 2;
    const plotHeight = height - margin * 2;

    const getX = (index) => {
      const denom = Math.max(history.length - 1, 1);
      return margin + (index / denom) * plotWidth;
    };
    const getY = (value) => {
      const ratio = (value - bottom) / (top - bottom);
      return margin + (1 - ratio) * plotHeight;
    };

    // grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    const steps = 4;
    ctx.font = `${12 * dpr}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";

    for (let i = 0; i <= steps; i++) {
      const y = margin + (plotHeight / steps) * i;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();

      const labelVal = top - ((top - bottom) / steps) * i;
      ctx.save();
      ctx.scale(1 / dpr, 1 / dpr);
      ctx.fillText(labelVal.toFixed(0), (width - margin + 6) * dpr, (y + 4) * dpr);
      ctx.restore();
    }

    const drawSeries = (key, color) => {
      ctx.beginPath();
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = color;
      history.forEach((point, idx) => {
        const x = getX(idx);
        const y = getY(point[key]);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // latest dot
      const last = history[history.length - 1];
      const x = getX(history.length - 1);
      const y = getY(last[key]);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    };

    drawSeries("gold", "#e3c372");
    drawSeries("silver", "#c4ccd8");
  }

  async function refresh(trigger = "auto") {
    if (fetchInProgress) return;
    fetchInProgress = true;
    if (trigger === "manual") setStatus("Refreshing…");

    try {
      const payload = await fetchPrices();
      updateCards(payload);
      appendHistory(payload);
      drawChart();
      setLastUpdated(payload.timestamp || new Date());

      if (payload.source === "goldprice") {
        setStatus("Live data connected (GoldPrice.org)");
      } else {
        setStatus("Using backup feed (change % unavailable)");
      }
    } catch (err) {
      console.error(err);
      setStatus("Unable to load live prices. Retrying shortly.", true);
    } finally {
      fetchInProgress = false;
    }
  }

  function initConverter() {
    if (!els.gramsInput || !els.ouncesInput) return;
    els.gramsInput.value = "1.00";
    els.ouncesInput.value = (1 / OUNCE_IN_GRAMS).toFixed(4);

    const gramsToOunces = (g) => g / OUNCE_IN_GRAMS;
    const ouncesToGrams = (o) => o * OUNCE_IN_GRAMS;

    els.gramsInput.addEventListener("input", () => {
      if (suppressConverter) return;
      suppressConverter = true;
      const grams = parseFloat(els.gramsInput.value);
      els.ouncesInput.value = Number.isFinite(grams)
        ? gramsToOunces(grams).toFixed(4)
        : "";
      suppressConverter = false;
    });

    els.ouncesInput.addEventListener("input", () => {
      if (suppressConverter) return;
      suppressConverter = true;
      const ounces = parseFloat(els.ouncesInput.value);
      els.gramsInput.value = Number.isFinite(ounces)
        ? ouncesToGrams(ounces).toFixed(2)
        : "";
      suppressConverter = false;
    });
  }

  function startAutoRefresh() {
    refresh();
    clearInterval(refreshTimer);
    refreshTimer = setInterval(refresh, REFRESH_MS);
  }

  function init() {
    initConverter();
    startAutoRefresh();

    if (els.refreshBtn) {
      els.refreshBtn.addEventListener("click", () => refresh("manual"));
    }

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refresh("resume");
    });

    window.addEventListener("resize", drawChart);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
