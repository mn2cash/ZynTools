// Performance: serve static assets with Cache-Control (e.g., max-age=86400) for faster repeat visits
const COINS = ["bitcoin", "ethereum", "solana", "dogecoin", "ripple", "binancecoin", "cardano"];
const API_BASE = "https://api.coingecko.com/api/v3/coins/markets";
const CORS_PROXY = "https://corsproxy.io/?"; // fallback proxy to bypass CORS if primary fails
const DEMO_API_KEY = ""; // Optional: add your CoinGecko x_cg_demo_api_key here to reduce CORS/rate-limit issues
const REFRESH_INTERVAL = 10000;

const tableBody = document.getElementById("table-body");
const skeleton = document.getElementById("skeleton");
const statusText = document.getElementById("status-text");
const errorBanner = document.getElementById("error-banner");
const refreshBtn = document.getElementById("refresh-btn");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  notation: "compact",
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let intervalId;
let hasLoadedOnce = false;
let usingProxy = false;

function buildApiUrl(useProxy = false) {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: COINS.join(","),
    sparkline: "false",
    price_change_percentage: "24h",
  });

  if (DEMO_API_KEY) {
    params.append("x_cg_demo_api_key", DEMO_API_KEY);
  }

  const url = `${API_BASE}?${params.toString()}`;
  return useProxy ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
}

function setStatus(message, type = "info") {
  statusText.textContent = message;
  statusText.style.color = type === "error" ? "#ff5a7a" : "#8da0c2";
}

function showSkeleton() {
  skeleton.classList.add("active");
}

function hideSkeleton() {
  skeleton.classList.remove("active");
}

function formatChange(value) {
  const formatted = numberFormatter.format(value ?? 0);
  const isPositive = value >= 0;
  const cls = isPositive ? "positive" : "negative";
  return `<span class="pill ${cls}">${isPositive ? "+" : ""}${formatted}%</span>`;
}

function formatRow(coin) {
  return `
    <tr class="flash">
      <td>
        <div class="coin-cell">
          <img src="${coin.image}" alt="${coin.name} logo" loading="lazy">
          <div>${coin.name}</div>
        </div>
      </td>
      <td class="muted">${coin.symbol.toUpperCase()}</td>
      <td>${currencyFormatter.format(coin.current_price)}</td>
      <td>${formatChange(coin.price_change_percentage_24h)}</td>
      <td>${compactCurrency.format(coin.market_cap)}</td>
    </tr>
  `;
}

async function fetchPrices() {
  if (!hasLoadedOnce) {
    showSkeleton();
  }
  setStatus(usingProxy ? "Fetching via backup route..." : "Fetching latest data...");
  errorBanner.hidden = true;

  try {
    const data = await fetchWithFallback();
    renderTable(data);
    setStatus(`Updated ${new Date().toLocaleTimeString()}`);
    hasLoadedOnce = true;
  } catch (err) {
    console.error(err);
    errorBanner.textContent = "Unable to load data right now. Please try again shortly.";
    errorBanner.hidden = false;
    setStatus("Connection issue. Retrying...", "error");
  } finally {
    hideSkeleton();
  }
}

async function fetchWithFallback() {
  try {
    usingProxy = false;
    return await fetchJson(buildApiUrl(false));
  } catch (primaryErr) {
    console.warn("Primary fetch failed, retrying with proxy", primaryErr);
    usingProxy = true;
    return await fetchJson(buildApiUrl(true));
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

function renderTable(data) {
  const rows = data
    .sort((a, b) => b.market_cap - a.market_cap)
    .map(formatRow)
    .join("");
  tableBody.innerHTML = rows;
}

function startAutoRefresh() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(fetchPrices, REFRESH_INTERVAL);
}

refreshBtn.addEventListener("click", () => {
  fetchPrices();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(intervalId);
  } else {
    startAutoRefresh();
    fetchPrices();
  }
});

// Initial load
fetchPrices();
startAutoRefresh();
