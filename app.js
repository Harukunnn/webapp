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

const scrapeInventory = {
  tokyo: {
    flights: [
      { title: "ANA nuit claire", detail: "HND → centre 22 min", price: 890, mode: "avion", valid: true, image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80" },
      { title: "JAL Premium Eco", detail: "1 bagage + siège large", price: 1240, mode: "avion", valid: true, image: "https://images.unsplash.com/photo-1504197906862-1c1f9e5e39e2?auto=format&fit=crop&w=600&q=80" },
      { title: "Monorail HND", detail: "Monorail 20 min", price: 7, mode: "train", valid: true, image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" },
      { title: "Narita Express", detail: "55 min Tokyo Station", price: 25, mode: "train", valid: true, image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
      { title: "Vol low-cost", detail: "Escale Séoul", price: 690, mode: "avion", valid: true, image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Shibuya Stream 4★", detail: "220€ nuit", price: 220, sejour: "mix", valid: true, image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Park Hotel 4★ arty", detail: "210€ nuit", price: 210, sejour: "luxe", valid: true, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Ginza", detail: "Sobre & central", price: 180, sejour: "sobre", valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Ryokan discret", detail: "Tatamis + onsen", price: 240, sejour: "luxe", valid: true, image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80" },
      { title: "Capsule premium", detail: "Option économique", price: 90, sejour: "eco", valid: true, image: "https://images.unsplash.com/photo-1578681143489-4662a462f8aa?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "TeamLab Planets", detail: "Billet daté", price: 28, valid: true, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
      { title: "Onsen Odaiba", detail: "No tattoo", price: 35, valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Food tour Shinjuku", detail: "3h nocturne", price: 95, valid: true, image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" },
      { title: "Rooftop Ginza", detail: "Signature cocktail", price: 40, valid: true, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
      { title: "Temple Asakusa", detail: "Lever du soleil", price: 0, valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Arrivée + Shibuya", valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 2", detail: "Asakusa + Ginza", valid: true, image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 3", detail: "Odaiba + onsen", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 4", detail: "TeamLab + Daikanyama", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
  },
  lisbonne: {
    flights: [
      { title: "Tap direct", detail: "Orly → LIS", price: 210, mode: "avion", valid: true, image: "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=600&q=80" },
      { title: "Low-cost", detail: "CDG via Madrid", price: 120, mode: "avion", valid: true, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80" },
      { title: "Train Sud Express", detail: "Paris → Hendaye → Lisboa", price: 190, mode: "train", valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Transfert metro", detail: "Ligne rouge 6-10 min", price: 2, mode: "train", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Lumiares 4★", detail: "Bairro Alto", price: 190, sejour: "luxe", valid: true, image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Mama Shelter", detail: "Design + rooftop", price: 160, sejour: "mix", valid: true, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Alfama", detail: "Sobre & fado", price: 150, sejour: "sobre", valid: true, image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80" },
      { title: "Eco hôtel LX", detail: "Label green", price: 130, sejour: "eco", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "Tram 28", detail: "3€ billet", price: 3, valid: true, image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80" },
      { title: "Belém tour", detail: "Torre + Pastéis", price: 15, valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Fado Alfama", detail: "Soirée intimiste", price: 45, valid: true, image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" },
      { title: "Surf Cascais", detail: "Session matin", price: 60, valid: true, image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Baixa + Alfama", valid: true, image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 2", detail: "Belém + LX Factory", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 3", detail: "Cascais/Sintra", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
  },
  montréal: {
    flights: [
      { title: "Air Canada direct", detail: "CDG → YUL", price: 780, mode: "avion", valid: true, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80" },
      { title: "Air Transat", detail: "Bagage inclus", price: 650, mode: "avion", valid: true, image: "https://images.unsplash.com/photo-1504197906862-1c1f9e5e39e2?auto=format&fit=crop&w=600&q=80" },
      { title: "Train aéroport 747", detail: "24/7 11$", price: 11, mode: "train", valid: true, image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" },
      { title: "Taxi fixe", detail: "48,40$ CAD", price: 48, mode: "route", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Humaniti 4★", detail: "Design & spa", price: 260, sejour: "luxe", valid: true, image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Monville 4★", detail: "Vue skyline", price: 210, sejour: "mix", valid: true, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Eco Mile-End", detail: "Certification verte", price: 160, sejour: "eco", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Old Port", detail: "Boiseries", price: 190, sejour: "sobre", valid: true, image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "Musée Beaux-Arts", detail: "Lundi fermé", price: 24, valid: true, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
      { title: "Mont Royal", detail: "Coucher soleil", price: 0, valid: true, image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Food tour Mile-End", detail: "3h", price: 75, valid: true, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
      { title: "Hockey Centre Bell", detail: "Billets soirée", price: 120, valid: true, image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Vieux-Port + marché", valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 2", detail: "Musées + Mile-End", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 3", detail: "Mont Royal + Saint-Laurent", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
  },
};

const state = {
  discovery: null,
  concept: null,
  choices: {},
  summary: null
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

function getStageScrapePlan(stage) {
  const plans = {
    discovery: ["vols fiables", "prix hôtels", "climat", "contrastes vibe", "accès premium"],
    profile: ["corridors sécurisés", "plafonds budget", "alertes vibe", "options transport", "sources vérifiées"],
    flights: ["routes directes", "escales courtes", "temps porte-à-porte", "classes confort", "prix dynamiques"],
    lodging: ["quartiers sûrs", "tarifs nuit", "labels luxe", "options éco", "politique annulation"],
    activities: ["pics d’affluence", "expériences premium", "options gratuites", "restrictions locales", "horaires fiables"],
    itinerary: ["rythme quotidien", "transports intra-ville", "plages horaires", "liens météo", "sécurité zones"],
    budget: ["total vols", "moyenne nuit", "transports locaux", "activités clés", "marge sécurité"],
  };
  return plans[stage] || ["sources ouvertes"];
}

function filterScrapeItems(destination, stage, discovery) {
  const key = (destination || "").trim().toLowerCase();
  const inventory = scrapeInventory[key]?.[stage] || [];
  const validOnly = inventory.filter((item) => item.valid !== false);
  const matchesTransport = discovery?.transport && discovery.transport !== "flex"
    ? validOnly.filter((item) => !item.mode || item.mode === discovery.transport || item.mode === "train")
    : validOnly;
  const matchesSejour = discovery?.sejour && discovery.sejour !== "mix"
    ? matchesTransport.filter((item) => !item.sejour || item.sejour === discovery.sejour)
    : matchesTransport;
  const base = matchesSejour.length ? matchesSejour : validOnly;
  if (!base.length) {
    return getStageScrapePlan(stage).map((p, idx) => ({
      title: `${stage} ${idx + 1}`,
      detail: `${p} vérifié`,
      price: null,
      valid: true,
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80"
    }));
  }
  return base;
}

function sampleScrapedItems(destination, stage, discovery, desired = 8) {
  const pool = filterScrapeItems(destination, stage, discovery);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const count = Math.max(5, Math.min(desired, 10, shuffled.length || desired));
  return shuffled.slice(0, count);
}

function pushLiveScrape({ title, text, source }) {
  if (!liveScrapeList) return;
  const item = document.createElement("li");
  item.innerHTML = `<strong>${title}</strong><p>${text}</p><small>${source}</small>`;
  liveScrapeList.prepend(item);
  const items = liveScrapeList.querySelectorAll("li");
  if (items.length > 6) items[items.length - 1].remove();
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

function showStepLoader(text, durationMs, stage) {
  if (dynamicState.loader) dynamicState.loader.remove();
  const loader = document.createElement("article");
  loader.className = "loader-card";
  const plan = getStageScrapePlan(stage || "discovery");
  loader.innerHTML = `
    <div class="loader-head">${text}</div>
    <div class="loader-bar" role="progressbar" aria-label="Simulation en cours"><span></span></div>
    <p class="muted">Scraping sécurisé (5–10s) : ${plan.slice(0, 3).join(" · ")}</p>
    <ul class="scrape-plan">${plan.map((item) => `<li>${item}</li>`).join("")}</ul>
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
      const media = opt.media ? `<figure class="option-media"><img src="${opt.media}" alt="${opt.title}" loading="lazy" /></figure>` : "";
      btn.innerHTML = `${media}<div class="option-copy"><strong>${opt.id}. ${opt.title}</strong>${opt.bullets ? `<ul>${opt.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}</div>`;
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


function attachScrapeToOptions(options, stage) {
  const destination = state.discovery?.destination;
  const scrapedSet = sampleScrapedItems(destination, stage, state.discovery, 9);
  const stagePlan = getStageScrapePlan(stage).join(" · ");
  if (scrapedSet?.length) {
    pushLiveScrape({
      title: `Scraping ${stage}`,
      text: `${scrapedSet.length} éléments validés`,
      source: `${stagePlan} — sources conformes seulement`,
    });
  }
  const chunkSize = Math.ceil(scrapedSet.length / options.length) || 1;
  return options.map((opt, idx) => {
    const start = idx * chunkSize;
    const subset = scrapedSet.slice(start, start + chunkSize);
    const picked = subset.length ? subset : scrapedSet.slice(0, chunkSize);
    const media = picked[0]?.image;
    const scrapeBullets = picked.slice(0, 3).map((item) => {
      const price = item.price ? `${item.price}${stage === "flights" ? "€" : ""}` : "";
      return `${item.title}${price ? ` — ${price}` : ""}`;
    });
    return {
      ...opt,
      media,
      bullets: [...(opt.bullets || []), ...scrapeBullets, `Validation: ${picked.length} sources filtrées`],
    };
  });
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
  return warnings;
}

function conceptOptions(discovery) {
  const vibeLabel = discovery.vibe
    ? discovery.vibe === "city"
      ? "City break"
      : discovery.vibe.charAt(0).toUpperCase() + discovery.vibe.slice(1)
    : "Mix";
  const options = [
    {
      id: "A",
      title: "Immersion urbaine culturelle",
      bullets: ["Musées & rooftops", "Déplacements simples", `Vibe ${vibeLabel}`],
    },
    {
      id: "B",
      title: "Nature ou littoral reposant",
      bullets: ["Rythme léger", "1 signature", "Transports simplifiés"],
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
  const delay = Math.floor(5000 + Math.random() * 5000);
  const stageLabel = `Agent ${index + 1} réfléchit…`;
  setThinking(stageLabel);
  showStepLoader(stageLabel, delay, id);
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
      `Transport: ${discovery.transport || "flex"}, Séjour: ${discovery.sejour || "mix"}`,
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
      `Vibe ${discovery.vibe}, flexibilité ${discovery.flex}, transport ${discovery.transport}, séjour ${discovery.sejour}`,
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
  const discoveryDelay = Math.floor(5000 + Math.random() * 5000);
  showStepLoader("Scraping découverte sécurisé…", discoveryDelay, "discovery");
  setTimeout(() => clearStepLoader(), discoveryDelay);

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

clearUI(true);
restoreState();
if (state.discovery?.destination) {
  setStatus("Session restaurée", "info");
  refreshIntelBtn.disabled = false;
  runIntel(state.discovery.destination);
}
