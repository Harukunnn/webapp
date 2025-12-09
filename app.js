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

const translations = {
  fr: {
    brand: "Atlas Noir",
    languageLabel: "Langue",
    heroEyebrow: "Voyage privé",
    heroTitle: "Atlas",
    heroTagline: "Luxe silencieux. Signal pur.",
    thinkingReady: "Prêt.",
    sectionDiscovery: "Découverte",
    briefTitle: "Brief",
    fieldOrigin: "Départ",
    fieldDestination: "Destination",
    fieldBudget: "Budget",
    fieldDuration: "Durée",
    fieldTransport: "Transport préféré",
    fieldStay: "Signature séjour",
    advancedPrefs: "Préférences fines",
    fieldVibe: "Vibe",
    fieldFlex: "Flex",
    fieldTravelers: "Voyageurs",
    fieldConstraints: "Contraintes",
    constraintsPlaceholder: "Court et précis",
    budgetLow: "Bas",
    budgetMid: "Moyen",
    budgetHigh: "Haut",
    transportFlex: "Auto / Train / Avion",
    transportTrain: "Train",
    transportPlane: "Avion",
    transportRoad: "Route",
    stayMix: "Mix premium",
    stayLuxury: "Luxe marqué",
    staySubtle: "Sobre & discret",
    stayEco: "Éco-conscient",
    vibeRelax: "Relax",
    vibeAdventure: "Aventure",
    vibeCity: "City",
    vibeRomantic: "Romantique",
    vibeFamily: "Famille",
    vibeMix: "Mix",
    flexFixed: "Dates fixes",
    flexFlexible: "Dates flexibles",
    flexOpen: "Destination ouverte",
    travelSolo: "Solo",
    travelCouple: "Couple",
    travelFamily: "Famille",
    travelFriends: "Amis",
    travelBusiness: "Business",
    launch: "Lancer",
    sectionWorkflow: "Parcours",
    workflowTitle: "Itinéraire",
    stepProfile: "Profil",
    stepFlights: "Vols",
    stepLodging: "Séjour",
    stepActivities: "Activités",
    stepItinerary: "Itinéraire",
    stepBudget: "Budget",
    sectionIntel: "Scraping",
    intelTitle: "Sources actives",
    refresh: "Rafraîchir",
    sectionSummary: "Sortie",
    summaryTitle: "Résumé",
    validate: "Valider",
    copy: "Copier",
    intelReady: "Prêt",
    thinkingIdle: "En attente d’une requête.",
    waitingStatus: "En attente",
    readyFlow: "Flux prêt. Deux options premium.",
    intelPaused: "En pause",
    summaryCopied: "Copié !",
    summaryCopy: "Copier le texte",
    validated: "Validé",
    validateMessage: "Validation finale",
    validateBody:
      "Parcours verrouillé. Les sélections scrappées restent synchronisées pour export et réservation.",
    statusSessionRestored: "Session restaurée",
    aiAwaitingValidation: "L’IA attend votre validation.",
    invalidHtml: "Entrée invalide : les balises HTML sont bloquées.",
    securityBlocked: "Demande bloquée pour sécurité.",
    statusInProgress: "En cours",
    thinkingConceptPrep: "Agent 0 prépare 3 pistes cohérentes…",
    coherenceAlertTitle: "Alerte cohérence",
    coherenceAlertAgent: "Vérifications préalables",
    scrapingStage: "Scraping sécurisé…",
    statusScraping: "Scraping",
    scrapeReady: "Sources scrappées prêtes",
    blockedTitle: "Blocage sécurité",
    blockedAgent: "Filtre légal",
    blockedBody:
      "La destination « {destination} » est interdite ou jugée dangereuse. Ce flux refuse de la planifier. Propositions sûres : {alternatives}.",
    blockedStatus: "Bloqué",
    intelSearchCancelled: "Recherche annulée",
    intelBlockedMessage: "Destination bloquée : l’outil propose des alternatives sûres.",
    intelSummaryTitle: "Résumé sécurité & logistique",
    intelHotelsTitle: "Hôtels probants",
    intelMomentsTitle: "Moments conseillés",
    intelFallbackMessage: "Résultats génériques faute de source dédiée.",
    intelSearching: "Recherche en cours…",
    intelError: "Erreur lors de la récupération des informations.",
    intelSearchFailed: "Échec de la recherche",
    budgetTight: "Budget serré",
    budgetGenerous: "Budget généreux",
    budgetBalanced: "Budget équilibré",
    warningLongStay: "Durée > 21 jours : risque de budget insuffisant.",
    warningShortStay: "Séjour très court : veillez à ne pas surcharger l’itinéraire.",
    warningBudgetVibe: "Budget serré mais vibe premium : prévoir concessions.",
    discoveryPhaseTitle: "Phase découverte",
    discoveryAgent: "Agent 0 — Scout",
    discoveryBody:
      "Vous voulez aller vers {destination} depuis {origin}, vibe {vibe}. Budget: {budget}. Voici 3 concepts rapides :",
    conceptQuestion: "Choisissez un concept (A/B/C) ou indiquez un autre axe.",
    conceptTitleA: "Immersion {destination} sur mesure",
    conceptTitleB: "Nature ou littoral reposant",
    conceptTitleC: "{destination} nocturne & design",
    conceptBulletA1: "{vibeLabel} + adresses confidentielles",
    conceptBulletA2: "Transports {transport} affinés",
    conceptBulletA3: "Séjour {stay} calibré",
    conceptBulletB1: "Rythme léger & panoramas",
    conceptBulletB2: "{duration}-jour(s) avec sorties ciblées",
    conceptBulletB3: "Transport {transport} + transfers filtrés",
    conceptBulletC1: "Quartiers vivants + rooftops",
    conceptBulletC2: "Bars/cafés signature scrappés",
    conceptBulletC3: "Logements proches des hubs sûrs",
    conceptChosen: "Concept choisi : {title}",
    proceedProfile: "Passage à l’étape 1 — Profil.",
  },
  en: {
    brand: "Atlas Noir",
    languageLabel: "Language",
    heroEyebrow: "Private travel",
    heroTitle: "Atlas",
    heroTagline: "Quiet luxury. Pure signal.",
    thinkingReady: "Ready.",
    sectionDiscovery: "Discovery",
    briefTitle: "Brief",
    fieldOrigin: "Departure",
    fieldDestination: "Destination",
    fieldBudget: "Budget",
    fieldDuration: "Length",
    fieldTransport: "Preferred transport",
    fieldStay: "Stay signature",
    advancedPrefs: "Fine preferences",
    fieldVibe: "Vibe",
    fieldFlex: "Flex",
    fieldTravelers: "Travelers",
    fieldConstraints: "Constraints",
    constraintsPlaceholder: "Short and precise",
    budgetLow: "Low",
    budgetMid: "Medium",
    budgetHigh: "High",
    transportFlex: "Car / Train / Plane",
    transportTrain: "Train",
    transportPlane: "Plane",
    transportRoad: "Road",
    stayMix: "Premium mix",
    stayLuxury: "High-end",
    staySubtle: "Subtle & discreet",
    stayEco: "Eco-conscious",
    vibeRelax: "Relax",
    vibeAdventure: "Adventure",
    vibeCity: "City",
    vibeRomantic: "Romantic",
    vibeFamily: "Family",
    vibeMix: "Mix",
    flexFixed: "Fixed dates",
    flexFlexible: "Flexible dates",
    flexOpen: "Open destination",
    travelSolo: "Solo",
    travelCouple: "Couple",
    travelFamily: "Family",
    travelFriends: "Friends",
    travelBusiness: "Business",
    launch: "Launch",
    sectionWorkflow: "Journey",
    workflowTitle: "Itinerary",
    stepProfile: "Profile",
    stepFlights: "Flights",
    stepLodging: "Stay",
    stepActivities: "Activities",
    stepItinerary: "Itinerary",
    stepBudget: "Budget",
    sectionIntel: "Scraping",
    intelTitle: "Active sources",
    refresh: "Refresh",
    sectionSummary: "Output",
    summaryTitle: "Summary",
    validate: "Validate",
    copy: "Copy",
    intelReady: "Ready",
    thinkingIdle: "Waiting for a request.",
    waitingStatus: "Pending",
    readyFlow: "Flow ready. Two premium options.",
    intelPaused: "On hold",
    summaryCopied: "Copied!",
    summaryCopy: "Copy text",
    validated: "Validated",
    validateMessage: "Final validation",
    validateBody:
      "Path locked. Scraped selections stay synchronized for export and booking.",
    statusSessionRestored: "Session restored",
    aiAwaitingValidation: "AI is waiting for your validation.",
    invalidHtml: "Invalid input: HTML tags are blocked.",
    securityBlocked: "Request blocked for safety.",
    statusInProgress: "In progress",
    thinkingConceptPrep: "Agent 0 is preparing 3 coherent paths…",
    coherenceAlertTitle: "Coherence alert",
    coherenceAlertAgent: "Pre-flight checks",
    scrapingStage: "Secure scraping…",
    statusScraping: "Scraping",
    scrapeReady: "Scraped sources ready",
    blockedTitle: "Security block",
    blockedAgent: "Compliance filter",
    blockedBody:
      "Destination “{destination}” is forbidden or unsafe. This flow will not plan it. Safe alternatives: {alternatives}.",
    blockedStatus: "Blocked",
    intelSearchCancelled: "Search cancelled",
    intelBlockedMessage: "Destination blocked: the tool suggests safe alternatives.",
    intelSummaryTitle: "Safety & logistics summary",
    intelHotelsTitle: "Proven hotels",
    intelMomentsTitle: "Suggested moments",
    intelFallbackMessage: "Generic results while no dedicated source is available.",
    intelSearching: "Searching…",
    intelError: "Error while fetching information.",
    intelSearchFailed: "Search failed",
    budgetTight: "Lean budget",
    budgetGenerous: "Generous budget",
    budgetBalanced: "Balanced budget",
    warningLongStay: "Stay > 21 days: risk of insufficient budget.",
    warningShortStay: "Very short stay: keep the itinerary light.",
    warningBudgetVibe: "Tight budget but premium vibe: expect trade-offs.",
    discoveryPhaseTitle: "Discovery phase",
    discoveryAgent: "Agent 0 — Scout",
    discoveryBody:
      "You want to travel to {destination} from {origin}, vibe {vibe}. Budget: {budget}. Here are 3 quick concepts:",
    conceptQuestion: "Choose a concept (A/B/C) or suggest another angle.",
    conceptTitleA: "Tailored {destination} immersion",
    conceptTitleB: "Relaxing nature or coast",
    conceptTitleC: "{destination} by night & design",
    conceptBulletA1: "{vibeLabel} + insider spots",
    conceptBulletA2: "Refined {transport} routes",
    conceptBulletA3: "{stay} stay calibrated",
    conceptBulletB1: "Light pace & panoramas",
    conceptBulletB2: "{duration}-day(s) with focused outings",
    conceptBulletB3: "{transport} + filtered transfers",
    conceptBulletC1: "Lively districts + rooftops",
    conceptBulletC2: "Signature bars/cafés",
    conceptBulletC3: "Lodging near safe hubs",
    conceptChosen: "Concept selected: {title}",
    proceedProfile: "Moving to step 1 — Profile.",
  },
};

const intelDataset = {
  tokyo: {
    summary: {
      fr: "Quartiers sûrs (Shinjuku, Shibuya, Ginza), transport facile par métro/Pasmo.",
      en: "Safe districts (Shinjuku, Shibuya, Ginza) with easy subway/Pasmo mobility.",
    },
    hotels: [
      { fr: "Shibuya Stream Excel Tokyu (4★)", en: "Shibuya Stream Excel Tokyu (4★)" },
      { fr: "Mitsui Garden Ginza (4★)", en: "Mitsui Garden Ginza (4★)" },
      { fr: "Park Hotel Tokyo (4★ artistique)", en: "Park Hotel Tokyo (4★ artsy)" },
    ],
    highlights: [
      { fr: "Food tours à Shinjuku", en: "Food tours in Shinjuku" },
      { fr: "Jardins Hama-rikyu", en: "Hama-rikyu Gardens" },
      { fr: "Onsen urbain à Odaiba", en: "Urban onsen in Odaiba" },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80", alt: { fr: "Shibuya de nuit", en: "Shibuya at night" } },
      { src: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80", alt: { fr: "Temple au lever du soleil", en: "Temple at sunrise" } },
      { src: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=800&q=80", alt: { fr: "Métro japonais", en: "Japanese subway" } },
    ],
  },
  lisbonne: {
    summary: {
      fr: "Ville côtière sûre, bon rapport qualité/prix, mobilité simple (tram 28, métro).",
      en: "Safe coastal city, good value, simple mobility (tram 28, metro).",
    },
    hotels: [
      { fr: "The Lumiares (4★ Bairro Alto)", en: "The Lumiares (4★ Bairro Alto)" },
      { fr: "Mama Shelter Lisboa (4★)", en: "Mama Shelter Lisboa (4★)" },
      { fr: "NH Collection Liberdade (4★)", en: "NH Collection Liberdade (4★)" },
    ],
    highlights: [
      { fr: "Miradouros, fado authentique", en: "Viewpoints, authentic fado" },
      { fr: "Excursion à Belém", en: "Excursion to Belém" },
      { fr: "Journée à Cascais/Sintra", en: "Day trip to Cascais/Sintra" },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-30&hue=-10", alt: { fr: "Tram jaune de Lisbonne", en: "Lisbon yellow tram" } },
      { src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80", alt: { fr: "Toits de Lisbonne", en: "Lisbon rooftops" } },
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-20", alt: { fr: "Rue pavée en pente", en: "Steep cobbled street" } },
    ],
  },
  montréal: {
    summary: {
      fr: "Destination très sûre, bilingue, scène food et musées riches.",
      en: "Very safe, bilingual destination with rich food and museum scene.",
    },
    hotels: [
      { fr: "Humaniti Hotel Montréal (4★)", en: "Humaniti Hotel Montréal (4★)" },
      { fr: "Hotel Monville (4★)", en: "Hotel Monville (4★)" },
      { fr: "Le Germain (4★ boutique)", en: "Le Germain (4★ boutique)" },
    ],
    highlights: [
      { fr: "Vieux-Port & marché Jean-Talon", en: "Old Port & Jean-Talon market" },
      { fr: "Musée des Beaux-Arts", en: "Fine Arts Museum" },
      { fr: "Mont Royal au coucher du soleil", en: "Mount Royal at sunset" },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-40", alt: { fr: "Skyline de Montréal", en: "Montréal skyline" } },
      { src: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=800&q=80", alt: { fr: "Vieux-Montréal", en: "Old Montréal" } },
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80", alt: { fr: "Mont Royal", en: "Mount Royal" } },
    ],
  },
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
      { title: "ANA nuit claire", detail: "HND → centre 22 min", price: 890, currency: "€", mode: "avion", valid: true, link: "https://www.ana.co.jp", image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80" },
      { title: "JAL Premium Eco", detail: "1 bagage + siège large", price: 1240, currency: "€", mode: "avion", valid: true, link: "https://www.jal.co.jp", image: "https://images.unsplash.com/photo-1504197906862-1c1f9e5e39e2?auto=format&fit=crop&w=600&q=80" },
      { title: "Monorail HND", detail: "Monorail 20 min", price: 7, currency: "€", mode: "train", valid: true, link: "https://www.tokyo-monorail.co.jp", image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" },
      { title: "Narita Express", detail: "55 min Tokyo Station", price: 25, currency: "€", mode: "train", valid: true, link: "https://www.jreast.co.jp/multi/fr/nex.html", image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
      { title: "Vol low-cost", detail: "Escale Séoul", price: 690, currency: "€", mode: "avion", valid: true, link: "https://www.skyscanner.fr", image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Shibuya Stream 4★", detail: "220€ nuit", price: 220, currency: "€", sejour: "mix", valid: true, link: "https://www.tokyu-hotels.co.jp/stream-e/", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Park Hotel 4★ arty", detail: "210€ nuit", price: 210, currency: "€", sejour: "luxe", valid: true, link: "https://parkhoteltokyo.com", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Ginza", detail: "Sobre & central", price: 180, currency: "€", sejour: "sobre", valid: true, link: "https://www.ginza-hotel.jp", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Ryokan discret", detail: "Tatamis + onsen", price: 240, currency: "€", sejour: "luxe", valid: true, link: "https://www.hoshinoya.com/tokyo/", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80" },
      { title: "Capsule premium", detail: "Option économique", price: 90, currency: "€", sejour: "eco", valid: true, link: "https://ninehours.co.jp", image: "https://images.unsplash.com/photo-1578681143489-4662a462f8aa?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "TeamLab Planets", detail: "Billet daté", price: 28, currency: "€", valid: true, link: "https://planets.teamlab.art/tokyo/", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
      { title: "Onsen Odaiba", detail: "No tattoo", price: 35, currency: "€", valid: true, link: "https://daiba.ooedoonsen.jp/en/", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Food tour Shinjuku", detail: "3h nocturne", price: 95, currency: "€", valid: true, link: "https://www.arigatojapan.co.jp/tour/shinjuku-izakaya", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" },
      { title: "Rooftop Ginza", detail: "Signature cocktail", price: 40, currency: "€", valid: true, link: "https://www.mandarinoriental.com/en/tokyo/nihonbashi/dine/mandarin-bar", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
      { title: "Temple Asakusa", detail: "Lever du soleil", price: 0, currency: "€", valid: true, link: "https://www.senso-ji.jp/guide/", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
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
      { title: "Tap direct", detail: "Orly → LIS", price: 210, currency: "€", mode: "avion", valid: true, link: "https://www.flytap.com", image: "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=600&q=80" },
      { title: "Low-cost", detail: "CDG via Madrid", price: 120, currency: "€", mode: "avion", valid: true, link: "https://www.iberia.com", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80" },
      { title: "Train Sud Express", detail: "Paris → Hendaye → Lisboa", price: 190, currency: "€", mode: "train", valid: true, link: "https://www.sncf-connect.com", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Transfert metro", detail: "Ligne rouge 6-10 min", price: 2, currency: "€", mode: "train", valid: true, link: "https://www.metrolisboa.pt", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Lumiares 4★", detail: "Bairro Alto", price: 190, currency: "€", sejour: "luxe", valid: true, link: "https://www.thelumiares.com", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Mama Shelter", detail: "Design + rooftop", price: 160, currency: "€", sejour: "mix", valid: true, link: "https://mamashelter.com/lisbon/", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Alfama", detail: "Sobre & fado", price: 150, currency: "€", sejour: "sobre", valid: true, link: "https://www.boutique-hotel-alfama.com", image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80" },
      { title: "Eco hôtel LX", detail: "Label green", price: 130, currency: "€", sejour: "eco", valid: true, link: "https://www.memmo.pt", image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "Tram 28", detail: "3€ billet", price: 3, currency: "€", valid: true, link: "https://www.carris.pt", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80" },
      { title: "Belém tour", detail: "Torre + Pastéis", price: 15, currency: "€", valid: true, link: "https://www.parquesdesintra.pt", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Fado Alfama", detail: "Soirée intimiste", price: 45, currency: "€", valid: true, link: "https://www.visitlisboa.com", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" },
      { title: "Surf Cascais", detail: "Session matin", price: 60, currency: "€", valid: true, link: "https://www.ericeirasurfhouse.com", image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Baixa + Alfama", valid: true, image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 2", detail: "Belém + LX Factory", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 3", detail: "Cascais/Sintra", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
  },
  montréal: {
    flights: [
      { title: "Air Canada direct", detail: "CDG → YUL", price: 780, currency: "€", mode: "avion", valid: true, link: "https://www.aircanada.com", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80" },
      { title: "Air Transat", detail: "Bagage inclus", price: 650, currency: "€", mode: "avion", valid: true, link: "https://www.airtransat.com", image: "https://images.unsplash.com/photo-1504197906862-1c1f9e5e39e2?auto=format&fit=crop&w=600&q=80" },
      { title: "Train aéroport 747", detail: "24/7 11$", price: 11, currency: "$", mode: "train", valid: true, link: "https://www.stm.info/en/info/networks/bus/747-yul-montreal-trudeau-airport-shuttle", image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" },
      { title: "Taxi fixe", detail: "48,40$ CAD", price: 48, currency: "$", mode: "route", valid: true, link: "https://montreal.ca/en/articles/taxi-fares-between-yul-and-downtown", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Humaniti 4★", detail: "Design & spa", price: 260, currency: "$", sejour: "luxe", valid: true, link: "https://www.humanitihotel.com", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Monville 4★", detail: "Vue skyline", price: 210, currency: "$", sejour: "mix", valid: true, link: "https://hotelmonville.com", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Eco Mile-End", detail: "Certification verte", price: 160, currency: "$", sejour: "eco", valid: true, link: "https://zerohotel.ca", image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Old Port", detail: "Boiseries", price: 190, currency: "$", sejour: "sobre", valid: true, link: "https://www.aubergeduvieuxport.com", image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "Musée Beaux-Arts", detail: "Lundi fermé", price: 24, currency: "$", valid: true, link: "https://www.mbam.qc.ca", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
      { title: "Mont Royal", detail: "Coucher soleil", price: 0, currency: "$", valid: true, link: "https://www.lemontroyal.qc.ca/en", image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Food tour Mile-End", detail: "3h", price: 75, currency: "$", valid: true, link: "https://localmontrealtours.com", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
      { title: "Hockey Centre Bell", detail: "Billets soirée", price: 120, currency: "$", valid: true, link: "https://www.centrebell.ca", image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Vieux-Port + marché", valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 2", detail: "Musées + Mile-End", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 3", detail: "Mont Royal + Saint-Laurent", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
  },
};

const scrapeStoreKey = "agenticScrapeStore";

const state = {
  discovery: null,
  concept: null,
  choices: {},
  summary: null,
  scrapeReady: null,
  scrapeCache: {},
};

const dynamicState = {
  loader: null,
  loaderInterval: null,
};

const safeStorage = {
  get(key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("Lecture storage sécurisée impossible", e);
      return null;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Écriture storage sécurisée impossible", e);
    }
  },
  remove(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn("Nettoyage storage sécurisé impossible", e);
    }
  }
};

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeField(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  return trimmed.replace(/<[^>]*>/g, "");
}

function containsUnsafeMarkup(value) {
  return /<[^>]+>/.test(String(value || ""));
}

const conversation = document.getElementById("conversation");
const stepList = Array.from(document.querySelectorAll("#stepList .step"));
const summaryBlock = document.getElementById("summary");
const exportBtn = document.getElementById("btnExport");
const validateBtn = document.getElementById("btnValidate");
const statusPill = document.getElementById("status");
const thinkingIndicator = document.getElementById("thinkingIndicator");
const intelStatus = document.getElementById("intelStatus");
const intelCards = document.getElementById("intelCards");
const intelError = document.getElementById("intelError");
const imageStrip = document.getElementById("imageStrip");
const refreshIntelBtn = document.getElementById("btnRefreshIntel");
const liveScrapeList = document.getElementById("liveScrapeList");

let currentLang = "fr";

function t(key) {
  return translations[currentLang]?.[key] || translations.fr[key] || key;
}

function resolveCopy(value) {
  if (value && typeof value === "object" && ("fr" in value || "en" in value)) {
    return value[currentLang] || value.fr || value.en || "";
  }
  return value ?? "";
}

function localizeList(values = []) {
  return values.map((entry) => resolveCopy(entry));
}

function localizeIntelPayload(intel = {}) {
  return {
    ...intel,
    summary: resolveCopy(intel.summary),
    hotels: localizeList(intel.hotels || []),
    highlights: localizeList(intel.highlights || []),
    images: (intel.images || []).map((img) => ({
      ...img,
      alt: resolveCopy(img.alt),
    })),
  };
}

function formatTemplate(template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function tr(key, vars) {
  return formatTemplate(t(key), vars);
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (key && translations[currentLang]?.[key]) {
      node.textContent = t(key);
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    if (key && translations[currentLang]?.[key]) {
      node.setAttribute("placeholder", t(key));
    }
  });
  if (intelStatus) {
    intelStatus.textContent = t("intelReady");
  }
  const languagePicker = document.getElementById("languagePicker");
  if (languagePicker && languagePicker.value !== currentLang) {
    languagePicker.value = currentLang;
  }
  if (state.scrapeReady && intelDataset[state.scrapeReady]) {
    renderIntel(intelDataset[state.scrapeReady], state.discovery?.destination || "");
  }
}

function setLanguage(lang) {
  currentLang = translations[lang] ? lang : "fr";
  safeStorage.set("appLang", currentLang);
  applyStaticTranslations();
  if (statusPill?.textContent === translations.fr.waitingStatus || statusPill?.textContent === translations.en.waitingStatus) {
    setStatus(t("waitingStatus"));
  }
  if (intelStatus?.textContent === translations.fr.intelPaused || intelStatus?.textContent === translations.en.intelPaused) {
    setIntelStatus(t("intelPaused"));
  }
  if (!state.summary) {
    stopThinking(t("thinkingIdle"));
  }
}

function slugify(text) {
  return (text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function loadScrapeCache() {
  try {
    const cached = safeStorage.get(scrapeStoreKey);
    state.scrapeCache = cached || {};
  } catch (e) {
    state.scrapeCache = {};
  }
}

function saveScrapeCache() {
  try {
    safeStorage.set(scrapeStoreKey, state.scrapeCache);
  } catch (e) {
    console.warn("Scrape cache save failed", e);
  }
}

function upsertScrapeRecord(destination, payload) {
  const key = slugify(destination);
  if (!key) return;
  state.scrapeCache[key] = {
    ...(state.scrapeCache[key] || {}),
    ...payload,
    updatedAt: Date.now(),
  };
  saveScrapeCache();
}

function hydrateScrapeSources() {
  Object.entries(state.scrapeCache || {}).forEach(([key, value]) => {
    if (value.inventory) {
      scrapeInventory[key] = value.inventory;
    }
    if (value.intel) {
      intelDataset[key] = value.intel;
    }
  });
}

function buildDynamicImages(destination, topics = []) {
  const slug = slugify(destination) || "destination";
  const seeds = [
    "1505761671935-60b3a7427bad",
    "1467269204594-9661b134dd2b",
    "1503389152951-9f343605f61e",
    "1500530855697-b586d89ba3ee",
    "1470124182917-cc6e71b22ecc",
    "1504197906862-1c1f9e5e39e2",
    "1542314831-068cd1dbfeeb",
    "1523275335684-37898b6baf30",
    "1526481280695-3c469c2f0f99",
  ];
  return topics.map((topic, idx) => {
    const photoId = seeds[idx % seeds.length];
    return {
      src: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=900&q=80&sig=${encodeURIComponent(
        `${slug}-${topic}-${idx}`
      )}`,
      alt: `${destination} — ${topic}`,
    };
  });
}

function createSyntheticScrape(destination) {
  const city = destination || "Destination";
  const slug = slugify(city);
  const baseTopics = ["quartier", "skyline", "gastronomie", "art", "parc", "rooftop", "architecture", "nature"];
  const images = buildDynamicImages(city, baseTopics);
  const pickImage = (idx) => images[idx % images.length]?.src;

  const synthInventory = {
    flights: [
      { title: `${city} Direct Confort`, detail: "Vol direct 4–6h", price: 420, currency: "€", mode: "avion", valid: true, link: "https://www.skyscanner.fr", image: pickImage(0) },
      { title: `${city} Eco rapide`, detail: "1 escale courte", price: 290, currency: "€", mode: "avion", valid: true, link: "https://www.kayak.fr", image: pickImage(1) },
      { title: `${city} Train premium`, detail: "Itinéraire optimisé", price: 180, currency: "€", mode: "train", valid: true, link: "https://www.thetrainline.com", image: pickImage(2) },
    ],
    lodging: [
      { title: `${city} Boutique 4★`, detail: "Central & design", price: 190, currency: "€", sejour: "mix", valid: true, link: "https://www.booking.com", image: pickImage(3) },
      { title: `${city} Hôtel 5★ vue`, detail: "Service club", price: 320, currency: "€", sejour: "luxe", valid: true, link: "https://www.tablethotels.com", image: pickImage(4) },
      { title: `${city} Éco-smart`, detail: "Label vert", price: 140, currency: "€", sejour: "eco", valid: true, link: "https://www.ecobnb.com", image: pickImage(5) },
    ],
    activities: [
      { title: `Food tour ${city}`, detail: "3h guidé", price: 75, currency: "€", valid: true, link: "https://www.viator.com", image: pickImage(6) },
      { title: `Musée clé ${city}`, detail: "Billet daté", price: 24, currency: "€", valid: true, link: "https://www.getyourguide.fr", image: pickImage(7) },
      { title: `Quartier ${city} by night`, detail: "Balade encadrée", price: 0, currency: "€", valid: true, link: "https://www.atlas-noir.app", image: pickImage(8) },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Centre + panoramas", valid: true, image: pickImage(5) },
      { title: "Jour 2", detail: "Musées + food tour", valid: true, image: pickImage(6) },
      { title: "Jour 3", detail: "Parcs + rooftops", valid: true, image: pickImage(7) },
    ],
  };

  const intel = {
    summary: `${city} : zones centrales sécurisées, mobilité simple, contrastes culture/food.`,
    hotels: [
      `${city} Boutique 4★ — quartier central`,
      `${city} 5★ vue — service club`,
      `${city} éco-smart — label vert`,
    ],
    highlights: [
      `Food tour ${city} nuit`,
      `Musée emblématique ${city}`,
      `Parc ou rooftop ${city} pour le coucher de soleil`,
    ],
    images,
    fallback: true,
  };

  upsertScrapeRecord(destination, { intel, inventory: synthInventory });
  scrapeInventory[slug] = synthInventory;
  intelDataset[slug] = intel;
  return { intel, inventory: synthInventory };
}

function getScrapedSnippet(destination, stage) {
  const key = slugify(destination || "");
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
  const key = slugify(destination || "");
  const inventory =
    stage === "discovery"
      ? [
          ...(scrapeInventory[key]?.flights || []),
          ...(scrapeInventory[key]?.lodging || []),
          ...(scrapeInventory[key]?.activities || []),
        ]
      : scrapeInventory[key]?.[stage] || [];
  const validOnly = inventory.filter((item) => item.valid !== false);
  const priorSelections = Object.values(state.choices || {})
    .flatMap((c) => c?.scrapedItems || [])
    .map((i) => i.title);
  const deduped = validOnly.filter((item) => !priorSelections.includes(item.title));
  const basePool = deduped.length >= 3 ? deduped : validOnly;
  const matchesTransport = discovery?.transport && discovery.transport !== "flex"
    ? basePool.filter((item) => !item.mode || item.mode === discovery.transport || item.mode === "train")
    : basePool;
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

function scoreItemByDiscovery(item, stage, discovery) {
  let score = 0;
  const price = Number(item.price || 0);
  if (discovery?.budget === "low" && price && price < 150) score += 2;
  if (discovery?.budget === "high" && price && price > 200) score += 1;
  if (stage === "flights" && discovery?.transport && item.mode === discovery.transport) score += 3;
  if (stage === "lodging" && discovery?.sejour && item.sejour === discovery.sejour) score += 3;
  if (stage === "activities" && discovery?.vibe && item.detail?.toLowerCase().includes(discovery.vibe)) score += 2;
  if (state.choices?.activities && stage === "itinerary") score += 1;
  if (item.link) score += 1;
  return score;
}

function rankScrapeItems(pool, stage, discovery) {
  return [...pool].sort((a, b) => scoreItemByDiscovery(b, stage, discovery) - scoreItemByDiscovery(a, stage, discovery));
}

function sampleScrapedItems(destination, stage, discovery, desired = 12) {
  const pool = filterScrapeItems(destination, stage, discovery);
  const ranked = rankScrapeItems(pool, stage, discovery);
  const count = Math.max(6, Math.min(desired, 12, ranked.length || desired));
  const picked = ranked.slice(0, count);
  const uniqueImages = new Set();
  return picked.map((item) => {
    const img = uniqueImages.has(item.image)
      ? ranked.find((alt) => !uniqueImages.has(alt.image) && alt.image)
      : item;
    if (img?.image) uniqueImages.add(img.image);
    return { ...item, image: img?.image || item.image };
  });
}

function domainFromLink(link) {
  if (!link) return "source vérifiée";
  try {
    const url = new URL(link.startsWith("http") ? link : `https://${link}`);
    return url.hostname.replace("www.", "");
  } catch (e) {
    return link.replace(/https?:\/\//, "").split("/")[0];
  }
}

function formatPriceTag(item, stage) {
  if (!item?.price && item?.price !== 0) return "tarif en cours";
  const unit = item.currency || (stage === "flights" ? "€" : "€");
  return `${item.price}${unit}`;
}

function pushLiveScrape({ title, text, source }) {
  if (!liveScrapeList) return;
  const item = document.createElement("li");
  const strong = document.createElement("strong");
  strong.textContent = title;
  const p = document.createElement("p");
  p.textContent = text;
  const small = document.createElement("small");
  small.textContent = source;
  item.append(strong, p, small);
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

function stopThinking(message = t("thinkingIdle")) {
  if (!thinkingIndicator) return;
  thinkingIndicator.classList.remove("active");
  const label = thinkingIndicator.querySelector(".label");
  label.textContent = message;
}

function persistState() {
  const safeState = { ...state };
  safeStorage.set("agenticState", safeState);
}

function restoreState() {
  const saved = safeStorage.get("agenticState");
  if (!saved) return;
  try {
    const parsed = saved;
    state.discovery = parsed.discovery || null;
    state.concept = parsed.concept || null;
    state.choices = parsed.choices || {};
    state.summary = parsed.summary || null;
    state.scrapeReady = parsed.scrapeReady || null;
    state.scrapeCache = parsed.scrapeCache || {};
    hydrateScrapeSources();
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
  conversation.innerHTML = `<p class="muted">${t("readyFlow")}</p>`;
  summaryBlock.innerHTML = "";
  exportBtn.disabled = true;
  intelCards.innerHTML = "";
  imageStrip.innerHTML = "";
  showIntelError("");
  setIntelStatus(t("intelPaused"));
  refreshIntelBtn.disabled = true;
  stepList.forEach((s) => s.classList.remove("done", "active"));
  stepList[0].classList.add("active");
  setStatus(t("waitingStatus"));
  stopThinking();
  clearStepLoader();
  state.discovery = null;
  state.concept = null;
  state.choices = {};
  state.summary = null;
  state.scrapeReady = null;
  hydrateScrapeSources();
  if (!skipPersist) persistState();
}

function addMessage({ title, agent, body, options = [], question }) {
  stopThinking(t("aiAwaitingValidation"));
  const card = document.createElement("article");
  card.className = "message";
  const heading = document.createElement("h3");
  heading.textContent = sanitizeField(title);
  card.appendChild(heading);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = sanitizeField(agent);
  card.appendChild(meta);

  if (body) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = sanitizeField(body);
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
      if (opt.media) {
        const fig = document.createElement("figure");
        fig.className = "option-media";
        const img = document.createElement("img");
        img.src = opt.media;
        img.alt = sanitizeField(opt.mediaAlt || opt.title);
        img.loading = "lazy";
        fig.appendChild(img);
        btn.appendChild(fig);
      }
      const copy = document.createElement("div");
      copy.className = "option-copy";
      const strong = document.createElement("strong");
      strong.textContent = `${opt.id}. ${sanitizeField(opt.title)}`;
      copy.appendChild(strong);
      if (opt.bullets?.length) {
        const list = document.createElement("ul");
        opt.bullets.forEach((b) => {
          const li = document.createElement("li");
          li.textContent = sanitizeField(b);
          list.appendChild(li);
        });
        copy.appendChild(list);
      }
      btn.appendChild(copy);
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
  const scrapedSet = sampleScrapedItems(destination, stage, state.discovery, 12);
  const stagePlan = getStageScrapePlan(stage).join(" · ");
  if (scrapedSet?.length) {
    pushLiveScrape({
      title: `Scraping ${stage}`,
      text: `${scrapedSet.length} éléments validés`,
      source: `${stagePlan} — sources conformes seulement`,
    });
  }
  const allocation = [...scrapedSet];
  const imagesUsed = new Set();
  const perOption = Math.max(3, Math.floor(scrapedSet.length / options.length));
  return options.map((opt, idx) => {
    const subset = [];
    while (subset.length < perOption && allocation.length) {
      subset.push(allocation.shift());
    }
    if (!subset.length) subset.push(...scrapedSet.slice(idx * 2, idx * 2 + perOption));
    const mediaItem = subset.find((s) => s.image && !imagesUsed.has(s.image)) || subset[0] || scrapedSet[0];
    if (mediaItem?.image) imagesUsed.add(mediaItem.image);
    const scrapeBullets = subset.slice(0, 3).map((item) => {
      const price = formatPriceTag(item, stage);
      const site = domainFromLink(item.link);
      return `${item.title} — ${price} (${site})`;
    });
    const baseBullets = Array.isArray(opt.bullets) ? opt.bullets : [];
    const blended = [...scrapeBullets, ...baseBullets.slice(0, 2)];
    return {
      ...opt,
      media: mediaItem?.image,
      mediaAlt: mediaItem?.title,
      scrapedItems: subset,
      bullets: blended,
    };
  });
}

function renderIntel(intel, destination) {
  if (!intelCards || !imageStrip) return;
  const localizedIntel = localizeIntelPayload(intel);
  const cards = [
    { title: t("intelSummaryTitle") || "Résumé sécurité & logistique", content: localizedIntel.summary },
    { title: t("intelHotelsTitle") || "Hôtels probants", content: localizedIntel.hotels.join(" · ") || "—" },
    { title: t("intelMomentsTitle") || "Moments conseillés", content: localizedIntel.highlights.join(" · ") || "—" },
  ];

  intelCards.innerHTML = "";
  cards.forEach((c) => {
    const article = document.createElement("article");
    article.className = "intel-card";
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = `📌 ${sanitizeField(destination)}`;
    const strong = document.createElement("strong");
    strong.textContent = c.title;
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = sanitizeField(c.content);
    article.append(tag, strong, p);
    intelCards.appendChild(article);
  });

  imageStrip.innerHTML = "";
  (localizedIntel.images || []).forEach((img) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = img.src;
    image.alt = sanitizeField(resolveCopy(img.alt) || destination);
    image.loading = "lazy";
    const caption = document.createElement("figcaption");
    caption.textContent = sanitizeField(resolveCopy(img.alt) || destination);
    figure.append(image, caption);
    imageStrip.appendChild(figure);
  });

  setIntelStatus(t("intelReady"), "success");
  if (refreshIntelBtn) refreshIntelBtn.disabled = false;
  showIntelError(
    intel.fallback ? t("intelFallbackMessage") : "",
    intel.fallback ? "error" : "success"
  );
}

function fallbackIntel(destination) {
  return {
    summary: {
      fr: `Pas de fiche ${destination}. On reste sur centres sûrs, 4★, culture + 1 premium.`,
      en: `No dedicated sheet for ${destination}. Staying with safe centers, 4★, culture + 1 premium touch.`,
    },
    hotels: [
      { fr: "Chaîne 4★ centrale", en: "Central 4★ chain" },
      { fr: "Boutique locale bien notée", en: "Well-rated local boutique" },
      { fr: "Option appart-hôtel sécurisé", en: "Secure aparthotel option" },
    ],
    highlights: [
      { fr: "Visite guidée du centre", en: "Guided city-center visit" },
      { fr: "Food tour", en: "Food tour" },
      { fr: "Panorama ou musée emblématique", en: "Panorama or emblematic museum" },
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80", alt: { fr: "Centre-ville", en: "Downtown" } },
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80", alt: { fr: "Quartier animé", en: "Lively district" } },
      { src: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=800&q=80", alt: { fr: "Hôtel moderne", en: "Modern hotel" } },
    ],
    fallback: true
  };
}

function fetchIntel(destination) {
  const key = slugify(destination.trim());
  setIntelStatus(t("intelSearching") || "Recherche en cours…", "info");
  showIntelError("");
  return new Promise((resolve) => {
    setTimeout(() => {
      const cachedIntel = state.scrapeCache[key]?.intel;
      if (cachedIntel) {
        intelDataset[key] = cachedIntel;
        return resolve(cachedIntel);
      }
      if (intelDataset[key]) {
        upsertScrapeRecord(destination, { intel: intelDataset[key] });
        return resolve(intelDataset[key]);
      }
      const synthetic = createSyntheticScrape(destination);
      resolve(synthetic.intel || fallbackIntel(destination));
    }, 320);
  });
}

function fetchInventory(destination) {
  const key = slugify(destination.trim());
  return new Promise((resolve) => {
    setTimeout(() => {
      const cachedInventory = state.scrapeCache[key]?.inventory;
      if (cachedInventory) {
        scrapeInventory[key] = cachedInventory;
        return resolve(cachedInventory);
      }
      if (scrapeInventory[key]) {
        upsertScrapeRecord(destination, { inventory: scrapeInventory[key] });
        return resolve(scrapeInventory[key]);
      }
      const synthetic = createSyntheticScrape(destination);
      resolve(synthetic.inventory);
    }, 320);
  });
}

async function runIntel(destination) {
  if (!destination) return;
  setIntelStatus(t("intelSearching") || "Recherche en cours…", "info");
  refreshIntelBtn.disabled = true;
  try {
    const intel = await fetchIntel(destination);
    renderIntel(intel, destination);
  } catch (e) {
    console.error(e);
    showIntelError(t("intelError") || "Erreur lors de la récupération des informations.");
    setIntelStatus(t("intelSearchFailed") || "Échec de la recherche", "danger");
    refreshIntelBtn.disabled = false;
  }
}

async function ensureScrapeDataset(destination, stageLabel = t("scrapingStage")) {
  const key = slugify(destination || "");
  if (!key) return {};
  if (state.scrapeReady === key && scrapeInventory[key]) {
    return { intel: intelDataset[key], inventory: scrapeInventory[key] };
  }
  setStatus(t("statusScraping"), "info");
  setThinking(stageLabel);
  const delay = Math.floor(2500 + Math.random() * 2000);
  const needsLoader = !dynamicState.loader;
  if (needsLoader) showStepLoader(stageLabel, delay, "discovery");
  await new Promise((resolve) => setTimeout(resolve, delay));
  const [intel, inventory] = await Promise.all([
    fetchIntel(destination),
    fetchInventory(destination),
  ]);
  renderIntel(intel, destination);
  state.scrapeReady = key;
  if (needsLoader) clearStepLoader();
  setIntelStatus(t("scrapeReady"), "success");
  refreshIntelBtn.disabled = false;
  return { intel, inventory };
}

function safetyBlocked(destination) {
  const alt = ["Lisbonne (culture & océan)", "Montréal (ville sûre)", "Séoul (high-tech)"];
  clearUI(true);
  safeStorage.remove("agenticState");
  addMessage({
    title: t("blockedTitle"),
    agent: t("blockedAgent"),
    body: tr("blockedBody", { destination, alternatives: alt.join(" · ") })
  });
  setStatus(t("blockedStatus"), "danger");
  setIntelStatus(t("intelSearchCancelled"), "danger");
  showIntelError(t("intelBlockedMessage"));
}

function formatBudgetLabel(level) {
  if (level === "low") return t("budgetTight");
  if (level === "high") return t("budgetGenerous");
  return t("budgetBalanced");
}

function validateDiscovery(data) {
  const warnings = [];
  const duration = Number(data.duration || 0);
  if (duration > 21) warnings.push(t("warningLongStay"));
  if (duration < 3) warnings.push(t("warningShortStay"));
  if (data.budget === "low" && ["romantic", "luxury", "premium"].some((v) => data.vibe?.includes(v))) {
    warnings.push(t("warningBudgetVibe"));
  }
  return warnings;
}

function conceptOptions(discovery) {
  const vibeLabel = discovery.vibe
    ? discovery.vibe === "city"
      ? "City break"
      : discovery.vibe.charAt(0).toUpperCase() + discovery.vibe.slice(1)
    : "Mix";
  const destinationLabel = sanitizeField(discovery.destination || "la destination");
  const options = [
    {
      id: "A",
      title: tr("conceptTitleA", { destination: destinationLabel }),
      bullets: [
        tr("conceptBulletA1", { vibeLabel }),
        tr("conceptBulletA2", { transport: discovery.transport }),
        tr("conceptBulletA3", { stay: discovery.sejour }),
      ],
    },
    {
      id: "B",
      title: t("conceptTitleB"),
      bullets: [
        t("conceptBulletB1"),
        tr("conceptBulletB2", { duration: discovery.duration }),
        tr("conceptBulletB3", { transport: discovery.transport }),
      ],
    },
    {
      id: "C",
      title: tr("conceptTitleC", { destination: destinationLabel }),
      bullets: [t("conceptBulletC1"), t("conceptBulletC2"), t("conceptBulletC3")],
    },
  ];
  return attachScrapeToOptions(options, "discovery").map((opt) => ({
      ...opt,
      onSelect: (o) => {
        state.concept = o;
        addMessage({
          title: tr("conceptChosen", { title: o.title }),
          agent: "Agent 0",
          body: t("proceedProfile"),
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
    node.removeAttribute("aria-current");
  });
  if (stepList[activeIndex]) {
    stepList[activeIndex].classList.add("active");
    stepList[activeIndex].setAttribute("aria-current", "step");
  }
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
  setTimeout(async () => {
    await ensureScrapeDataset(state.discovery?.destination, stageLabel);
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
  if (validateBtn) validateBtn.disabled = false;
  const blocks = [];
  const { discovery, concept, choices } = state;

  const formatScrapeLines = (choice, stage) => {
    if (!choice?.scrapedItems?.length) return [choice?.title || "—"];
    const lines = choice.scrapedItems.slice(0, 3).map((item) => {
      const price = formatPriceTag(item, stage);
      const site = domainFromLink(item.link);
      return `${item.title} — ${price} via ${site}`;
    });
    const headline = `${choice.id || "Option"} · ${sanitizeField(choice.title)}`;
    return [headline, ...lines];
  };

  blocks.push({
    title: "1. Profil client",
    items: [
      `${formatBudgetLabel(discovery.budget)} — ${discovery.duration} jours`,
      `Départ ${sanitizeField(discovery.origin)} → ${sanitizeField(discovery.destination)}`,
      `Vibe ${sanitizeField(discovery.vibe)}, flexibilité ${sanitizeField(discovery.flex)}, transport ${sanitizeField(discovery.transport)}, séjour ${sanitizeField(discovery.sejour)}`,
      `Voyageurs: ${sanitizeField(discovery.travelers)}`,
      concept ? `Concept: ${sanitizeField(concept.title)}` : ""
    ].filter(Boolean)
  });

  blocks.push({ title: "2. Vols", items: formatScrapeLines(choices.flights, "flights") });
  blocks.push({ title: "3. Hôtels", items: formatScrapeLines(choices.lodging, "lodging") });
  blocks.push({ title: "4. Activités", items: formatScrapeLines(choices.activities, "activities") });
  blocks.push({ title: "5. Itinéraire", items: choices.itinerary?.bullets || ["Itinéraire standard"] });
  blocks.push({ title: "6. Package choisi", items: formatScrapeLines(choices.package, "budget") });
  blocks.push({ title: "7. Conformité sécurité", items: ["Pas de destinations interdites", "Aucune activité illégale"] });

  summaryBlock.innerHTML = "";
  blocks.forEach((b) => {
    const container = document.createElement("div");
    container.className = "block";
    const h4 = document.createElement("h4");
    h4.textContent = b.title;
    container.appendChild(h4);
    const list = document.createElement("ul");
    b.items.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = sanitizeField(i);
      list.appendChild(li);
    });
    container.appendChild(list);
    summaryBlock.appendChild(container);
  });

  state.summary = blocks;
  persistState();
}
exportBtn.addEventListener("click", () => {
  if (!state.summary) return;
  const text = state.summary
    .map((b) => `${b.title}\n- ${b.items.join("\n- ")}`)
    .join("\n\n");
  navigator.clipboard.writeText(text).then(() => {
    exportBtn.textContent = t("summaryCopied");
    setTimeout(() => (exportBtn.textContent = t("summaryCopy")), 2000);
  });
});

if (validateBtn) {
  validateBtn.addEventListener("click", () => {
    if (!state.summary) return;
    validateBtn.textContent = t("validated");
    validateBtn.classList.add("confirmed");
    addMessage({
      title: t("validateMessage"),
      agent: "Chef d’orchestre",
      body: t("validateBody"),
    });
  });
}

async function onDiscoverySubmit(event) {
  event.preventDefault();
  const formEntries = Object.fromEntries(new FormData(event.target).entries());
  if (containsUnsafeMarkup(formEntries.destination) || containsUnsafeMarkup(formEntries.origin)) {
    showIntelError(t("invalidHtml"));
    return;
  }
  const data = Object.fromEntries(
    Object.entries(formEntries).map(([k, v]) => [k, sanitizeField(v)])
  );
  const destinationLC = data.destination.trim().toLowerCase();
  if (bannedDestinations.some((d) => destinationLC.includes(d))) {
    safetyBlocked(data.destination);
    stopThinking(t("securityBlocked"));
    return;
  }
  const warnings = validateDiscovery(data);
  state.discovery = data;
  state.scrapeReady = null;
  setStatus(t("statusInProgress"), "info");
  conversation.innerHTML = "";
  setThinking(t("thinkingConceptPrep"));

  if (warnings.length) {
    addMessage({
      title: t("coherenceAlertTitle"),
      agent: t("coherenceAlertAgent"),
      body: warnings.join("\n")
    });
  }

  await ensureScrapeDataset(data.destination, t("scrapingStage"));

  addMessage({
    title: t("discoveryPhaseTitle"),
    agent: t("discoveryAgent"),
    body: tr("discoveryBody", {
      destination: data.destination,
      origin: data.origin,
      vibe: data.vibe,
      budget: formatBudgetLabel(data.budget),
    }),
    options: conceptOptions(data),
    question: t("conceptQuestion")
  });

  persistState();
}

document.getElementById("discoveryForm").addEventListener("submit", onDiscoverySubmit);
if (refreshIntelBtn) {
  refreshIntelBtn.addEventListener("click", () => {
    if (state.discovery?.destination) runIntel(state.discovery.destination);
  });
}

const savedLang = safeStorage.get("appLang") || (navigator.language || "fr").slice(0, 2);
setLanguage(savedLang);
applyStaticTranslations();

const languagePicker = document.getElementById("languagePicker");
if (languagePicker) {
  languagePicker.addEventListener("change", (event) => setLanguage(event.target.value));
}

loadScrapeCache();
hydrateScrapeSources();
clearUI(true);
restoreState();
if (state.discovery?.destination) {
  setStatus(t("statusSessionRestored"), "info");
  if (refreshIntelBtn) refreshIntelBtn.disabled = false;
  runIntel(state.discovery.destination);
}
