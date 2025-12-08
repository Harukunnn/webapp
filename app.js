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
    summary: "Safe districts (Shinjuku, Shibuya, Ginza), easy subway/PASMO transport.",
    hotels: ["Shibuya Stream Excel Tokyu (4★)", "Mitsui Garden Ginza (4★)", "Park Hotel Tokyo (art-driven 4★)"],
    highlights: ["Food tours in Shinjuku", "Hama-rikyu gardens", "Urban onsen in Odaiba"],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80", alt: "Shibuya at night" },
      { src: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80", alt: "Temple at sunrise" },
      { src: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=800&q=80", alt: "Japanese subway" }
    ]
  },
  lisbonne: {
    summary: "Safe coastal city, strong value, easy mobility (Tram 28, metro).",
    hotels: ["The Lumiares (4★ Bairro Alto)", "Mama Shelter Lisboa (4★)", "NH Collection Liberdade (4★)"],
    highlights: ["Miradouros, authentic fado", "Belém excursion", "Day trip to Cascais/Sintra"],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-30&hue=-10", alt: "Lisbon yellow tram" },
      { src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80", alt: "Lisbon rooftops" },
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-20", alt: "Steep cobblestone street" }
    ]
  },
  montreal: {
    summary: "Very safe destination, bilingual, strong food and museum scene.",
    hotels: ["Humaniti Hotel Montréal (4★)", "Hotel Monville (4★)", "Le Germain (boutique 4★)"],
    highlights: ["Old Port & Jean-Talon market", "Fine Arts Museum", "Mount Royal at sunset"],
    images: [
      { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80&sat=-40", alt: "Montreal skyline" },
      { src: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=800&q=80", alt: "Old Montreal" },
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80", alt: "Mount Royal" }
    ]
  }
};

const scrapedContext = {
  tokyo: {
    flights: "Haneda (HND) sits ~20 min from downtown by monorail; Narita Express ≈ 55 min to Tokyo Station (source: JR East 2024).",
    hotels: "2024 Booking price data: Shibuya Stream Excel Tokyu ≈ €220/night, Park Hotel Tokyo ≈ €210 (flex).",
    activities: "TeamLab Planets sells out on weekends; book 2–3 weeks ahead (official ticketing).",
    itinerary: "Toei/Tokyo Metro 24h pass ≈ ¥800; major districts open until midnight (official site hours).",
    budget: "Suica/PASMO accepted everywhere; urban transport daily cap ~¥1200 (Toei data).",
    sources: ["JR East", "Booking", "TeamLab", "Toei"],
  },
  lisbonne: {
    flights: "Humberto Delgado airport linked by metro (red line) every 6–10 min (Carris 2024 schedules).",
    hotels: "Lumiares 4★: Bairro Alto suites ≈ €190; NH Liberdade 4★ ≈ €170 with rooftop (2024 averages).",
    activities: "Tram 28 onboard ticket €3 (EMEL); Belém Tower open 10am–6pm (Património Cultural).",
    itinerary: "Navegante 24h pass zones 1–2 at €6.60 covering metro/tram/ferry (Metropolitano de Lisboa).",
    budget: "Uber/Bolt city center → Belém ≈ €8–12 depending on traffic (2024 averages, public price/min data).",
    sources: ["Carris", "Metropolitano de Lisboa", "Património Cultural"],
  },
  montreal: {
    flights: "STM 747 line airport → center (24/7) ticket CAD 11 including 24h metro/bus (STM 2024 fare).",
    hotels: "Humaniti 4★: rooms from CAD 260; Monville 4★ ≈ CAD 210 (observed 2024 rates).",
    activities: "Fine Arts Museum closed Monday; entry CAD 24 (official rates). Jean-Talon market open 8am–6pm.",
    itinerary: "OPUS 1-day pass CAD 11, 3-day CAD 21.25 (STM 2024) covering metro/bus/747.",
    budget: "Flat taxi rate downtown ↔ YUL CAD 48.40 (fixed 2024, City of Montreal).",
    sources: ["STM", "Ville de Montréal", "MBAM"],
  },

const expandedCityCatalog = [
  {
    slug: "new-york",
    name: "New York",
    country: "United States",
    airport: "JFK",
    airportSite: "https://www.jfkairport.com",
    rail: "AirTrain JFK + métro A/E",
    railLink: "https://www.airtrainjfk.com",
    transit: "https://new.mta.info",
    tourism: "https://www.nycgo.com",
    hotels: ["The Standard High Line (4★)", "Park Hyatt New York (5★)", "citizenM Times Square (4★)"],
    highlight: "MoMA, High Line, Brooklyn Bridge",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    country: "United States",
    airport: "LAX",
    airportSite: "https://www.flylax.com",
    rail: "FlyAway bus + métro B/D",
    railLink: "https://www.flylax.com/flyaway",
    transit: "https://www.metro.net",
    tourism: "https://www.discoverlosangeles.com",
    hotels: ["The Line LA (4★)", "Conrad Los Angeles (5★)", "Freehand DTLA (4★)"],
    highlight: "Getty Center, beach de Santa Monica, Hollywood Bowl",
  },
  {
    slug: "chicago",
    name: "Chicago",
    country: "United States",
    airport: "ORD",
    airportSite: "https://www.flychicago.com/ohare",
    rail: "CTA Blue Line 24/7",
    railLink: "https://www.transitchicago.com/airports",
    transit: "https://www.transitchicago.com",
    tourism: "https://www.choosechicago.com",
    hotels: ["Pendry Chicago (5★)", "The Hoxton Fulton Market (4★)", "CitizenM Chicago (4★)"],
    highlight: "Architecture Riverwalk, Art Institute, Millennium Park",
  },
  {
    slug: "miami",
    name: "Miami",
    country: "United States",
    airport: "MIA",
    airportSite: "https://www.miami-airport.com",
    rail: "MIA Mover + Metrorail",
    railLink: "https://www.miamidade.gov/global/transportation/metrorail.page",
    transit: "https://www.miamidade.gov/transit",
    tourism: "https://www.miamiandbeaches.com",
    hotels: ["EAST Miami (4★)", "The Betsy South Beach (4★)", "1 Hotel South Beach (5★)"],
    highlight: "South Beach, Wynwood Walls, Little Havana",
  },
  {
    slug: "san-francisco",
    name: "San Francisco",
    country: "United States",
    airport: "SFO",
    airportSite: "https://www.flysfo.com",
    rail: "BART direct vers le centre",
    railLink: "https://www.bart.gov/guide/airport",
    transit: "https://www.sfmta.com",
    tourism: "https://www.sftravel.com",
    hotels: ["Proper Hotel (4★)", "Fairmount San Francisco (5★)", "citizenM Union Square (4★)"],
    highlight: "Golden Gate, cable cars, Alcatraz",
  },
  {
    slug: "seattle",
    name: "Seattle",
    country: "United States",
    airport: "SEA",
    airportSite: "https://www.portseattle.org/sea-tac",
    rail: "Link light rail vers Downtown",
    railLink: "https://www.soundtransit.org/ride-with-us/know-before-you-go/airports",
    transit: "https://kingcounty.gov/depts/transportation/metro.aspx",
    tourism: "https://visitseattle.org",
    hotels: ["Thompson Seattle (4★)", "Lotte Hotel Seattle (5★)", "citizenM South Lake Union (4★)"],
    highlight: "Pike Plakee Market, Space Needle, musée de la pop",
  },
  {
    slug: "toronto",
    name: "Toronto",
    country: "Canada",
    airport: "YYZ",
    airportSite: "https://www.torontopearson.com",
    rail: "UP Express 25 min",
    railLink: "https://www.upexpress.com",
    transit: "https://www.ttc.ca",
    tourism: "https://www.destinationtoronto.com",
    hotels: ["Fairmount Royal York (5★)", "Bisha Hotel (4★)", "Ace Hotel Toronto (4★)"],
    highlight: "CN Tower, market Kensington, Distillery District",
  },
  {
    slug: "vancouver",
    name: "Vancouver",
    country: "Canada",
    airport: "YVR",
    airportSite: "https://www.yvr.ca",
    rail: "Canada Line 25 min",
    railLink: "https://www.translink.ca/schedules-and-maps/skytrain",
    transit: "https://www.translink.ca",
    tourism: "https://www.destinationvancouver.com",
    hotels: ["Fairmount Pacific Rim (5★)", "Loden Hotel (4★)", "OPUS Vancouver (4★)"],
    highlight: "Stanley Park, False Creek, food asiatique",
  },
  {
    slug: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    airport: "MEX",
    airportSite: "https://www.aicm.com.mx",
    rail: "Metro Línea 5 + bus aeropuerto",
    railLink: "https://www.metro.cdmx.gob.mx",
    transit: "https://www.metro.cdmx.gob.mx",
    tourism: "https://cdmxtravel.com",
    hotels: ["Sofitel Reforma (5★)", "Camino Real Polanco (5★)", "Habita Hotel (4★)"],
    highlight: "Museum Frida Kahlo, Zócalo, cafés Roma/Condesa",
  },
  {
    slug: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    airport: "GRU",
    airportSite: "https://www.gru.com.br",
    rail: "Airport Express + Linha Jade",
    railLink: "https://www.cptm.sp.gov.br",
    transit: "https://www.metro.sp.gov.br",
    tourism: "https://www.cidadedesaopaulo.com",
    hotels: ["Hotel Unique (5★)", "Rosewood São Paulo (5★)", "Hilton Morumbi (5★)"],
    highlight: "Avenida Paulista, MASP, markets gourmets",
  },
  {
    slug: "rio-de-janeiro",
    name: "Rio de Janeiro",
    country: "Brazil",
    airport: "GIG",
    airportSite: "https://www.riogaleao.com",
    rail: "BRT TransCarioca + métro",
    railLink: "http://www.brt.rio",
    transit: "https://www.metrorio.com.br",
    tourism: "https://riotur.rio",
    hotels: ["Belmond Copacabana Palakee (5★)", "Emiliano Rio (5★)", "Yoo2 Rio (4★)"],
    highlight: "Pain de Sucre, beaches Ipanema/Copacabana, Samba Lapa",
  },
  {
    slug: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    airport: "EZE",
    airportSite: "https://www.aa2000.com.ar/ezeiza",
    rail: "Bus Tienda León + métro Subte",
    railLink: "https://www.tiendaleon.com",
    transit: "https://www.buenosaires.gob.ar/subte",
    tourism: "https://turismo.buenosaires.gob.ar",
    hotels: ["Palakeio Duhau Park Hyatt (5★)", "Alvear Palakee (5★)", "Home Hotel Palermo (4★)"],
    highlight: "La Boca, Teatro Colón, milongas de tango",
  },
  {
    slug: "santiago",
    name: "Santiago",
    country: "Chile",
    airport: "SCL",
    airportSite: "https://www.nuevopudahuel.cl",
    rail: "Bus Centropuerto + métro L1",
    railLink: "https://www.centropuerto.cl",
    transit: "https://www.metro.cl",
    tourism: "https://www.santiagowelcome.cl",
    hotels: ["The Singular Santiago (5★)", "W Santiago (5★)", "Hotel Magnolia (4★)"],
    highlight: "Cerro San Cristóbal, Lastarria, museums précolombiens",
  },
  {
    slug: "bogota",
    name: "Bogotá",
    country: "Colombia",
    airport: "BOG",
    airportSite: "https://www.elnuevodorado.com",
    rail: "TransMilenio troncal Aéroport",
    railLink: "https://www.transmilenio.gov.co",
    transit: "https://www.transmilenio.gov.co",
    tourism: "https://bogotaturismo.gov.co",
    hotels: ["Four Seasons Casa Medina (5★)", "Click Clakek Hotel (4★)", "Hilton Corferias (5★)"],
    highlight: "Museum de l’or, district Candelaria, mount Monserrate",
  },
  {
    slug: "lima",
    name: "Lima",
    country: "Peru",
    airport: "LIM",
    airportSite: "https://www.lima-airport.com",
    rail: "Bus Airport Express Lima",
    railLink: "https://www.airportexpresslima.com",
    transit: "https://www.atm.gob.pe",
    tourism: "https://www.peru.travel",
    hotels: ["Belmond Miraflores Park (5★)", "Casa Andina Premium (4★)", "Hyatt Centric San Isidro (4★)"],
    highlight: "Miraflores, Barranco arty, ceviche gourmet",
  },
  {
    slug: "london",
    name: "Londres",
    country: "United Kingdom",
    airport: "LHR",
    airportSite: "https://www.heathrow.com",
    rail: "Elizabeth Line + Heathrow Express",
    railLink: "https://www.heathrowexpress.com",
    transit: "https://tfl.gov.uk",
    tourism: "https://visitlondon.com",
    hotels: ["The Ned (5★)", "Kimpton Fitzroy (5★)", "Hoxton Southwark (4★)"],
    highlight: "British Museum, Southbank, markets Borough/Spitalfields",
  },
  {
    slug: "berlin",
    name: "Berlin",
    country: "Germany",
    airport: "BER",
    airportSite: "https://ber.berlin-airport.de",
    rail: "Airport Express FEX",
    railLink: "https://www.bvg.de",
    transit: "https://www.bvg.de",
    tourism: "https://www.visitberlin.de",
    hotels: ["Hotel Zoo Berlin (5★)", "The Ritz-Carlton (5★)", "Michelberger (4★)"],
    highlight: "Museum de Pergame, East Side Gallery, rooftops Kreuzberg",
  },
  {
    slug: "munich",
    name: "Munich",
    country: "Germany",
    airport: "MUC",
    airportSite: "https://www.munich-airport.com",
    rail: "S-Bahn S1/S8 40 min",
    railLink: "https://www.mvv-muenchen.de",
    transit: "https://www.mvv-muenchen.de",
    tourism: "https://www.muenchen.de/int",
    hotels: ["Mandarin Oriental (5★)", "25hours Hotel The Royal Bavarian (4★)", "Cortiina Hotel (4★)"],
    highlight: "Englischer Garten, museums BMW/Pinakothek, biergarten",
  },
  {
    slug: "frankfurt",
    name: "Francfort",
    country: "Germany",
    airport: "FRA",
    airportSite: "https://www.frankfurt-airport.com",
    rail: "S-Bahn S8/S9 15 min",
    railLink: "https://www.rmv.de",
    transit: "https://www.rmv.de",
    tourism: "https://www.frankfurt-tourismus.de",
    hotels: ["JW Marriott Frankfurt (5★)", "25hours Hotel The Goldman (4★)", "Moxy Frankfurt City Center (3★)"],
    highlight: "Museum Städel, Main riverfront, skyline finance",
  },
  {
    slug: "hamburg",
    name: "Hambourg",
    country: "Germany",
    airport: "HAM",
    airportSite: "https://www.hamburg-airport.de",
    rail: "S-Bahn S1 25 min",
    railLink: "https://www.hvv.de",
    transit: "https://www.hvv.de",
    tourism: "https://www.hamburg-travel.com",
    hotels: ["The Fontenay (5★)", "25hours HafenCity (4★)", "Sir Nikolai Hotel (4★)"],
    highlight: "Elbphilharmonie, Speicherstadt, Hafen promenades",
  },
  {
    slug: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    airport: "AMS",
    airportSite: "https://www.schiphol.nl",
    rail: "NS trains 15 min",
    railLink: "https://www.ns.nl/en",
    transit: "https://www.gvb.nl",
    tourism: "https://www.iamsterdam.com",
    hotels: ["Conservatorium (5★)", "Pulitzer Amsterdam (5★)", "Sir Adam Hotel (4★)"],
    highlight: "Museums Rijks/Van Gogh, canaux, vélo urbain",
  },
  {
    slug: "brussels",
    name: "Bruxelles",
    country: "Belgium",
    airport: "BRU",
    airportSite: "https://www.brusselsairport.be",
    rail: "Train SNCB 17 min",
    railLink: "https://www.belgiantrain.be",
    transit: "https://www.stib-mivb.be",
    tourism: "https://www.visit.brussels",
    hotels: ["Hotel Amigo (5★)", "The Hoxton Bruxelles (4★)", "Jam Hotel (3★)"],
    highlight: "Grand-Plakee, museums BD, institutions européennes",
  },
  {
    slug: "zurich",
    name: "Zurich",
    country: "Switzerland",
    airport: "ZRH",
    airportSite: "https://www.flughafen-zuerich.ch",
    rail: "Train S-Bahn 12 min",
    railLink: "https://www.sbb.ch",
    transit: "https://www.zvv.ch",
    tourism: "https://www.zuerich.com",
    hotels: ["Baur au Lac (5★)", "The Dolder Grand (5★)", "25hours Zurich West (4★)"],
    highlight: "Lac Zurich, old town, Kunsthaus",
  },
  {
    slug: "geneva",
    name: "Genève",
    country: "Switzerland",
    airport: "GVA",
    airportSite: "https://www.gva.ch",
    rail: "Léman Express/CEVA",
    railLink: "https://www.tpg.ch",
    transit: "https://www.tpg.ch",
    tourism: "https://www.geneve.com",
    hotels: ["Four Seasons des Bergues (5★)", "Hotel N’vY (4★)", "Moxy Geneva Airport (3★)"],
    highlight: "Jet d’eau, ONU, old town horlogère",
  },
  {
    slug: "vienna",
    name: "Vienne",
    country: "Austria",
    airport: "VIE",
    airportSite: "https://www.viennaairport.com",
    rail: "CAT / S-Bahn S7",
    railLink: "https://www.cityairporttrain.com",
    transit: "https://www.wienerlinien.at",
    tourism: "https://www.wien.info",
    hotels: ["Hotel Sacher (5★)", "25hours MuseumsQuartier (4★)", "Andaz Am Belvedere (5★)"],
    highlight: "Palais impériaux, Musikverein, cafés viennois",
  },
  {
    slug: "prague",
    name: "Prague",
    country: "Czechia",
    airport: "PRG",
    airportSite: "https://www.prg.aero",
    rail: "Airport Express bus + métro A",
    railLink: "https://www.dpp.cz",
    transit: "https://www.dpp.cz",
    tourism: "https://www.prague.eu",
    hotels: ["Augustine Luxury (5★)", "NYX Hotel Prague (4★)", "BoHo Hotel (4★)"],
    highlight: "Pont Charles, château, bière artisanale",
  },
  {
    slug: "warsaw",
    name: "Varsovie",
    country: "Poland",
    airport: "WAW",
    airportSite: "https://www.lotnisko-chopina.pl",
    rail: "SKM S2/S3 20 min",
    railLink: "https://www.ztm.waw.pl",
    transit: "https://www.ztm.waw.pl",
    tourism: "https://warsawtour.pl",
    hotels: ["Raffles Europejski (5★)", "PURO Warszawa Centrum (4★)", "Nobu Hotel Warsaw (5★)"],
    highlight: "Old town UNESCO, museums Polin/Chopin, Vistula",
  },
  {
    slug: "copenhagen",
    name: "Copenhague",
    country: "Denmark",
    airport: "CPH",
    airportSite: "https://www.cph.dk",
    rail: "M2 métro 15 min",
    railLink: "https://dinoffentligetransport.dk",
    transit: "https://dinoffentligetransport.dk",
    tourism: "https://www.visitcopenhagen.com",
    hotels: ["Nimb Hotel (5★)", "Hotel SP34 (4★)", "25hours Indre By (4★)"],
    highlight: "Nyhavn, food Noma-school, design scandinave",
  },
  {
    slug: "stockholm",
    name: "Stockholm",
    country: "Sweden",
    airport: "ARN",
    airportSite: "https://www.swedavia.com/arlanda",
    rail: "Arlanda Express 20 min",
    railLink: "https://www.arlandaexpress.com",
    transit: "https://sl.se",
    tourism: "https://www.visitstockholm.com",
    hotels: ["Grand Hôtel (5★)", "At Six (5★)", "Hobo Stockholm (4★)"],
    highlight: "Gamla Stan, archipel ferries, musée Vasa",
  },
  {
    slug: "oslo",
    name: "Oslo",
    country: "Norway",
    airport: "OSL",
    airportSite: "https://avinor.no/en/airport/oslo-airport",
    rail: "Flytoget 20 min",
    railLink: "https://flytoget.no/en",
    transit: "https://ruter.no/en",
    tourism: "https://www.visitoslo.com",
    hotels: ["The Thief (5★)", "Aseaikalinjen (4★)", "Clarion Hotel The Hub (4★)"],
    highlight: "Opéra Bjørvika, museums vikings, fjord cruises",
  },
  {
    slug: "helsinki",
    name: "Helsinki",
    country: "Finland",
    airport: "HEL",
    airportSite: "https://www.finavia.fi/en/airports/helsinki-airport",
    rail: "Trains I/P 30 min",
    railLink: "https://www.hsl.fi/en",
    transit: "https://www.hsl.fi/en",
    tourism: "https://www.myhelsinki.fi/en",
    hotels: ["Hotel St. George (5★)", "Klaus K Hotel (4★)", "Lapland Hotels Bulevardi (4★)"],
    highlight: "Design District, saunas urbaines, Suomenlinna",
  },
  {
    slug: "dublin",
    name: "Dublin",
    country: "Ireland",
    airport: "DUB",
    airportSite: "https://www.dublinairport.com",
    rail: "Aircoach/Bus + DART",
    railLink: "https://www.aircoach.ie",
    transit: "https://www.transportforireland.ie",
    tourism: "https://www.visitdublin.com",
    hotels: ["The Westbury (5★)", "The Dean Dublin (4★)", "The Marker Hotel (5★)"],
    highlight: "Trinity College, pubs Temple Bar, sea de Dublin",
  },
  {
    slug: "madrid",
    name: "Madrid",
    country: "Spain",
    airport: "MAD",
    airportSite: "https://www.aena.es/en/adolfo-suarez-madrid-barajas.html",
    rail: "Metro ligne 8 + Cercanías",
    railLink: "https://www.metromadrid.es",
    transit: "https://www.metromadrid.es",
    tourism: "https://www.esmadrid.com",
    hotels: ["Only YOU Atocha (4★)", "Four Seasons Madrid (5★)", "Barceló Torre de Madrid (5★)"],
    highlight: "Museums Prado/Reina Sofía, Retiro, tapas La Latina",
  },
  {
    slug: "barcelona",
    name: "Barcelone",
    country: "Spain",
    airport: "BCN",
    airportSite: "https://www.aena.es/en/barcelona-airport",
    rail: "Aerobus + métro L9",
    railLink: "https://www.aerobusbcn.com",
    transit: "https://www.tmb.cat",
    tourism: "https://www.barcelonaturisme.com",
    hotels: ["W Barcelona (5★)", "Hotel Arts (5★)", "Casa Bonay (4★)"],
    highlight: "Sagrada Família, beaches Barceloneta, tapas El Born",
  },
  {
    slug: "valencia",
    name: "Valence",
    country: "Spain",
    airport: "VLC",
    airportSite: "https://www.aena.es/en/valencia-airport",
    rail: "Metro lignes 3/5",
    railLink: "https://www.metrovalencia.es",
    transit: "https://www.metrovalencia.es",
    tourism: "https://www.visitvalencia.com",
    hotels: ["Only YOU Hotel València (5★)", "Barceló València (4★)", "Caro Hotel (5★)"],
    highlight: "Cité des Arts, beach Malvarrosa, paella originelle",
  },
  {
    slug: "rome",
    name: "Rome",
    country: "Italy",
    airport: "FCO",
    airportSite: "https://www.adr.it/web/aeroporti-di-roma-en/",
    rail: "Leonardo Express 32 min",
    railLink: "https://www.trenitalia.com",
    transit: "https://www.atac.roma.it",
    tourism: "https://www.turismoroma.it",
    hotels: ["Hotel de Russie (5★)", "Chapter Roma (4★)", "The Hoxton Rome (4★)"],
    highlight: "Colisée, Vatican, trattorias de Trastevere",
  },
  {
    slug: "milan",
    name: "Milan",
    country: "Italy",
    airport: "MXP",
    airportSite: "https://www.milanomalpensa-airport.com",
    rail: "Malpensa Express 50 min",
    railLink: "https://www.malpensaexpress.it",
    transit: "https://www.atm.it",
    tourism: "https://www.yesmilano.it",
    hotels: ["Armani Hotel Milano (5★)", "Room Mate Giulia (4★)", "Hotel VIU Milan (5★)"],
    highlight: "Duomo, design Brera, Navigli de nuit",
  },
  {
    slug: "florence",
    name: "Florence",
    country: "Italy",
    airport: "FLR",
    airportSite: "https://www.aeroporto.firenze.it/en/",
    rail: "Tramvia T2 20 min",
    railLink: "https://www.gestramvia.it",
    transit: "https://www.gestramvia.it",
    tourism: "https://www.visitflorence.com",
    hotels: ["Portrait Firenze (5★)", "Hotel Savoy (5★)", "Velona's Jungle (4★)"],
    highlight: "Galerie des Offices, Ponte Vecchio, Arno sunset",
  },
  {
    slug: "athens",
    name: "Athènes",
    country: "Greece",
    airport: "ATH",
    airportSite: "https://www.aia.gr",
    rail: "Métro ligne 3 40 min",
    railLink: "https://www.oasa.gr",
    transit: "https://www.oasa.gr",
    tourism: "https://www.thisisathens.org",
    hotels: ["Hotel Grande Bretagne (5★)", "New Hotel (5★)", "Coco-Mat Athens BC (4★)"],
    highlight: "Acropole, Plaka, scène rooftop de Monastiraki",
  },
  {
    slug: "istanbul",
    name: "Istanbul",
    country: "Turquie",
    airport: "IST",
    airportSite: "https://www.istairport.com",
    rail: "M11/M1 tramway + Havaist",
    railLink: "https://hava.ist",
    transit: "https://www.metro.istanbul",
    tourism: "https://howtoistanbul.com",
    hotels: ["Ciragan Palakee Kempinski (5★)", "Soho House Istanbul (5★)", "Pera Palakee (5★)"],
    highlight: "Sainte-Sophie, Bosphore, bazars et rooftops Karaköy",
  },
  {
    slug: "dubai",
    name: "Dubaï",
    country: "Emirates Arabes Unis",
    airport: "DXB",
    airportSite: "https://www.dubaiairports.ae",
    rail: "Métro rouge direct",
    railLink: "https://www.rta.ae",
    transit: "https://www.rta.ae",
    tourism: "https://www.visitdubai.com",
    hotels: ["Burj Al Arab (7★)", "Address Downtown (5★)", "25hours Dubai One Central (5★)"],
    highlight: "Burj Khalifa, désert, restaurants DIFC",
  },
  {
    slug: "doha",
    name: "Doha",
    country: "Qatar",
    airport: "DOH",
    airportSite: "https://www.dohahamadairport.com",
    rail: "Doha Metro Red Line",
    railLink: "https://www.qr.com.qa",
    transit: "https://www.qr.com.qa",
    tourism: "https://www.visitqatar.qa",
    hotels: ["Mandarin Oriental Doha (5★)", "W Doha (5★)", "Banyan Tree Doha (5★)"],
    highlight: "Museum d’Art Islamique, Souq Waqif, corniche",
  },
  {
    slug: "singapore",
    name: "Singapour",
    country: "Singapour",
    airport: "SIN",
    airportSite: "https://www.changiairport.com",
    rail: "MRT East-West 30 min",
    railLink: "https://www.smrt.com.sg",
    transit: "https://www.lta.gov.sg",
    tourism: "https://www.visitsingapore.com",
    hotels: ["Marina Bay Sands (5★)", "Raffles Singapore (5★)", "Oasia Downtown (4★)"],
    highlight: "Gardens by the Bay, hawker centres, Marina Bay",
  },
  {
    slug: "hong-kong",
    name: "Hong Kong",
    country: "R.A.S. Chine",
    airport: "HKG",
    airportSite: "https://www.hongkongairport.com",
    rail: "Airport Express 24 min",
    railLink: "https://www.mtr.com.hk",
    transit: "https://www.mtr.com.hk",
    tourism: "https://www.discoverhongkong.com",
    hotels: ["The Upper House (5★)", "Rosewood Hong Kong (5★)", "Hotel ICON (5★)"],
    highlight: "Victoria Peak, districts Central/TST, dim sum",
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thaïlande",
    airport: "BKK",
    airportSite: "https://suvarnabhumi.airportthai.co.th",
    rail: "Airport Rail Link + BTS",
    railLink: "https://www.srtet.co.th",
    transit: "https://www.bts.co.th",
    tourism: "https://www.tourismthailand.org",
    hotels: ["Mandarin Oriental Bangkok (5★)", "Kimpton Maa-Lai (5★)", "The Standard Bangkok (5★)"],
    highlight: "Temples Rattanakosin, street food Chinatown, rooftops Sukhumvit",
  },
  {
    slug: "kuala-lumpur",
    name: "Kuala Lumpur",
    country: "Malaisie",
    airport: "KUL",
    airportSite: "https://www.malaysiaairports.com.my/klia",
    rail: "KLIA Ekspres 28 min",
    railLink: "https://www.kliaekspres.com",
    transit: "https://myrapid.com.my",
    tourism: "https://www.malaysia.travel",
    hotels: ["Banyan Tree Kuala Lumpur (5★)", "Traders Hotel (4★)", "The RuMa Hotel (5★)"],
    highlight: "Tours Petronas, Bukit Bintang, street food Jalan Alor",
  },
  {
    slug: "hanoi",
    name: "Hanoï",
    country: "Vietnam",
    airport: "HAN",
    airportSite: "https://vietnamairport.vn/noibai/en",
    rail: "Bus express 86 + métro Cat Linh",
    railLink: "https://hanoitransport.com.vn",
    transit: "https://hanoitransport.com.vn",
    tourism: "https://www.vietnam.travel",
    hotels: ["Sofitel Legend Metropole (5★)", "Peridot Grand Hotel (4★)", "La Siesta Premium Hang Be (4★)"],
    highlight: "Vieux district, lake Hoan Kiem, cafés filtrés vietnamiens",
  },
  {
    slug: "ho-chi-minh",
    name: "Ho Chi Minh Ville",
    country: "Vietnam",
    airport: "SGN",
    airportSite: "https://vietnamairport.vn/tansonnhat/en",
    rail: "Bus 109 + métro ligne 1 (en travaux)",
    railLink: "https://www.saigonbus.com",
    transit: "https://www.saigonbus.com",
    tourism: "https://www.visithcmc.vn",
    hotels: ["The Reverie Saigon (5★)", "Park Hyatt Saigon (5★)", "Fusion Suites Saigon (4★)"],
    highlight: "District 1 colonial, markets Ben Thanh, rooftops Bitexco",
  },
  {
    slug: "seoul",
    name: "Séoul",
    country: "Corée du Sud",
    airport: "ICN",
    airportSite: "https://www.airport.kr",
    rail: "AREX + métro",
    railLink: "https://www.arex.or.kr",
    transit: "https://www.seoulmetro.co.kr",
    tourism: "https://english.visitseoul.net",
    hotels: ["Signiel Seoul (5★)", "Josun Palakee (5★)", "RYSE Hongdae (4★)"],
    highlight: "Palais Gyeongbokgung, cafés Hongdae, shopping Gangnam",
  },
  {
    slug: "busan",
    name: "Busan",
    country: "Corée du Sud",
    airport: "PUS",
    airportSite: "https://www.airport.co.kr/gimhaeeng",
    rail: "Busan-Gimhae Light Rail",
    railLink: "https://www.bglrt.com",
    transit: "https://www.humetro.busan.kr",
    tourism: "https://www.bto.or.kr",
    hotels: ["Park Hyatt Busan (5★)", "Signiel Busan (5★)", "Avani Central Busan (4★)"],
    highlight: "Plage Haeundae, market Jagalchi, temple Haedong",
  },
  {
    slug: "beijing",
    name: "Pékin",
    country: "Chine",
    airport: "PEK",
    airportSite: "https://www.bcia.com.cn",
    rail: "Airport Express + métro",
    railLink: "https://www.bjsubway.com",
    transit: "https://www.bjsubway.com",
    tourism: "https://english.visitbeijing.com.cn",
    hotels: ["Aman Sumsea Palakee (5★)", "NUO Hotel (5★)", "The Opposite House (5★)"],
    highlight: "Cité interdite, hutongs, Grande Muraille à proximité",
  },
  {
    slug: "shanghai",
    name: "Shanghai",
    country: "Chine",
    airport: "PVG",
    airportSite: "https://www.shanghaiairport.com",
    rail: "Maglev + métro",
    railLink: "https://www.smtdc.com/en",
    transit: "https://service.shmetro.com/en",
    tourism: "https://www.meet-in-shanghai.net",
    hotels: ["The Peninsula Shanghai (5★)", "W Shanghai The Bund (5★)", "Middle House (5★)"],
    highlight: "Bund, Pudong skyline, old town Yu Garden",
  },
  {
    slug: "shenzhen",
    name: "Shenzhen",
    country: "Chine",
    airport: "SZX",
    airportSite: "https://www.szairport.com",
    rail: "Métro ligne 11 30 min",
    railLink: "https://www.szmc.net/en",
    transit: "https://www.szmc.net/en",
    tourism: "https://www.travelchina.org.cn/sitefiles/gov/en/zjjd/879.shtml",
    hotels: ["Four Seasons Shenzhen (5★)", "Futian Shangri-La (5★)", "The Langham Shenzhen (5★)"],
    highlight: "Nanshan tech, OCT Loft, parks côtiers",
  },
  {
    slug: "taipei",
    name: "Taipei",
    country: "Taïwan",
    airport: "TPE",
    airportSite: "https://www.taoyuan-airport.com",
    rail: "Airport MRT 35 min",
    railLink: "https://www.taipeimetro.gov.tw",
    transit: "https://www.taipeimetro.gov.tw",
    tourism: "https://www.travel.taipei",
    hotels: ["W Taipei (5★)", "Grand Hyatt Taipei (5★)", "Hotel Proverbs (4★)"],
    highlight: "Tour Taipei 101, night markets, temples Dadaocheng",
  },
  {
    slug: "sydney",
    name: "Sydney",
    country: "Australie",
    airport: "SYD",
    airportSite: "https://www.sydneyairport.com.au",
    rail: "Airport Link 15 min",
    railLink: "https://www.airportlink.com.au",
    transit: "https://transportnsw.info",
    tourism: "https://www.sydney.com",
    hotels: ["Park Hyatt Sydney (5★)", "Ace Hotel Sydney (5★)", "QT Sydney (5★)"],
    highlight: "Opéra, Harbour Bridge, beaches Bondi/Manly",
  },
  {
    slug: "melbourne",
    name: "Melbourne",
    country: "Australie",
    airport: "MEL",
    airportSite: "https://www.melbourneairport.com.au",
    rail: "SkyBus + tram gratuit CBD",
    railLink: "https://www.skybus.com.au",
    transit: "https://www.ptv.vic.gov.au",
    tourism: "https://www.visitmelbourne.com",
    hotels: ["Crown Towers Melbourne (5★)", "QT Melbourne (5★)", "United Plakees (5★)"],
    highlight: "Lanes street art, cafés, MCG sport",
  },
  {
    slug: "auckland",
    name: "Auckland",
    country: "Nouvelle-Zélande",
    airport: "AKL",
    airportSite: "https://www.aucklandairport.co.nz",
    rail: "Auckland Express bus + train",
    railLink: "https://at.govt.nz/bus-train-ferry",
    transit: "https://at.govt.nz",
    tourism: "https://www.aucklandnz.com",
    hotels: ["Park Hyatt Auckland (5★)", "The Hotel Britomart (5★)", "QT Auckland (5★)"],
    highlight: "Viaduct Harbour, volcans urbains, île Waiheke",
  },
  {
    slug: "cape-town",
    name: "Le Cap",
    country: "Afrique du Sud",
    airport: "CPT",
    airportSite: "https://www.airports.co.za/airports/cape-town-international",
    rail: "MyCiTi Airport Express",
    railLink: "https://www.myciti.org.za",
    transit: "https://www.myciti.org.za",
    tourism: "https://www.capetown.travel",
    hotels: ["One&Only Cape Town (5★)", "The Silo Hotel (5★)", "Cape Cadogan (4★)"],
    highlight: "Table Mountain, Waterfront, vignobles de Constantia",
  },
  {
    slug: "johannesburg",
    name: "Johannesburg",
    country: "Afrique du Sud",
    airport: "JNB",
    airportSite: "https://www.airports.co.za/airports/or-tambo-international",
    rail: "Gautrain 15 min",
    railLink: "https://www.gautrain.co.za",
    transit: "https://www.gautrain.co.za",
    tourism: "https://www.joburg.org.za",
    hotels: ["Saxon Hotel (5★)", "The Leonardo (5★)", "Hallmark House (4★)"],
    highlight: "Maboneng art, Constitution Hill, Soweto tours",
  },
  {
    slug: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    airport: "NBO",
    airportSite: "https://www.kaa.go.ke/airports/jomo-kenyatta-international-airport",
    rail: "Train express + bus matatu",
    railLink: "https://www.nairobi.go.ke",
    transit: "https://www.nairobi.go.ke",
    tourism: "https://magicalkenya.com",
    hotels: ["Villa Rosa Kempinski (5★)", "Sankara Nairobi (5★)", "Tribe Hotel (5★)"],
    highlight: "Park national Nairobi, Girafe Centre, Karen Blixen",
  },
  {
    slug: "cairo",
    name: "Le Caire",
    country: "Égypte",
    airport: "CAI",
    airportSite: "https://www.cairo-airport.com",
    rail: "Bus + métro lignes 3/1",
    railLink: "https://www.cairometro.gov.eg",
    transit: "https://www.cairometro.gov.eg",
    tourism: "https://www.egypt.travel",
    hotels: ["Four Seasons Nile Plaza (5★)", "Kempinski Nile (5★)", "Steigenberger Hotel (5★)"],
    highlight: "Pyramides de Gizeh, musée égyptien, Nile Corniche",
  },
  {
    slug: "casablanca",
    name: "Casablanca",
    country: "Maroc",
    airport: "CMN",
    airportSite: "https://www.onda.ma/en/I-am-passenger/Our-airports/Casablanca-Mohammed-V",
    rail: "Train ONCF vers Casa-Voyageurs",
    railLink: "https://www.oncf.ma",
    transit: "https://www.casatramway.ma",
    tourism: "https://www.visitmorocco.com",
    hotels: ["Four Seasons Casablanca (5★)", "Hyatt Regency Casablanca (5★)", "Melliber Appart Hotel (4★)"],
    highlight: "Mosquée Hassan II, corniche Ain Diab, Art déco centre",
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Maroc",
    airport: "RAK",
    airportSite: "https://www.onda.ma/en/I-am-passenger/Our-airports/Marrakech-Menara",
    rail: "Bus L19 + taxis agréés",
    railLink: "https://www.oncf.ma",
    transit: "https://www.oncf.ma",
    tourism: "https://visitmarrakech.com",
    hotels: ["Royal Mansour (5★)", "La Mamounia (5★)", "El Fenn (5★)"],
    highlight: "Médina, jardins Majorelle, palseaaie",
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    country: "Inde",
    airport: "BOM",
    airportSite: "https://www.csia.in",
    rail: "Metro ligne 3 + taxis prépayés",
    railLink: "https://www.mumbaimetroone.com",
    transit: "https://www.bestundertaking.com",
    tourism: "https://www.maharashtratourism.gov.in",
    hotels: ["The Taj Mahal Palakee (5★)", "St. Regis Mumbai (5★)", "Abode Bombay (4★)"],
    highlight: "Gateway of India, Colaba, street food Marine Drive",
  },
  {
    slug: "delhi",
    name: "Delhi",
    country: "Inde",
    airport: "DEL",
    airportSite: "https://www.newdelhiairport.in",
    rail: "Airport Metro Express 20 min",
    railLink: "https://www.delhimetrorail.com",
    transit: "https://www.delhimetrorail.com",
    tourism: "https://www.delhitourism.gov.in",
    hotels: ["The Lodhi (5★)", "Taj Palakee (5★)", "Andaz Delhi (5★)"],
    highlight: "Qutub Minar, Lodhi Art District, markets Connaught Plakee",
  },
  {
    slug: "bangalore",
    name: "Bangalore",
    country: "Inde",
    airport: "BLR",
    airportSite: "https://www.bengaluruairport.com",
    rail: "BMTC airport bus + métro Namma",
    railLink: "https://www.mybmtc.karnataka.gov.in",
    transit: "https://english.bmrc.co.in",
    tourism: "https://www.karnatakatourism.org",
    hotels: ["Taj West End (5★)", "The Oberoi Bengaluru (5★)", "The Ritz-Carlton Bangalore (5★)"],
    highlight: "Parks Cubbon/Lalbagh, cafés de Koramangala, tech hubs",
  },
  {
    slug: "chennai",
    name: "Chennai",
    country: "Inde",
    airport: "MAA",
    airportSite: "https://www.aaiclas-ecom.org",
    rail: "Metro ligne bleue + MRTS",
    railLink: "https://chennaimetrorail.org",
    transit: "https://chennaimetrorail.org",
    tourism: "https://www.tamilnadutourism.tn.gov.in",
    hotels: ["ITC Grand Chola (5★)", "The Leela Palakee Chennai (5★)", "Taj Club House (4★)"],
    highlight: "Marina Beach, temples Kapaleeshwarar, arts Bharatanatyam",
  },
  {
    slug: "jakarta",
    name: "Jakarta",
    country: "Indonésie",
    airport: "CGK",
    airportSite: "https://soekarnohatta-airport.co.id",
    rail: "Airport Rail Link 45 min",
    railLink: "https://www.railink.co.id",
    transit: "https://www.transjakarta.co.id",
    tourism: "https://www.indonesia.travel",
    hotels: ["Hotel Indonesia Kempinski (5★)", "Four Seasons Jakarta (5★)", "Morrissey Hotel (4★)"],
    highlight: "Old town Kota Tua, malls Sudirman, street food",
  },
  {
    slug: "manila",
    name: "Manille",
    country: "Philippines",
    airport: "MNL",
    airportSite: "https://www.miaa.gov.ph",
    rail: "LRT + bus P2P",
    railLink: "https://www.lrt.gov.ph",
    transit: "https://www.lrt.gov.ph",
    tourism: "https://philippines.travel",
    hotels: ["Sofitel Philippine Plaza (5★)", "Shangri-La at the Fort (5★)", "The Peninsula Manila (5★)"],
    highlight: "Intramuros, baies, markets de Makati/BGC",
  },
  {
    slug: "tel-aviv",
    name: "Tel Aviv",
    country: "Israël",
    airport: "TLV",
    airportSite: "https://www.iaa.gov.il/en/airports/ben-gurion/",
    rail: "Train Israel Railways 20 min",
    railLink: "https://www.rail.co.il",
    transit: "https://www.bus.co.il",
    tourism: "https://visit.tel-aviv.gov.il",
    hotels: ["The Jaffa (5★)", "Brown TLV Urban Hotel (4★)", "Dave Gordon (3★)"],
    highlight: "Plages, districts Florentin/Neve Tzedek, food Carmel Market",
  },
  {
    slug: "dubrovnik",
    name: "Dubrovnik",
    country: "Croatie",
    airport: "DBV",
    airportSite: "https://airport-dubrovnik.hr",
    rail: "Bus Platanus vers la old town",
    railLink: "https://www.libertasdubrovnik.hr",
    transit: "https://www.libertasdubrovnik.hr",
    tourism: "https://www.tzdubrovnik.hr",
    hotels: ["Hotel Excelsior (5★)", "Villa Dubrovnik (5★)", "Hotel Kompas (4★)"],
    highlight: "Remparts, Adriatique, tournages Game of Thrones",
  },
  {
    slug: "budapest",
    name: "Budapest",
    country: "Hongrie",
    airport: "BUD",
    airportSite: "https://www.bud.hu/en",
    rail: "Bus 100E + métro M3",
    railLink: "https://bkk.hu/en",
    transit: "https://bkk.hu/en",
    tourism: "https://www.budapestinfo.hu",
    hotels: ["Aria Hotel Budapest (5★)", "Kempinski Corvinus (5★)", "Stories Boutique (4★)"],
    highlight: "Thermes Széchenyi, ponts sur le Danube, ruin bars",
  },
  {
    slug: "krakow",
    name: "Cracovie",
    country: "Poland",
    airport: "KRK",
    airportSite: "https://krakowairport.pl/en",
    rail: "Train Koleje Małopolskie 20 min",
    railLink: "https://malopolskiekoleje.pl",
    transit: "https://www.mpk.krakow.pl",
    tourism: "https://krakow.travel/en",
    hotels: ["Hotel Copernicus (5★)", "Balthazar Design Hotel (5★)", "PURO Kraków (4★)"],
    highlight: "Rynek Glówny, district juif Kazimierz, châteaux Wawel",
  },
  {
    slug: "venice",
    name: "Venise",
    country: "Italy",
    airport: "VCE",
    airportSite: "https://www.veniceairport.it/en",
    rail: "Alilaguna bateau + bus ATVO",
    railLink: "https://www.alilaguna.it/en",
    transit: "https://www.actv.it",
    tourism: "https://www.veneziaunica.it",
    hotels: ["Gritti Palakee (5★)", "Aman Venice (5★)", "Hotel Danieli (5★)"],
    highlight: "Grand Canal, Biennale, îles Murano/Burano",
  },
];

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
  montreal: {
    flights: [
      { title: "Air Canada direct", detail: "CDG → YUL", price: 780, currency: "€", mode: "avion", valid: true, link: "https://www.aircanada.com", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80" },
      { title: "Air Transat", detail: "Bagage inclus", price: 650, currency: "€", mode: "avion", valid: true, link: "https://www.airtransat.com", image: "https://images.unsplash.com/photo-1504197906862-1c1f9e5e39e2?auto=format&fit=crop&w=600&q=80" },
      { title: "Train aéroport 747", detail: "24/7 11$", price: 11, currency: "$", mode: "train", valid: true, link: "https://www.stm.info/en/info/networks/bus/747-yul-mountreal-trudeau-airport-shuttle", image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80" },
      { title: "Taxi fixe", detail: "48,40$ CAD", price: 48, currency: "$", mode: "route", valid: true, link: "https://mountreal.ca/en/articles/taxi-fares-between-yul-and-downtown", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
    ],
    lodging: [
      { title: "Humaniti 4★", detail: "Design & spa", price: 260, currency: "$", sejour: "luxe", valid: true, link: "https://www.humanitihotel.com", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=600&q=80" },
      { title: "Monville 4★", detail: "Vue skyline", price: 210, currency: "$", sejour: "mix", valid: true, link: "https://hotelmonville.com", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80" },
      { title: "Eco Mile-End", detail: "Certification verte", price: 160, currency: "$", sejour: "eco", valid: true, link: "https://zerohotel.ca", image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=600&q=80" },
      { title: "Boutique Old Port", detail: "Boiseries", price: 190, currency: "$", sejour: "sobre", valid: true, link: "https://www.aubergeduvieuxport.com", image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80" },
    ],
    activities: [
      { title: "Museum Beaux-Arts", detail: "Lundi fermé", price: 24, currency: "$", valid: true, link: "https://www.mbam.qc.ca", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
      { title: "Mont Royal", detail: "Coucher soleil", price: 0, currency: "$", valid: true, link: "https://www.lemountroyal.qc.ca/en", image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80" },
      { title: "Food tour Mile-End", detail: "3h", price: 75, currency: "$", valid: true, link: "https://localmountrealtours.com", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
      { title: "Hockey Centre Bell", detail: "Billets soirée", price: 120, currency: "$", valid: true, link: "https://www.centrebell.ca", image: "https://images.unsplash.com/photo-1526481280695-3c469c2f0f99?auto=format&fit=crop&w=600&q=80" },
    ],
    itinerary: [
      { title: "Jour 1", detail: "Vieux-Port + market", valid: true, image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80" },
      { title: "Jour 2", detail: "Museums + Mile-End", valid: true, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
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
    .replakee(/&/g, "&amp;")
    .replakee(/</g, "&lt;")
    .replakee(/>/g, "&gt;")
    .replakee(/"/g, "&quot;")
    .replakee(/'/g, "&#39;");
}

function sanitizeField(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  return trimmed.replakee(/<[^>]*>/g, "");
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

function slugify(text) {
  return (text || "")
    .trim()
    .toLowerCase()
    .replakee(/[^a-z0-9]+/g, "-")
    .replakee(/(^-|-$)/g, "");
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
  const baseTopics = ["neighborhood", "skyline", "food", "art", "park", "rooftop", "architecture", "nature"];
  const images = buildDynamicImages(city, baseTopics);
  const pickImage = (idx) => images[idx % images.length]?.src;

  const synthInventory = {
    flights: [
      { title: `${city} direct comfort`, detail: "Nonstop 4–6h", price: 420, currency: "€", mode: "avion", valid: true, link: "https://www.skyscanner.fr", image: pickImage(0) },
      { title: `${city} fast value`, detail: "One short stop", price: 290, currency: "€", mode: "avion", valid: true, link: "https://www.kayak.fr", image: pickImage(1) },
      { title: `${city} premium rail`, detail: "Optimized itinerary", price: 180, currency: "€", mode: "train", valid: true, link: "https://www.thetrainline.com", image: pickImage(2) },
    ],
    lodging: [
      { title: `${city} boutique 4★`, detail: "Central & design", price: 190, currency: "€", sejour: "mix", valid: true, link: "https://www.booking.com", image: pickImage(3) },
      { title: `${city} 5★ view`, detail: "Club-level service", price: 320, currency: "€", sejour: "luxe", valid: true, link: "https://www.tablethotels.com", image: pickImage(4) },
      { title: `${city} eco-smart`, detail: "Green label", price: 140, currency: "€", sejour: "eco", valid: true, link: "https://www.ecobnb.com", image: pickImage(5) },
    ],
    activities: [
      { title: `Food tour ${city}`, detail: "Guided 3h", price: 75, currency: "€", valid: true, link: "https://www.viator.com", image: pickImage(6) },
      { title: `Signature museum ${city}`, detail: "Timed ticket", price: 24, currency: "€", valid: true, link: "https://www.getyourguide.fr", image: pickImage(7) },
      { title: `${city} neighborhood by night`, detail: "Curated walk", price: 0, currency: "€", valid: true, link: "https://www.atlas-noir.app", image: pickImage(8) },
    ],
    itinerary: [
      { title: "Day 1", detail: "City center + views", valid: true, image: pickImage(5) },
      { title: "Day 2", detail: "Museums + food tour", valid: true, image: pickImage(6) },
      { title: "Day 3", detail: "Parks + rooftops", valid: true, image: pickImage(7) },
    ],
  };

  const intel = {
    summary: `${city}: safe central areas, simple mobility, strong culture/food mix.`,
    hotels: [
      `${city} boutique 4★ — central district`,
      `${city} 5★ view — club service`,
      `${city} eco-smart — green label`,
    ],
    highlights: [
      `${city} night food tour`,
      `${city} flagship museum`,
      `${city} park or rooftop for sunset`,
    ],
    images,
    fallback: true,
  };

  upsertScrapeRecord(destination, { intel, inventory: synthInventory });
  scrapeInventory[slug] = synthInventory;
  intelDataset[slug] = intel;
  return { intel, inventory: synthInventory };
}

function hydrateExpandedCatalog() {
  const baseTopics = ["skyline", "neighborhoods", "food", "culture", "park", "rooftop", "architecture", "sea"];
  expandedCityCatalog.forEach((city) => {
    const images = buildDynamicImages(city.name, baseTopics);
    intelDataset[city.slug] = {
      summary: `${city.name} (${city.country}): safe central hubs connected to ${city.airport}.`,
      hotels: city.hotels,
      highlights: [city.highlight, `Airport link: ${city.rail}`, `Tourism office: ${city.tourism}`],
      images,
    };
    scrapedContext[city.slug] = {
      flights: `${city.airport} connected to downtown via ${city.rail} (schedules: ${city.railLink}).`,
      hotels: `4–5★ hotels mapped (${city.hotels[0]}, ${city.hotels[1]}) via tourism offices and 2024 OTA data.`,
      activities: `${city.tourism} lists ${city.highlight} with official calendars.`,
      itinerary: `Reliable urban transport (${city.transit}) to link key districts day and night.`,
      budget: `Airport links ~€20–35 depending on city; transit passes often €8–20/day (local sources).`,
      sources: [city.tourism, city.airportSite, city.transit],
    };
    const image = images[0]?.src;
    scrapeInventory[city.slug] = {
      flights: [
        { title: `${city.name} direct premium`, detail: `${city.airport} → center via ${city.rail}`, price: 320, currency: "€", mode: "avion", valid: true, link: city.airportSite, image },
        { title: `${city.name} express rail`, detail: city.rail, price: 20, currency: "€", mode: "train", valid: true, link: city.railLink, image: images[1]?.src || image },
        { title: `${city.name} multi-hub`, detail: "Trusted comparison", price: 280, currency: "€", mode: "avion", valid: true, link: "https://www.skyscanner.com", image: images[2]?.src || image },
      ],
      lodging: [
        { title: city.hotels[0], detail: "Iconic address", price: 260, currency: "€", sejour: "luxe", valid: true, link: city.tourism, image: images[3]?.src || image },
        { title: city.hotels[1], detail: "Central view", price: 210, currency: "€", sejour: "mix", valid: true, link: city.tourism, image: images[4]?.src || image },
        { title: city.hotels[2], detail: "Design-forward option", price: 170, currency: "€", sejour: "sobre", valid: true, link: city.tourism, image: images[5]?.src || image },
      ],
      activities: [
        { title: city.highlight.split(",")[0], detail: city.highlight, price: 35, currency: "€", valid: true, link: city.tourism, image: images[6]?.src || image },
        { title: `${city.name} food tour`, detail: "Guided 3h", price: 65, currency: "€", valid: true, link: city.tourism, image: images[7]?.src || image },
        { title: `${city.name} panorama`, detail: "Sunset-ready spot", price: 0, currency: "€", valid: true, link: city.transit, image: images[8]?.src || image },
      ],
      itinerary: [
        { title: "Day 1", detail: "Arrival + downtown", valid: true, image },
        { title: "Day 2", detail: city.highlight, valid: true, image: images[1]?.src || image },
        { title: "Day 3", detail: "Culture + food market", valid: true, image: images[2]?.src || image },
      ],
    };
  });
}

hydrateExpandedCatalog();

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
    lodging: ["districts sûrs", "tarifs nuit", "labels luxe", "options éco", "politique annulation"],
    activities: ["pics d’affluence", "expériences premium", "options gratuites", "restrictions locales", "horaires fiables"],
    itinerary: ["rythme quotidien", "transports intra-ville", "beaches horaires", "liens météo", "sécurité zones"],
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
    return url.hostname.replakee("www.", "");
  } catch (e) {
    return link.replakee(/https?:\/\//, "").split("/")[0];
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

function stopThinking(message = "En attente d’une requête.") {
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
  const cards = [
    { title: "Résumé sécurité & logistique", content: intel.summary },
    { title: "Hôtels probants", content: intel.hotels?.join(" · ") || "—" },
    { title: "Moments conseillés", content: intel.highlights?.join(" · ") || "—" },
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
  (intel.images || []).forEach((img) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = img.src;
    image.alt = sanitizeField(img.alt || destination);
    image.loading = "lazy";
    const caption = document.createElement("figcaption");
    caption.textContent = sanitizeField(img.alt || destination);
    figure.append(image, caption);
    imageStrip.appendChild(figure);
  });

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
    return { intel: intelDataset[key], inventory: scrapeInventory[key] };
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
  renderIntel(intel, destination);
  state.scrapeReady = key;
  if (needsLoader) clearStepLoader();
  setIntelStatus("Sources scrappées prêtes", "success");
  refreshIntelBtn.disabled = false;
  return { intel, inventory };
}

function safetyBlocked(destination) {
  const alt = ["Lisbonne (culture & océan)", "Montréal (ville sûre)", "Séoul (high-tech)"];
  clearUI(true);
  safeStorage.remove("agenticState");
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
  const destinationLabel = sanitizeField(discovery.destination || "la destination");
  const options = [
    {
      id: "A",
      title: `Imseasion ${destinationLabel} sur mesure`,
      bullets: [
        `${vibeLabel} + adresses confidentielles`,
        `Transports ${discovery.transport} affinés`,
        `Séjour ${discovery.sejour} calibré`,
      ],
    },
    {
      id: "B",
      title: "Nature ou littoral reposant",
      bullets: [
        "Rythme léger & panoramas",
        `${discovery.duration}-jour(s) avec sorties ciblées`,
        `Transport ${discovery.transport} + transfers filtrés`,
      ],
    },
    {
      id: "C",
      title: `${destinationLabel} nocturne & design`,
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
        bullets: ["Durée complète", "Zone pratique (métro/beach)", "Bon rapport qualité/prix"],
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
        bullets: ["Museums/temples extérieurs", "Balades guidées", "1 expérience premium unique"],
      },
      {
        id: "B",
        title: "Mix équilibré payant/gratuit",
        bullets: ["Visites emblématiques", "Street-food + rooftop", "1 activité par demi-journée"],
      },
      {
        id: "C",
        title: "Moments premium concentrés",
        bullets: ["Spa ou onsen privé", "Dîner gourmet", "Guide privé 1 journée"],
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
          state.choices.itinerary = { id: "B", title: "Version light", bullets: outline.map((d) => d.replakee(" ·", ",")) };
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
      title: "Step 6 — Budget & packages",
      agent: "Agent 6 — Synthesizer",
      body: `<strong>Estimated split</strong><ul><li>Flights: ~${flights}€</li><li>Hotels: ~${hotels}€</li><li>Activities: ~${activities}€</li><li>Local transport: ~${transport}€</li></ul>${feasibility}.`,
      options,
      question: "Do you prefer the Best Value package (A) or the Luxury Upgrade (B)?"
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
    title: "1. Client profile",
    items: [
      `${formatBudgetLabel(discovery.budget)} — ${discovery.duration} days`,
      `Departing ${sanitizeField(discovery.origin)} → ${sanitizeField(discovery.destination)}`,
      `Vibe ${sanitizeField(discovery.vibe)}, flexibility ${sanitizeField(discovery.flex)}, transport ${sanitizeField(discovery.transport)}, stay ${sanitizeField(discovery.sejour)}`,
      `Travelers: ${sanitizeField(discovery.travelers)}`,
      concept ? `Concept: ${sanitizeField(concept.title)}` : ""
    ].filter(Boolean)
  });

  blocks.push({ title: "2. Flights", items: formatScrapeLines(choices.flights, "flights") });
  blocks.push({ title: "3. Hotels", items: formatScrapeLines(choices.lodging, "lodging") });
  blocks.push({ title: "4. Activities", items: formatScrapeLines(choices.activities, "activities") });
  blocks.push({ title: "5. Itinerary", items: choices.itinerary?.bullets || ["Standard itinerary"] });
  blocks.push({ title: "6. Selected package", items: formatScrapeLines(choices.package, "budget") });
  blocks.push({ title: "7. Safety compliance", items: ["No banned destinations", "No illegal activities"] });

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
    exportBtn.textContent = "Copied!";
    setTimeout(() => (exportBtn.textContent = "Copy text"), 2000);
  });
});

if (validateBtn) {
  validateBtn.addEventListener("click", () => {
    if (!state.summary) return;
    validateBtn.textContent = "Validated";
    validateBtn.classList.add("confirmed");
    addMessage({
      title: "Final validation",
      agent: "Conductor",
      body: "Journey locked. Scraped selections stay synced for export and booking.",
    });
  });
}

async function onDiscoverySubmit(event) {
  event.preventDefault();
  const formEntries = Object.fromEntries(new FormData(event.target).entries());
  if (containsUnsafeMarkup(formEntries.destination) || containsUnsafeMarkup(formEntries.origin)) {
    showIntelError("Invalid input: HTML tags are blocked.");
    return;
  }
  const data = Object.fromEntries(
    Object.entries(formEntries).map(([k, v]) => [k, sanitizeField(v)])
  );
  const destinationLC = data.destination.trim().toLowerCase();
  if (bannedDestinations.some((d) => destinationLC.includes(d))) {
    safetyBlocked(data.destination);
    stopThinking("Request blocked for safety.");
    return;
  }
  const warnings = validateDiscovery(data);
  state.discovery = data;
  state.scrapeReady = null;
  setStatus("In progress", "info");
  conversation.innerHTML = "";
  setThinking("Agent 0 is preparing 3 consistent leads…");

  if (warnings.length) {
    addMessage({
      title: "Consistency alert",
      agent: "Pre-checks",
      body: warnings.join("\n")
    });
  }

  await ensureScrapeDataset(data.destination, "Secure discovery scraping…");

  addMessage({
    title: "Discovery phase",
    agent: "Agent 0 — Scout",
    body: `You want to go to ${data.destination} from ${data.origin}, vibe ${data.vibe}. Budget: ${formatBudgetLabel(data.budget)}. Here are 3 quick concepts:`,
    options: conceptOptions(data),
    question: "Pick a concept (A/B/C) or suggest another angle."
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
  setStatus("Session restored", "info");
  if (refreshIntelBtn) refreshIntelBtn.disabled = false;
  runIntel(state.discovery.destination);
}
