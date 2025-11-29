const tools = [
  { name: "Live Crypto Tracker", slug: "./LIVE-CRYPTO-PRICE-TRACKER/index.html", icon: "🪙", type: "tracker" },
  { name: "Gold & Silver Price Tracker", slug: "./GOLD---SILVER-PRICE-TRACKER/index.html", icon: "🥇", type: "tracker" },
  { name: "Currency Converter", slug: "./currency/index.html", icon: "💱", type: "converter" },
  { name: "BMI Calculator", slug: "./BMI-CALCULATOR/index.html", icon: "⚖️", type: "calculator" },
  { name: "Grade Calculator", slug: "./GCSE-A-LEVEL-GRADE-CALCULATOR/index.html", icon: "📊", type: "calculator" },
  { name: "AI Name Generator", slug: "./AI-NAME-GENERATOR/index.html", icon: "✨", type: "generator" },
  { name: "Petrol Price Tracker (UK)", slug: "./PETROL-PRICE-TRACKER--UK-/index.html", icon: "⛽", type: "tracker" }
];

const typeDescriptions = {
  tracker: tool => `Live ${tool.name.toLowerCase()} with auto-refresh, clean tables, and quick highlights for trends.`,
  converter: tool => `${tool.name} with precise rounding, instant math, and mobile-friendly inputs.`,
  calculator: tool => `${tool.name} that returns results in real time with clear ranges and guidance.`,
  generator: tool => `${tool.name} that produces fresh options on every click with smart prompt templates.`,
  finder: tool => `${tool.name} that surfaces rotating picks, filters, and on-page refresh controls.`
};

function buildCard(tool) {
  const typeLabel = tool.type.charAt(0).toUpperCase() + tool.type.slice(1);
  const card = document.createElement("article");
  card.className = "tool-card";
  card.innerHTML = `
    <div class="tool-top">
      <div class="tool-icon">${tool.icon}</div>
      <div>
        <div class="tool-name">${tool.name}</div>
        <p class="tool-desc">${(typeDescriptions[tool.type] || (() => `${tool.name} that runs fast on any device.`))(tool)}</p>
      </div>
    </div>
    <div class="card-footer">
      <span class="chip">${typeLabel}</span>
      <a class="btn secondary" href="${tool.slug}">Open Tool</a>
    </div>
  `;
  return card;
}

function populateTools() {
  const grid = document.querySelector("#toolGrid");
  if (!grid) return;
  const frag = document.createDocumentFragment();
  tools.forEach(tool => frag.appendChild(buildCard(tool)));
  grid.appendChild(frag);
}

function handleSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function handleNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

function setYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function setupFaq() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;
    question.addEventListener("click", () => {
      const isOpen = item.classList.toggle("active");
      question.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function cardHoverEffects() {
  document.querySelectorAll(".tool-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateTools();
  handleSmoothScroll();
  handleNavToggle();
  setupFaq();
  setYear();
  cardHoverEffects();
});
