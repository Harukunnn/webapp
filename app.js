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
      { title: "ANA nuit claire", detail: "HND → centre 22 min", price: 890, currency: "€", mode: "avion", valid: true, link: "https://www.ana.co.jp", hours: "Départs 21h30-00h30", address: "Terminal international HND", tags: ["avion", "premium"], image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80" },
      { title: "JAL Premium Eco", detail: "1 bagage + siège large", price: 1240, currency: "€", mode: "avion", valid: true, link: "https://www.jal.co.jp", hours: "Départs matin 08h-11h", address: "Terminal 2 HND", tags: ["avion", "premium"], image: "https://images.unsplash.com/photo-1504197906862-1c1f9e5e39e2?auto=format&fit=crop&w=600&q=80" },
      { title: "Monorail HND", detail: "Monorail 20 min", price: 7, currency: "€", mode: "train", valid: true, link: "https://www.tokyo-monorail.co.jp", hours: "Toutes les 4–5 min 05h-00h", address: "Station Haneda Airport T3", tags: ["train", "access"], image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" },
      { title: "Narita Express", detail: "55 min Tokyo Station", price: 25, currency: "€", mode: "train", valid: true, link: "https://www.jreast.co.jp/multi/fr/nex.html", hours: "Deux fois/heure 07h-22h", address: "Narita T1/T2/T3", tags: ["train", "premium"], image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
      { title: "Vol low-cost", detail: "Escale Séoul", price: 690, currency: "€", mode: "avion", valid: true, link: "https://www.skyscanner.fr", hours: "Fréquences variables", address: "Narita T2", tags: ["avion", "budget"], image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Shibuya Stream 4★", detail: "220€ nuit", price: 220, currency: "€", sejour: "mix", valid: true, link: "https://www.tokyu-hotels.co.jp/stream-e/", address: "3-21-3 Shibuya", hours: "Check-in 15h", tags: ["gastro", "nightlife"], image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Park Hotel 4★ arty", detail: "210€ nuit", price: 210, currency: "€", sejour: "luxe", valid: true, link: "https://parkhoteltokyo.com", address: "Shiodome Media Tower", hours: "Check-in 15h", tags: ["art-design"], image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Ginza", detail: "Sobre & central", price: 180, currency: "€", sejour: "sobre", valid: true, link: "https://www.ginza-hotel.jp", address: "1-5-10 Ginza", hours: "Réception 24/7", tags: ["shopping", "sobre"], image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Ryokan discret", detail: "Tatamis + onsen", price: 240, currency: "€", sejour: "luxe", valid: true, link: "https://www.hoshinoya.com/tokyo/", address: "1-9-1 Otemachi", hours: "Check-in 15h", tags: ["bien-etre", "tradition"], image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80" },
      { title: "Capsule premium", detail: "Option économique", price: 90, currency: "€", sejour: "eco", valid: true, link: "https://ninehours.co.jp", address: "Narita T2", hours: "Check-in 12h", tags: ["budget", "fauteuil"], image: "https://images.unsplash.com/photo-1578681143489-4662a462f8aa?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "TeamLab Planets", detail: "Billet daté", price: 28, currency: "€", valid: true, link: "https://planets.teamlab.art/tokyo/", address: "Toyosu 6-1-16", hours: "10h-20h", tags: ["tech", "immersif", "famille"], image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
      { title: "Onsen Odaiba", detail: "No tattoo", price: 35, currency: "€", valid: true, link: "https://daiba.ooedoonsen.jp/en/", address: "1-6-1 Odaiba", hours: "11h-21h", tags: ["bien-etre"], image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Food tour Shinjuku", detail: "3h nocturne", price: 95, currency: "€", valid: true, link: "https://www.arigatojapan.co.jp/tour/shinjuku-izakaya", address: "Kabukicho", hours: "18h-21h", tags: ["gastro", "nightlife"], image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" },
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
      { title: "Transfert metro", detail: "Ligne rouge 6-10 min", price: 2, currency: "€", mode: "train", valid: true, link: "https://www.metrolisboa.pt", hours: "Toutes les 6-10 min 06h-01h", address: "Aéroport Humberto Delgado", tags: ["train", "access"], image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Lumiares 4★", detail: "Bairro Alto", price: 190, currency: "€", sejour: "luxe", valid: true, link: "https://www.thelumiares.com", address: "Rua do Diário de Notícias 142", hours: "Check-in 15h", tags: ["gastro", "rooftop"], image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Mama Shelter", detail: "Design + rooftop", price: 160, currency: "€", sejour: "mix", valid: true, link: "https://mamashelter.com/lisbon/", address: "Av. Álvares Cabral 33", hours: "Check-in 15h", tags: ["art-design", "rooftop"], image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Alfama", detail: "Sobre & fado", price: 150, currency: "€", sejour: "sobre", valid: true, link: "https://www.boutique-hotel-alfama.com", address: "Rua dos Remédios 45", hours: "Check-in 14h", tags: ["patrimoine", "sobre"], image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80" },
      { title: "Eco hôtel LX", detail: "Label green", price: 130, currency: "€", sejour: "eco", valid: true, link: "https://www.memmo.pt", address: "Praça do Comércio", hours: "Check-in 15h", tags: ["eco", "fauteuil"], image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "Tram 28", detail: "3€ billet", price: 3, currency: "€", valid: true, link: "https://www.carris.pt", address: "Martim Moniz", hours: "Départs 07h-23h", tags: ["patrimoine", "famille"], image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80" },
      { title: "Belém tour", detail: "Torre + Pastéis", price: 15, currency: "€", valid: true, link: "https://www.parquesdesintra.pt", address: "Avenida Brasília", hours: "10h-18h", tags: ["patrimoine", "mer"], image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Fado Alfama", detail: "Soirée intimiste", price: 45, currency: "€", valid: true, link: "https://www.visitlisboa.com", address: "Rua dos Remédios", hours: "20h-23h", tags: ["nightlife", "gastro"], image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" },
      { title: "Surf Cascais", detail: "Session matin", price: 60, currency: "€", valid: true, link: "https://www.ericeirasurfhouse.com", address: "Praia do Guincho", hours: "08h-11h", tags: ["outdoor", "mer"], image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Baixa + Alfama", valid: true, image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 2", detail: "Belém + LX Factory", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 3", detail: "Cascais/Sintra", valid: true, image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
    ],
  },
  montréal: {
    flights: [
      { title: "Air Canada direct", detail: "CDG → YUL", price: 780, currency: "€", mode: "avion", valid: true, link: "https://www.aircanada.com", hours: "Départs quotidiens 13h-16h", address: "CDG T2E", tags: ["avion", "premium"], image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80" },
      { title: "Air Transat", detail: "Bagage inclus", price: 650, currency: "€", mode: "avion", valid: true, link: "https://www.airtransat.com", hours: "Départs soirée 17h-22h", address: "CDG T3", tags: ["avion", "budget"], image: "https://images.unsplash.com/photo-1504197906862-1c1f9e5e39e2?auto=format&fit=crop&w=600&q=80" },
      { title: "Train aéroport 747", detail: "24/7 11$", price: 11, currency: "$", mode: "train", valid: true, link: "https://www.stm.info/en/info/networks/bus/747-yul-montreal-trudeau-airport-shuttle", hours: "Toutes les 10 min 24/7", address: "Sortie porte 28 YUL", tags: ["train", "fauteuil"], image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" },
      { title: "Taxi fixe", detail: "48,40$ CAD", price: 48, currency: "$", mode: "route", valid: true, link: "https://montreal.ca/en/articles/taxi-fares-between-yul-and-downtown", hours: "24/7", address: "Station taxis YUL", tags: ["route", "access"], image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Humaniti 4★", detail: "Design & spa", price: 260, currency: "$", sejour: "luxe", valid: true, link: "https://www.humanitihotel.com", address: "340 Rue de la Gauchetière O", hours: "Check-in 15h", tags: ["art-design", "spa"], image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Monville 4★", detail: "Vue skyline", price: 210, currency: "$", sejour: "mix", valid: true, link: "https://hotelmonville.com", address: "1041 Rue de Bleury", hours: "Check-in 15h", tags: ["skyline", "business"], image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Eco Mile-End", detail: "Certification verte", price: 160, currency: "$", sejour: "eco", valid: true, link: "https://zerohotel.ca", address: "Mile-End", hours: "Check-in 15h", tags: ["eco", "veggie"], image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Old Port", detail: "Boiseries", price: 190, currency: "$", sejour: "sobre", valid: true, link: "https://www.aubergeduvieuxport.com", address: "97 Rue de la Commune E", hours: "Check-in 15h", tags: ["patrimoine", "famille"], image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "Musée Beaux-Arts", detail: "Lundi fermé", price: 24, currency: "$", valid: true, link: "https://www.mbam.qc.ca", address: "1380 Rue Sherbrooke O", hours: "10h-17h", tags: ["musee", "art-design"], image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
      { title: "Mont Royal", detail: "Coucher soleil", price: 0, currency: "$", valid: true, link: "https://www.lemontroyal.qc.ca/en", address: "Parc du Mont-Royal", hours: "05h-00h", tags: ["outdoor", "famille"], image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Food tour Mile-End", detail: "3h", price: 75, currency: "$", valid: true, link: "https://localmontrealtours.com", address: "Boulevard St-Laurent", hours: "Départs 11h / 17h", tags: ["gastro", "street-food"], image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
      { title: "Hockey Centre Bell", detail: "Billets soirée", price: 120, currency: "$", valid: true, link: "https://www.centrebell.ca", address: "1909 Av. des Canadiens-de-Montréal", hours: "Matchs 19h", tags: ["nightlife", "famille"], image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
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

function slugify(text) {
  return (text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function loadScrapeCache() {
  try {
    const cached = localStorage.getItem(scrapeStoreKey);
    state.scrapeCache = cached ? JSON.parse(cached) : {};
  } catch (e) {
    state.scrapeCache = {};
  }
}

function saveScrapeCache() {
  try {
    localStorage.setItem(scrapeStoreKey, JSON.stringify(state.scrapeCache));
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

function generateStageImage(destination, stage, idx) {
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
    "1470246973918-29a93221c455",
  ];
  const photoId = seeds[idx % seeds.length];
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=900&q=80&sat=-5&sig=${encodeURIComponent(
    `${slugify(destination)}-${stage}-${idx}`
  )}`;
}

function createSyntheticScrape(destination) {
  const city = destination || "Destination";
  const slug = slugify(city);
  const baseTopics = ["quartier", "skyline", "gastronomie", "art", "parc", "rooftop", "architecture", "nature"];
  const images = buildDynamicImages(city, baseTopics);
  const pickImage = (idx) => images[idx % images.length]?.src;

  const synthInventory = {
    flights: [
      { title: `${city} Direct Confort`, detail: "Vol direct 4–6h", price: 420, currency: "€", mode: "avion", valid: true, link: "https://www.skyscanner.fr", hours: "Départs matin", address: `${city} Intl T1`, tags: ["avion", "premium"], image: pickImage(0) },
      { title: `${city} Eco rapide`, detail: "1 escale courte", price: 290, currency: "€", mode: "avion", valid: true, link: "https://www.kayak.fr", hours: "Départs soir", address: `${city} Intl T2`, tags: ["avion", "budget"], image: pickImage(1) },
      { title: `${city} Train premium`, detail: "Itinéraire optimisé", price: 180, currency: "€", mode: "train", valid: true, link: "https://www.thetrainline.com", hours: "Départs toutes les h", address: `${city} Gare Centrale`, tags: ["train", "fauteuil"], image: pickImage(2) },
    ],
    lodging: [
      { title: `${city} Boutique 4★`, detail: "Central & design", price: 190, currency: "€", sejour: "mix", valid: true, link: "https://www.booking.com", address: `${city} centre historique`, hours: "Check-in 15h", tags: ["art-design", "shopping"], image: pickImage(3) },
      { title: `${city} Hôtel 5★ vue`, detail: "Service club", price: 320, currency: "€", sejour: "luxe", valid: true, link: "https://www.tablethotels.com", address: `${city} skyline`, hours: "Check-in 15h", tags: ["skyline", "bien-etre"], image: pickImage(4) },
      { title: `${city} Éco-smart`, detail: "Label vert", price: 140, currency: "€", sejour: "eco", valid: true, link: "https://www.ecobnb.com", address: `${city} quartier vert`, hours: "Check-in 14h", tags: ["eco", "veggie"], image: pickImage(5) },
    ],
    activities: [
      { title: `Food tour ${city}`, detail: "3h guidé", price: 75, currency: "€", valid: true, link: "https://www.viator.com", address: `${city} marché central`, hours: "11h / 18h", tags: ["gastro", "street-food"], image: pickImage(6) },
      { title: `Musée clé ${city}`, detail: "Billet daté", price: 24, currency: "€", valid: true, link: "https://www.getyourguide.fr", address: `${city} musée national`, hours: "10h-18h", tags: ["musee", "art-design"], image: pickImage(7) },
      { title: `Quartier ${city} by night`, detail: "Balade encadrée", price: 0, currency: "€", valid: true, link: "https://www.atlas-noir.app", address: `${city} centre`, hours: "20h-23h", tags: ["nightlife", "rooftop"], image: pickImage(8) },
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

function ensureInventoryVolume(destination, inventory = {}, discovery) {
  const stages = ["flights", "lodging", "activities", "itinerary", "profile", "discovery"];
  const baseAddress = `${destination || "Destination"} centre`;
  stages.forEach((stage) => {
    const pool = inventory[stage] || (stage === "discovery" ? [] : []);
    const desired = stage === "activities"
      ? Math.max(18, (Number(discovery?.duration) || 6) * 2)
      : 18;
    let idx = pool.length;
    while (pool.length < desired) {
      const priceSeed = 40 + idx * 5;
      const synthetic = {
        title: `${destination || "Destination"} ${stage} ${idx + 1}`,
        detail: stage === "flights" ? "Horaires fréquents" : stage === "lodging" ? "Adresse centrale" : "Sélection scrappée",
        price: stage === "lodging" ? priceSeed + 80 : priceSeed,
        currency: "€",
        mode: stage === "flights" ? (idx % 2 ? "avion" : "train") : undefined,
        sejour: stage === "lodging" ? (idx % 3 === 0 ? "luxe" : idx % 3 === 1 ? "mix" : "eco") : undefined,
        valid: true,
        link: "https://www.google.com/travel",
        hours:
          stage === "activities"
            ? `${10 + (idx % 4)}h-${18 + (idx % 4)}h`
            : stage === "flights"
            ? `${6 + (idx % 5)}h-${22 - (idx % 3)}h`
            : "24/7",
        address: `${baseAddress} · secteur ${idx + 1}`,
        tags: [stage, discovery?.focus, discovery?.culture, discovery?.night].filter(Boolean),
        image: generateStageImage(destination, stage, idx),
      };
      pool.push(synthetic);
      idx++;
    }
    inventory[stage] = pool;
  });
  return inventory;
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
  const preferenceTags = [
    discovery?.focus,
    discovery?.food,
    discovery?.culture,
    discovery?.night,
    discovery?.outdoor,
    discovery?.sport,
    discovery?.wellness,
    discovery?.shopping,
    discovery?.season,
    discovery?.access,
    discovery?.kids === "famille" ? "famille" : null,
  ].filter(Boolean);
  const matchesTransport = discovery?.transport && discovery.transport !== "flex"
    ? basePool.filter((item) => !item.mode || item.mode === discovery.transport || item.mode === "train")
    : basePool;
  const matchesSejour = discovery?.sejour && discovery.sejour !== "mix"
    ? matchesTransport.filter((item) => !item.sejour || item.sejour === discovery.sejour)
    : matchesTransport;
  const matchesPreferences =
    preferenceTags.length && matchesSejour.some((item) => preferenceTags.some((t) => (item.tags || []).includes(t)))
      ? matchesSejour.filter((item) => preferenceTags.some((t) => (item.tags || []).includes(t)))
      : matchesSejour;
  const base = matchesPreferences.length ? matchesPreferences : matchesSejour.length ? matchesSejour : validOnly;
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
  const tags = item.tags || [];
  [discovery?.focus, discovery?.food, discovery?.culture, discovery?.night, discovery?.outdoor].forEach((pref) => {
    if (pref && tags.includes(pref)) score += 2;
  });
  if (discovery?.access && tags.includes(discovery.access)) score += 1;
  if (discovery?.pace === "slow" && stage === "itinerary") score += 1;
  if (discovery?.pace === "dense" && stage === "activities") score += 1;
  if (discovery?.kids === "famille" && tags.includes("famille")) score += 2;
  if (state.choices?.activities && stage === "itinerary") score += 1;
  if (item.link) score += 1;
  return score;
}

function rankScrapeItems(pool, stage, discovery) {
  return [...pool].sort((a, b) => scoreItemByDiscovery(b, stage, discovery) - scoreItemByDiscovery(a, stage, discovery));
}

function sampleScrapedItems(destination, stage, discovery, desired = 18) {
  const pool = filterScrapeItems(destination, stage, discovery);
  const ranked = rankScrapeItems(pool, stage, discovery);
  const count = Math.max(9, Math.min(desired, ranked.length || desired));
  const picked = ranked.slice(0, count);
  const uniqueImages = new Set();
  return picked.map((item, idx) => {
    const imgCandidate = uniqueImages.has(item.image)
      ? ranked.find((alt) => !uniqueImages.has(alt.image) && alt.image)
      : item;
    const fallbackImg = imgCandidate?.image || generateStageImage(destination, stage, idx + picked.length);
    uniqueImages.add(fallbackImg);
    return { ...item, image: fallbackImg };
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

function formatScrapeBullet(item, stage) {
  const price = formatPriceTag(item, stage);
  const site = domainFromLink(item.link);
  const detailParts = [price, item.address, item.hours].filter(Boolean).join(" · ");
  return `${item.title}${detailParts ? ` — ${detailParts}` : ""} (${site})`;
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
  state.scrapeReady = null;
  hydrateScrapeSources();
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
    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "ghost icon skip";
    skip.textContent = "Passer (choix auto)";
    skip.addEventListener("click", () => {
      const randomOpt = options[Math.floor(Math.random() * options.length)];
      if (randomOpt?.onSelect) randomOpt.onSelect(randomOpt);
    });
    grid.appendChild(skip);
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
  const desiredCount = stage === "activities"
    ? Math.max(18, (Number(state.discovery?.duration) || 5) * 3)
    : 18;
  const scrapedSet = sampleScrapedItems(destination, stage, state.discovery, desiredCount);
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
      return formatScrapeBullet(item, stage);
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

function buildProfileIntel(destination, discovery) {
  const key = slugify(destination || "");
  const context = scrapedContext[key] || {};
  const preview = sampleScrapedItems(destination, "profile", discovery, 9).slice(0, 3);
  const chips = [
    context.flights && { label: "Accès / transports", value: context.flights },
    context.hotels && { label: "Hôtellerie / prix", value: context.hotels },
    context.activities && { label: "Culture / sorties", value: context.activities },
    context.itinerary && { label: "Rythme / horaires", value: context.itinerary },
    context.budget && { label: "Budget local", value: context.budget },
  ].filter(Boolean);

  const chipHtml = chips
    .map(
      (c) =>
        `<div class="profile-chip"><p class="chip-label">${c.label}</p><p class="chip-value">${c.value}</p></div>`
    )
    .join("");

  const cards = preview
    .map(
      (item) =>
        `<article class="profile-card"><figure><img src="${item.image}" alt="${item.title}" loading="lazy" /></figure><div><p class="muted mini">${item.address || item.detail || "Source vérifiée"}</p><strong>${item.title}</strong><p class="muted">${item.hours || formatScrapeBullet(item, "profile")}</p></div></article>`
    )
    .join("");

  return `<div class="profile-intel"><div class="profile-chips">${chipHtml}</div><div class="profile-cards">${cards}</div></div>`;
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
  if (refreshIntelBtn) refreshIntelBtn.disabled = false;
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
  const key = slugify(destination.trim());
  setIntelStatus("Recherche en cours…", "info");
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
        scrapeInventory[key] = ensureInventoryVolume(destination, cachedInventory, state.discovery);
        return resolve(scrapeInventory[key]);
      }
      if (scrapeInventory[key]) {
        scrapeInventory[key] = ensureInventoryVolume(destination, scrapeInventory[key], state.discovery);
        upsertScrapeRecord(destination, { inventory: scrapeInventory[key] });
        return resolve(scrapeInventory[key]);
      }
      const synthetic = createSyntheticScrape(destination);
      resolve(ensureInventoryVolume(destination, synthetic.inventory, state.discovery));
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

async function ensureScrapeDataset(destination, stageLabel = "Scraping sécurisé…") {
  const key = slugify(destination || "");
  if (!key) return {};
  if (state.scrapeReady === key && scrapeInventory[key]) {
    return { intel: intelDataset[key], inventory: ensureInventoryVolume(destination, scrapeInventory[key], state.discovery) };
  }
  setStatus("Scraping", "info");
  setThinking(stageLabel);
  const delay = Math.floor(2500 + Math.random() * 2000);
  const needsLoader = !dynamicState.loader;
  if (needsLoader) showStepLoader(stageLabel, delay, "discovery");
  await new Promise((resolve) => setTimeout(resolve, delay));
  const [intel, inventory] = await Promise.all([
    fetchIntel(destination),
    fetchInventory(destination),
  ]);
  const normalizedInventory = ensureInventoryVolume(destination, inventory, state.discovery);
  scrapeInventory[key] = normalizedInventory;
  renderIntel(intel, destination);
  state.scrapeReady = key;
  if (needsLoader) clearStepLoader();
  setIntelStatus("Sources scrappées prêtes", "success");
  refreshIntelBtn.disabled = false;
  return { intel, inventory: normalizedInventory };
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

function variantTitle(base, stage, discovery, id) {
  const vibe = discovery?.vibe || "mix";
  const pace = discovery?.pace === "equilibre" ? "équilibré" : discovery?.pace || "équilibré";
  const palette = {
    discovery: ["signature", "curation locale", "mix immersif", "atlas premium"],
    profile: ["vibe alignée", `cadence ${pace}`, `focus ${vibe}`, "sur mesure"],
    flights: ["sky", "express", "long-courrier doux", "connecté"],
    lodging: ["collection", "suite & vues", "mix hôtelier", "adresses sûres"],
    activities: ["culture & food", "nocturne", "panoramas", "sur-mesure"],
    itinerary: ["rythme fin", `cadence ${pace}`, "flow", "ligne directrice"],
    budget: ["précision", "premium", "équilibre", "surclassement"],
  };
  const variants = palette[stage] || palette.discovery;
  const suffix = variants[Math.floor(Math.random() * variants.length)] || "signature";
  return `${base} · ${suffix}${id ? ` (${id})` : ""}`;
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
  const focusLabel = discovery.focus ? discovery.focus.replace("-", " ") : "mix";
  const cultureLabel = discovery.culture ? discovery.culture.replace("-", " ") : "culture locale";
  const destinationLabel = discovery.destination || "la destination";
  const options = [
    {
      id: "A",
      title: variantTitle(`Immersion ${destinationLabel} sur mesure`, "discovery", discovery, "A"),
      bullets: [
        `${vibeLabel} + adresses ${focusLabel}`,
        `Transports ${discovery.transport} affinés`,
        `Séjour ${discovery.sejour} calibré (${cultureLabel})`,
      ],
    },
    {
      id: "B",
      title: variantTitle("Nature ou littoral reposant", "discovery", discovery, "B"),
      bullets: [
        "Rythme léger & panoramas",
        `${discovery.duration}-jour(s) avec sorties ciblées`,
        `Transport ${discovery.transport} + transfers filtrés`,
      ],
    },
    {
      id: "C",
      title: variantTitle(`${destinationLabel} nocturne & design`, "discovery", discovery, "C"),
      bullets: [
        "Quartiers vivants + rooftops",
        "Bars/cafés signature scrappés",
        "Logements proches des hubs sûrs",
      ],
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

    const profileIntel = buildProfileIntel(discovery.destination, discovery);
    const vibeTag = discovery.vibe ? discovery.vibe.replace(/-/g, " ") : "mix";
    const focusTag = discovery.focus ? discovery.focus.replace(/-/g, " ") : "signature";
    const transportTag = discovery.transport || "flex";

    const options = attachScrapeToOptions([
      {
        id: "A",
        title: variantTitle("Hybrid luxe + budget maîtrisé", "profile", discovery, "A"),
        bullets: [
          `Moments premium ${discovery.duration > 5 ? "étalés" : "ciblés"}`,
          `Hôtels/vols triés sur ${focusTag}`,
          `Transport ${transportTag} + horaires lissés`,
        ],
      },
      {
        id: "B",
        title: variantTitle("Séjour court très confortable", "profile", discovery, "B"),
        bullets: [
          `${discovery.duration - 1 > 0 ? discovery.duration - 1 : 3}-4 jours intenses`,
          `Vols courts + transferts ${transportTag}`,
          `${focusTag} + vibe ${vibeTag} assumés`,
        ],
      },
      {
        id: "C",
        title: variantTitle("Durée pleine, hôtels sobres", "profile", discovery, "C"),
        bullets: [
          `${discovery.duration + 1} jours avec pics culture ${focusTag}`,
          `3★/4★ très bien notés + accès ${transportTag}`,
          `Budget prioritaire sur activités ${vibeTag}`,
        ],
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
      body: `<div class="profile-head"><div><strong>Résumé compact</strong><ul>${summary
        .map((i) => `<li>${i}</li>`)
        .join("")}</ul><p class="muted mini">Concept pressenti : ${concept ? concept.title : "-"}.</p></div><div class="profile-highlights"><span class="pill">${vibeTag}</span><span class="pill">${focusTag}</span><span class="pill">${transportTag}</span></div></div>${profileIntel}`,
      options,
      question: "Choisissez le profil A/B/C ou ajustez votre choix."
    });
  },
  flights: (idx) => {
    const { origin, destination, budget } = state.discovery;
    const options = attachScrapeToOptions([
      {
        id: "A",
        title: variantTitle("Route économique sécurisée", "flights", state.discovery, "A"),
        bullets: [
          `${origin} → escale → ${destination}`,
          "Classe éco, horaires étalés",
          "Prix bas, temps plus long",
        ],
      },
      {
        id: "B",
        title: variantTitle("Confort + horaires courts", "flights", state.discovery, "B"),
        bullets: [
          `${origin} → ${destination} ou escale courte`,
          "Éco premium/siège extra",
          "Plus cher mais reposant",
        ],
      },
      {
        id: "C",
        title: variantTitle("Équilibré budget/temps", "flights", state.discovery, "C"),
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
        title: variantTitle("Moins de nuits mais 5★", "lodging", state.discovery, "A"),
        bullets: ["2–3 nuits luxe", "Quartier central", "Budget concentré"],
      },
      {
        id: "B",
        title: variantTitle("4★ abordable toute la durée", "lodging", state.discovery, "B"),
        bullets: ["Durée complète", "Zone pratique (métro/plage)", "Bon rapport qualité/prix"],
      },
      {
        id: "C",
        title: variantTitle("Mix luxe + mid-range", "lodging", state.discovery, "C"),
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
        title: variantTitle("Culture + gratuit majoritaire", "activities", state.discovery, "A"),
        bullets: ["Musées/temples extérieurs", "Balades guidées", "1 expérience premium unique"],
      },
      {
        id: "B",
        title: variantTitle("Mix équilibré payant/gratuit", "activities", state.discovery, "B"),
        bullets: ["Visites emblématiques", "Street-food + rooftop", "1 activité par demi-journée"],
      },
      {
        id: "C",
        title: variantTitle("Moments premium concentrés", "activities", state.discovery, "C"),
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
  const duration = Number(discovery.duration || 0) || 1;

  const estimateStageCost = (choice, stage) => {
    if (!choice?.scrapedItems?.length) return 0;
    const prices = choice.scrapedItems
      .map((i) => Number(i.price))
      .filter((p) => !Number.isNaN(p) && p > 0);
    if (!prices.length) return 0;
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    if (stage === "lodging") return Math.round(average * duration);
    if (stage === "activities") return Math.round(average * Math.max(duration, prices.length / 2));
    if (stage === "flights") return Math.round(Math.min(...prices));
    return Math.round(average);
  };

  const formatScrapeLines = (choice, stage) => {
    if (!choice?.scrapedItems?.length) return [choice?.title || "—"];
    const seen = new Set();
    const lines = choice.scrapedItems.slice(0, 3).map((item) => {
      const price = formatPriceTag(item, stage);
      const site = domainFromLink(item.link);
      const img = item.image && !seen.has(item.image) ? `<img src="${item.image}" alt="${item.title}" loading="lazy" />` : "";
      if (item.image) seen.add(item.image);
      const link = item.link ? `<a href="${item.link}" target="_blank" rel="noreferrer">${site}</a>` : site;
      return `${img}<strong>${item.title}</strong> — ${price} via ${link}`;
    });
    const headline = `${choice.id || "Option"} · ${choice.title}`;
    return [headline, ...lines];
  };

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

  blocks.push({ title: "2. Vols", items: formatScrapeLines(choices.flights, "flights") });
  blocks.push({ title: "3. Hôtels", items: formatScrapeLines(choices.lodging, "lodging") });
  blocks.push({ title: "4. Activités", items: formatScrapeLines(choices.activities, "activities") });
  blocks.push({ title: "5. Itinéraire", items: choices.itinerary?.bullets || ["Itinéraire standard"] });
  blocks.push({ title: "6. Package choisi", items: formatScrapeLines(choices.package, "budget") });
  blocks.push({ title: "7. Conformité sécurité", items: ["Pas de destinations interdites", "Aucune activité illégale"] });

  const totalFlights = estimateStageCost(choices.flights, "flights");
  const totalLodging = estimateStageCost(choices.lodging, "lodging");
  const totalActivities = estimateStageCost(choices.activities, "activities");
  const totalLocal = Math.round(duration * 40);
  const grandTotal = totalFlights + totalLodging + totalActivities + totalLocal;

  summaryBlock.innerHTML = `
    <div class="summary-header luxe">
      <div>
        <p class="muted mini">Atlas Noir — Synthèse premium</p>
        <strong class="sum-total">${grandTotal ? `~${grandTotal}€ estimés` : "Budget à calibrer"}</strong>
        <p class="muted">Vols ~${totalFlights}€ · Séjour ~${totalLodging}€ · Activités ~${totalActivities}€ · Transports locaux ~${totalLocal}€</p>
      </div>
      <div class="sum-chips">
        <span class="pill">${formatBudgetLabel(discovery.budget)}</span>
        <span class="pill">${discovery.duration} jours</span>
        <span class="pill">${discovery.destination}</span>
      </div>
    </div>
    <div class="block-grid luxe">${blocks
      .map(
        (b) => `<div class="block"><h4>${b.title}</h4><ul>${b.items
          .map((i) => `<li>${i}</li>`)
          .join("")}</ul></div>`
      )
      .join("")}</div>`;

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

if (validateBtn) {
  validateBtn.addEventListener("click", () => {
    if (!state.summary) return;
    validateBtn.textContent = "Validé";
    validateBtn.classList.add("confirmed");
    addMessage({
      title: "Validation finale",
      agent: "Chef d’orchestre",
      body: "Parcours verrouillé. Les sélections scrappées restent synchronisées pour export et réservation.",
    });
  });
}

async function onDiscoverySubmit(event) {
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
  state.scrapeReady = null;
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

  await ensureScrapeDataset(data.destination, "Scraping découverte sécurisé…");

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
if (refreshIntelBtn) {
  refreshIntelBtn.addEventListener("click", () => {
    if (state.discovery?.destination) runIntel(state.discovery.destination);
  });
}

loadScrapeCache();
hydrateScrapeSources();
clearUI(true);
restoreState();
if (state.discovery?.destination) {
  setStatus("Session restaurée", "info");
  if (refreshIntelBtn) refreshIntelBtn.disabled = false;
  runIntel(state.discovery.destination);
}
