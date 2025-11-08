// Minimal PWA cache (optional; active only on http(s))
// Mise à jour du cache pour la version 3.4.11. Cette version introduit
// l’auto‑priorisation des actions via le module prioritizer.js ainsi que
// des améliorations liées aux indicateurs Kairos. Incrémentez
// ce nom à chaque version pour forcer les navigateurs à télécharger les
// nouvelles ressources et éviter les conflits de cache.
const CACHE = 'klaro-3.4.25-af1';
// La liste des ressources à mettre en cache. Inclut app.js et
// prioritizer.js avec leur paramètre de version afin d’éviter que le
// service worker ne serve de version obsolète. Si vous ajoutez de nouvelles
// dépendances, n’oubliez pas de les référencer ici.
const ASSETS = ['./','./index.html','./styles.css','./app.js?v=3.4.25','./prioritizer.js?v=3.4.25','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request))); });
