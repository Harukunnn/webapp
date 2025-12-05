const bannedDestinations = [
  "corée du nord",
  "north korea",
  "syrie",
  "afghanistan",
  "yémen",
  "somalie",
  "libye",
  "gaza",
  "zone de guerre",
  "war zone",
  "zone militaire"
];

const intelDataset = {
  tokyo: {
    summary: "Quartiers sûrs (Shinjuku, Shibuya, Ginza), transport facile par métro/Pasmo.",
    hotels: ["Shibuya Stream Excel Tokyu (4★)", "Mitsui Garden Ginza (4★)", "Park Hotel Tokyo (4★ artistique)"],
    highlights: ["Food tours à Shinjuku", "Jardins Hama-rikyu", "Onsen urbain à Odaiba"],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80", alt: "Shibuya de nuit" },
      { src: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80", alt: "Temple au lever du soleil" },
      { src: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=800&q=80", alt: "Métro japonais" }
    ]
  },
  lisbonne: {
    summary: "Ville côtière sûre, bon rapport qualité/prix, mobilité simple (tram 28, métro).",
    hotels: ["The Lumiares (4★ Bairro Alto)", "Mama Shelter Lisboa (4★)", "NH Collection Liberdade (4★)"],
    highlights: ["Miradouros, fado authentique", "Excursion à Belém", "Journée à Cascais/Sintra"],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-30&hue=-10", alt: "Tram jaune de Lisbonne" },
      { src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80", alt: "Toits de Lisbonne" },
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-20", alt: "Rue pavée en pente" }
    ]
  },
  montréal: {
    summary: "Destination très sûre, bilingue, scène food et musées riches.",
    hotels: ["Humaniti Hotel Montréal (4★)", "Hotel Monville (4★)", "Le Germain (4★ boutique)"],
    highlights: ["Vieux-Port & marché Jean-Talon", "Musée des Beaux-Arts", "Mont Royal au coucher du soleil"],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-40", alt: "Skyline de Montréal" },
      { src: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=800&q=80", alt: "Vieux-Montréal" },
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80", alt: "Mont Royal" }
    ]
  }
};

const scrapedContext = {
  tokyo: {
    flights: "Haneda (HND) est à 20 min du centre en monorail; Narita Express ≈ 55 min vers Tokyo Station (source: JR East horaires 2024).",
    hotels: "Données prix Booking 2024: Shibuya Stream Excel Tokyu ≈ 220€ nuit, Park Hotel Tokyo ≈ 210€ (flex).",
    activities: "TeamLab Planets affiche complet le week-end; réservation 2-3 semaines avant (source: billetterie officielle).",
    itinerary: "Pass 24h métro Toei/Tokyo Metro ≈ 800¥; grands quartiers ouverts jusqu’à minuit (horaires sites officiels).",
    budget: "Carte Suica/PASMO acceptée partout; plafond journalier transport urbain ~1200¥ (données Toei).",
    sources: ["JR East", "Booking", "TeamLab", "Toei"],
  },
  lisbonne: {
    flights: "Aéroport Humberto Delgado relié en métro (ligne rouge) toutes les 6–10 min (horaires Carris 2024).",
    hotels: "Lumiares 4★: suites Bairro Alto ≈ 190€; NH Liberdade 4★ ≈ 170€ avec rooftop (tarifs moyens 2024).",
    activities: "Billet Tram 28 à bord à 3€ (EMEL), Tour de Belém ouvert 10h–18h (Património Cultural).",
    itinerary: "Pass Navegante 24h zones 1–2 à 6,60€ couvrant métro/tram/ferry (source: Metropolitano de Lisboa).",
    budget: "Uber/Bolt centre-ville → Belém ≈ 8–12€ selon trafic (moyenne 2024, données publiques prix/min).",
    sources: ["Carris", "Metropolitano de Lisboa", "Património Cultural"],
  },
  montréal: {
    flights: "Ligne 747 STM aéroport → centre (24/7) billet 11$CAD incluant 24h métro/bus (tarif STM 2024).",
    hotels: "Humaniti 4★: chambres à partir de 260$CAD; Monville 4★ ≈ 210$CAD (tarifs observés 2024).",
    activities: "Musée des Beaux-Arts fermé le lundi; entrée 24$CAD (tarifs officiels). Marché Jean-Talon ouvert 8h–18h.",
    itinerary: "Pass OPUS 1 jour 11$CAD, 3 jours 21,25$CAD (tarifs STM 2024) couvrant métro/bus/747.",
    budget: "Taxi centre-ville ↔ YUL forfait 48,40$CAD (tarif fixe 2024, Ville de Montréal).",
    sources: ["STM", "Ville de Montréal", "MBAM"],
  },
};

const state = {
  discovery: null,
  concept: null,
  choices: {},
  summary: null
};

const scrapeTargetsByStage = {
  discovery: ["Tarifs moyens par nuit", "Transferts aéroport", "Quartiers sûrs", "Pics saisonniers", "Visa/arrivée"],
  profile: ["Notes clients 4★+", "Accès PMR", "Transferts rapides", "Quartiers calmes", "Politique d'annulation"],
  flights: ["Durée de vol", "Correspondances < 2h", "Baggage inclus", "Taux de retard", "Aéroports secondaires"],
  lodging: ["Prix/nuit", "Distance centre", "Petit-déjeuner", "Review > 8.5", "Late check-in"],
  activities: ["Billets horodatés", "Files coupe-file", "Ouvertures", "Annulations météo", "Accès famille"],
  itinerary: ["Temps de trajet", "Pass illimités", "Heures de pointe", "Derniers métros", "Marchabilité"],
  budget: ["Dépenses journalières", "Taux de change", "Pourboires", "Taxes locales", "Transports urbains"],
};

const dynamicState = {
  loader: null,
  loaderInterval: null,
};

const conversation = document.getElementById("conversation");
const stepList = Array.from(document.querySelectorAll("#stepList .step"));
const summaryBlock = document.getElementById("summary");
const exportBtn = document.getElementById("btnExport");
const statusPill = document.getElementById("status");
const thinkingIndicator = document.getElementById("thinkingIndicator");
const intelStatus = document.getElementById("intelStatus");
const intelCards = document.getElementById("intelCards");
const intelError = document.getElementById("intelError");
const imageStrip = document.getElementById("imageStrip");
const refreshIntelBtn = document.getElementById("btnRefreshIntel");
const liveScrapeList = document.getElementById("liveScrapeList");
const conciergeForm = document.getElementById("conciergeForm");
const conciergeNote = document.getElementById("conciergeNote");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackStatus = document.getElementById("feedbackStatus");
const btnCallMe = document.getElementById("btnCallMe");
const btnConcierge = document.getElementById("btnConcierge");
const serviceHealth = document.getElementById("serviceHealth");

function getScrapedSnippet(destination, stage) {
  const key = (destination || "").trim().toLowerCase();
  const record = scrapedContext[key];
  if (!record) {
    return {
      text: "Pas de source dédiée. On reste sur les hubs sûrs et les hôtels 4★.",
      source: "Sources ouvertes",
    };
  }
  const mapping = {
    profile: record.flights,
    flights: record.flights,
    lodging: record.hotels,
    activities: record.activities,
    itinerary: record.itinerary,
    budget: record.budget,
    discovery: `${record.flights} ${record.hotels}`,
  };
  return {
    text: mapping[stage] || record.activities,
    source: record.sources?.join(" · ") || "Sources ouvertes",
  };
}

function pushLiveScrape({ title, text, source }) {
  if (!liveScrapeList) return;
  const item = document.createElement("li");
  item.innerHTML = `<strong>${title}</strong><p>${text}</p><small>${source}</small>`;
  liveScrapeList.prepend(item);
  const items = liveScrapeList.querySelectorAll("li");
  if (items.length > 6) items[items.length - 1].remove();
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function validateScrapedItem(value = "") {
  const normalized = value.trim().toLowerCase();
  if (normalized.length < 8) return false;
  return !bannedDestinations.some((d) => normalized.includes(d));
}

function simulateScrape(stage) {
  const destination = state.discovery?.destination || "destination";
  const destinationKey = destination.trim().toLowerCase();
  const snippet = getScrapedSnippet(destination, stage);
  const targets = scrapeTargetsByStage[stage] || [];
  const intelImages = intelDataset[destinationKey]?.images || fallbackIntel(destination).images;
  const rawPieces = (snippet.text || "")
    .split(/;|\./)
    .map((part) => part.trim())
    .filter(Boolean);

  const contextual = targets.map((t) => `${t} validés pour ${destination}`);
  const transport = state.discovery?.transport ? `Transport préféré: ${state.discovery.transport}` : null;
  const lodgingStyle = state.discovery?.lodgingStyle ? `Style hôtel: ${state.discovery.lodgingStyle}` : null;
  const activityFocus = state.discovery?.activitiesFocus
    ? `Focus activités: ${state.discovery.activitiesFocus}`
    : null;

  const pool = [...rawPieces, ...contextual, transport, lodgingStyle, activityFocus]
    .filter(Boolean)
    .filter((value, index, self) => validateScrapedItem(value) && self.indexOf(value) === index);

  const paddedPool = pool.length < 5
    ? [...pool, ...targets.map((t) => `${t} (${destination})`)].filter((v, idx, self) => self.indexOf(v) === idx)
    : pool;

  const shuffled = shuffle(paddedPool).slice(0, Math.max(5, Math.min(10, paddedPool.length)));
  pushLiveScrape({
    title: `Scraping ${stage} (${shuffled.length} éléments)`,
    text: shuffled.slice(0, 3).join(" · "),
    source: snippet.source || "Sources ouvertes"
  });
  return { items: shuffled, images: intelImages };
}

function distributeScrapeToOptions(options, stage) {
  const { items, images } = simulateScrape(stage);
  if (!items?.length) return options;
  const shuffledItems = shuffle(items);
  const sliceSize = Math.max(2, Math.floor(shuffledItems.length / options.length));
  return options.map((opt, idx) => {
    const start = idx * sliceSize;
    const subset = shuffledItems.slice(start, start + sliceSize);
    const paddedSubset = subset.length ? subset : shuffledItems.slice(0, 3);
    const uniqueSubset = [...new Set(paddedSubset)].slice(0, 3);
    const image = images?.[idx % (images?.length || 1)];
    return {
      ...opt,
      scrapeHighlights: uniqueSubset,
      image,
    };
  });
}

function setStatus(text, tone = "neutral") {
  statusPill.textContent = text;
  statusPill.className = `pill ${tone}`;
}

function setIntelStatus(text, tone = "neutral") {
  if (!intelStatus) return;
  intelStatus.textContent = text;
  intelStatus.className = `muted ${tone}`;
}

function setThinking(text) {
  if (!thinkingIndicator) return;
  const label = thinkingIndicator.querySelector(".label");
  label.textContent = text;
  thinkingIndicator.classList.add("active");
}

function showStepLoader(text, durationMs, targets = []) {
  if (dynamicState.loader) dynamicState.loader.remove();
  const loader = document.createElement("article");
  loader.className = "loader-card";
  const targetList = targets.length ? `<ul class="muted">${targets.map((t) => `<li>${t}</li>`).join("")}</ul>` : "";
  loader.innerHTML = `
    <div class="loader-head">${text}</div>
    <div class="loader-bar" role="progressbar" aria-label="Simulation en cours"><span></span></div>
    <p class="muted">Scraping sécurisé (5–10s) : validation des critères et tri des doublons.</p>
    ${targetList}
  `;
  conversation.appendChild(loader);
  conversation.scrollTo({ top: conversation.scrollHeight, behavior: "smooth" });
  dynamicState.loader = loader;

  let elapsed = 0;
  const step = 500;
  dynamicState.loaderInterval = setInterval(() => {
    elapsed += step;
    const bar = loader.querySelector(".loader-bar span");
    if (bar) {
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      bar.style.width = `${pct}%`;
    }
    if (elapsed >= durationMs) {
      clearInterval(dynamicState.loaderInterval);
    }
  }, step);
}

function clearStepLoader() {
  if (dynamicState.loaderInterval) clearInterval(dynamicState.loaderInterval);
  if (dynamicState.loader) dynamicState.loader.remove();
  dynamicState.loader = null;
  dynamicState.loaderInterval = null;
}

function stopThinking(message = "En attente d’une requête.") {
  if (!thinkingIndicator) return;
  thinkingIndicator.classList.remove("active");
  const label = thinkingIndicator.querySelector(".label");
  label.textContent = message;
}

function persistState() {
  const safeState = { ...state };
  localStorage.setItem("agenticState", JSON.stringify(safeState));
}

function restoreState() {
  const saved = localStorage.getItem("agenticState");
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    state.discovery = parsed.discovery || null;
    state.concept = parsed.concept || null;
    state.choices = parsed.choices || {};
    state.summary = parsed.summary || null;
    const form = document.getElementById("discoveryForm");
    if (form && parsed.discovery) {
      Object.entries(parsed.discovery).forEach(([k, v]) => {
        if (form.elements[k]) form.elements[k].value = v;
      });
      if (parsed.summary) {
        buildSummary();
      }
    }
  } catch (e) {
    console.warn("State restore failed", e);
  }
}

function clearUI(skipPersist = false) {
  conversation.innerHTML = '<p class="muted">Flux prêt. Deux options ultra-courtes.</p>';
  summaryBlock.innerHTML = "";
  exportBtn.disabled = true;
  intelCards.innerHTML = "";
  imageStrip.innerHTML = "";
  showIntelError("");
  setIntelStatus("En pause");
  refreshIntelBtn.disabled = true;
  stepList.forEach((s) => s.classList.remove("done", "active"));
  stepList[0].classList.add("active");
  setStatus("En attente");
  stopThinking();
  clearStepLoader();
  state.discovery = null;
  state.concept = null;
  state.choices = {};
  state.summary = null;
  if (!skipPersist) persistState();
}

function addMessage({ title, agent, body, options = [], question }) {
  stopThinking("L’IA attend votre validation.");
  const card = document.createElement("article");
  card.className = "message";
  const heading = document.createElement("h3");
  heading.textContent = title;
  card.appendChild(heading);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = agent;
  card.appendChild(meta);

  if (body) {
    const p = document.createElement("p");
    p.className = "muted";
    p.innerHTML = body;
    card.appendChild(p);
  }

  if (options.length) {
    const grid = document.createElement("div");
    grid.className = "options";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.setAttribute("data-id", opt.id);
      const visual = opt.image
        ? `<div class="option-visual"><img src="${opt.image.src}" alt="${opt.image.alt}" loading="lazy" /></div>`
        : '<div class="option-visual" aria-hidden="true"></div>';
      btn.innerHTML = `${visual}<div><strong>${opt.id}. ${opt.title}</strong>${opt.bullets ? `<ul>${opt.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}</div>`;
      btn.addEventListener("click", () => opt.onSelect(opt));
      grid.appendChild(btn);
    });
    card.appendChild(grid);
  }

  if (question) {
    const q = document.createElement("p");
    q.className = "muted";
    q.textContent = question;
    card.appendChild(q);
  }

  conversation.appendChild(card);
  conversation.scrollTo({ top: conversation.scrollHeight, behavior: "smooth" });
}

function showIntelError(message, tone = "error") {
  if (!intelError) return;
  intelError.textContent = message || "";
  intelError.className = `alert ${tone === "success" ? "success" : tone === "error" ? "error" : ""}`;
}

function applyConciergeProfile(reason = "") {
  const { priority, pace, service } = state.concierge;
  const destination = state.discovery?.destination || "votre destination";
  if (conciergeNote) {
    const pacing = pace === "soft" ? "2 temps forts/jour" : pace === "dense" ? "4 temps forts/jour" : "3 temps forts/jour";
    const serviceCopy = service === "dedicated" ? "Butler dédié + accueil VIP" : service === "hybrid" ? "Humain si besoin" : "100% digital sécurisé";
    conciergeNote.textContent = reason
      ? `${reason} : dossier ${priority}, ${pacing}, ${serviceCopy}.`
      : `Dossier ${destination} prêt : ${priority}, ${pacing}, ${serviceCopy}.`;
  }
  persistState();
}

function updateTrustMetrics() {
  const uptime = (99.9 + Math.random() * 0.09).toFixed(2);
  const latency = 180 + Math.round(Math.random() * 120);
  if (serviceHealth) {
    const label = serviceHealth.querySelector(".health-text");
    if (label) label.textContent = `Service stable · Uptime ${uptime}% · Latence < ${latency}ms · Données chiffrées`;
  }
  const copy = document.getElementById("uptimeCopy");
  if (copy) copy.textContent = `Monitoring actif, uptime ${uptime}% / latence ${latency}ms.`;
}

function attachScrapeToOptions(options, stage) {
  const enriched = distributeScrapeToOptions(options, stage);
  return enriched.map((opt) => ({
    ...opt,
    bullets: [...(opt.bullets || []), ...(opt.scrapeHighlights || []).map((s) => `Scraping validé: ${s}`)],
  }));
}

function renderIntel(intel, destination) {
  if (!intelCards || !imageStrip) return;
  const cards = [
    { title: "Résumé sécurité & logistique", content: intel.summary },
    { title: "Hôtels probants", content: intel.hotels?.join(" · ") || "—" },
    { title: "Moments conseillés", content: intel.highlights?.join(" · ") || "—" },
  ];

  intelCards.innerHTML = cards
    .map(
      (c) => `<article class="intel-card"><div class="tag">📌 ${destination}</div><strong>${c.title}</strong><p class="muted">${c.content}</p></article>`
    )
    .join("");

  imageStrip.innerHTML = intel.images
    .map(
      (img) => `<figure><img src="${img.src}" alt="${img.alt}" loading="lazy" /><figcaption>${img.alt}</figcaption></figure>`
    )
    .join("");

  setIntelStatus("Infos + images prêtes", "success");
  refreshIntelBtn.disabled = false;
  showIntelError(intel.fallback ? "Résultats génériques faute de source dédiée." : "", intel.fallback ? "error" : "success");
}

function fallbackIntel(destination) {
  return {
    summary: `Pas de fiche ${destination}. On reste sur centres sûrs, 4★, culture + 1 premium.`,
    hotels: ["Chaîne 4★ centrale", "Boutique locale bien notée", "Option appart-hôtel sécurisé"],
    highlights: ["Visite guidée du centre", "Food tour", "Panorama ou musée emblématique"],
    images: [
      { src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80", alt: "Centre-ville" },
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80", alt: "Quartier animé" },
      { src: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=800&q=80", alt: "Hôtel moderne" }
    ],
    fallback: true
  };
}

function fetchIntel(destination) {
  const key = destination.trim().toLowerCase();
  setIntelStatus("Recherche en cours…", "info");
  showIntelError("");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(intelDataset[key] || fallbackIntel(destination));
    }, 320);
  });
}

async function runIntel(destination) {
  if (!destination) return;
  setIntelStatus("Recherche en cours…", "info");
  refreshIntelBtn.disabled = true;
  try {
    const intel = await fetchIntel(destination);
    renderIntel(intel, destination);
  } catch (e) {
    console.error(e);
    showIntelError("Erreur lors de la récupération des informations.");
    setIntelStatus("Échec de la recherche", "danger");
    refreshIntelBtn.disabled = false;
  }
}

function safetyBlocked(destination) {
  const alt = ["Lisbonne (culture & océan)", "Montréal (ville sûre)", "Séoul (high-tech)"];
  addMessage({
    title: "Blocage sécurité",
    agent: "Filtre légal",
    body: `La destination « ${destination} » est interdite ou jugée dangereuse. Ce flux refuse de la planifier. Propositions sûres : ${alt.join(" · ")}.`
  });
  setStatus("Bloqué", "danger");
  setIntelStatus("Recherche annulée", "danger");
  showIntelError("Destination bloquée : l’outil propose des alternatives sûres.");
}

function formatBudgetLabel(level) {
  if (level === "low") return "Budget serré";
  if (level === "high") return "Budget généreux";
  return "Budget équilibré";
}

function validateDiscovery(data) {
  const warnings = [];
  const duration = Number(data.duration || 0);
  if (duration > 21) warnings.push("Durée > 21 jours : risque de budget insuffisant.");
  if (duration < 3) warnings.push("Séjour très court : veillez à ne pas surcharger l’itinéraire.");
  if (data.budget === "low" && ["romantic", "luxury", "premium"].some((v) => data.vibe?.includes(v))) {
    warnings.push("Budget serré mais vibe premium : prévoir concessions.");
  }
  if (data.transport === "chauffeur" && data.budget === "low") {
    warnings.push("Chauffeur privé avec budget serré : risque de dépassement.");
  }
  if (data.lodgingStyle === "luxe" && data.budget === "low") {
    warnings.push("Hébergement 5★ impossible en budget bas : reconsidérer le mix.");
  }
  return warnings;
}

function conceptOptions(discovery) {
  const vibeLabel = discovery.vibe
    ? discovery.vibe === "city"
      ? "City break"
      : discovery.vibe.charAt(0).toUpperCase() + discovery.vibe.slice(1)
    : "Mix";
  const transportLabel = discovery.transport === "chauffeur" ? "chauffeur dédié" : discovery.transport === "public" ? "100% transports" : "mix";
  const lodgingLabel = discovery.lodgingStyle === "luxe" ? "5★" : discovery.lodgingStyle === "sobre" ? "4★ sobres" : "boutique";
  const options = [
    {
      id: "A",
      title: "Immersion urbaine culturelle",
      bullets: ["Musées, food tours, rooftops", `Mobilité ${transportLabel}`, `Hôtels ${lodgingLabel}`, `Vibe ${vibeLabel}`],
    },
    {
      id: "B",
      title: "Nature ou littoral reposant",
      bullets: ["Rythme léger", "1 expérience signature", `Transports ${transportLabel}`, `Hôtels ${lodgingLabel}`],
    },
  ];
  return attachScrapeToOptions(options, "discovery").map((opt) => ({
      ...opt,
      onSelect: (o) => {
        state.concept = o;
        addMessage({
          title: `Concept choisi : ${o.title}`,
          agent: "Agent 0",
          body: "Passage à l’étape 1 — Profil."
        });
        persistState();
        startStepFlow(0);
      }
    }));
}

const steps = ["profile", "flights", "lodging", "activities", "itinerary", "budget"];

function updateStepList(activeIndex) {
  stepList.forEach((node, idx) => {
    node.classList.remove("active");
    if (idx < activeIndex) node.classList.add("done");
    else node.classList.remove("done");
  });
  if (stepList[activeIndex]) stepList[activeIndex].classList.add("active");
}

function startStepFlow(index) {
  if (index >= steps.length) {
    updateStepList(steps.length);
    buildSummary();
    return;
  }
  updateStepList(index);
  const id = steps[index];
  const builder = builders[id];
  const delay = Math.max(5000, Math.floor(5000 + Math.random() * 5000));
  const stageLabel = `Agent ${index + 1} réfléchit…`;
  const targets = scrapeTargetsByStage[id] || [];
  setThinking(stageLabel);
  showStepLoader(`${stageLabel} (scraping)`, delay, targets);
  setTimeout(() => {
    clearStepLoader();
    builder(index);
  }, delay);
}

const builders = {
  profile: () => {
    const { discovery, concept } = state;
    const summary = [
      `${formatBudgetLabel(discovery.budget)} pour ${discovery.duration} jours`,
      `Départ ${discovery.origin} → ${discovery.destination}`,
      `Vibe: ${discovery.vibe}, Flex: ${discovery.flex}`,
      `Voyageurs: ${discovery.travelers}`,
      discovery.notes ? `Note: ${discovery.notes}` : ""
    ].filter(Boolean);

    const options = attachScrapeToOptions([
      {
        id: "A",
        title: "Hybrid luxe + budget maîtrisé",
        bullets: ["Moments premium ciblés", "Hôtels 4★ compacts", "Activités équilibrées"],
      },
      {
        id: "B",
        title: "Séjour court très confortable",
        bullets: ["Moins de jours", "Vols confort", "Hôtel 5★ central"],
      },
      {
        id: "C",
        title: "Durée pleine, hôtels sobres",
        bullets: ["Plus de jours", "3★/4★ bien notés", "Budget focalisé sur activités"],
      },
    ], "profile").map((opt) => ({
      ...opt,
      onSelect: (o) => {
        state.choices.profile = o;
        addMessage({
          title: `Profil retenu: ${o.title}`,
          agent: "Agent 1",
          body: "Étape suivante : stratégie vols."
        });
        startStepFlow(1);
      }
    }));

    addMessage({
      title: "Étape 1 — Profil client",
      agent: "Agent 1 — Architecte profil",
      body: `<strong>Résumé compact</strong><ul>${summary.map((i) => `<li>${i}</li>`).join("")}</ul>Concept pressenti : ${concept ? concept.title : "-"}.`,
      options,
      question: "Choisissez le profil A/B/C ou ajustez votre choix."
    });
  },
  flights: (idx) => {
    const { origin, destination, budget } = state.discovery;
    const options = attachScrapeToOptions([
      {
        id: "A",
        title: "Route économique sécurisée",
        bullets: [
          `${origin} → escale → ${destination}`,
          "Classe éco, horaires étalés",
          "Prix bas, temps plus long",
        ],
      },
      {
        id: "B",
        title: "Confort + horaires courts",
        bullets: [
          `${origin} → ${destination} ou escale courte`,
          "Éco premium/siège extra",
          "Plus cher mais reposant",
        ],
      },
      {
        id: "C",
        title: "Équilibré budget/temps",
        bullets: [
          `${origin} → escale unique → ${destination}`,
          "Durée ~8–12h (selon distance)",
          "Prix moyen, horaires corrects",
        ],
      },
    ], "flights").map((opt) => ({
      ...opt,
      onSelect: (o) => {
        state.choices.flights = o;
        addMessage({ title: `Stratégie vols: ${o.title}`, agent: "Agent 2", body: "OK pour passer aux hôtels." });
        persistState();
        startStepFlow(idx + 1);
      }
    }));

    addMessage({
      title: "Étape 2 — Vols",
      agent: "Agent 2 — Optimiseur vols",
      body: "3 options réalistes, sans inventer d’horaires ni de compagnies précises.",
      options,
      question: "Choisissez une stratégie (A/B/C) ou laissez l’IA décider."
    });
  },
  lodging: (idx) => {
    const { duration } = state.discovery;
    const options = attachScrapeToOptions([
      {
        id: "A",
        title: "Moins de nuits mais 5★",
        bullets: ["2–3 nuits luxe", "Quartier central", "Budget concentré"],
      },
      {
        id: "B",
        title: "4★ abordable toute la durée",
        bullets: ["Durée complète", "Zone pratique (métro/plage)", "Bon rapport qualité/prix"],
      },
      {
        id: "C",
        title: "Mix luxe + mid-range",
        bullets: ["1–2 nuits signature + reste 3★/4★", `${duration} nuits réparties`, "Équilibre confort/coût"],
      },
    ], "lodging").map((opt) => ({
      ...opt,
      onSelect: (o) => {
        state.choices.lodging = o;
        addMessage({ title: `Hébergement: ${o.title}`, agent: "Agent 3", body: "Prêt pour les activités." });
        persistState();
        startStepFlow(idx + 1);
      }
    }));

    addMessage({
      title: "Étape 3 — Hôtels",
      agent: "Agent 3 — Curateur hébergement",
      body: "Adaptation au budget restant : luxe focalisé, milieu de gamme continu, ou mix modulable.",
      options,
      question: "Choisissez une stratégie (A/B/C) ou proposez un ajustement bref."
    });
  },
  activities: (idx) => {
    const remaining = state.discovery.budget === "low" ? "Faible" : state.discovery.budget === "high" ? "Confortable" : "Modéré";
    const options = attachScrapeToOptions([
      {
        id: "A",
        title: "Culture + gratuit majoritaire",
        bullets: ["Musées/temples extérieurs", "Balades guidées", "1 expérience premium unique"],
      },
      {
        id: "B",
        title: "Mix équilibré payant/gratuit",
        bullets: ["Visites emblématiques", "Street-food + rooftop", "1 activité par demi-journée"],
      },
      {
        id: "C",
        title: "Moments premium concentrés",
        bullets: ["Spa ou onsen privé", "Dîner gastronomique", "Guide privé 1 journée"],
      },
    ], "activities").map((opt) => ({
      ...opt,
      onSelect: (o) => {
        state.choices.activities = o;
        addMessage({ title: `Style activités: ${o.title}`, agent: "Agent 4", body: "On assemble l’itinéraire concret." });
        persistState();
        startStepFlow(idx + 1);
      }
    }));

    addMessage({
      title: "Étape 4 — Activités",
      agent: "Agent 4 — Designer expériences",
      body: `Budget restant : ${remaining}. Choisissez un style qui respecte le rythme (2–3 temps forts max/jour).`,
      options,
      question: "Préférez-vous A, B ou C ? Vous pouvez aussi mixer (ex. A avec un luxe de C)."
    });
  },
  itinerary: (idx) => {
    const days = Math.min(Number(state.discovery.duration) || 7, 10);
    const activityStyle = state.choices.activities?.title || "Mix";
    const outline = [];
    for (let i = 1; i <= days; i++) {
      if (i === 1) {
        outline.push(`Jour ${i}: Arrivée, check-in, balade légère, dîner ${activityStyle.includes("premium") ? "raffiné" : "local"}`);
      } else if (i === days) {
        outline.push(`Jour ${i}: Derniers achats ou café panoramique, retour vers l’aéroport`);
      } else {
        outline.push(`Jour ${i}: Matin — découverte clé · Après-midi — activité ${activityStyle.toLowerCase()} · Soir — temps libre/restaurant conseillé`);
      }
    }

    const approveOptions = attachScrapeToOptions([
      {
        id: "A",
        title: "J’approuve cet itinéraire de base",
        bullets: ["Rythme réaliste", "Pas d’horaires inventés", "Transports: marche/taxi/métro"],
        onSelect: () => {
          state.choices.itinerary = { id: "A", title: "Itinéraire approuvé", bullets: outline };
          addMessage({ title: "Itinéraire validé", agent: "Agent 5", body: "Passage à la synthèse budget & packages." });
          persistState();
          startStepFlow(idx + 1);
        }
      },
      {
        id: "B",
        title: "Alléger certaines journées",
        bullets: ["Moins d’activités", "Plus de temps libre", "Maintien sécurité"],
        onSelect: () => {
          state.choices.itinerary = { id: "B", title: "Version light", bullets: outline.map((d) => d.replace(" ·", ",")) };
          addMessage({ title: "Itinéraire ajusté (light)", agent: "Agent 5", body: "Synthèse budget en cours." });
          persistState();
          startStepFlow(idx + 1);
        }
      },
    ], "itinerary");

    addMessage({
      title: "Étape 5 — Itinéraire & logistique",
      agent: "Agent 5 — Orchestrateur",
      body: `<strong>Plan jour par jour</strong><ul>${outline.map((d) => `<li>${d}</li>`).join("")}</ul>`,
      options: approveOptions,
      question: "Validez-vous ce canevas (A) ou souhaitez-vous l’alléger (B) ?"
    });
  },
  budget: () => {
    const { budget, duration } = state.discovery;
    const base = budget === "low" ? 1200 : budget === "mid" ? 2500 : 4800;
    const flights = Math.round(base * 0.35);
    const hotels = Math.round((base * 0.4) * (duration / 7));
    const activities = Math.round((base * 0.15));
    const transport = Math.round(base * 0.1);

    const feasibility = base >= 2000 ? "Dans le budget ou légèrement au-dessus" : "Risque de dépassement si luxe";

    const packages = [
      {
        id: "Best Value",
        title: "Forfait valeur sûre",
        bullets: [
          "Vols stratégie équilibrée",
          "Hôtels 4★ stables ou mix 3★/4★",
          "1 expérience premium, reste abordable",
          "Transport urbain en commun + taxis fiables",
        ],
      },
      {
        id: "Luxury Upgrade",
        title: "Montée en gamme",
        bullets: [
          "Vols confort (éco premium)",
          "Chambre vue/club 5★ sur 2 nuits",
          "2 expériences premium (dîner signature, guide privé)",
          "Budget +15–25% vs initial",
        ],
      },
    ];

    const options = attachScrapeToOptions(
      packages.map((pkg) => ({
        id: pkg.id === "Best Value" ? "A" : "B",
        title: pkg.title,
        bullets: pkg.bullets,
        onSelect: () => {
          state.choices.package = pkg;
          updateStepList(steps.length);
          buildSummary();
          persistState();
        }
      })),
      "budget"
    );

    addMessage({
      title: "Étape 6 — Budget & packages",
      agent: "Agent 6 — Synthétiseur",
      body: `<strong>Découpage estimé</strong><ul><li>Vols : ~${flights}€</li><li>Hôtels : ~${hotels}€</li><li>Activités : ~${activities}€</li><li>Transports locaux : ~${transport}€</li></ul>${feasibility}.`,
      options,
      question: "Préférez-vous le package Best Value (A) ou Luxury Upgrade (B) ?"
    });
  }
};

function buildSummary() {
  exportBtn.disabled = false;
  const blocks = [];
  const { discovery, concept, choices } = state;

  blocks.push({
    title: "1. Profil client",
    items: [
      `${formatBudgetLabel(discovery.budget)} — ${discovery.duration} jours`,
      `Départ ${discovery.origin} → ${discovery.destination}`,
      `Vibe ${discovery.vibe}, flexibilité ${discovery.flex}`,
      `Mobilité: ${discovery.transport || "mix"}`,
      `Hébergement: ${discovery.lodgingStyle || "boutique"}`,
      `Activités: ${discovery.activitiesFocus || "culture"}`,
      `Voyageurs: ${discovery.travelers}`,
      concept ? `Concept: ${concept.title}` : ""
    ].filter(Boolean)
  });

  blocks.push({ title: "2. Vols", items: [choices.flights?.title || "—"] });
  blocks.push({ title: "3. Hôtels", items: [choices.lodging?.title || "—"] });
  blocks.push({ title: "4. Activités", items: [choices.activities?.title || "—"] });
  blocks.push({ title: "5. Itinéraire", items: choices.itinerary?.bullets || ["Itinéraire standard"] });
  blocks.push({ title: "6. Package choisi", items: [choices.package?.title || "Pas encore choisi"] });
  blocks.push({ title: "7. Conformité sécurité", items: ["Pas de destinations interdites", "Aucune activité illégale"] });

  const scrape = getScrapedSnippet(discovery.destination, "budget");
  if (scrape?.text) {
    blocks.push({ title: "8. Données scrappées injectées", items: [scrape.text, `Sources: ${scrape.source}`] });
  }

  summaryBlock.innerHTML = blocks
    .map(
      (b) => `<div class="block"><h4>${b.title}</h4><ul>${b.items
        .map((i) => `<li>${i}</li>`)
        .join("")}</ul></div>`
    )
    .join("");

  state.summary = blocks;
  persistState();
}
exportBtn.addEventListener("click", () => {
  if (!state.summary) return;
  const text = state.summary
    .map((b) => `${b.title}\n- ${b.items.join("\n- ")}`)
    .join("\n\n");
  navigator.clipboard.writeText(text).then(() => {
    exportBtn.textContent = "Copié !";
    setTimeout(() => (exportBtn.textContent = "Copier le texte"), 2000);
  });
});

function handleConciergeSubmit(event) {
  event.preventDefault();
  const prefs = Object.fromEntries(new FormData(event.target).entries());
  state.concierge = prefs;
  applyConciergeProfile("Brief concierge reçu");
}

function handleFeedbackSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  if (feedbackStatus) feedbackStatus.textContent = data.score === "satisfait" ? "Merci pour votre validation." : "Merci, nous allons améliorer.";
}

function onDiscoverySubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const destinationLC = data.destination.trim().toLowerCase();
  if (bannedDestinations.some((d) => destinationLC.includes(d))) {
    safetyBlocked(data.destination);
    stopThinking("Demande bloquée pour sécurité.");
    return;
  }
  const warnings = validateDiscovery(data);
  state.discovery = data;
  setStatus("En cours", "info");
  conversation.innerHTML = "";
  setThinking("Agent 0 prépare 3 pistes cohérentes…");

  if (warnings.length) {
    addMessage({
      title: "Alerte cohérence",
      agent: "Vérifications préalables",
      body: warnings.join("<br>")
    });
  }
  runIntel(data.destination);
  refreshIntelBtn.disabled = false;

  addMessage({
    title: "Phase découverte",
    agent: "Agent 0 — Scout",
    body: `Vous voulez aller vers ${data.destination} depuis ${data.origin}, vibe ${data.vibe}. Budget: ${formatBudgetLabel(data.budget)}. Voici 3 concepts rapides :`,
    options: conceptOptions(data),
    question: "Choisissez un concept (A/B/C) ou indiquez un autre axe."
  });

  persistState();
}

document.getElementById("discoveryForm").addEventListener("submit", onDiscoverySubmit);
refreshIntelBtn.addEventListener("click", () => {
  if (state.discovery?.destination) runIntel(state.discovery.destination);
});
conciergeForm?.addEventListener("submit", handleConciergeSubmit);
feedbackForm?.addEventListener("submit", handleFeedbackSubmit);
btnCallMe?.addEventListener("click", () => applyConciergeProfile("Rappel concierge programmé"));
btnConcierge?.addEventListener("click", () => applyConciergeProfile("Concierge en ligne"));

updateTrustMetrics();
setInterval(updateTrustMetrics, 8000);
applyConciergeProfile();

clearUI(true);
restoreState();
if (state.discovery?.destination) {
  setStatus("Session restaurée", "info");
  refreshIntelBtn.disabled = false;
  runIntel(state.discovery.destination);
}
