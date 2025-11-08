/* Klaro v3.3r — base v3.2 stabilisée, avec filtres dynamiques, vues, charts et Gantt dans Dashboard.
   Raccourcis clavier supprimés. Service Worker versionné séparément. */
(() => {
  'use strict';

  const APP_NAME = 'Klaro';
  // Mise à jour de la version pour refléter les améliorations UX/UI
  // Bump the application version after fixing routine ID generation and task persistence
  // Bump version number after routine stability improvements and Gantt enhancements.
  // Version 3.4.6 introduces the routine dashboard KPIs, improved Gantt colouring
  // and additional hardening around routine name escaping.
// Update the application version. 3.4.7 consolidates all previous
// improvements (unique IDs for routines and tasks, proper task
// persistence when editing routines, sanitized HTML injection,
// dashboard KPIs for routines and action statuses, colour‑coded
// Gantt chart) and finalises the red‑team fixes. Bumping the
// version here ensures the UI and service worker cache are invalidated
// appropriately when you deploy the updated files.
// Mise à jour : version 3.4.9 introduit les KPI routines,
// les indicateurs Kairos (contribution, énergie, dilution) et la gestion
// automatique de l'hibernation pour les projets à faible énergie.
// Mise à jour de la version : inclut l’auto‑priorisation des actions
// et le flux Red‑Team automatisé avec intégration des entrées Red‑Team
const APP_VERSION = '3.5.0';

  // Exposer la version de l’application sur l’objet global afin d’y accéder
  // facilement depuis la console ou d’autres scripts. Permet aussi aux
  // tests automatisés de vérifier la version courante.
  try { window.KlaroVersion = APP_VERSION; } catch(e) {}

  // ---------- Constants ----------
  const DB_NAME = 'goal_planner_webapp';   // on conserve pour compat compat
  // Bump DB version when adding new stores (routines, routineTasks, routineRuns)
  const DB_VERSION = 34;
  // Define all IndexedDB stores and their key paths. Added routines related stores.
  const STORES = {
    globals:'id',
    systems:'id',
    projects:'id',
    actions:'id',
    params:'key',
    snapshots:'id',
    trash:'id',
    files:'id',
    templates:'name',
    audit:'ts',
    // New stores for periodic routines
    routines:'id',
    routineTasks:'id',
    routineRuns:'id'
  };

  const defaultEnums = {
    domains:["Business","Produit","Apprentissage","Santé","Finance","Personnel","Relationnel","Créativité"],
    // Ajout du statut "Autonome" pour les projets auto‑pilotés
    statuses:["Idée","Planifié","En cours","Autonome","Bloqué","Terminé","Annulé"],
    priorities:["Basse","Moyenne","Haute","Critique"],
    units:["€","%","pts","h","unités"],
    taskStatuses:["À faire","En cours","Bloqué","Fait"],
    collaborators:["Florian","Equipe A","Equipe B","Freelance","Partenaire"],
    modes:["value","tasks"]
  };
  const defaultThresholds = { varRed:-0.10, varAmber:-0.03, spiRed:0.90, spiAmber:0.98, dueSoonDays:7 };
  const defaultCaps = { "Florian": 20, "Equipe A": 20, "Equipe B": 20, "Freelance": 15, "Partenaire": 10 };

  const OBJECTIVE_TYPES = [
    { value:'temporal', label:'Temporel' },
    { value:'result', label:'Résultat' },
    { value:'method', label:'Méthode' },
    { value:'quality', label:'Qualité' },
    { value:'learning', label:'Apprentissage' }
  ];
  const REQUIRED_OBJECTIVE_TYPES = ['temporal','result','method'];

  // Filtres appliqués au tableau de bord (période, projet, responsable). Ces valeurs
  // sont définies via la barre de filtres du dashboard et utilisées pour filtrer
  // les actions, projets et KPIs. Les options possibles sont :
  //  - time: 'today' | '7d' | '30d' | 'all'
  //  - project: id du projet ou 'all'
  //  - owner: nom du collaborateur ou 'all'
  const dashboardFilters = { time:'all', project:'all', owner:'all' };

  // ---------- IndexedDB ----------
  function openDB(){
    return new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        try{ if (db.objectStoreNames.contains('vault')) db.deleteObjectStore('vault'); }catch(e){}
        if (!db.objectStoreNames.contains('globals')) db.createObjectStore('globals', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('systems')) {
          const os = db.createObjectStore('systems', { keyPath: 'id' });
          if (!os.indexNames.contains('byGlobal')) os.createIndex('byGlobal','idGlobal',{unique:false});
        } else {
          const os = req.transaction.objectStore('systems');
          if (!os.indexNames.contains('byGlobal')) os.createIndex('byGlobal','idGlobal',{unique:false});
        }
        if (!db.objectStoreNames.contains('projects')) {
          const os = db.createObjectStore('projects', { keyPath: 'id' });
          if (!os.indexNames.contains('byGlobal')) os.createIndex('byGlobal','idGlobal',{unique:false});
          if (!os.indexNames.contains('bySystem')) os.createIndex('bySystem','idSystem',{unique:false});
          if (!os.indexNames.contains('byStatus')) os.createIndex('byStatus','status',{unique:false});
        } else {
          const os = req.transaction.objectStore('projects');
          if (!os.indexNames.contains('byGlobal')) os.createIndex('byGlobal','idGlobal',{unique:false});
          if (!os.indexNames.contains('bySystem')) os.createIndex('bySystem','idSystem',{unique:false});
          if (!os.indexNames.contains('byStatus')) os.createIndex('byStatus','status',{unique:false});
        }
        if (!db.objectStoreNames.contains('actions')) {
          const os = db.createObjectStore('actions', { keyPath: 'id' });
          if (!os.indexNames.contains('byProject')) os.createIndex('byProject','idProject',{unique:false});
          if (!os.indexNames.contains('byDueDate')) os.createIndex('byDueDate','dueDate',{unique:false});
        } else {
          const os = req.transaction.objectStore('actions');
          if (!os.indexNames.contains('byProject')) os.createIndex('byProject','idProject',{unique:false});
          if (!os.indexNames.contains('byDueDate')) os.createIndex('byDueDate','dueDate',{unique:false});
        }
        if (!db.objectStoreNames.contains('params')) db.createObjectStore('params', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('snapshots')) db.createObjectStore('snapshots', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('trash')) db.createObjectStore('trash', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath: 'name' });
        if (!db.objectStoreNames.contains('audit')) db.createObjectStore('audit', { keyPath: 'ts' });

        // --- New stores for routines ---
        if (!db.objectStoreNames.contains('routines')) {
          const os = db.createObjectStore('routines', { keyPath:'id' });
          // Index routines by system to filter easily by system
          os.createIndex('bySystem','idSystem',{unique:false});
        } else {
          const os = req.transaction.objectStore('routines');
          if (!os.indexNames.contains('bySystem')) os.createIndex('bySystem','idSystem',{unique:false});
        }
        if (!db.objectStoreNames.contains('routineTasks')) {
          const os = db.createObjectStore('routineTasks',{ keyPath:'id' });
          os.createIndex('byRoutine','routineId',{unique:false});
        } else {
          const os = req.transaction.objectStore('routineTasks');
          if (!os.indexNames.contains('byRoutine')) os.createIndex('byRoutine','routineId',{unique:false});
        }
        if (!db.objectStoreNames.contains('routineRuns')) {
          const os = db.createObjectStore('routineRuns',{ keyPath:'id' });
          // Index runs by date and by routine to query runs quickly
          os.createIndex('byDate','date',{unique:false});
          os.createIndex('byRoutine','routineId',{unique:false});
        } else {
          const os = req.transaction.objectStore('routineRuns');
          if (!os.indexNames.contains('byDate')) os.createIndex('byDate','date',{unique:false});
          if (!os.indexNames.contains('byRoutine')) os.createIndex('byRoutine','routineId',{unique:false});
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  const idb = {
    store(db,name,mode='readonly'){ return db.transaction(name,mode).objectStore(name); },
    getAll(db,name){ return toPromise(this.store(db,name).getAll()); },
    get(db,name,key){ return toPromise(this.store(db,name).get(key)); },
    put(db,name,val){ return toPromise(this.store(db,name,'readwrite').put(val)); },
    del(db,name,key){ return toPromise(this.store(db,name,'readwrite').delete(key)); },
    clear(db,name){ return toPromise(this.store(db,name,'readwrite').clear()); },
    indexGetAll(db,name,index,query){ const s=this.store(db,name); return toPromise(s.index(index).getAll(query)); }
  };
  function toPromise(req){ return new Promise((res,rej)=>{ req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error); }); }

  // ---------- Utils ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const today = () => new Date(new Date().toDateString());
  const parseDate = s => s ? new Date(s+'T00:00:00') : null;
  const daysBetween = (a,b) => (a && b) ? Math.round((b - a)/86400000) : null;
  const dateAddDays = (d,days)=> new Date(d.getTime()+days*86400000);
  const clamp01 = x => Math.max(0, Math.min(1, x ?? 0));
  const fmtPct = x => (isFinite(x) ? (Math.round(x*1000)/10).toFixed(1)+'%' : '—');
  const fmtNum = (x,d=0) => (isFinite(x) ? Number(x).toFixed(d) : '—');
  const fmtDate = d => d ? new Date(d).toISOString().slice(0,10) : '';
  const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function formatDurationMinutes(minutes){
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    if (!total) return '—';
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours && mins){
      return `${hours} h ${mins}`;
    }
    if (hours){
      return `${hours} h`;
    }
    return `${mins} min`;
  }
  function showToast(msg){ const t = $('#toast'); if (!t) return; t.textContent = msg; t.hidden=false; setTimeout(()=>t.hidden=true, 1600); }

  // --------- Validation différée pour les nouveaux éléments (hors actions) ---------
  const VALIDATION_DELAY_DAYS = 7;
  const VALIDATION_TARGETS = {
    globals:{ label:'Objectif global', title:item => item?.title || item?.id || '' },
    systems:{ label:'Système', title:item => item?.title || item?.id || '' },
    projects:{ label:'Projet', title:item => item?.title || item?.id || '' },
    routines:{ label:'Routine', title:item => item?.name || item?.title || item?.id || '' }
  };

  function createValidationMetadata(){
    const base = today();
    const created = fmtDate(base);
    const due = fmtDate(dateAddDays(base, VALIDATION_DELAY_DAYS));
    return { status:'pending', createdAt: created, dueDate: due };
  }

  function ensureValidationMetadata(kind, existing, obj){
    if (kind === 'actions') return obj;
    if (existing && existing.validation){
      obj.validation = existing.validation;
      return obj;
    }
    if (!existing){
      obj.validation = createValidationMetadata();
    }
    return obj;
  }

  function computeValidationDue(meta){
    if (!meta) return null;
    if (meta.dueDate){
      return parseDate(meta.dueDate);
    }
    if (meta.createdAt){
      const created = parseDate(meta.createdAt);
      if (created) return dateAddDays(created, VALIDATION_DELAY_DAYS);
    }
    return null;
  }

  function gatherValidationQueue(data){
    const queue = [];
    const now = today();
    Object.entries(VALIDATION_TARGETS).forEach(([store, cfg]) => {
      const list = data[store] || [];
      list.forEach(item => {
        if (!item) return;
        const meta = item.validation;
        if (!meta || meta.status !== 'pending') return;
        const due = computeValidationDue(meta);
        if (!due || due > now) return;
        queue.push({
          store,
          id: item.id,
          type: cfg.label,
          title: cfg.title(item),
          createdAt: meta.createdAt || '',
          dueDate: meta.dueDate || fmtDate(due),
          due
        });
      });
    });
    queue.sort((a,b) => {
      const ad = a.due ? a.due.getTime() : 0;
      const bd = b.due ? b.due.getTime() : 0;
      if (ad !== bd) return ad - bd;
      return (a.title || '').localeCompare(b.title || '', 'fr', {numeric:true, sensitivity:'base'});
    });
    return queue;
  }

  function refreshStoreAfterValidation(store){
    if (store === 'globals') return refreshGlobals();
    if (store === 'systems') return refreshSystems();
    if (store === 'projects') return refreshProjects();
    if (store === 'routines' && window.refreshRoutines) return window.refreshRoutines();
  }

  // --------- Loading overlay helpers ---------
  function showLoading(){ const o=document.getElementById('loadingOverlay'); if (o) o.removeAttribute('hidden'); }
  function hideLoading(){ const o=document.getElementById('loadingOverlay'); if (o) o.setAttribute('hidden',''); }

  // --------- Accent color helpers ---------
  const ACCENT_KEY = 'klaro:accentColor';
  function applyAccentColor(color){
    if (!color) return;
    document.documentElement.style.setProperty('--accent', color);
    const picker=document.getElementById('accentColorPicker');
    if (picker && picker.value !== color) picker.value = color;
  }
  function loadAccentColor(){
    const saved = localStorage.getItem(ACCENT_KEY);
    if (saved) applyAccentColor(saved);
  }
  function bindAccentForm(){
    const picker = document.getElementById('accentColorPicker');
    const btn = document.getElementById('btnSaveAccent');
    if (!picker || !btn) return;
    // Initial set from saved value or computed CSS
    loadAccentColor();
    // If no saved color, default the picker to the current accent variable
    if (!localStorage.getItem(ACCENT_KEY)){
      const computed = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      if (computed) picker.value = computed;
    }
    btn.addEventListener('click', () => {
      const color = picker.value;
      applyAccentColor(color);
      localStorage.setItem(ACCENT_KEY, color);
      showToast('Couleur appliquée');
    });
  }

  // Apply saved accent color immediately when script is loaded
  loadAccentColor();
  function pad(n,size=3){ n=String(n); while(n.length<size) n='0'+n; return n; }

  /**
   * Met à jour l’indicateur de tendance pour un KPI donné. On récupère la
   * valeur précédente dans localStorage (clé klaro:prevKpis) et on ajoute
   * un pictogramme ▲, ▼ ou – selon la variation. La valeur actuelle est
   * ensuite sauvegardée.
   */
  function updateKpiTrend(id, value){
    const el = document.getElementById(id);
    if (!el) return;
    // Charger les valeurs précédentes
    let prevKpis;
    try{ prevKpis = JSON.parse(localStorage.getItem('klaro:prevKpis') || '{}'); }catch(e){ prevKpis = {}; }
    const prevVal = Number(prevKpis[id]||0);
    const newVal = Number(value||0);
    let symbol = '–'; let cls='muted';
    if (newVal > prevVal){ symbol = '▲'; cls='ok'; }
    else if (newVal < prevVal){ symbol = '▼'; cls='bad'; }
    // Mettre à jour l’élément : retirer l’ancienne icône si présente
    // Placer l’icône de tendance à l’intérieur du bloc de valeur KPI pour qu’elle
    // apparaisse immédiatement après le nombre. Si aucune icône n’existe,
    // on la crée à la fin du nœud kpi-value.
    let trendSpan = el.querySelector('.trend-icon');
    if (!trendSpan){ trendSpan = document.createElement('span'); trendSpan.className = 'trend-icon'; el.appendChild(trendSpan); }
    trendSpan.textContent = symbol;
    trendSpan.classList.remove('ok','bad','muted');
    trendSpan.classList.add(cls);
    // Sauvegarder la nouvelle valeur
    prevKpis[id] = newVal;
    try{ localStorage.setItem('klaro:prevKpis', JSON.stringify(prevKpis)); }catch(e){}
  }
  /**
   * Generate a new unique identifier for a given store.
   *
   * IDs are composed of a prefix, the current date in YYYYMMDD format and a
   * three‑digit incremental suffix. When computing the next suffix the
   * function examines all existing IDs in the provided store, extracts the
   * trailing numeric portion (ignoring the date part) and increments it. A
   * subtle bug in earlier versions incorrectly escaped the regular
   * expression, causing the suffix extraction to always fail and every
   * generated ID to reset to 001. As a result newly created records would
   * overwrite previous ones and it was impossible to create multiple
   * routines or routine tasks. This implementation fixes the regex so that
   * only digits at the end of the ID are matched.
   *
   * @param {string} prefix  A short prefix identifying the store (e.g. 'R' or 'RT').
   * @param {string} storeName The name of the IndexedDB object store.
   * @returns {Promise<string>} A promise resolving to the new unique ID.
   */
  async function nextId(prefix, storeName){
    // Use the current date (YYYYMMDD) as part of the ID. Removing hyphens
    // ensures the date portion is numeric and sortable.
    const stamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
    // Read all existing entries from the target store. idb.getAll() returns an
    // array of objects; if the store is empty we will generate the first ID.
    const all = await idb.getAll(db, storeName);
    let max = 0;
    for (const it of all){
      // Extract the trailing number after the last hyphen. The previous code
      // mistakenly attempted to match '\\d+' which searched for a literal
      // backslash and "d" instead of digits. Here we correctly match one or
      // more digits at the end of the string.
      const m = String(it.id || '').match(/(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    }
    // Pad the new numeric suffix to three digits. If no existing items were
    // found max remains 0 and the new ID will end with 001.
    return `${prefix}${stamp}-${pad(max + 1, 3)}`;
  }
  function maskName(s){ return s; } // CSS gère le masquage

  // ---------- Params ----------
  let db, enums, thresholds, capacities, privacy='off';
  async function loadParams(){
    enums = (await idb.get(db,'params','enums'))?.value || defaultEnums;
    thresholds = (await idb.get(db,'params','thresholds'))?.value || defaultThresholds;
    capacities = (await idb.get(db,'params','capacities'))?.value || defaultCaps;
    privacy = (await idb.get(db,'params','privacy'))?.value || 'off';
    document.documentElement.setAttribute('data-privacy', privacy==='on'?'on':'off');
  }
  async function saveEnums(v){ enums=v; await idb.put(db,'params',{key:'enums', value:v}); }
  async function saveThresholds(v){ thresholds=v; await idb.put(db,'params',{key:'thresholds', value:v}); }
  async function saveCaps(v){ capacities=v; await idb.put(db,'params',{key:'capacities', value:v}); }
  async function setPrivacyState(v){ privacy=v; await idb.put(db,'params',{key:'privacy', value:v}); document.documentElement.setAttribute('data-privacy', v==='on'?'on':'off'); }

  // ---------- Audit ----------
  async function audit(op, store, id){ await idb.put(db,'audit', { ts: Date.now()+Math.random(), op, store, id }); }

  // ---------- Computations ----------
  function computeSystem(sys){
    const progress = (sys.target - sys.baseline) !== 0 ? (Number(sys.current||0) - Number(sys.baseline||0))/(Number(sys.target||0) - Number(sys.baseline||0)) : 0;
    sys.progress = clamp01(progress);
    return sys;
  }
  function worstRAG(a,b){ const score={'Vert':0,'Ambre':1,'Rouge':2}; return (score[a]>=score[b])?a:b; }
  function computeProject(p, actions){
    const target = Number(p.target)||0, current = Number(p.current)||0;
    const progressValue = target>0 ? current/target : 0;
    const ptsTotal = (actions||[]).reduce((s,a)=> s + (Number(a.points)||0), 0);
    const ptsDone = (actions||[]).filter(a=>a.statusTask==='Fait').reduce((s,a)=> s + (Number(a.points)||0), 0);
    const progressTasks = ptsTotal>0 ? ptsDone/ptsTotal : 0;
    // Déterminer un mode de suivi des progrès. Certains projets sont suivis
    // principalement par la progression des tâches (mode "tasks"), d’autres
    // par la valeur produite (mode "value"). Plutôt que d’appliquer un
    // rapport fixe (70/30), nous ajustons dynamiquement les poids en
    // fonction de ce mode : 70 % pour la dimension choisie, 30 % pour
    // l’autre. Si aucun mode n’est renseigné, un équilibre 50/50 est appliqué.
    let wTasks = 0.5; let wValue = 0.5;
    if (p.mode === 'tasks') { wTasks = 0.7; wValue = 0.3; }
    else if (p.mode === 'value') { wTasks = 0.3; wValue = 0.7; }
    const overall = clamp01(wTasks * progressTasks + wValue * progressValue);
    const dStart = parseDate(p.startDate), dEnd = parseDate(p.plannedEnd), now=today();
    const expected = (dStart && dEnd && dEnd>dStart) ? clamp01((now - dStart)/(dEnd - dStart)) : 0;
    const variance = overall - expected;
    const overdue = (p.status!=='Terminé' && dEnd && dEnd < now);
    const budget = Number(p.budget)||0, actual = Number(p.actualCost)||0;
    const EV = budget * overall, PV = budget * expected;
    const CPI = (actual>0) ? EV/actual : null;
    const SPI = (PV>0) ? EV/PV : null;
    const ICE = (Number(p.impact)||0) * (Number(p.confidence)||0) / Math.max(0.1, Number(p.effort)||0);
    const ragByVar = (variance <= thresholds.varRed) ? 'Rouge' : (variance <= thresholds.varAmber ? 'Ambre':'Vert');
    let ragBySpi = 'Vert';
    if (SPI!=null){ if (SPI <= thresholds.spiRed) ragBySpi='Rouge'; else if (SPI <= thresholds.spiAmber) ragBySpi='Ambre'; }
    const RAG = worstRAG(ragByVar, ragBySpi);
    const suggestedStatus = (overall>=0.999) ? 'Terminé' : ((actions||[]).some(a=>a.statusTask==='Bloqué') ? 'Bloqué' : ((overall>0 || ptsDone>0) ? 'En cours' : 'Planifié'));
    return Object.assign({}, p, { progressValue:clamp01(progressValue), pointsTotal:ptsTotal, pointsDone:ptsDone, progressTasks:clamp01(progressTasks), progressOverall:clamp01(overall), expectedProgress:expected, variance, overdue, EV, PV, CPI, SPI, ICE, suggestedStatus, RAG });
  }
  function computeGlobal(g, systems, projects){
    const progressValue = (g.target - g.baseline) ? (Number(g.currentValue||0) - Number(g.baseline||0))/(Number(g.target||0) - Number(g.baseline||0)) : 0;
    const systemsFor = systems.filter(s=> s.idGlobal===g.id).map(computeSystem);
    const projsFor = projects.filter(p=> p.idGlobal===g.id);
    const avgSys = systemsFor.length ? systemsFor.reduce((s,x)=>s+x.progress,0)/systemsFor.length : 0;
    const avgProj = projsFor.length ? projsFor.reduce((s,x)=>s+(x.progressOverall||0),0)/projsFor.length : 0;
    const scorePriority = ((Number(g.impact)||0)+(Number(g.urgency)||0)+(Number(g.clarity)||0))/3 || 0;
    // Calcule une progression combinée pour l’objectif global. Plutôt que de se
    // contenter d’afficher séparément la progression par valeur, la moyenne
    // des systèmes et celle des projets, nous construisons un indicateur
    // synthétique. Les poids s’adaptent selon la présence de systèmes et
    // de projets : si des systèmes existent mais pas de projets, on leur donne
    // plus de poids, et inversement. Lorsque les trois dimensions sont
    // présentes, on privilégie légèrement la valeur (40 %) et répartit
    // le reste sur les systèmes (30 %) et les projets (30 %).
    let wValue = 0.4, wSys = 0.3, wProj = 0.3;
    const hasSys = systemsFor.length > 0;
    const hasProj = projsFor.length > 0;
    if (hasSys && !hasProj) { wValue = 0.5; wSys = 0.5; wProj = 0; }
    else if (!hasSys && hasProj) { wValue = 0.5; wSys = 0; wProj = 0.5; }
    else if (!hasSys && !hasProj) { wValue = 1; wSys = 0; wProj = 0; }
    const progressCombined = clamp01(wValue * progressValue + wSys * avgSys + wProj * avgProj);
    return Object.assign({}, g, { progressValue:clamp01(progressValue), avgSystems:clamp01(avgSys), avgProjects:clamp01(avgProj), progressCombined, scorePriority });
  }

  // ---------- State ----------
  let theme = (localStorage.getItem('theme') || 'dark');
  document.documentElement.setAttribute('data-theme', theme);
  let timerInterval = null;
  let timerDeadline = 0;
  let timerRemainingMs = 0;
  let timerInitialMs = 0;
  let timerRunning = false;
  let timerCurrentLabel = '';
  let timerReturnFocus = null;

  const HIERARCHY_STATE_KEY = 'klaro:projectHierarchy';
  const projectHierarchyState = loadProjectHierarchyState();

  // ---------- Init ----------
  window.addEventListener('load', init);
  async function init(){
    db = await openDB();
    await loadParams();
    await seedIfEmpty();
    await autoSnapshotDaily();
    bindNav();
    // Attacher les gestionnaires des sous-menus après avoir relié la navigation principale
    bindObjectSubnav();
    bindReviewSubnav();
    bindTheme();
    bindPrivacy();
    bindForms();
    bindTables();
    bindDataOps();
    bindViews();
    bindRoutines();
    // Initialiser la personnalisation de la couleur d'accent
    bindAccentForm();
    // Attacher les liens interactifs pour les KPI du dashboard
    bindDashboardLinks();

    // Initialiser les filtres du dashboard (projets, responsables) une fois que la base est ouverte
    await populateDashboardFilters();
    // Charger les filtres mémorisés depuis localStorage
    try{
      const saved = JSON.parse(localStorage.getItem('klaro:dashboardFilters') || '{}');
      if (saved && typeof saved === 'object') Object.assign(dashboardFilters, saved);
    }catch(e){}

    // Bouton de téléchargement du rapport complet
    const btnRep = document.getElementById('btnDownloadReport');
    if (btnRep){
      btnRep.addEventListener('click', () => { downloadFullReport(); });
    }
    // Appliquer les filtres sauvegardés aux listes déroulantes
    const selTime = document.getElementById('filterTime');
    const selProj = document.getElementById('filterProject');
    const selOwner = document.getElementById('filterOwner');
    if (selTime && dashboardFilters.time) selTime.value = dashboardFilters.time;
    if (selProj && dashboardFilters.project) selProj.value = dashboardFilters.project;
    if (selOwner && dashboardFilters.owner) selOwner.value = dashboardFilters.owner;
    // Attacher les boutons d’application/réinitialisation des filtres
    const btnApply = document.getElementById('btnApplyFilters');
    const btnReset = document.getElementById('btnResetFilters');
    if (btnApply) btnApply.addEventListener('click', applyDashboardFilters);
    if (btnReset) btnReset.addEventListener('click', resetDashboardFilters);

    // Activer les boutons de réduction des panneaux du dashboard
    document.querySelectorAll('#view-dashboard .panel .collapse-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const panel = e.currentTarget.closest('.panel');
        if (panel){ panel.classList.toggle('collapsed'); }
      });
    });
    // Initialiser les cases "Sans date de fin" pour chaque formulaire
    initNoEndDateHandlers($('#formGlobal'));
    initNoEndDateHandlers($('#formSystem'));
    initNoEndDateHandlers($('#formProject'));
    initNoEndDateHandlers($('#formAction'));
    // Activer le basculement des options avancées sur les formulaires.
    bindAdvancedToggles();
    initObjectiveEditors();
    bindTimerControls();
    refreshAll();

    // Mettre à jour dynamiquement la version affichée dans l'entête pour qu'elle corresponde
    // à APP_VERSION. Cela évite de devoir modifier manuellement index.html à chaque
    // changement de version. Si l'élément .brand existe, on remplace son texte.
    const brandEl = document.querySelector('.brand');
    if (brandEl) {
      const offline = brandEl.textContent.includes('(offline)');
      brandEl.textContent = `📈 Klaro — v${APP_VERSION} ${offline ? '(offline)' : ''}`;
    }

    // Mettre à jour le titre du document avec la version actuelle. Lors du changement de vue,
    // showView() ajoutera le nom de la vue après le tiret.
    try {
      const parts = document.title.split('—');
      // Remplacer la partie version (après 'Planificateur')
      document.title = `Klaro — Planificateur v${APP_VERSION}`;
    } catch(e){}
    console.info(`%c${APP_NAME} v${APP_VERSION} initialisé`, 'color:#7fb4ff');

    // Lier le bouton Paramètres (icône engrenage) pour ouvrir la vue Paramètres.
    // Ce bouton n'est plus un onglet principal, il doit donc déclencher manuellement
    // l'affichage de la vue "params" lorsque l'utilisateur clique dessus. Sans cet
    // écouteur, l'icône ne fait rien et l'utilisateur ne peut pas accéder aux
    // paramètres. La fonction showView() gère l'activation de l'onglet caché
    // correspondant.
    const settingsBtn = document.getElementById('btnSettings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        try {
          showView('params');
        } catch (e) {
          console.warn('Impossible d’ouvrir la vue Paramètres', e);
        }
      });
    }
  }

  async function seedIfEmpty(){
    if ((await idb.getAll(db,'globals')).length) return;
    await saveEnums(defaultEnums); await saveThresholds(defaultThresholds); await saveCaps(defaultCaps);
    await idb.put(db,'templates', { name:'Projet eBook', actions:['Découverte client','Rédiger plan','Maquette V1','Landing page','Beta lecteurs'] });
    const g = { id:'G20250101-001', title:'Devenir créateur reconnu', description:'', domain:'Business', horizonYears:5, kpi:'CA annuel', baseline:0, target:100000, unit:'€', currentValue:35000, owner:'Florian', status:'En cours', priority:'Haute', risk:3, clarity:4, impact:5, urgency:3, startDate: fmtDate(new Date()), targetDate: fmtDate(new Date(new Date().getFullYear(),11,31)) };
    const s = { id:'S20250101-001', idGlobal:g.id, title:'Automatiser 60% des tâches', description:'Outils + SOP', kpi:'% auto', baseline:0, target:0.6, unit:'%', current:0.38, owner:'Florian', status:'En cours', priority:'Haute', startDate: fmtDate(new Date()), targetDate: fmtDate(new Date(new Date().getFullYear()+1,11,31)) };
    const p = { id:'P20250101-001', idGlobal:g.id, idSystem:s.id, title:"eBook 'Effort Juste'", hypothesis:"Valider l'appétence marché", indicator:'Ventes', target:200, unit:'unités', current:95, mode:'value', budget:2000, actualCost:800, revenue:1800, impact:4, confidence:0.7, effort:12, owner:'Florian', status:'En cours', priority:'Haute', risk:3,
      // Valeurs par défaut pour les nouveaux indicateurs Kairos : énergie ressentie, contribution, état d'énergie et risque de dilution
      energy: 10,
      contribution: 80,
      energyState: 'vivant',
      dilutionRisk: 'temps',
      startDate: fmtDate(new Date(new Date().getFullYear(),0,15)), plannedEnd: fmtDate(new Date(new Date().getFullYear(),11,31)), actualEnd:'', comments:'' };
    const a1 = { id:'A20250101-001', idProject:p.id, task:'Rédiger le plan détaillé', owner:'Florian', startDate: fmtDate(dateAddDays(today(),-4)), dueDate: fmtDate(dateAddDays(today(),-1)), doneDate: fmtDate(dateAddDays(today(),-1)), estHours:2, realHours:2, points:2, statusTask:'Fait', tag:'Rédaction', comments:'' };
    const a2 = { id:'A20250101-002', idProject:p.id, task:'Écrire le chap. 1', owner:'Florian', startDate: fmtDate(dateAddDays(today(),-1)), dueDate: fmtDate(dateAddDays(today(),2)), doneDate:'', estHours:3, realHours:0, points:3, statusTask:'En cours', tag:'Rédaction', comments:'' };
    const a3 = { id:'A20250101-003', idProject:p.id, task:'Mettre en page', owner:'Freelance', startDate: fmtDate(dateAddDays(today(),5)), dueDate: fmtDate(dateAddDays(today(),9)), doneDate:'', estHours:4, realHours:0, points:5, statusTask:'À faire', tag:'Design', comments:'' };
    await idb.put(db,'globals', g); await idb.put(db,'systems', s); await idb.put(db,'projects', p); await idb.put(db,'actions', a1); await idb.put(db,'actions', a2); await idb.put(db,'actions', a3);
  }

  async function autoSnapshotDaily(){
    const last = (await idb.get(db,'params','lastAutoSnapshot'))?.value || 0;
    if (Date.now() - last > 24*3600*1000){
      await createSnapshot(); await idb.put(db,'params',{key:'lastAutoSnapshot', value: Date.now()});
    }
  }

  // ---------- Navigation & Theme & Privacy ----------
  function bindNav(){ $$('.nav-btn').forEach(b => b.addEventListener('click', () => showView(b.dataset.nav))); }

  // Sous-menu objet : gérer les clics sur les sous-onglets (globaux, systèmes, projets,
  // actions, routines). Cette fonction affiche la vue correspondante tout en laissant
  // actif le bouton principal "Objet" et en mettant à jour l'état du sous-menu.
  function bindObjectSubnav(){
    const subnav = document.getElementById('objectSubnav');
    if (!subnav) return;
    subnav.querySelectorAll('.subnav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.subview;
        // Afficher la vue correspondante via showView
        showView(target);
        // Laisser l'onglet principal "Objet" actif
        const navObjs = document.querySelectorAll('.nav-btn');
        navObjs.forEach(nb => {
          if (nb.dataset.nav === 'objects'){
            nb.classList.add('active');
            nb.setAttribute('aria-pressed','true');
          } else if (nb.dataset.nav === target){
            // Ne pas marquer l'onglet spécifique comme actif dans le menu principal
            nb.classList.remove('active');
            nb.setAttribute('aria-pressed','false');
          }
        });
        // Mettre à jour l'état des boutons du sous-menu
        subnav.querySelectorAll('.subnav-btn').forEach(b => {
          const on = b === btn;
          b.setAttribute('aria-pressed', String(on));
        });
        // Veiller à ce que le sous-menu reste visible
        subnav.classList.remove('hidden');
      });
    });
  }

  // Sous-menu review : gérer les clics sur le sous-onglet Red-Team.
  function bindReviewSubnav(){
    const subnav = document.getElementById('reviewSubnav');
    if (!subnav) return;
    subnav.querySelectorAll('.subnav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.review;
        // Afficher la vue correspondante
        showView(target);
        // Laisser l'onglet principal "Review" actif
        document.querySelectorAll('.nav-btn').forEach(nb => {
          if (nb.dataset.nav === 'review'){
            nb.classList.add('active');
            nb.setAttribute('aria-pressed','true');
          } else if (nb.dataset.nav === target){
            nb.classList.remove('active');
            nb.setAttribute('aria-pressed','false');
          }
        });
        // Mettre à jour l'état des boutons du sous-menu
        subnav.querySelectorAll('.subnav-btn').forEach(b => {
          const on = b === btn;
          b.setAttribute('aria-pressed', String(on));
        });
        subnav.classList.remove('hidden');
      });
    });
  }
  function showView(name){
    // Gérer l'affichage des vues et le menu principal. Si l'onglet "Objet" est
    // sélectionné, nous affichons la sous‑navigation et basculons par défaut
    // sur la vue des objectifs globaux. Sinon, nous masquons la sous‑navigation.
    document.querySelectorAll('.view').forEach(v => v.classList.remove('show'));
    const subnavObj = document.getElementById('objectSubnav');
    const subnavRev = document.getElementById('reviewSubnav');
    if (name === 'objects'){
      // Par défaut, afficher la vue Globaux lorsque l'on clique sur Objet
      const def = document.getElementById('view-globals');
      if (def) def.classList.add('show');
      if (subnavObj) subnavObj.classList.remove('hidden');
      if (subnavRev) subnavRev.classList.add('hidden');
      // Activer le premier bouton du sous-menu Objet
      if (subnavObj) subnavObj.querySelectorAll('.subnav-btn').forEach((b,i) => {
        const active = (i===0);
        b.setAttribute('aria-pressed', String(active));
      });
    } else if (name === 'review'){
      // Afficher par défaut la vue RedTeam
      const def = document.getElementById('view-redteam');
      if (def) def.classList.add('show');
      if (subnavRev) subnavRev.classList.remove('hidden');
      if (subnavObj) subnavObj.classList.add('hidden');
      // Activer le premier bouton du sous-menu Review
      if (subnavRev) subnavRev.querySelectorAll('.subnav-btn').forEach((b,i) => {
        const active = (i===0);
        b.setAttribute('aria-pressed', String(active));
      });
    } else {
      // Afficher la vue correspondante et masquer les sous-menus
      const view = document.getElementById('view-'+name);
      if (view) view.classList.add('show');
      if (subnavObj) subnavObj.classList.add('hidden');
      if (subnavRev) subnavRev.classList.add('hidden');
    }
    // Mettre à jour l'état des boutons de navigation principaux
    document.querySelectorAll('.nav-btn').forEach(b => {
      const on = (b.dataset.nav===name);
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    // Mettre à jour le titre de la page
    try{
      const baseTitle = (document.title.split(' — ')[0] || 'Klaro');
      if (name === 'objects'){
        document.title = baseTitle + ' — Objet';
      } else {
        document.title = baseTitle + ' — ' + name.charAt(0).toUpperCase()+name.slice(1);
      }
    }catch(e){}
    if (typeof refreshView==='function') refreshView(name);
  }
  function bindTheme(){ $('#btnTheme').addEventListener('click', () => { theme = (theme==='dark'?'light':'dark'); document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }); }
  function bindPrivacy(){ $('#btnPrivacy').addEventListener('click', async ()=> { await setPrivacyState(privacy==='on'?'off':'on'); showToast(privacy==='on'?'Confidentialité ON':'Confidentialité OFF'); refreshAll(); }); }

  // ---------- Forms & Tables ----------
  function bindForms(){
    // Globals
    $('#btnAddGlobal').addEventListener('click', () => openForm('global'));
    $('#cancelGlobal').addEventListener('click', () => $('#formGlobal').classList.add('collapsed'));
    $('#formGlobal').addEventListener('submit', handleGlobalSubmit);
    // Systems
    $('#btnAddSystem').addEventListener('click', () => openForm('system'));
    $('#cancelSystem').addEventListener('click', () => $('#formSystem').classList.add('collapsed'));
    $('#formSystem').addEventListener('submit', handleSystemSubmit);
    // Projects
    $('#btnAddProject').addEventListener('click', () => openForm('project'));
    $('#cancelProject').addEventListener('click', () => $('#formProject').classList.add('collapsed'));
    $('#formProject').addEventListener('submit', handleProjectSubmit);
    // Actions
    $('#btnAddAction').addEventListener('click', () => openForm('action'));
    $('#cancelAction').addEventListener('click', () => $('#formAction').classList.add('collapsed'));
    $('#formAction').addEventListener('submit', handleActionSubmit);
  }
  function bindTables(){
    $('#searchGlobals').addEventListener('input', refreshGlobals);
    $('#searchSystems').addEventListener('input', refreshSystems);
    $('#searchProjects').addEventListener('input', refreshProjects);
    $('#searchActions').addEventListener('input', refreshActions);
    makeSortable($('#tblGlobals'), refreshGlobals);
    makeSortable($('#tblSystems'), refreshSystems);
    makeSortable($('#tblProjects'), refreshProjects);
    makeSortable($('#tblActions'), refreshActions);
    // Make archived tables sortable if they exist
    const tblArchAct = document.getElementById('tblArchivedActions');
    if (tblArchAct) makeSortable(tblArchAct, refreshArchives);
    const tblArchRtn = document.getElementById('tblArchivedRoutines');
    if (tblArchRtn) makeSortable(tblArchRtn, refreshArchives);
    // Bulk
    $('#selAllProjects').addEventListener('change', (e)=>{ $$('#tblProjects tbody input[type=checkbox]').forEach(c=>c.checked=e.target.checked); updateBulkBar('projects'); });
    $('#bulkProjects').addEventListener('click', handleBulkProjects);
    $('#selAllActions').addEventListener('change', (e)=>{ $$('#tblActions tbody input[type=checkbox]').forEach(c=>c.checked=e.target.checked); updateBulkBar('actions'); });
    $('#bulkActions').addEventListener('click', handleBulkActions);
    bindProjectHierarchyControls();
  }
  function bindDataOps(){
    // Templates
    if (document.getElementById('formTemplate')){
      document.getElementById('formTemplate').addEventListener('submit', saveTemplate);
      document.getElementById('btnApplyTpl').addEventListener('click', async (e)=>{ e.preventDefault(); await applyTemplate(); });
      refreshTplSelect();
    }

    // Export/Import
    $('#btnExport').addEventListener('click', exportJSON);
    $('#btnExportProjectsCSV').addEventListener('click', () => exportCSV('projects'));
    $('#btnExportActionsCSV').addEventListener('click', () => exportCSV('actions'));
    $('#btnImportJSON').addEventListener('click', importJSON);
    $('#btnImportProjectsCSV').addEventListener('click', ()=> importCSV('projects'));
    $('#btnImportActionsCSV').addEventListener('click', ()=> importCSV('actions'));
    const formCustomExport = document.getElementById('formCustomExport');
    if (formCustomExport){ formCustomExport.addEventListener('submit', handleCustomExport); }
    const formCustomImport = document.getElementById('formCustomImport');
    if (formCustomImport){ formCustomImport.addEventListener('submit', handleCustomImport); }
    // Integrity & snapshots
    $('#btnScanIntegrity').addEventListener('click', scanIntegrity);
    $('#btnSnapshot').addEventListener('click', createSnapshot);
    // Files
    $('#btnUpload').addEventListener('click', uploadFiles);
  }
  function bindViews(){
    // tabs in Params
    const tabsRoot = document.getElementById('paramsTabs');
    if (tabsRoot){
      const tabs = Array.from(tabsRoot.querySelectorAll('.tab'));
      const panels = tabs.map(tab => document.getElementById(tab.dataset.tab)).filter(Boolean);
      const activateTab = (tab) => {
        tabs.forEach(btn => {
          const isActive = btn === tab;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
          btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        panels.forEach(panel => {
          const isActive = panel.id === tab.dataset.tab;
          panel.classList.toggle('show', isActive);
          panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });
        const targetPanel = document.getElementById(tab.dataset.tab);
        if (targetPanel){
          if (!targetPanel.hasAttribute('tabindex')) targetPanel.setAttribute('tabindex','-1');
          if (tab.dataset.tab === 'p-data'){ refreshData(); }
          setTimeout(() => targetPanel.focus(), 0);
        }
      };
      tabs.forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn));
        const isActive = btn.classList.contains('active');
        btn.setAttribute('aria-selected', String(isActive));
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      panels.forEach(panel => {
        if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex','-1');
        panel.setAttribute('aria-hidden', panel.classList.contains('show') ? 'false' : 'true');
      });
      tabsRoot.addEventListener('keydown', ev => {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft' && ev.key !== 'Home' && ev.key !== 'End') return;
        ev.preventDefault();
        const currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex === -1) return;
        let nextIndex = currentIndex;
        if (ev.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        else if (ev.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (ev.key === 'Home') nextIndex = 0;
        else if (ev.key === 'End') nextIndex = tabs.length - 1;
        const nextTab = tabs[nextIndex];
        nextTab.focus();
        activateTab(nextTab);
      });
    }
    // watchlist
    const addBtn = $('#wl-add-btn');
    if (addBtn){
      addBtn.addEventListener('click', ()=>{
        const inp = $('#wl-add-project'); const val = (inp.value||'').trim(); if (!val) return;
        const wl = getWatchlist(); if (!wl.includes(val)) wl.push(val); setWatchlist(wl); paintWatchlist();
        inp.value='';
      });
    }
    // Attacher la barre d’auto‑priorisation : lorsque l’utilisateur clique sur le bouton,
    // on active le tri automatique selon le score calculé et on déclenche le rafraîchissement
    // de la liste des actions. La valeur courante d’énergie est lue depuis l’input correspondant.
    const btnAuto = document.getElementById('btnAutoPrioritize');
    if (btnAuto){
      btnAuto.addEventListener('click', () => {
        autoPrioActive = true;
        // Rafraîchit la liste pour appliquer le classement par score
        refreshActions();
      });
    }

    // ----- Initialisation Red‑Team -----
    // Charger les entrées Red‑Team depuis le stockage et préparer la vue
    loadRedTeam();
    refreshRedTeam();
    // Lier les actions sur le formulaire Red‑Team (commit, dismiss, cancel)
    const formRT = document.getElementById('formRedTeam');
    if (formRT){
      formRT.addEventListener('submit', handleRedTeamCommit);
    }
    const btnDismissRT = document.getElementById('btnRedTeamDismiss');
    if (btnDismissRT){ btnDismissRT.addEventListener('click', handleRedTeamDismiss); }
    const btnCancelRT = document.getElementById('btnRedTeamCancel');
    if (btnCancelRT){ btnCancelRT.addEventListener('click', () => {
      formRT.classList.add('collapsed');
    }); }

    // Initialiser les routines vues individuelles (doneRoutineToday)
    loadDoneRoutineToday();


    // routine mode selection (Court/Normal/Long)
    // Charger le mode sauvegardé depuis localStorage (klaro:routineViewMode) et
    // persister toute modification. Cela permet de conserver la sélection
    // même après fermeture du navigateur.
    const savedMode = localStorage.getItem('klaro:routineViewMode');
    if (savedMode){ routineViewMode = savedMode; }
    const modeInputs = document.querySelectorAll('.view-mode-select input[name=viewMode]');
    modeInputs.forEach(inp => {
      // Cocher le bouton radio correspondant si un mode a été enregistré
      if (savedMode && inp.value === savedMode) inp.checked = true;
      inp.addEventListener('change', () => {
        if (inp.checked){
          routineViewMode = inp.value || 'short';
          localStorage.setItem('klaro:routineViewMode', routineViewMode);
          refreshViews();
        }
      });
    });
  
    try { af_bindActionFirst(); } catch(e) { /* optional */ }
}

  /**
   * Attache des gestionnaires aux boutons d’options avancées sur les formulaires.
   * Chaque bouton doit avoir un attribut aria-controls pointant vers un conteneur
   * d’options avancées (div.advanced-options). Le conteneur est masqué par
   * défaut (hidden). Au clic, on inverse l’état hidden et on met à jour
   * aria-expanded et le libellé du bouton (+/− Options avancées).
   */
  function bindAdvancedToggles(){
    document.querySelectorAll('.toggle-advanced').forEach(btn => {
      const targetId = btn.getAttribute('aria-controls');
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      btn.addEventListener('click', () => {
        const isHidden = target.hasAttribute('hidden');
        if (isHidden) {
          target.removeAttribute('hidden');
          btn.setAttribute('aria-expanded','true');
          // Mettre à jour l’intitulé pour indiquer la possibilité de replier
          btn.textContent = '− Options avancées';
        } else {
          target.setAttribute('hidden','');
          btn.setAttribute('aria-expanded','false');
          btn.textContent = '+ Options avancées';
        }
      });
    });
  }

  function ensureObjectiveBaseline(targetId){
    const container = document.getElementById(targetId);
    if (!container) return;
    const currentTypes = Array.from(container.querySelectorAll('select[data-field=type]')).map(sel => sel.value);
    for (const req of REQUIRED_OBJECTIVE_TYPES){
      if (!currentTypes.includes(req)){
        addObjectiveRow(targetId, { type:req });
      }
    }
    while (container.children.length < 3){
      addObjectiveRow(targetId, {});
    }
  }

  function addObjectiveRow(targetId, data={}){
    const container = document.getElementById(targetId);
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'objective-item';
    const existingTypes = Array.from(container.querySelectorAll('select[data-field=type]')).map(sel => sel.value);
    let type = data.type || REQUIRED_OBJECTIVE_TYPES.find(t => !existingTypes.includes(t)) || 'quality';
    if (!OBJECTIVE_TYPES.some(o => o.value === type)) type = 'quality';
    const select = document.createElement('select');
    select.dataset.field = 'type';
    OBJECTIVE_TYPES.forEach(optData => {
      const opt = document.createElement('option');
      opt.value = optData.value;
      opt.textContent = optData.label;
      if (opt.value === type) opt.selected = true;
      select.appendChild(opt);
    });
    const input = document.createElement('input');
    input.dataset.field = 'description';
    input.placeholder = 'Décrire l’objectif…';
    input.value = data.description || '';
    input.required = true;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'secondary';
    removeBtn.textContent = '🗑️';
    removeBtn.title = 'Supprimer cet objectif';
    removeBtn.addEventListener('click', () => {
      row.remove();
      ensureObjectiveBaseline(targetId);
    });
    row.appendChild(select);
    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }

  function resetObjectives(targetId, objectives){
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = '';
    if (Array.isArray(objectives) && objectives.length){
      for (const obj of objectives){
        if (!obj) continue;
        addObjectiveRow(targetId, { type: obj.type, description: obj.description || obj.label || '' });
      }
    }
    ensureObjectiveBaseline(targetId);
  }

  function collectObjectives(targetId){
    const container = document.getElementById(targetId);
    if (!container) return [];
    const rows = Array.from(container.querySelectorAll('.objective-item'));
    return rows.map(row => {
      const typeSel = row.querySelector('select[data-field=type]');
      const descInput = row.querySelector('input[data-field=description]');
      return {
        type: (typeSel?.value || '').trim(),
        description: (descInput?.value || '').trim()
      };
    }).filter(obj => obj.description);
  }

  function validateObjectives(list){
    if (!Array.isArray(list) || list.length < 3) return false;
    const types = new Set(list.map(obj => obj.type));
    return REQUIRED_OBJECTIVE_TYPES.every(t => types.has(t));
  }

  function initObjectiveEditors(){
    document.querySelectorAll('[data-add-objective]').forEach(btn => {
      const targetId = btn.getAttribute('data-add-objective');
      if (!targetId) return;
      btn.addEventListener('click', () => {
        addObjectiveRow(targetId, {});
      });
    });
    ['systemObjectives','actionObjectives','routineObjectives'].forEach(id => ensureObjectiveBaseline(id));
  }

  function resetAdvancedSections(form){
    if (!form) return;
    form.querySelectorAll('.advanced-options').forEach(section => {
      section.setAttribute('hidden','');
    });
    form.querySelectorAll('.toggle-advanced').forEach(btn => {
      btn.setAttribute('aria-expanded','false');
      btn.textContent = '+ Options avancées';
    });
  }

  function normalizeIdList(val){
    if (Array.isArray(val)) return val.map(v => String(v));
    if (val==null) return [];
    return [String(val)];
  }

  function loadProjectHierarchyState(){
    try {
      const stored = JSON.parse(localStorage.getItem(HIERARCHY_STATE_KEY) || '{}');
      return {
        focus: stored.focus || '__all',
        includeDescendants: stored.includeDescendants !== false
      };
    } catch(err){
      return { focus:'__all', includeDescendants:true };
    }
  }
  function saveProjectHierarchyState(){
    localStorage.setItem(HIERARCHY_STATE_KEY, JSON.stringify(projectHierarchyState));
  }
  function syncProjectHierarchyControls(){
    const select = document.getElementById('projectHierarchySelect');
    if (select){
      const options = Array.from(select.options).map(opt => opt.value);
      if (!options.includes(projectHierarchyState.focus)){
        projectHierarchyState.focus = '__all';
        saveProjectHierarchyState();
      }
      select.value = projectHierarchyState.focus;
    }
    const cb = document.getElementById('projectHierarchyIncludeDesc');
    if (cb){
      cb.checked = projectHierarchyState.includeDescendants;
    }
  }
  function resetProjectHierarchyState(){
    projectHierarchyState.focus = '__all';
    projectHierarchyState.includeDescendants = true;
    saveProjectHierarchyState();
    syncProjectHierarchyControls();
    refreshProjects();
  }
  function setProjectHierarchyFocus(value, includeDesc = projectHierarchyState.includeDescendants){
    projectHierarchyState.focus = value || '__all';
    projectHierarchyState.includeDescendants = includeDesc;
    saveProjectHierarchyState();
    syncProjectHierarchyControls();
    refreshProjects();
  }
  function createAncestorResolver(projects){
    const rawMap = new Map((projects||[]).map(p => [p.id, p]));
    const memo = new Map();
    function ancestors(id, stack = new Set()){
      if (memo.has(id)) return memo.get(id);
      const proj = rawMap.get(id);
      if (!proj) return [];
      const parents = normalizeIdList(proj.parentProjects).map(v => v.trim()).filter(Boolean);
      let result = [];
      for (const parentId of parents){
        if (stack.has(parentId)) continue;
        const nextStack = new Set(stack);
        nextStack.add(parentId);
        const parentAnc = ancestors(parentId, nextStack);
        result = result.concat(parentAnc);
        result.push(parentId);
      }
      const uniq = result.filter((v,i,arr) => arr.indexOf(v) === i);
      memo.set(id, uniq);
      return uniq;
    }
    return { ancestors, rawMap };
  }
  function collectDescendantsFromMap(id, childMap){
    const visited = new Set();
    const stack = [...(childMap.get(id) || [])];
    const out = [];
    while (stack.length){
      const current = stack.pop();
      if (visited.has(current)) continue;
      visited.add(current);
      out.push(current);
      const children = childMap.get(current) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) stack.push(childId);
      });
    }
    return out;
  }
  function paintProjectHierarchySelect(projects, titleById, childMap){
    const select = document.getElementById('projectHierarchySelect');
    if (!select) return;
    const visited = new Set();
    const options = [
      { value:'__all', label:'Tous les projets' },
      { value:'__root', label:'Racine (sans parent)' }
    ];
    const sorted = (projects||[]).slice().sort((a,b)=> (a.title||a.id||'').localeCompare(b.title||b.id||'', 'fr', { numeric:true, sensitivity:'base' }));
    const roots = sorted.filter(p => normalizeIdList(p.parentProjects).length === 0);
    const addNode = (id, depth=0) => {
      if (!id || visited.has(id)) return;
      visited.add(id);
      const label = titleById.get(id) || id;
      const prefix = depth ? ' '.repeat(depth*2) + '↳ ' : '';
      options.push({ value:id, label: prefix + label });
      const children = (childMap.get(id) || []).slice().sort((a,b)=> (titleById.get(a)||a).localeCompare(titleById.get(b)||b, 'fr', { numeric:true, sensitivity:'base' }));
      children.forEach(childId => addNode(childId, depth+1));
    };
    roots.forEach(root => addNode(root.id, 0));
    sorted.forEach(p => addNode(p.id, 0));
    select.innerHTML = '';
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    syncProjectHierarchyControls();
  }
  function bindProjectHierarchyControls(){
    const select = document.getElementById('projectHierarchySelect');
    if (select){
      select.addEventListener('change', () => {
        setProjectHierarchyFocus(select.value);
      });
    }
    const cb = document.getElementById('projectHierarchyIncludeDesc');
    if (cb){
      cb.addEventListener('change', () => {
        projectHierarchyState.includeDescendants = cb.checked;
        saveProjectHierarchyState();
        refreshProjects();
      });
    }
    const resetBtn = document.getElementById('projectHierarchyReset');
    if (resetBtn){
      resetBtn.addEventListener('click', () => resetProjectHierarchyState());
    }
    syncProjectHierarchyControls();
  }

  // ---------- Timer helpers ----------
  function handleTimerActivation(cell){
    if (!cell) return;
    const minutes = Number(cell.dataset.minutes || 0);
    if (!minutes) return;
    const label = cell.dataset.label || 'Action';
    openTimerModal(label, minutes);
  }
  function handleTimeCellClick(event){
    event.preventDefault();
    handleTimerActivation(event.currentTarget);
  }
  function handleTimeCellKey(event){
    if (event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      handleTimerActivation(event.currentTarget);
    }
  }
  function openTimerModal(label, minutes){
    const modal = document.getElementById('timerModal');
    if (!modal) return;
    timerCurrentLabel = label || 'Action';
    const active = document.activeElement;
    timerReturnFocus = (active && typeof active.focus === 'function') ? active : null;
    const title = document.getElementById('timerTitle');
    if (title) title.textContent = `Chronomètre — ${timerCurrentLabel}`;
    const toggle = document.getElementById('timerToggle');
    if (toggle){
      toggle.dataset.state = 'running';
      toggle.textContent = '⏸️ Pause';
    }
    const msg = document.getElementById('timerMessage');
    if (msg) msg.textContent = '';
    const minutesValue = Math.max(0, Number(minutes) || 0);
    timerInitialMs = Math.max(1000, Math.round(minutesValue * 60000));
    timerRemainingMs = timerInitialMs;
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    updateTimerDisplay();
    startTimerCountdown();
    toggle?.focus();
  }
  function startTimerCountdown(){
    clearInterval(timerInterval);
    timerDeadline = Date.now() + timerRemainingMs;
    timerRunning = true;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timerRemainingMs = Math.max(0, timerDeadline - Date.now());
      updateTimerDisplay();
      if (timerRemainingMs <= 0){
        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;
        const toggle = document.getElementById('timerToggle');
        if (toggle){ toggle.dataset.state = 'paused'; toggle.textContent = '▶️ Reprendre'; }
        const msg = document.getElementById('timerMessage');
        if (msg) msg.textContent = 'Temps écoulé !';
      }
    }, 500);
  }
  function pauseTimer(updateToggle=true){
    if (timerInterval){
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (timerRunning){
      timerRemainingMs = Math.max(0, timerDeadline - Date.now());
      timerRunning = false;
    }
    if (updateToggle){
      const toggle = document.getElementById('timerToggle');
      if (toggle){ toggle.dataset.state = 'paused'; toggle.textContent = '▶️ Reprendre'; }
    }
  }
  function resumeTimer(){
    if (timerRemainingMs <= 0){
      timerRemainingMs = timerInitialMs > 0 ? timerInitialMs : 60000;
    }
    const msg = document.getElementById('timerMessage');
    if (msg) msg.textContent = '';
    const toggle = document.getElementById('timerToggle');
    if (toggle){ toggle.dataset.state = 'running'; toggle.textContent = '⏸️ Pause'; }
    startTimerCountdown();
  }
  function restartTimer(){
    timerRemainingMs = timerInitialMs > 0 ? timerInitialMs : 60000;
    const msg = document.getElementById('timerMessage');
    if (msg) msg.textContent = '';
    const toggle = document.getElementById('timerToggle');
    if (toggle){ toggle.dataset.state = 'running'; toggle.textContent = '⏸️ Pause'; }
    startTimerCountdown();
  }
  function closeTimerModal(){
    const modal = document.getElementById('timerModal');
    if (!modal) return;
    pauseTimer(false);
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    if (timerReturnFocus && typeof timerReturnFocus.focus === 'function'){
      try { timerReturnFocus.focus(); } catch(e){}
    }
    timerReturnFocus = null;
  }
  function updateTimerDisplay(){
    const countdownEl = document.getElementById('timerCountdown');
    if (!countdownEl) return;
    const remaining = Math.max(0, Math.round(timerRemainingMs / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    countdownEl.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }
  function bindTimerControls(){
    const toggle = document.getElementById('timerToggle');
    if (toggle){
      toggle.dataset.state = 'running';
      toggle.addEventListener('click', () => {
        if (toggle.dataset.state === 'running'){
          pauseTimer();
        } else {
          resumeTimer();
        }
      });
    }
    const resetBtn = document.getElementById('timerReset');
    if (resetBtn){ resetBtn.addEventListener('click', restartTimer); }
    const closeBtn = document.getElementById('timerClose');
    if (closeBtn){ closeBtn.addEventListener('click', closeTimerModal); }
    const modal = document.getElementById('timerModal');
    if (modal){
      modal.addEventListener('click', (ev) => { if (ev.target === modal) closeTimerModal(); });
    }
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape'){
        const modalEl = document.getElementById('timerModal');
        if (modalEl && !modalEl.hidden){
          closeTimerModal();
        }
      }
    });
  }

  // Attacher des comportements aux cartes KPI du tableau de bord.
  function bindDashboardLinks(){
    // Associer chaque KPI à une vue ou une action de navigation. Lorsqu'on clique
    // sur une carte, on appelle showView() avec la vue correspondante. Ceci
    // permet un accès rapide aux listes concernées (objets, projets, actions,
    // routines, red-team). Certaines cartes (Projets en retard, Actions en retard,
    // Alertes) pointent vers les mêmes vues car les filtres seront appliqués
    // automatiquement via la barre de filtres.
    const map = {
      kpiGlobalCount:'globals', kpiGlobalAvg:'globals',
      kpiSysCount:'systems', kpiSysAvg:'systems',
      kpiProjCount:'projects', kpiProjAvg:'projects', kpiLateCount:'projects',
      kpiActionOpen:'actions', kpiActionLate:'actions',
      kpiRoutineCount:'routines', kpiRoutineTasksToday:'views',
      kpiAlerts:'actions', kpiRedTeamPending:'redteam'
    };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const card = el.closest('.card');
      if (!card) return;
      card.classList.add('clickable');
      if (!card.dataset.linked){
        card.addEventListener('click', () => {
          const target = map[id];
          if (target) showView(target);
        });
        card.dataset.linked = 'true';
      }
    });
  }

  /**
   * Remplit les listes déroulantes du tableau de bord (projets, responsables)
   * en se basant sur les données actuellement stockées en base. Cette
   * fonction est appelée à l'initialisation et peut être rappelée si des
   * projets ou des collaborateurs sont ajoutés/supprimés.
   */
  async function populateDashboardFilters(){
    const selProj = document.getElementById('filterProject');
    const selOwner = document.getElementById('filterOwner');
    if (!selProj || !selOwner) return;
    // Sauvegarder la valeur sélectionnée pour la restaurer après remplissage
    const prevProj = selProj.value;
    const prevOwner = selOwner.value;
    const [projects, actions] = await Promise.all([ idb.getAll(db,'projects'), idb.getAll(db,'actions') ]);
    // Construire la liste des projets
    selProj.innerHTML = '<option value="all">Tous</option>';
    (projects||[]).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.title || p.id;
      if (p.id === prevProj) opt.selected = true;
      selProj.appendChild(opt);
    });
    // Construire la liste des responsables (collaborateurs). Utiliser owners
    // présents dans les actions ainsi que la liste des collaborateurs définie dans enums.
    const ownersSet = new Set();
    (actions||[]).forEach(a => { if (a.owner) ownersSet.add(a.owner); });
    (defaultEnums.collaborators||[]).forEach(o => ownersSet.add(o));
    selOwner.innerHTML = '<option value="all">Tous</option>';
    Array.from(ownersSet).forEach(o => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      if (o === prevOwner) opt.selected = true;
      selOwner.appendChild(opt);
    });
  }

  /**
   * Applique les filtres sélectionnés dans la barre de filtres et rafraîchit
   * le tableau de bord. Les valeurs sont conservées dans l'objet
   * dashboardFilters pour être utilisées par refreshDashboard().
   */
  function applyDashboardFilters(){
    const selTime = document.getElementById('filterTime');
    const selProj = document.getElementById('filterProject');
    const selOwner = document.getElementById('filterOwner');
    if (selTime) dashboardFilters.time = selTime.value || 'all';
    if (selProj) dashboardFilters.project = selProj.value || 'all';
    if (selOwner) dashboardFilters.owner = selOwner.value || 'all';
    // Sauvegarder dans localStorage pour mémoire persistante
    try{
      localStorage.setItem('klaro:dashboardFilters', JSON.stringify(dashboardFilters));
    }catch(e){}
    refreshDashboard();
  }

  /**
   * Réinitialise les filtres de dashboard et déclenche un rafraîchissement.
   */
  function resetDashboardFilters(){
    dashboardFilters.time = 'all';
    dashboardFilters.project = 'all';
    dashboardFilters.owner = 'all';
    const selTime = document.getElementById('filterTime');
    const selProj = document.getElementById('filterProject');
    const selOwner = document.getElementById('filterOwner');
    if (selTime) selTime.value = 'all';
    if (selProj) selProj.value = 'all';
    if (selOwner) selOwner.value = 'all';
    try{
      localStorage.setItem('klaro:dashboardFilters', JSON.stringify(dashboardFilters));
    }catch(e){}
    refreshDashboard();
  }

  function openForm(kind, data=null){
    if (kind==='global'){
      fillGlobalSelects();
      const form = $('#formGlobal');
      resetAdvancedSections(form);
      form.classList.remove('collapsed');
      $('#titleGlobalForm').textContent = data?`Modifier ${data.id}`:'Nouvel objectif global';
      formSet(form, data||{});
      form.dataset.editing = data?data.id:'';
      updateNoEndDateState(form);
    }else if(kind==='system'){
      fillSystemSelects();
      const form = $('#formSystem');
      resetAdvancedSections(form);
      form.classList.remove('collapsed');
      $('#titleSystemForm').textContent = data?`Modifier ${data.id}`:'Nouvel objectif système';
      formSet(form, data||{});
      form.dataset.editing = data?data.id:'';
      resetObjectives('systemObjectives', data?.objectives || []);
      updateNoEndDateState(form);
    }else if(kind==='project'){
      const form = $('#formProject');
      form.dataset.editing = data?data.id:'';
      fillProjectSelects(form.dataset.editing || '');
      resetAdvancedSections(form);
      form.classList.remove('collapsed');
      $('#titleProjectForm').textContent = data?`Modifier ${data.id}`:'Nouveau projet';
      formSet(form, data||{});
      form.dataset.editing = data?data.id:'';
      updateNoEndDateState(form);
    }else if(kind==='action'){
      fillActionSelects();
      const form = $('#formAction');
      resetAdvancedSections(form);
      form.classList.remove('collapsed');
      $('#titleActionForm').textContent = data?`Modifier ${data.id}`:'Nouvelle action';
      formSet(form, data||{});
      form.dataset.editing = data?data.id:'';
      resetObjectives('actionObjectives', data?.objectives || []);
      updateNoEndDateState(form);
      // Définir la date d'échéance par défaut à aujourd'hui pour les nouvelles actions
      if (!data){
        const dd = form.querySelector('input[name=dueDate]');
        if (dd && !dd.value){ dd.value = fmtDate(today()); }
      }
    }
    window.scrollTo({ top: 0, behavior:'smooth' });
  }

  function formGet(form){
    const o={};
    const fd = new FormData(form);
    for (const [k,v] of fd.entries()){
      if (o[k]===undefined){
        o[k]=v;
      } else if (Array.isArray(o[k])){
        o[k].push(v);
      } else {
        o[k] = [o[k], v];
      }
    }
    return o;
  }
  function formSet(form,data){
    for (const el of Array.from(form.elements)){
      if (!el.name) continue;
      const val = data[el.name];
      if (val==null) continue;
      if (el.type === 'checkbox'){
        if (Array.isArray(val)) el.checked = val.includes(el.value);
        else el.checked = val === true || val === 'true' || val === el.value;
      } else if (el.type === 'radio'){
        el.checked = val === el.value;
      } else if (el.tagName === 'SELECT' && el.multiple){
        const values = Array.isArray(val) ? val.map(String) : [String(val)];
        Array.from(el.options).forEach(opt => { opt.selected = values.includes(opt.value); });
      } else {
        el.value = val;
      }
    }
  }

  async function handleGlobalSubmit(e){
    e.preventDefault(); const f=e.currentTarget, g=formGet(f);
    if (Number(g.target)<Number(g.baseline)) return alert('Cible doit être > Baseline');
    const editingId = f.dataset.editing || '';
    const existing = editingId ? await idb.get(db,'globals', editingId) : null;
    const id = editingId || await nextId('G','globals');
    const obj = existing ? { ...existing } : {};
    Object.assign(obj, { id, title:g.title||'', description:g.description||'', domain:g.domain||'', horizonYears:Number(g.horizonYears)||0, kpi:g.kpi||'', baseline:Number(g.baseline)||0, target:Number(g.target)||0, unit:g.unit||'', currentValue:Number(g.currentValue)||0, owner:g.owner||'', status:g.status||'', priority:g.priority||'', risk:Number(g.risk)||0, clarity:Number(g.clarity)||0, impact:Number(g.impact)||0, urgency:Number(g.urgency)||0, startDate:g.startDate||'', targetDate:g.targetDate||'' });
    ensureValidationMetadata('globals', existing, obj);
    await idb.put(db,'globals', obj); await audit(editingId?'update':'create','globals', id); f.classList.add('collapsed'); f.reset(); showToast('Objectif global enregistré'); refreshGlobals();
  }
  async function handleSystemSubmit(e){
    e.preventDefault(); const f=e.currentTarget, s=formGet(f);
    if (Number(s.target)<Number(s.baseline)) return alert('Cible doit être > Baseline');
    const editingId = f.dataset.editing || '';
    const existing = editingId ? await idb.get(db,'systems', editingId) : null;
    const id = editingId || await nextId('S','systems');
    const obj = existing ? { ...existing } : {};
    const objectives = collectObjectives('systemObjectives');
    if (!validateObjectives(objectives)) return alert('Ajoutez au moins trois objectifs (temps, résultat, méthode) pour ce système.');
    Object.assign(obj, { id, idGlobal:s.idGlobal||'', title:s.title||'', description:s.description||'', kpi:s.kpi||'', baseline:Number(s.baseline)||0, target:Number(s.target)||0, unit:s.unit||'', current:Number(s.current)||0, owner:s.owner||'', status:s.status||'', priority:s.priority||'', startDate:s.startDate||'', targetDate:s.targetDate||'' });
    obj.objectives = objectives;
    ensureValidationMetadata('systems', existing, obj);
    await idb.put(db,'systems', obj); await audit(editingId?'update':'create','systems', id); f.classList.add('collapsed'); f.reset(); resetObjectives('systemObjectives', []); showToast('Objectif système enregistré'); refreshSystems();
  }
  async function handleProjectSubmit(e){
    e.preventDefault(); const f=e.currentTarget, p=formGet(f);
    const editingId = f.dataset.editing || '';
    const existing = editingId ? await idb.get(db,'projects', editingId) : null;
    const id = editingId || await nextId('P','projects');
    const obj = existing ? { ...existing } : {};
    Object.assign(obj, { id,
      idGlobal:p.idGlobal||'', idSystem:p.idSystem||'', title:p.title||'', hypothesis:p.hypothesis||'', indicator:p.indicator||'',
      target:Number(p.target)||0, unit:p.unit||'', current:Number(p.current)||0, mode:(p.mode==='tasks'?'tasks':'value'),
      budget:Number(p.budget)||0, actualCost:Number(p.actualCost)||0, revenue:Number(p.revenue)||0,
      impact:Number(p.impact)||0, confidence:Number(p.confidence)||0, effort:Number(p.effort)||0,
      owner:p.owner||'', status:p.status||'', priority:p.priority||'', risk:Number(p.risk)||0,
      // Indicateurs Kairos : énergie (1–10) du projet, contribution, état et risque de dilution
      energy:Number(p.energy)||10,
      contribution:Number(p.contribution)||0,
      energyState:p.energyState||'',
      dilutionRisk:p.dilutionRisk||'',
      startDate:p.startDate||'', plannedEnd:p.plannedEnd||'', actualEnd:p.actualEnd||'', comments:p.comments||'',
      escalation:p.escalation||'',
      currentLevel:p.currentLevel||'',
      criticalMass:Number(p.criticalMass)||0
    });
    const parentRaw = Array.isArray(p.parentProjects) ? p.parentProjects : (p.parentProjects ? [p.parentProjects] : []);
    obj.parentProjects = Array.from(new Set(parentRaw.map(String).map(x => x.trim()).filter(x => x && x !== id)));
    ensureValidationMetadata('projects', existing, obj);
    await idb.put(db,'projects', obj); await audit(editingId?'update':'create','projects', id); f.classList.add('collapsed'); f.reset(); showToast('Projet enregistré'); refreshProjects();
  }
  async function handleActionSubmit(e){
    e.preventDefault(); const f=e.currentTarget, a=formGet(f);
    const id = f.dataset.editing || await nextId('A','actions');
    const objectives = collectObjectives('actionObjectives');
    if (!validateObjectives(objectives)) return alert('Chaque action doit comporter au minimum un objectif temporel, un objectif de résultat et un objectif de méthode.');
    // Enregistrer les nouvelles propriétés utilisées pour l’auto‑priorisation (impact, urgence, effort, énergie requise)
    const obj = {
      id,
      idProject: a.idProject || '',
      task: a.task || '',
      owner: a.owner || '',
      startDate: a.startDate || '',
      dueDate: a.dueDate || '',
      doneDate: a.doneDate || '',
      estHours: Number(a.estHours) || 0,
      realHours: Number(a.realHours) || 0,
      points: Number(a.points) || 0,
      // Champs de priorisation : valeur par défaut si non renseignée
      impact: Number(a.impact) || 5,
      urgency: Number(a.urgency) || 5,
      effort_estimate: Number(a.effort_estimate) || 5,
      energy_required: Number(a.energy_required) || 5,
      statusTask: a.statusTask || '',
      tag: a.tag || '',
      comments: a.comments || '',
      timeOfDay: a.timeOfDay || '',
      // Les sous‑objectifs SMART sont saisis ligne par ligne. On valide qu'ils
      // contiennent au moins une lettre et un chiffre. On stocke un tableau
      // sérialisé en JSON pour garantir la compatibilité avec IndexedDB.
      subgoals: (()=>{
        const lines = (a.subgoals || '').split(/\n+/).map(l => l.trim()).filter(l => l);
        const valid = [];
        for (const line of lines){
          if (/[A-Za-z]/.test(line) && /\d/.test(line)) valid.push(line);
          else console.warn('Sous-objectif ignoré (doit contenir lettres et chiffres):', line);
        }
        return valid;
      })()
    };
    obj.objectives = objectives;
    await idb.put(db,'actions', obj); await audit(f.dataset.editing?'update':'create','actions', id); f.classList.add('collapsed'); f.reset(); resetObjectives('actionObjectives', []); showToast('Action enregistrée'); refreshActions();
  }

  // Selects
  async function fillGlobalSelects(){ const f=$('#formGlobal'); sel(f, 'unit', enums.units); sel(f,'owner',enums.collaborators); sel(f,'status',enums.statuses); sel(f,'priority',enums.priorities); sel(f,'domain',enums.domains); }
  async function fillSystemSelects(){
    const f = $('#formSystem');
    // Liste des objectifs globaux avec intitulé comme label
    const gls = (await idb.getAll(db,'globals')).map(g => ({ value: g.id, label: (g.title && g.title.trim()) ? g.title.trim() : g.id }));
    sel(f, 'idGlobal', gls);
    sel(f, 'unit', enums.units);
    sel(f, 'owner', enums.collaborators);
    sel(f, 'status', enums.statuses);
    sel(f, 'priority', enums.priorities);
  }
  async function fillProjectSelects(currentId=''){
    const f = $('#formProject');
    const [globals, systems, projects] = await Promise.all([
      idb.getAll(db,'globals'),
      idb.getAll(db,'systems'),
      idb.getAll(db,'projects')
    ]);
    const gls = (globals||[]).map(g => ({ value: g.id, label: (g.title && g.title.trim()) ? g.title.trim() : g.id }));
    const sys = (systems||[]).map(s => ({ value: s.id, label: (s.title && s.title.trim()) ? s.title.trim() : s.id }));
    sel(f, 'idGlobal', gls);
    sel(f, 'idSystem', sys);
    sel(f, 'unit', enums.units);
    sel(f, 'owner', enums.collaborators);
    sel(f, 'status', enums.statuses);
    sel(f, 'priority', enums.priorities);
    const parentSelect = f?.querySelector('select[name=parentProjects]');
    if (parentSelect){
      parentSelect.innerHTML = '';
      (projects||[])
        .filter(p => p.id && p.id !== currentId)
        .sort((a,b) => (a.title||a.id||'').localeCompare(b.title||b.id||'', 'fr', { numeric:true, sensitivity:'base' }))
        .forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.title ? `${p.title} (${p.id})` : p.id;
          parentSelect.appendChild(opt);
        });
    }
  }
  async function fillActionSelects(){
    const f = $('#formAction');
    const projs = (await idb.getAll(db,'projects')).map(p => ({ value: p.id, label: (p.title && p.title.trim()) ? p.title.trim() : p.id }));
    sel(f, 'idProject', projs);
    sel(f, 'owner', enums.collaborators);
    sel(f, 'statusTask', enums.taskStatuses);
  }
  // Remplir un select avec une liste de valeurs ou d'objets {value,label}. Si un objet est fourni,
  // on utilise ses propriétés pour définir la valeur et le texte affiché. Permet d'afficher
  // les intitulés au lieu des IDs pour les objectifs, systèmes et projets.
  function sel(form, name, arr){
    const s = form[name];
    if (!s) return;
    s.innerHTML = '';
    if (!s.multiple){
      s.append(new Option('—',''));
    }
    (arr || []).forEach(v => {
      if (v && typeof v === 'object' && 'value' in v && 'label' in v) {
        s.append(new Option(v.label, v.value));
      } else {
        s.append(new Option(v, v));
      }
    });
  }

  /**
   * Ajoute des gestionnaires pour les cases à cocher "Sans date de fin" dans un formulaire. Chaque
   * case doit avoir l'attribut data-target pointant vers le nom de l'input date associé.
   * Lorsqu'une case est cochée, le champ date est vidé et désactivé afin qu'il ne soit pas soumis
   * via FormData. Lorsqu'elle est décochée, le champ est réactivé.
   * @param {HTMLFormElement} form
   */
  function initNoEndDateHandlers(form){
    if (!form) return;
    form.querySelectorAll('input.no-end-date').forEach(cb => {
      cb.addEventListener('change', () => {
        const target = form.querySelector(`[name="${cb.dataset.target}"]`);
        if (!target) return;
        if (cb.checked){
          target.value = '';
          target.disabled = true;
        } else {
          target.disabled = false;
        }
      });
    });
  }

  /**
   * Met à jour l'état des cases "Sans date de fin" en fonction des valeurs des champs date.
   * Si un champ date est vide ou inexistant, la case correspondante est cochée et le champ est
   * désactivé. Sinon, la case est décochée et le champ est activé.
   * @param {HTMLFormElement} form
   */
  function updateNoEndDateState(form){
    if (!form) return;
    form.querySelectorAll('input.no-end-date').forEach(cb => {
      const target = form.querySelector(`[name="${cb.dataset.target}"]`);
      if (!target) return;
      if (!target.value){
        cb.checked = true;
        target.disabled = true;
      } else {
        cb.checked = false;
        target.disabled = false;
      }
    });
  }

  // ---------- Sorting & search ----------
  const sortState = new Map();
  function makeSortable(table, refreshFn){
    table.querySelectorAll('thead th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const type = th.dataset.type || 'text';
        const tableEl = th.closest('table');
        if (tableEl){ tableEl.querySelectorAll('thead th[data-sort]').forEach(t=>{ t.setAttribute('aria-sort','none'); t.classList.remove('asc','desc'); }); }
        const key=th.dataset.sort;
        let st = sortState.get(table.id) || { key:null, dir:'asc' };
        if (st.key===key) st.dir = (st.dir==='asc'?'desc':'asc'); else { st.key=key; st.dir='asc'; }
        sortState.set(table.id, st);
        table.querySelectorAll('thead th[data-sort]').forEach(t=> t.classList.remove('asc','desc'));
        th.classList.add(st.dir);
        th.setAttribute('aria-sort', st.dir==='asc'?'ascending':'descending');
        refreshFn();
      });
    });
  }
  function detectType(val){
    if (val==null) return 'text';
    const s = String(val).trim();
    if (/^\\d+(\\.\\d+)?\\s*%$/.test(s)) return 'percent';
    if (!isNaN(Number(s))) return 'number';
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(s)) return 'date';
    return 'text';
  }
  function sortBy(arr, key, dir, type){
    if (!key) return arr;
    const localType = type || detectType(arr.find(x => x && x[key] != null)?.[key]);
    const get = v => (v==null ? '' : v);
    const cmp = (a,b)=>{
      const av=get(a[key]), bv=get(b[key]);
      if (localType==='number' || localType==='percent') return (Number(String(av).replace('%',''))||0) - (Number(String(bv).replace('%',''))||0);
      if (localType==='date') return (new Date(av) - new Date(bv));
      return String(av).localeCompare(String(bv), 'fr', {numeric:true, sensitivity:'base'});
    };
    const out=[...arr].sort(cmp);
    return dir==='desc' ? out.reverse() : out;
  }
  function filterBySearch(arr, text, fields){
    text = (text||'').trim().toLowerCase(); if (!text) return arr;
    return arr.filter(o => fields.some(f => (o[f]??'').toString().toLowerCase().includes(text)));
  }

  // ---------- Dynamic filters (safe/robust) ----------
  const FILTER_KEY_PREFIX='klaro:filters:';
  const SORT_KEY_PREFIX='klaro:sort:';
  const SAVED_VIEWS_KEY='klaro:savedViews';
  function getFilters(view){ try{ return JSON.parse(localStorage.getItem(FILTER_KEY_PREFIX+view)||'[]'); }catch(e){ return []; } }
  function setFilters(view, arr){ localStorage.setItem(FILTER_KEY_PREFIX+view, JSON.stringify(arr||[])); }
  function getSort(view){ try{ return JSON.parse(localStorage.getItem(SORT_KEY_PREFIX+view)||'{}'); }catch(e){ return {}; } }
  function setSort(view, obj){ localStorage.setItem(SORT_KEY_PREFIX+view, JSON.stringify(obj||{})); }
  function getSavedViews(){ try{ return JSON.parse(localStorage.getItem(SAVED_VIEWS_KEY)||'[]'); }catch(e){ return []; } }
  function setSavedViews(arr){ localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(arr||[])); }

  const FIELD_DEFS={
    projects:{ title:'text', status:'enum', owner:'enum', priority:'enum', plannedEnd:'date', ICE:'number', SPI:'number', id:'text', parentChain:'text', parentIds:'text', childIds:'text', rootId:'text', hasParent:'text' },
    actions:{ task:'text', statusTask:'enum', owner:'enum', dueDate:'date', points:'number', idProject:'text', id:'text' },
    globals:{ title:'text', status:'enum', owner:'enum', domain:'enum', priority:'enum', id:'text' },
    systems:{ title:'text', status:'enum', owner:'enum', domain:'enum', idGlobal:'text', priority:'enum', id:'text' }
  };
  const ENUM_SOURCES={
    status: ()=> (enums.statuses||[]),
    statusTask: ()=> (enums.taskStatuses||[]),
    owner: ()=> (enums.collaborators||[]),
    priority: ()=> (enums.priorities||[]),
    domain: ()=> (enums.domains||[])
  };
  const OPS={
    text:[{k:'contains',l:'contient'},{k:'is',l:'est'},{k:'isnot',l:'≠'}],
    enum:[{k:'is',l:'est'},{k:'isnot',l:'≠'}],
    number:[{k:'=',l:'='},{k:'>=',l:'≥'},{k:'<=',l:'≤'},{k:'>',l:'>'},{k:'<',l:'<'}],
    date:[{k:'on',l:'le'},{k:'after',l:'après'},{k:'before',l:'avant'}]
  };
  function applyFiltersToData(view, data){
    const filters = getFilters(view);
    if (!filters.length) return data;
    return data.filter(row => filters.every(f=>{
      const t = FIELD_DEFS[view][f.field]||'text';
      const val = row[f.field]; const v=f.value;
      if (t==='text'){ if (f.op==='contains') return String(val||'').toLowerCase().includes(String(v||'').toLowerCase()); if (f.op==='is') return String(val||'').toLowerCase()===String(v||'').toLowerCase(); if (f.op==='isnot') return String(val||'').toLowerCase()!==String(v||'').toLowerCase(); }
      if (t==='enum'){ if (f.op==='is') return String(val||'')===String(v||''); if (f.op==='isnot') return String(val||'')!==String(v||''); }
      if (t==='number'){ const a=Number(val)||0, b=Number(v)||0; if (f.op==='=') return a===b; if (f.op==='>=') return a>=b; if (f.op==='<=') return a<=b; if (f.op==='>') return a>b; if (f.op==='<') return a<b; }
      if (t==='date'){ const a=Date.parse(val)||0, b=Date.parse(v)||0; if (f.op==='on') return a===b; if (f.op==='after') return a>b; if (f.op==='before') return a<b; }
      return true;
    }));
  }
  function renderFilterBar(view){
    const fieldSel = document.getElementById(`f-field-${view}`);
    const opSel = document.getElementById(`f-op-${view}`);
    const valInput = document.getElementById(`f-value-${view}`);
    const chips = document.getElementById(`chips-${view}`);
    if (!fieldSel || !opSel || !valInput || !chips) return;
    fieldSel.innerHTML='';
    const defs = FIELD_DEFS[view]||{};
    Object.keys(defs).forEach(k=> fieldSel.add(new Option(k, k)));
    function syncOps(){
      const t = defs[fieldSel.value]||'text';
      opSel.innerHTML='';
      (OPS[t]||OPS.text).forEach(o=> opSel.add(new Option(o.l, o.k)));
      valInput.type = (t==='number'?'number': (t==='date'?'date':'text'));
      if (t==='enum'){
        const source = ENUM_SOURCES[fieldSel.value]; const arr = source? source():[];
        valInput.setAttribute('list', `dl-${view}-${fieldSel.value}`);
        let dl = document.getElementById(`dl-${view}-${fieldSel.value}`);
        if (!dl){ dl = document.createElement('datalist'); dl.id=`dl-${view}-${fieldSel.value}`; document.body.appendChild(dl); }
        dl.innerHTML = arr.map(v=> `<option value="${escapeHtml(v)}">`).join('');
      } else { valInput.removeAttribute('list'); }
    }
    fieldSel.addEventListener('change', syncOps); syncOps();
    function paintChips(){
      const filters = getFilters(view);
      chips.innerHTML='';
      filters.forEach((f,i)=>{
        const el=document.createElement('span'); el.className='chip';
        el.innerHTML = `<span>${escapeHtml(f.field)} ${escapeHtml(f.op)} ${escapeHtml(String(f.value))}</span> <button data-del="${i}" aria-label="Supprimer ce filtre">✕</button>`;
        chips.appendChild(el);
      });
      chips.querySelectorAll('button[data-del]').forEach(btn=> btn.addEventListener('click', ()=>{ const idx=Number(btn.dataset.del); const arr=getFilters(view); arr.splice(idx,1); setFilters(view,arr); paintChips(); forceRefresh(view); }));
    }
    paintChips();
    const addBtn = document.getElementById(`f-add-${view}`);
    const clrBtn = document.getElementById(`f-clear-${view}`);
    if (addBtn) addBtn.onclick = ()=>{ const f={ field:fieldSel.value, op:opSel.value, value:valInput.value }; if (!f.field || !f.op || String(f.value).trim()==='') return; const arr=getFilters(view); arr.push(f); setFilters(view,arr); paintChips(); forceRefresh(view); };
    if (clrBtn) clrBtn.onclick = ()=>{ setFilters(view, []); paintChips(); forceRefresh(view); };
    const sortSel = document.getElementById(`sort-${view}`);
    if (sortSel){
      const defs = FIELD_DEFS[view]; const options=[['title','asc','text','Titre A→Z'],['title','desc','text','Titre Z→A']];
      if (defs.plannedEnd) options.push(['plannedEnd','asc','date','Fin ancien→récent'], ['plannedEnd','desc','date','Fin récent→ancien']);
      if (defs.ICE) options.push(['ICE','desc','number','ICE décroissant']);
      if (defs.SPI) options.push(['SPI','desc','number','SPI décroissant']);
      options.push(['id','asc','text','ID (A→Z)'], ['id','desc','text','ID (Z→A)']);
      sortSel.innerHTML=''; options.forEach(o=> sortSel.add(new Option(o[3], o.join('|'))));
      const saved=getSort(view); if (saved && saved.key){ sortSel.value=[saved.key,saved.dir,saved.type].join('|'); }
      sortSel.onchange = ()=>{ const [key,dir,type]=sortSel.value.split('|'); setSort(view,{key,dir,type}); forceRefresh(view); };
    }
  }
  function forceRefresh(view){ if (view==='projects') refreshProjects(); else if (view==='actions') refreshActions(); else if (view==='globals') refreshGlobals(); else if (view==='systems') refreshSystems(); }

  function updateBulkBar(which){
    if (which==='projects'){
      const ids = $$('#tblProjects tbody input[type=checkbox]:checked').map(c=>c.value);
      $('#bulkProjCount').textContent = ids.length; $('#bulkProjects').hidden = (ids.length===0);
    } else {
      const ids = $$('#tblActions tbody input[type=checkbox]:checked').map(c=>c.value);
      $('#bulkActCount').textContent = ids.length; $('#bulkActions').hidden = (ids.length===0);
    }
  }

  async function handleBulkProjects(e){
    const act = e.target.closest('button')?.dataset.bulk; if (!act) return;
    const ids = $$('#tblProjects tbody input[type=checkbox]:checked').map(c=>c.value);
    if (!ids.length) return;
    if (act.startsWith('status:')){
      const st = act.split(':')[1];
      for (const id of ids){ const p = await idb.get(db,'projects', id); if (!p) continue; p.status=st; await idb.put(db,'projects',p); await audit('update','projects',id); }
      showToast(`Statut → ${st} (${ids.length})`);
    } else if (act==='delete'){
      if (!confirm(`Supprimer ${ids.length} projet(s) ? (sera envoyé à la corbeille)`)) return;
      for (const id of ids){ const p = await idb.get(db,'projects', id); if (!p) continue; await idb.put(db,'trash', { id:'TR-'+id, store:'projects', ts:Date.now(), item:p }); await idb.del(db,'projects', id); await audit('delete','projects',id); }
      showToast(`Supprimé: ${ids.length}`);
    } else if (act==='export'){
      const items = []; for (const id of ids){ const p = await idb.get(db,'projects', id); if (p) items.push(p); }
      downloadCSV(items, 'projects_selection.csv');
    }
    refreshProjects(); refreshTrash();
  }
  async function handleBulkActions(e){
    const act = e.target.closest('button')?.dataset.bulkAct; if (!act) return;
    const ids = $$('#tblActions tbody input[type=checkbox]:checked').map(c=>c.value);
    if (!ids.length) return;
    if (act.startsWith('status:')){
      const st = act.split(':')[1];
      for (const id of ids){ const a = await idb.get(db,'actions', id); if (!a) continue; a.statusTask=st; await idb.put(db,'actions',a); await audit('update','actions',id); }
      showToast(`Statut → ${st} (${ids.length})`);
    } else if (act==='delete'){
      if (!confirm(`Supprimer ${ids.length} action(s) ? (corbeille)`)) return;
      for (const id of ids){ const a = await idb.get(db,'actions', id); if (!a) continue; await idb.put(db,'trash', { id:'TR-'+id, store:'actions', ts:Date.now(), item:a }); await idb.del(db,'actions', id); await audit('delete','actions',id); }
      showToast(`Supprimé: ${ids.length}`);
    } else if (act==='export'){
      const items = []; for (const id of ids){ const a = await idb.get(db,'actions', id); if (a) items.push(a); }
      downloadCSV(items, 'actions_selection.csv');
    }
    refreshActions(); refreshTrash();
  }

  // ---------- Refresh ----------
    async function refreshAll(){
    // Display loading overlay to communicate that the app is refreshing data
    showLoading();
    try{
      const views = ['dashboard','globals','systems','projects','actions','routines','views','archives','params'];
      // Execute refreshes in parallel to minimize overall waiting time
      await Promise.all(views.map(name => refreshView(name)));
    }catch(e){ console.error('Erreur refreshAll', e); }
    hideLoading();
  }
  async function refreshView(name){
    if (name==='dashboard') return refreshDashboard();
    if (name==='globals') return refreshGlobals();
    if (name==='systems') return refreshSystems();
    if (name==='projects') return refreshProjects();
    if (name==='actions') return refreshActions();
    if (name==='routines') return (window.refreshRoutines && window.refreshRoutines());
    if (name==='views') return refreshViews();
    if (name==='archives') return refreshArchives();
    if (name==='params') return refreshParams();
    if (name==='redteam') return refreshRedTeam();
  }

  async function refreshDashboard(){
    const [globals, systems, projects, actions, routines, routineTasks] = await Promise.all([
      idb.getAll(db,'globals'),
      idb.getAll(db,'systems'),
      idb.getAll(db,'projects'),
      idb.getAll(db,'actions'),
      idb.getAll(db,'routines'),
      idb.getAll(db,'routineTasks')
    ]);
    // Appliquer les filtres aux actions pour les statistiques du tableau de bord
    let actionsFiltered = actions.slice();
    if (dashboardFilters.project && dashboardFilters.project !== 'all'){
      actionsFiltered = actionsFiltered.filter(a => a.idProject === dashboardFilters.project);
    }
    if (dashboardFilters.owner && dashboardFilters.owner !== 'all'){
      actionsFiltered = actionsFiltered.filter(a => (a.owner || '') === dashboardFilters.owner);
    }
    if (dashboardFilters.time && dashboardFilters.time !== 'all'){
      const nowDateF = today();
      let endDate;
      if (dashboardFilters.time === 'today') endDate = nowDateF;
      else if (dashboardFilters.time === '7d') endDate = dateAddDays(nowDateF, 7);
      else if (dashboardFilters.time === '30d') endDate = dateAddDays(nowDateF, 30);
      actionsFiltered = actionsFiltered.filter(a => {
        if (!a.dueDate) return false;
        const d = parseDate(a.dueDate);
        return d && d >= nowDateF && d <= endDate;
      });
    }
    // Calculer les projets à partir de toutes les actions, sans filtrer, pour conserver la vision globale
    const actBy = groupBy(actions,'idProject');
    const projs = projects.map(p=> computeProject(p, actBy[p.id]||[]));
    // Commencer par un calcul simple de progression des systèmes à partir de leur valeur
    const sysC = systems.map(computeSystem);
    // --- Intégration des routines dans le calcul de progression des systèmes ---
    try{
      // Construire une carte des tâches de routine réalisées aujourd’hui (doneRoutineToday)
      const todayDateSys = today();
      const todayDowSys = todayDateSys.getDay();
      const todayDomSys = todayDateSys.getDate();
      function runsTodaySys(r){
        const freq = r.frequency || 'daily';
        if (freq === 'daily') return true;
        if (freq === 'weekly') return Array.isArray(r.dow) && r.dow.includes(todayDowSys);
        if (freq === 'monthly') return r.dom != null && Number(r.dom) === todayDomSys;
        return false;
      }
      const statsBySys = {};
      for (const r of routines || []){
        if (!r || !r.idSystem) continue;
        if (!runsTodaySys(r)) continue;
        const tasksR = (routineTasks || []).filter(t => t.routineId === r.id);
        if (!tasksR.length) continue;
        const sid = r.idSystem;
        if (!statsBySys[sid]) statsBySys[sid] = { total:0, done:0 };
        statsBySys[sid].total += tasksR.length;
        for (const t of tasksR){ if (doneRoutineToday && doneRoutineToday.tasks && doneRoutineToday.tasks[t.id]) statsBySys[sid].done++; }
      }
      // Ajuster la progression des systèmes en combinant la progression valeur et la progression des routines
      for (const s of sysC){
        const st = statsBySys[s.id];
        if (st && st.total > 0){
          const routineProgress = st.done / st.total;
          // Poids : 70 % valeur (progress) et 30 % routines pour un équilibre.
          const combined = clamp01(0.7 * (s.progress||0) + 0.3 * routineProgress);
          s.progress = combined;
          s.routineProgress = routineProgress;
        }
      }
    }catch(e){ console.warn('Erreur calcul progression système avec routines', e); }
    const glC = globals.map(g=> computeGlobal(g, sysC, projs));
    $('#kpiGlobalCount').textContent = String(glC.length);
    $('#kpiSysCount').textContent = String(sysC.length);
    $('#kpiProjCount').textContent = String(projs.length);
    // L’avancement global combine désormais la progression de la valeur,
    // des systèmes et des projets en utilisant le poids combiné défini
    // dans computeGlobal (attribut progressCombined).
    $('#kpiGlobalAvg').textContent = fmtPct(avg(glC.map(x => x.progressCombined || ((x.progressValue + x.avgSystems + x.avgProjects)/3) )));
    $('#kpiSysAvg').textContent = fmtPct(avg(sysC.map(x=>x.progress)));
    $('#kpiProjAvg').textContent = fmtPct(avg(projs.map(x=>x.progressOverall)));
    $('#kpiLateCount').textContent = String(projs.filter(x=>x.overdue).length);

    // --- Avancement global combiné ---
    // Cette logique est désormais intégrée dans computeGlobal via l’attribut
    // progressCombined. Le calcul précédent (moyenne simple) est conservé
    // en secours si progressCombined n’est pas présent. La section ci‑dessous
    // devient obsolète mais est conservée pour compatibilité ;
    // nous ne la réexécutons plus pour éviter un double calcul.

    // KPI routines: number of active routines, tasks scheduled today and frequency distribution
    try {
      // Filter active, non‑archived routines
      const activeR = (routines || []).filter(r => (r.active !== false) && !r.archived);
      const kpiRoutines = document.getElementById('kpiRoutineCount');
      if (kpiRoutines) kpiRoutines.textContent = String(activeR.length);
      // Determine today's date attributes
      const todayDate = today();
      const todayDow = todayDate.getDay();
      const todayDom = todayDate.getDate();
      function runsToday(r){
        const freq = r.frequency || 'daily';
        if (freq === 'daily') return true;
        if (freq === 'weekly') return Array.isArray(r.dow) && r.dow.includes(todayDow);
        if (freq === 'monthly') return r.dom != null && Number(r.dom) === todayDom;
        return false;
      }
      let totalTasksToday = 0;
      for (const r of activeR){
        if (runsToday(r)){
          const count = (routineTasks || []).filter(t => t.routineId === r.id).length;
          totalTasksToday += count;
        }
      }
      const kpiTasksToday = document.getElementById('kpiRoutineTasksToday');
      if (kpiTasksToday) kpiTasksToday.textContent = String(totalTasksToday);
      // Frequency counts
      const freqCounts = { daily:0, weekly:0, monthly:0, other:0 };
      activeR.forEach(r => {
        const f = String(r.frequency || 'other');
        if (freqCounts[f] != null) freqCounts[f] += 1; else freqCounts.other += 1;
      });
      const freqLabels = { daily:'Quotidien', weekly:'Hebdo.', monthly:'Mensuel', other:'Autre' };
      const freqOrder = ['daily','weekly','monthly','other'];
      const dist = document.getElementById('routineFreqDist');
      if (dist){
        dist.innerHTML = '';
        freqOrder.forEach(f => {
          const div = document.createElement('div');
          div.className = 'item';
          const count = freqCounts[f] || 0;
          div.innerHTML = `<div>${escapeHtml(freqLabels[f])}</div><div>${count}</div>`;
          dist.appendChild(div);
        });
      }
      const donutC = document.getElementById('chartRoutineFreqDonut');
      if (donutC){
        const parts = freqOrder.map(f => ({ k: freqLabels[f], v: freqCounts[f] || 0 }));
        drawDonut(donutC, parts);
      }
    }catch(e){ console.warn('Erreur calcul KPI routines', e); }

    // Nouvelles KPI pour les actions ouvertes et en retard
    try{
      const openActions = actionsFiltered.filter(a => !a.archived && a.statusTask !== 'Fait');
      const nowDate = today();
      const lateActions = actionsFiltered.filter(a => !a.archived && (a.statusTask !== 'Fait') && a.dueDate && parseDate(a.dueDate) < nowDate);
      const kpiOpen = document.getElementById('kpiActionOpen');
      const kpiLate = document.getElementById('kpiActionLate');
      if (kpiOpen) kpiOpen.textContent = String(openActions.length);
      if (kpiLate) kpiLate.textContent = String(lateActions.length);

      // Calcul des alertes : actions en retard, actions en attente de Red‑Team, entrées Red‑Team à traiter
      const overdueCount = lateActions.length;
      const pendingRTActions = actions.filter(a => !a.archived && a.statusTask === 'done_pending_redteam').length;
      // Charger les entrées Red‑Team pour connaître celles en attente
      loadRedTeam();
      const pendingEntries = redTeamEntries.filter(rt => rt.status === 'to_process').length;
      const pendingValidations = gatherValidationQueue({ globals, systems, projects, routines }).length;
      const alerts = overdueCount + pendingRTActions + pendingEntries + pendingValidations;
      const kpiAlertsEl = document.getElementById('kpiAlerts');
      if (kpiAlertsEl) kpiAlertsEl.textContent = String(alerts);
      const kpiRT = document.getElementById('kpiRedTeamPending');
      if (kpiRT) kpiRT.textContent = String(pendingRTActions + pendingEntries + pendingValidations);
    }catch(e){ console.warn('Erreur calcul KPI actions', e); }

    // Liste des actions à venir (due soon) pour le dashboard
    try{
      const days = (thresholds && thresholds.dueSoonDays != null) ? thresholds.dueSoonDays : 7;
      const nowDate2 = today();
      const soonDate = dateAddDays(nowDate2, days);
      const dueSoon = actionsFiltered.filter(a => {
        if (a.archived) return false;
        if (a.statusTask === 'Fait') return false;
        if (!a.dueDate) return false;
        const d = parseDate(a.dueDate);
        return d && d >= nowDate2 && d <= soonDate;
      }).sort((a,b) => (a.dueDate||'').localeCompare(b.dueDate||''));
      const projMapDash = new Map((projects||[]).map(p => [p.id, (p.title && p.title.trim()) ? p.title.trim() : p.id]));
      const rows = dueSoon.map(a => [projMapDash.get(a.idProject) || a.idProject || '', a.task || '', a.dueDate || '', maskName(a.owner || '')]);
      const tbDue = document.getElementById('tblDashboardDueSoon');
      if (tbDue){ const tbody = tbDue.querySelector('tbody'); if (tbody){ tbody.innerHTML=''; fillRows(tbody, rows); } }
    }catch(e){ console.warn('Erreur calcul actions à venir', e); }

    // Répartition des statuts des actions + graphique donut
    try{
      // Pour la répartition des statuts, inclure également les tâches archivées afin de
      // donner une vision complète des actions passées. Les actions archivées sont
      // comptabilisées selon leur statut d’origine (Fait, À faire, etc.).
      const taskCounts = countBy(actionsFiltered /* inclut archivées */, 'statusTask');
      const cont = document.getElementById('actionsStatusDist');
      if (cont) {
        cont.innerHTML = '';
        (enums.taskStatuses || []).forEach(st => {
          const div = document.createElement('div');
          div.className = 'item';
          div.innerHTML = `<div>${escapeHtml(st)}</div><div>${taskCounts[st] || 0}</div>`;
          cont.appendChild(div);
        });
      }
      const donut2 = document.getElementById('chartActionStatusDonut');
      if (donut2) {
        const parts2 = (enums.taskStatuses || []).map(st => ({ k: st, v: taskCounts[st] || 0 }));
        drawDonut(donut2, parts2);
      }
    }catch(e){ console.warn('Erreur répartition statuts actions', e); }

    // Répartition des actions ouvertes par collaborateur + graphique barre
    try{
      const ownerCounts = countBy(actionsFiltered.filter(a => !a.archived && a.statusTask !== 'Fait'), 'owner');
      const owners = Object.keys(ownerCounts).sort((a,b) => (ownerCounts[b] || 0) - (ownerCounts[a] || 0));
      const rowsOwners = owners.map(o => [maskName(o), ownerCounts[o] || 0]);
      const tbOwner = document.getElementById('tblActionsOwner');
      if (tbOwner){ const tbBody = tbOwner.querySelector('tbody'); if (tbBody){ fillRows(tbBody, rowsOwners); } }
      const barsCanvas = document.getElementById('chartActionsOwnerBars');
      if (barsCanvas){ const series = owners.map(o => ({ name: o, load: ownerCounts[o] || 0, cap: ownerCounts[o] || 0 })); drawSimpleBars(barsCanvas, series); }
    }catch(e){ console.warn('Erreur actions par collaborateur', e); }

    // Statuts distrib + charts
    const statCounts = countBy(projs,'status'); const container = $('#statusDist'); container.innerHTML='';
    (enums.statuses||[]).forEach(st=> { const div=document.createElement('div'); div.className='item'; div.innerHTML=`<div>${escapeHtml(st)}</div><div>${statCounts[st]||0}</div>`; container.appendChild(div); });
    try{ const donut = $('#chartStatusDonut'); if (donut){ const parts=(enums.statuses||[]).map((st)=>({k:st,v:statCounts[st]||0})); drawDonut(donut, parts); } }catch(e){}

    // Vélocité KPIs + sparkline factice (somme 7/28j)
    const now=today(), d7 = dateAddDays(now,-7), d28 = dateAddDays(now,-28);
    const sumPts = from => actions.filter(a=> a.statusTask==='Fait' && a.doneDate && parseDate(a.doneDate)>=from).reduce((s,a)=> s+(Number(a.points)||0),0);
    $('#kpiVelo7').textContent = String(sumPts(d7)); $('#kpiVelo28').textContent = String(sumPts(d28));
    try{ const sp = $('#chartVelo'); if (sp){ const series=[...Array(12)].map((_,i)=> i<6 ? Math.max(0, sumPts(dateAddDays(now,-i-1))-i) : Math.max(0, sumPts(dateAddDays(now,-i-1))-i-2)); drawSparkline(sp, series.reverse()); } }catch(e){}

    // Charge / capacité
    const capRows = Object.keys(capacities||{}).map(name => {
      const load = actionsFiltered.filter(a=> a.owner===name && a.statusTask!=='Fait' && a.dueDate && parseDate(a.dueDate)>=now && parseDate(a.dueDate)<=dateAddDays(now,7)).reduce((s,a)=> s+(Number(a.points)||0),0);
      const cap = Number(capacities[name]||0); const diff = load - cap; return { name, load, cap, diff, overload: diff>0 };
    }).sort((a,b)=> b.diff - a.diff);
    fillRows($('#tblCapacity tbody'), capRows.map(r=> [maskName(r.name), r.load, r.cap, (r.diff>0?`+${r.diff}`:r.diff), r.overload?'Oui':'Non']));
    try{ const bars=$('#chartCapacityBars'); if (bars) drawBars(bars, capRows); }catch(e){}

    // Gantt dans le dashboard
    try{ await renderGantt('dashGantt'); }catch(e){ console.warn('Gantt render error', e); }

    // Mettre à jour les tendances pour toutes les cartes KPI après avoir calculé les nouvelles valeurs
    try{
      const kpiIds = ['kpiGlobalCount','kpiGlobalAvg','kpiSysCount','kpiSysAvg','kpiProjCount','kpiProjAvg','kpiLateCount','kpiActionOpen','kpiActionLate','kpiRoutineCount','kpiRoutineTasksToday','kpiAlerts','kpiRedTeamPending'];
      kpiIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const valStr = el.textContent || '0';
        // Extraire nombre depuis chaîne (ex. "35%" -> 35)
        const num = parseFloat(valStr) || 0;
        updateKpiTrend(id, num);
      });
    }catch(e){ console.warn('Erreur lors de la mise à jour des tendances', e); }
  }

  /**
   * Génère un rapport complet de l’état de l’application et télécharge un PDF.
   * Le rapport compile l’ensemble des objectifs globaux, systèmes, projets,
   * actions, routines et entrées Red‑Team présentes dans
   * l’application. Chaque section est structurée avec des titres et les
   * propriétés essentielles afin de fournir un aperçu exhaustif. Utilise
   * la bibliothèque jsPDF (chargée via CDN) pour composer le document.
   */
  async function downloadFullReport(){
    try{
      // Charger toutes les données nécessaires en parallèle
      const [globals, systems, projects, actions, routines, routineTasks] = await Promise.all([
        idb.getAll(db,'globals'),
        idb.getAll(db,'systems'),
        idb.getAll(db,'projects'),
        idb.getAll(db,'actions'),
        idb.getAll(db,'routines'),
        idb.getAll(db,'routineTasks')
      ]);
      // Charger les entrées Red‑Team via la fonction existante
      try { await loadRedTeam(); } catch(e) {}
      const redEntries = (typeof redTeamEntries !== 'undefined') ? redTeamEntries.slice() : [];
      // Obtenir l’instance jsPDF depuis le module UMD chargé via CDN
      if (!window.jspdf || !window.jspdf.jsPDF){
        alert('La bibliothèque jsPDF n’est pas disponible. Veuillez vérifier la connexion réseau.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      // Configurations de mise en page
      let y = 10;
      const pageHeight = doc.internal.pageSize.getHeight() - 10;
      function addLine(text, indent=0, size=10, bold=false){
        doc.setFontSize(size);
        doc.setFont(undefined, bold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, 190 - indent);
        lines.forEach(ln => {
          if (y > pageHeight){ doc.addPage(); y = 10; }
          doc.text(10 + indent, y, ln);
          y += 5;
        });
      }
      // Titre du rapport
      const dateStr = new Date().toISOString().slice(0,10);
      doc.setFontSize(16);
      doc.setFont(undefined,'bold');
      doc.text(10, y, `Rapport complet Kairos – ${dateStr}`);
      y += 10;
      doc.setFont(undefined,'normal');
      addLine('Ce document présente un état exhaustif de toutes les entités enregistrées dans l’application : objectifs globaux, systèmes, projets, actions, routines et entrées Red‑Team.', 0, 10);
      // Section Globaux
      addLine('Objectifs globaux', 0, 14, true);
      globals.forEach(g => {
        addLine(`ID : ${g.id} | Titre : ${g.title || ''}`, 2, 11, true);
        addLine(`Domaine : ${g.domain || ''}`, 4);
        addLine(`Progrès valeur : ${fmtPct(g.progressValue || 0)} | Moy. systèmes : ${fmtPct(g.avgSystems || 0)} | Moy. projets : ${fmtPct(g.avgProjects || 0)}`, 4);
        if (g.progressCombined != null){ addLine(`Progression combinée : ${fmtPct(g.progressCombined)}`, 4); }
        // Liste des systèmes reliés
        const sysFor = systems.filter(s => s.idGlobal === g.id);
        if (sysFor.length){ addLine('Systèmes liés :', 4, 10, true); }
        sysFor.forEach(s => {
          addLine(`• [${s.id}] ${s.title || ''} – Progression : ${fmtPct(s.progress || 0)}`, 6);
        });
        // Liste des projets reliés
        const projsFor = projects.filter(p => p.idGlobal === g.id);
        if (projsFor.length){ addLine('Projets liés :', 4, 10, true); }
        projsFor.forEach(p => {
          addLine(`• [${p.id}] ${p.title || ''} – Avancement : ${fmtPct(p.progressOverall || 0)}`, 6);
        });
        y += 2;
      });
      // Section Systèmes sans Global
      const orphanSys = systems.filter(s => !s.idGlobal);
      if (orphanSys.length){ addLine('Systèmes sans objectif global', 0, 14, true); orphanSys.forEach(s => { addLine(`• [${s.id}] ${s.title || ''} – Progression : ${fmtPct(s.progress || 0)}`, 4); }); y+=2; }
      // Section Projets
      addLine('Projets', 0, 14, true);
      projects.forEach(p => {
        addLine(`ID : ${p.id} | Titre : ${p.title || ''}`, 2, 11, true);
        addLine(`Système : ${p.idSystem || ''} | Global : ${p.idGlobal || ''}`, 4);
        addLine(`Hypothèse : ${p.hypothesis || ''}`, 4);
        addLine(`Indicateur : ${p.indicator || ''} | Cible : ${p.target || ''} ${p.unit || ''} | Actuel : ${p.current || ''}`, 4);
        addLine(`Avancement valeur : ${fmtPct(p.progressValue || 0)} | Avancement tâches : ${fmtPct(p.progressTasks || 0)} | Avancement global : ${fmtPct(p.progressOverall || 0)}`, 4);
        addLine(`Dates : ${p.startDate || ''} – ${p.plannedEnd || ''}`, 4);
        addLine(`Statut : ${p.status || ''} | Propriétaire : ${p.owner || ''}`, 4);
        addLine(`Points totaux : ${p.pointsTotal || 0} | Points faits : ${p.pointsDone || 0}`, 4);
        y+=2;
      });
      // Section Actions
      addLine('Actions', 0, 14, true);
      actions.forEach(a => {
        addLine(`ID : ${a.id} | Projet : ${a.idProject || ''}`, 2, 11, true);
        addLine(`Tâche : ${a.task || ''}`, 4);
        addLine(`Due : ${a.dueDate || ''} | Statut : ${a.statusTask || ''} | Responsable : ${a.owner || ''}`, 4);
        addLine(`Points : ${a.points || ''} | Impact : ${a.impact || ''} | Urgence : ${a.urgency || ''} | Effort : ${a.effort_estimate || ''}`, 4);
        if (a.energy_required != null) addLine(`Énergie requise : ${a.energy_required}`, 4);
        y+=2;
      });
      // Section Routines
      addLine('Routines', 0, 14, true);
      routines.forEach(r => {
        addLine(`ID : ${r.id} | Nom : ${r.name || ''}`, 2, 11, true);
        addLine(`Système : ${r.idSystem || ''} | Fréquence : ${r.frequency || ''} | Active : ${(r.active === false ? 'Non' : 'Oui')}`, 4);
        // Tâches de la routine
        const tasksR = routineTasks.filter(t => t.routineId === r.id);
        if (tasksR.length){ addLine('Tâches :', 4, 10, true); }
        tasksR.forEach(t => {
          const modes = [];
          if (t.short) modes.push(`Court: ${t.short}`);
          if (t.normal) modes.push(`Normal: ${t.normal}`);
          if (t.long) modes.push(`Long: ${t.long}`);
          addLine(`• ${t.title || ''} (${modes.join(', ')||'—'})`, 6);
        });
        y+=2;
      });
      // Section Red‑Team
      addLine('Entrées Red‑Team', 0, 14, true);
      redEntries.forEach(rt => {
        addLine(`ID : ${rt.id} | Tâche : ${rt.taskId || ''} | Titre : ${rt.title || ''}`, 2, 11, true);
        addLine(`Date : ${rt.dateAdded || ''} | Statut : ${rt.status || ''} | Suggestion : ${rt.suggestedTime || ''}`, 4);
        if (rt.autoSummary) addLine(`Résumé : ${rt.autoSummary}`, 4);
        y+=2;
      });
      // Générer et télécharger le PDF
      doc.save(`rapport_kairos_${dateStr}.pdf`);
    }catch(err){
      console.error('Erreur lors de la génération du rapport complet', err);
      alert('Une erreur est survenue lors de la génération du rapport. Voir la console pour plus de détails.');
    }
  }
  // Exposer la fonction globalement pour le bouton
  window.downloadFullReport = downloadFullReport;

  async function refreshGlobals(){
    const [globals, systems, projects] = await Promise.all([ idb.getAll(db,'globals'), idb.getAll(db,'systems'), idb.getAll(db,'projects') ]);
    const sysC = systems.map(computeSystem);
    const actBy = groupBy(await idb.getAll(db,'actions'),'idProject');
    const projsC = projects.map(p=> computeProject(p, actBy[p.id]||[]));
    let glC = globals.map(g=> computeGlobal(g, sysC, projsC));
    glC = applyFiltersToData('globals', glC);
    glC = filterBySearch(glC, $('#searchGlobals').value, ['id','title','domain','owner','status','priority']);
    renderFilterBar('globals');
    const srt = getSort('globals'); if (srt && srt.key){ glC = sortBy(glC, srt.key, srt.dir, srt.type); }
    const tb = $('#tblGlobals tbody'); tb.innerHTML='';
    for (const g of glC){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-id ro">${escapeHtml(g.id)}</td>
        <td>${escapeHtml(g.title||'')}</td>
        <td>${escapeHtml(g.domain||'')}</td>
        <td class="ro">${fmtPct(g.progressValue)}</td>
        <td class="ro">${fmtPct(g.avgSystems)}</td>
        <td class="ro">${fmtPct(g.avgProjects)}</td>
        <td class="mask-name">${escapeHtml(g.owner||'')}</td>
        <td>${escapeHtml(g.priority||'')}</td>
        <td>${escapeHtml(g.status||'')}</td>
        <td><button data-edit="${escapeHtml(g.id)}" aria-label="Modifier l'objectif global">✏️</button> <button data-report="${escapeHtml(g.id)}" data-kind="global" aria-label="Rapport">📄</button> <button class="secondary" data-del="${escapeHtml(g.id)}" aria-label="Supprimer">🗑️</button></td>`;
      tb.appendChild(tr);
      tr.addEventListener('dblclick', () => openForm('global', g));
    }
    tb.querySelectorAll('button[data-edit]').forEach(btn=> btn.addEventListener('click', async ()=> openForm('global', await idb.get(db,'globals', btn.dataset.edit)) ));
    tb.querySelectorAll('button[data-report]').forEach(btn=> btn.addEventListener('click', ()=> openReport(btn.dataset.kind, btn.dataset.report)) );
    tb.querySelectorAll('button[data-del]').forEach(btn=> btn.addEventListener('click', async ()=> { if (confirm(`Supprimer ${btn.dataset.del} ? (corbeille)`)){ const it=await idb.get(db,'globals', btn.dataset.del); await idb.put(db,'trash',{id:'TR-'+it.id, store:'globals', ts:Date.now(), item:it}); await idb.del(db,'globals', btn.dataset.del); await audit('delete','globals',btn.dataset.del); refreshGlobals(); refreshTrash(); }}));
  }

  
async function refreshSystems(){
  const [systems,globals] = await Promise.all([ idb.getAll(db,'systems'), idb.getAll(db,'globals') ]);
  const glMap = new Map((globals||[]).map(g=> [g.id, (g.title && g.title.trim()) ? g.title.trim() : '(Sans intitulé)']));
  let sysC = (systems||[]).map(computeSystem);
  sysC = applyFiltersToData('systems', sysC);
  sysC = filterBySearch(sysC, $('#searchSystems').value, ['id','idGlobal','title','owner','status','priority']);
  renderFilterBar('systems');
  const srt = getSort('systems'); if (srt && srt.key){ sysC = sortBy(sysC, srt.key, srt.dir, srt.type); }
  const tb = $('#tblSystems tbody'); tb.innerHTML='';
  for (const s of sysC){
    const tr = document.createElement('tr');
    const glTitle = glMap.get(s.idGlobal) || '';
    tr.innerHTML = `
      <td class="col-id ro">${escapeHtml(s.id)}</td>
      <td>${escapeHtml(glTitle)}</td>
      <td>${escapeHtml(s.title||'')}</td>
      <td class="ro">${fmtPct(s.progress)}</td>
      <td class="mask-name">${escapeHtml(s.owner||'')}</td>
      <td>${escapeHtml(s.priority||'')}</td>
      <td>${escapeHtml(s.status||'')}</td>
      <td><button data-edit="${escapeHtml(s.id)}" aria-label="Modifier l'objectif système">✏️</button> <button data-report="${escapeHtml(s.id)}" data-kind="system" aria-label="Rapport">📄</button> <button class="secondary" data-del="${escapeHtml(s.id)}" aria-label="Supprimer">🗑️</button></td>`;
    tb.appendChild(tr);
    tr.addEventListener('dblclick', () => openForm('system', s));
  }
  tb.querySelectorAll('button[data-edit]').forEach(btn=> btn.addEventListener('click', async ()=> openForm('system', await idb.get(db,'systems', btn.dataset.edit)) ));
  tb.querySelectorAll('button[data-report]').forEach(btn=> btn.addEventListener('click', ()=> openReport(btn.dataset.kind, btn.dataset.report)) );
  tb.querySelectorAll('button[data-del]').forEach(btn=> btn.addEventListener('click', async ()=> {
    if (confirm(`Supprimer ${btn.dataset.del} ? (corbeille)`)){
      const it=await idb.get(db,'systems', btn.dataset.del);
      await idb.put(db,'trash',{id:'TR-'+it.id, store:'systems', ts:Date.now(), item:it});
      await idb.del(db,'systems', btn.dataset.del);
      await audit('delete','systems',btn.dataset.del);
      refreshSystems(); refreshTrash();
    }
  }));
}
async function refreshProjects(){
    const [projects, actions] = await Promise.all([ idb.getAll(db,'projects'), idb.getAll(db,'actions') ]);
    const actBy = groupBy(actions,'idProject');
    const titleById = new Map((projects||[]).map(p => [p.id, p.title || p.id]));
    const computedMap = new Map();
    (projects||[]).forEach(p => {
      const base = computeProject(p, actBy[p.id]||[]);
      base.parentProjects = normalizeIdList(p.parentProjects).map(v => v.trim()).filter(Boolean);
      computedMap.set(p.id, base);
    });
    const childMap = new Map();
    (projects||[]).forEach(p => {
      normalizeIdList(p.parentProjects).map(v => v.trim()).filter(Boolean).forEach(parentId => {
        if (!childMap.has(parentId)) childMap.set(parentId, []);
        if (!childMap.get(parentId).includes(p.id)) childMap.get(parentId).push(p.id);
      });
    });
    paintProjectHierarchySelect(projects || [], titleById, childMap);
    const ancestorResolver = createAncestorResolver(projects || []);
    const focusId = projectHierarchyState.focus;
    const highlightSets = { focus:new Set(), ancestors:new Set(), descendants:new Set() };
    if (focusId && focusId !== '__all' && focusId !== '__root'){
      highlightSets.focus.add(focusId);
      ancestorResolver.ancestors(focusId).forEach(id => highlightSets.ancestors.add(id));
      const descList = projectHierarchyState.includeDescendants ? collectDescendantsFromMap(focusId, childMap) : (childMap.get(focusId) || []);
      descList.forEach(id => highlightSets.descendants.add(id));
    }
    let projs = Array.from(computedMap.values()).map(p => {
      const enriched = { ...p };
      const sortedParents = (p.parentProjects || []).slice().sort((a,b) => (titleById.get(a)||a).localeCompare(titleById.get(b)||b, 'fr', { numeric:true, sensitivity:'base' }));
      enriched.parentProjects = sortedParents;
      const rawChildren = childMap.get(p.id) || [];
      enriched.childProjects = rawChildren.slice().sort((a,b) => (titleById.get(a)||a).localeCompare(titleById.get(b)||b, 'fr', { numeric:true, sensitivity:'base' }));
      const ancestors = ancestorResolver.ancestors(p.id);
      enriched.ancestorIds = ancestors;
      enriched.parentChain = ancestors.map(pid => titleById.get(pid) || pid).join(' › ');
      enriched.parentIds = ancestors.join('|');
      enriched.childIds = enriched.childProjects.join('|');
      enriched.hasParent = enriched.parentProjects.length ? 'oui' : 'non';
      enriched.rootId = ancestors.length ? ancestors[0] : p.id;
      if (enriched.childProjects.length){
        const children = enriched.childProjects.map(id => computedMap.get(id)).filter(Boolean);
        if (children.length){
          const totalPoints = (enriched.pointsTotal||0) + children.reduce((s,c)=> s + (c.pointsTotal||0), 0);
          const totalDone = (enriched.pointsDone||0) + children.reduce((s,c)=> s + (c.pointsDone||0), 0);
          const tasksProgress = totalPoints>0 ? totalDone/totalPoints : enriched.progressTasks;
          const avgOverall = avg(children.map(c => c.progressOverall||0));
          const avgValue = avg(children.map(c => c.progressValue||0));
          enriched.progressTasks = clamp01(tasksProgress);
          enriched.progressOverall = clamp01((enriched.progressOverall + avgOverall)/2);
          enriched.progressValue = clamp01(children.length ? (enriched.progressValue + avgValue)/2 : enriched.progressValue);
        }
      }
      return enriched;
    });
    if (focusId === '__root'){
      projs = projs.filter(p => !(p.parentProjects && p.parentProjects.length));
    } else if (focusId && focusId !== '__all'){
      const allowed = new Set([focusId]);
      ancestorResolver.ancestors(focusId).forEach(id => allowed.add(id));
      if (projectHierarchyState.includeDescendants){
        collectDescendantsFromMap(focusId, childMap).forEach(id => allowed.add(id));
      } else {
        (childMap.get(focusId) || []).forEach(id => allowed.add(id));
      }
      projs = projs.filter(p => allowed.has(p.id));
    }
    projs = applyFiltersToData('projects', projs);
    projs = filterBySearch(projs, $('#searchProjects').value, ['id','title','owner','status','priority','plannedEnd','parentChain','parentIds','childIds','rootId']);
    renderFilterBar('projects');
    const srt = getSort('projects'); if (srt && srt.key){ projs = sortBy(projs, srt.key, srt.dir, srt.type); }
    const tb = $('#tblProjects tbody'); tb.innerHTML='';
    for (const p of projs){
      const tr = document.createElement('tr');
      const lowEnergy = Number(p.energy||0) < 6;
      const lowContribution = Number(p.contribution||0) < 20;
      const stagnant = (p.energyState||'').toLowerCase() === 'stagnant';
      if (lowEnergy || lowContribution || stagnant) tr.classList.add('hibernation');
      if (focusId === '__root' && !(p.parentProjects && p.parentProjects.length)) tr.classList.add('hier-focus');
      else if (highlightSets.focus.has(p.id)) tr.classList.add('hier-focus');
      else if (highlightSets.ancestors.has(p.id)) tr.classList.add('hier-ancestor');
      else if (highlightSets.descendants.has(p.id)) tr.classList.add('hier-descendant');
      const parentBadge = p.parentProjects.length ? `<div class="parent-tags">↳ ${p.parentProjects.map(pid => {
        const label = titleById.get(pid) || pid;
        return `<button type="button" class="parent-link" data-parent="${escapeHtml(pid)}">${escapeHtml(label)}</button>`;
      }).join(', ')}</div>` : '';
      const childCount = p.childProjects.length;
      const childBadge = childCount ? `<div class="child-tags"><button type="button" class="child-link" data-target="${escapeHtml(p.id)}">${childCount} ${childCount>1?'projets enfants':'projet enfant'}</button></div>` : '';
      tr.innerHTML = `
        <td class="selectcol"><input type="checkbox" value="${escapeHtml(p.id)}"></td>
        <td class="col-id ro">${escapeHtml(p.id)}</td>
        <td>${escapeHtml(p.title||'')}${parentBadge}${childBadge}</td>
        <td class="ro">${fmtPct(p.progressOverall)}</td>
        <td class="ro">${fmtNum(p.ICE,1)}</td>
        <td class="ro">${p.SPI==null?'—':fmtNum(p.SPI,2)}</td>
        <td class="ro">${escapeHtml(p.RAG||'')}</td>
        <td class="ro energy-cell ${lowEnergy ? 'low-energy' : ''}">${escapeHtml(String(p.energy||''))}${lowEnergy ? ' ⏸️' : ''}</td>
        <td class="ro">${escapeHtml(String(p.contribution||''))}</td>
        <td class="ro">${escapeHtml(p.energyState||'')}</td>
        <td class="ro">${escapeHtml(p.dilutionRisk||'')}</td>
        <td>${escapeHtml(p.status||'')}</td>
        <td>${escapeHtml(p.plannedEnd||'')}</td>
        <td class="mask-name">${escapeHtml(p.owner||'')}</td>
        <td><button data-edit="${escapeHtml(p.id)}" aria-label="Modifier le projet">✏️</button> <button data-report="${escapeHtml(p.id)}" data-kind="project" aria-label="Rapport">📄</button> <button class="secondary" data-del="${escapeHtml(p.id)}" aria-label="Supprimer">🗑️</button></td>`;
      tb.appendChild(tr);
      tr.addEventListener('dblclick', () => openForm('project', p));
    }
    tb.querySelectorAll('input[type=checkbox]').forEach(c=> c.addEventListener('change', ()=> updateBulkBar('projects')));
    tb.querySelectorAll('button[data-edit]').forEach(btn=> btn.addEventListener('click', async ()=> openForm('project', await idb.get(db,'projects', btn.dataset.edit)) ));
    tb.querySelectorAll('button[data-report]').forEach(btn=> btn.addEventListener('click', ()=> openReport(btn.dataset.kind, btn.dataset.report)) );
    tb.querySelectorAll('button[data-del]').forEach(btn=> btn.addEventListener('click', async ()=> { if (confirm(`Supprimer ${btn.dataset.del} ? (corbeille)`)){ const it=await idb.get(db,'projects', btn.dataset.del); await idb.put(db,'trash',{id:'TR-'+it.id, store:'projects', ts:Date.now(), item:it}); await idb.del(db,'projects', btn.dataset.del); await audit('delete','projects',btn.dataset.del); refreshProjects(); refreshTrash(); }}));
    tb.querySelectorAll('button.parent-link').forEach(btn => btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setProjectHierarchyFocus(btn.dataset.parent || '__all');
    }));
    tb.querySelectorAll('button.child-link').forEach(btn => btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setProjectHierarchyFocus(btn.dataset.target || '__all', true);
    }));
    updateBulkBar('projects');
  }

  async function refreshActions(){
    const [actions, projects] = await Promise.all([ idb.getAll(db,'actions'), idb.getAll(db,'projects') ]);
    const projMap = new Map(projects.map(p=> [p.id, p.title||p.id]));
    // Hide archived actions by default
    let acts = applyFiltersToData('actions', actions.filter(a=> !a.archived));
    acts = filterBySearch(acts, $('#searchActions').value, ['id','idProject','task','owner','statusTask','dueDate']);
    renderFilterBar('actions');
    const srt = getSort('actions'); if (srt && srt.key){ acts = sortBy(acts, srt.key, srt.dir, srt.type); }
    const tb = $('#tblActions tbody'); tb.innerHTML='';
    // Niveau d’énergie actuel saisi par l’utilisateur, utilisé pour le calcul de score
    const energyNow = Number(document.getElementById('userEnergyNow')?.value) || 5;
    // Si l’auto‑priorisation est activée, recalculer les scores et trier la liste
    if (autoPrioActive){
      acts = window.autoPrioritizeTasks(acts, energyNow, { decorate: true });
    }
    for (const a of acts){
      // Calculer le score pour l’action courante (même si autoPrioActive=false)
      let breakdown;
      let score;
      try{
        const res = window.calculateTaskScore(a, energyNow);
        breakdown = res;
        score = Math.round(res.score);
      }catch(err){
        breakdown = { impactNorm:0.5, urgencyNorm:0.5, effortNorm:0.5, energyAlignment:0.5 };
        score = 50;
      }
      const tooltip = `Impact : ${(breakdown.impactNorm*100).toFixed(0)}%\nUrgence : ${(breakdown.urgencyNorm*100).toFixed(0)}%\nEffort : ${((1-breakdown.effortNorm)*100).toFixed(0)}%\nAlignement : ${(breakdown.energyAlignment*100).toFixed(0)}%`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="selectcol"><input type="checkbox" value="${escapeHtml(a.id)}"></td>
        <td class="col-id ro">${escapeHtml(a.id)}</td>
        <td>${escapeHtml(projMap.get(a.idProject)||a.idProject||'')}</td>
        <td>${escapeHtml(a.task||'')}</td>
        <td>${escapeHtml(a.dueDate||'')}</td>
        <td>${escapeHtml(String(a.points||0))}</td>
        <td><span class="status-toggle" data-id="${escapeHtml(a.id)}" title="Changer le statut">${escapeHtml(a.statusTask === 'done_pending_redteam' ? 'Fait 🔴' : (a.statusTask||''))}</span></td>
        <td class="mask-name">${escapeHtml(a.owner||'')}</td>
        <td><span class="score-badge" title="${tooltip}">${escapeHtml(String(score))}</span></td>
        <td><button data-edit="${escapeHtml(a.id)}" aria-label="Modifier l'action">✏️</button> <button data-report="${escapeHtml(a.id)}" data-kind="action" aria-label="Rapport">📄</button> <button data-archive="${escapeHtml(a.id)}" aria-label="Archiver">📦</button> <button class="secondary" data-del="${escapeHtml(a.id)}" aria-label="Supprimer">🗑️</button></td>`;
      tb.appendChild(tr);
      tr.addEventListener('dblclick', () => openForm('action', a));
    }
    tb.querySelectorAll('input[type=checkbox]').forEach(c=> c.addEventListener('change', ()=> updateBulkBar('actions')));
    tb.querySelectorAll('button[data-edit]').forEach(btn=> btn.addEventListener('click', async ()=> openForm('action', await idb.get(db,'actions', btn.dataset.edit)) ));
    tb.querySelectorAll('button[data-report]').forEach(btn=> btn.addEventListener('click', ()=> openReport(btn.dataset.kind, btn.dataset.report)) );
    tb.querySelectorAll('button[data-archive]').forEach(btn=> btn.addEventListener('click', async ()=> {
      const id = btn.dataset.archive;
      const it = await idb.get(db,'actions', id);
      if (!it) return;
      // Vérifier la présence d’une entrée Red‑Team non committée
      loadRedTeam();
      const hasPendingRT = redTeamEntries.some(rt => rt.taskId === id && rt.status !== 'committed' && rt.status !== 'dismissed');
      // Bloquer l'archivage si une Red‑Team est en attente OU si la tâche a été marquée Fait sans validation Red‑Team
      if (it.statusTask === 'done_pending_redteam' || hasPendingRT || (it.statusTask === 'Fait' && !it.redTeamCommitted)){
        alert('Impossible d\'archiver : une Red‑Team est en attente pour cette tâche. → Aller à Red‑Team');
        // Naviguer vers la vue Red-Team pour permettre le traitement
        showView('redteam');
        refreshRedTeam();
        return;
      }
      it.archived = true;
      await idb.put(db,'actions', it);
      await audit('archive','actions', id);
      showToast('Action archivée');
      refreshActions();
    }));
    tb.querySelectorAll('button[data-del]').forEach(btn=> btn.addEventListener('click', async ()=> { if (confirm(`Supprimer ${btn.dataset.del} ? (corbeille)`)){ const it=await idb.get(db,'actions', btn.dataset.del); await idb.put(db,'trash',{id:'TR-'+it.id, store:'actions', ts:Date.now(), item:it}); await idb.del(db,'actions', btn.dataset.del); await audit('delete','actions',btn.dataset.del); refreshActions(); refreshTrash(); }}));

    // Permettre de basculer rapidement le statut en cliquant sur la cellule
    tb.querySelectorAll('span.status-toggle').forEach(span => span.addEventListener('click', async (e) => {
      const actionId = e.currentTarget.dataset.id;
      const action = await idb.get(db, 'actions', actionId);
      if (!action) return;
      const current = action.statusTask || '';
      // Cas 1 : déjà en attente Red‑Team → repasser à "À faire" et supprimer l'entrée
      if (current === 'done_pending_redteam'){
        action.statusTask = 'À faire';
        action.doneDate = '';
        // Supprimer l'entrée Red‑Team associée (non traitée)
        loadRedTeam();
        redTeamEntries = redTeamEntries.filter(rt => !(rt.taskId === action.id && rt.status === 'to_process'));
        saveRedTeam();
        await idb.put(db, 'actions', action);
        await audit('update','actions', actionId);
        e.currentTarget.textContent = 'À faire';
        showToast('Statut action → À faire');
        refreshRedTeam();
        refreshDashboard();
        return;
      }
      // Cas 2 : Fait sans Red‑Team ou autre statut → passer à done_pending_redteam
      if (current === 'Fait'){
        // Si l'action est déjà Fait (sans redteam) on bascule sur À faire
        action.statusTask = 'À faire';
        action.doneDate = '';
        await idb.put(db,'actions', action);
        await audit('update','actions', actionId);
        e.currentTarget.textContent = 'À faire';
        showToast('Statut action → À faire');
        return;
      }
      // Dans les autres cas (À faire, En cours, Bloqué…), marquer comme fait
      action.statusTask = 'done_pending_redteam';
      action.doneDate = fmtDate(new Date());
      await idb.put(db,'actions', action);
      await audit('update','actions', actionId);
      // Créer une entrée Red‑Team et notifier
      createRedTeamEntry(action);
      e.currentTarget.textContent = 'Fait 🔴';
      showToast('Tâche marquée comme faite. Red‑Team à traiter.');
      refreshDashboard();
    }));
    updateBulkBar('actions');
  }

  async function refreshViews(){
    const [projects, actions] = await Promise.all([ idb.getAll(db,'projects'), idb.getAll(db,'actions') ]);
    const actBy = groupBy(actions,'idProject');
    const projs = projects.map(p=> computeProject(p, actBy[p.id]||[]));
    const late = projs.filter(p=> p.overdue).sort((a,b)=> (a.plannedEnd||'').localeCompare(b.plannedEnd||''));
    fillRows($('#tblViewLate tbody'), late.map(p=> [p.id, p.title||'', p.startDate||'', p.plannedEnd||'', fmtPct(p.variance||0), fmtNum(p.ICE,1), p.priority||'', maskName(p.owner||'')]));
    const blocked = projs.filter(p=> p.status==='Bloqué');
    fillRows($('#tblViewBlocked tbody'), blocked.map(p=> [p.id, p.title||'', fmtPct(p.progressOverall||0), fmtNum(p.ICE,1), p.priority||'', maskName(p.owner||'')]));
    const days = thresholds.dueSoonDays||7, now=today(); const soon = dateAddDays(now,days);
    const dueSoon = actions.filter(a=> a.statusTask!=='Fait' && a.dueDate && parseDate(a.dueDate)>=now && parseDate(a.dueDate)<=soon).sort((a,b)=> (a.dueDate||'').localeCompare(b.dueDate||''));
    const projMap = new Map(projects.map(p=> [p.id, p.title||p.id]));
    fillRows($('#tblViewDueSoon tbody'), dueSoon.map(a=> [a.id, projMap.get(a.idProject)||a.idProject, a.task||'', a.dueDate||'', String(daysBetween(now, parseDate(a.dueDate))), maskName(a.owner||'')]));
    // watchlist paint + datalist
    paintWatchlistDatalist(projects);
    paintWatchlist();

    // ----- Routines & Actions for today (daily view) -----
    try{
      const todayDate = today();
      const todayStr = fmtDate(todayDate);
      // Selected mode for routines
      const mode = routineViewMode || 'short';
      // Load routines and routine tasks
      const [routines, rTasks] = await Promise.all([ idb.getAll(db,'routines'), idb.getAll(db,'routineTasks') ]);
      // ===== Implémentation unifiée v3.4.14 pour l'affichage quotidien des routines et actions =====
      // On affiche une seule ligne par routine dans le tableau des routines, et l'on injecte
      // les tâches du mode sélectionné dans le tableau des actions. Les tâches "Fait"
      // pour aujourd'hui ne sont pas réaffichées. Lorsqu'une routine est marquée comme faite,
      // toutes ses tâches du mode sélectionné sont considérées faites pour la journée.
      try {
        const todayDate = today();
        const todayStr = fmtDate(todayDate);
        // Préparer les lignes du tableau des routines et des actions
        const tbodyR = document.querySelector('#tblViewRoutineToday tbody');
        if (tbodyR) tbodyR.innerHTML = '';
        const actRows = [];
        // Construire une carte projet -> nom pour les actions normales
        const projMap = new Map(projects.map(p => [p.id, p.title || p.id]));
        // Itérer sur chaque routine active et non archivée
        for (const r of (routines || [])) {
          if (r.archived || r.active === false) continue;
          // Vérifier si la routine doit être exécutée aujourd'hui
          let isToday = false;
          if (!r.frequency || r.frequency === 'daily') isToday = true;
          else if (r.frequency === 'weekly' && Array.isArray(r.dow)) isToday = r.dow.includes(todayDate.getDay());
          else if (r.frequency === 'monthly') isToday = (r.dom && Number(r.dom) === todayDate.getDate());
          if (!isToday) continue;
          // Récupérer toutes les tâches pour cette routine
          const tasksAll = (rTasks || []).filter(t => t.routineId === r.id && !t.archived);
          tasksAll.sort((a, b) => (a.order || 0) - (b.order || 0));
          // Mode sélectionné pour cette routine : spécifique ou global par défaut
          const sel = routineModes[r.id] || routineViewMode || 'short';
          // Filtrer les tâches pour ce mode
          const tasksForMode = tasksAll.filter(t => {
            if (t.mode) {
              // Supporter libellés français et anglais
              const frToEn = { 'Court': 'short', 'court': 'short', 'Normal': 'normal', 'normal': 'normal', 'Long': 'long', 'long': 'long' };
              const m = frToEn[String(t.mode)] || String(t.mode).toLowerCase();
              return m === sel;
            }
            // Sinon, utiliser les propriétés short/normal/long
            if (sel === 'short') return (t.short != null && t.short > 0);
            if (sel === 'normal') return (t.normal != null && t.normal > 0);
            if (sel === 'long') return (t.long != null && t.long > 0);
            return false;
          });
          // Déterminer si toutes les tâches du mode sont déjà marquées comme faites
          let doneAll = true;
          for (const t of tasksForMode) {
            const rid = `${r.id}-${t.id}`;
            if (!doneRoutineToday.tasks || !doneRoutineToday.tasks[rid]) {
              doneAll = false;
              break;
            }
          }
          // Créer la ligne de la routine
          if (tbodyR) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${escapeHtml(r.id)}</td>
              <td>${escapeHtml(r.name || r.id)}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td><span class="routine-status" data-rid="${escapeHtml(r.id)}">${doneAll ? 'Fait' : 'À faire'}</span></td>`;
            // Ajouter les boutons de sélection de mode dans la colonne "Mode" (index 4)
            const modeCell = tr.children[4];
            ['short', 'normal', 'long'].forEach(m => {
              const b = document.createElement('button');
              b.textContent = m.charAt(0).toUpperCase();
              b.dataset.routine = r.id;
              b.dataset.mode = m;
              b.title = m;
              // Appliquer une classe spécifique pour le style horizontal
              b.classList.add('mode-btn');
              if (m === sel) b.classList.add('active');
              b.addEventListener('click', ev => {
                ev.stopPropagation();
                routineModes[r.id] = m;
                refreshViews();
              });
              modeCell.appendChild(b);
            });
            // Clic sur la ligne pour ouvrir la popup des tâches (hors boutons et statut)
            tr.addEventListener('click', ev => {
              if (ev.target.closest('button') || ev.target.closest('span.routine-status')) return;
              showRoutineTasksPopup(r.id, sel);
            });
            // Clic sur le statut pour marquer/démarquer toutes les tâches du mode comme faites pour aujourd'hui
            const stEl = tr.querySelector('span.routine-status');
            stEl.addEventListener('click', ev => {
              ev.stopPropagation();
              if (!doneRoutineToday.tasks) doneRoutineToday.tasks = {};
              const markDone = stEl.textContent.trim() !== 'Fait';
              for (const t of tasksForMode) {
                const rid2 = `${r.id}-${t.id}`;
                if (markDone) doneRoutineToday.tasks[rid2] = true;
                else delete doneRoutineToday.tasks[rid2];
              }
              saveDoneRoutineToday();
              showToast(markDone ? 'Routine marquée comme faite pour aujourd\'hui' : 'Routine réinitialisée');
              refreshViews();
            });
            tbodyR.appendChild(tr);
          }
          // Ajouter les tâches de cette routine dans la liste des actions (uniquement si non faites)
          for (const t of tasksForMode) {
            const rid3 = `${r.id}-${t.id}`;
            if (doneRoutineToday.tasks && doneRoutineToday.tasks[rid3]) continue;
            // Determine a ranking for the moment of the day; default to afternoon (2)
            const m = (t.timeOfDay || '').toLowerCase();
            const timeRank = m==='morning' ? 1 : m==='afternoon' ? 2 : m==='evening' ? 3 : 2;
            let durationMinutes = Number(t.duration || 0);
            if (!durationMinutes){
              const short = Number(t.short || 0);
              const normal = Number(t.normal || 0);
              const long = Number(t.long || 0);
              if (sel === 'short' && short) durationMinutes = short;
              else if (sel === 'normal' && normal) durationMinutes = normal;
              else if (sel === 'long' && long) durationMinutes = long;
            }
            const displayDuration = formatDurationMinutes(durationMinutes);
            actRows.push({ row: [
              escapeHtml(rid3),
              escapeHtml(r.name || r.id),
              escapeHtml(t.title || ''),
              '',
              escapeHtml(displayDuration),
              'À faire',
              ''
            ], rank: timeRank, timeMinutes: durationMinutes, timerLabel: `${r.name || r.id} — ${t.title || ''}` });
          }
        }
        // Ajouter les autres actions (non routinières) qui doivent apparaître aujourd'hui
        for (const a of (actions || [])) {
          if (a.archived) continue;
          const st = a.statusTask || '';
          const done = a.doneDate ? parseDate(a.doneDate) : null;
          const start = a.startDate ? parseDate(a.startDate) : null;
          const due = a.dueDate ? parseDate(a.dueDate) : null;
          const showAct = ((st !== 'Fait') && ((due && fmtDate(due) === todayStr) || (start && start <= todayDate && !done)));
          if (showAct) {
            const m = (a.timeOfDay || '').toLowerCase();
            const timeRank = m==='morning' ? 1 : m==='afternoon' ? 2 : m==='evening' ? 3 : 2;
            let minutesEstimate = Math.round((Number(a.estHours) || 0) * 60);
            if (!minutesEstimate){
              const real = Math.round((Number(a.realHours) || 0) * 60);
              if (real) minutesEstimate = real;
            }
            const displayDuration = formatDurationMinutes(minutesEstimate);
            actRows.push({ row: [
              escapeHtml(a.id),
              escapeHtml(projMap.get(a.idProject) || a.idProject || ''),
              escapeHtml(a.task || ''),
              escapeHtml(a.dueDate || ''),
              escapeHtml(displayDuration),
              escapeHtml(st || ''),
              escapeHtml(a.owner || '')
            ], rank: timeRank, timeMinutes: minutesEstimate, timerLabel: `${projMap.get(a.idProject) || a.idProject || ''} — ${a.task || ''}` });
          }
        }
        // Trier les actions et tâches de routine selon leur rang de moment (1: matin, 2: aprem, 3: soir)
        const sortedAct = actRows.sort((a,b) => (a.rank||2) - (b.rank||2));
        const tbodyAction = document.querySelector('#tblViewActionToday tbody');
        fillRows(tbodyAction, sortedAct.map(item=>item.row));
        // Ajouter un bouton de fin de tâche à chaque ligne et détecter le type (routine ou action)
        try {
          const tbodyAct = document.querySelector('#tblViewActionToday tbody');
          if (tbodyAct) {
            const rows = Array.from(tbodyAct.querySelectorAll('tr'));
            rows.forEach((tr, idx) => {
              const meta = sortedAct[idx] || {};
              const id = (tr.children[0]?.textContent || '').trim();
              const type = id.includes('-RT') ? 'routine' : 'action';
              const timeCell = tr.children[4];
              const minutes = Number(meta.timeMinutes || 0);
              if (timeCell){
                if (minutes > 0){
                  timeCell.classList.add('time-cell');
                  timeCell.dataset.minutes = String(minutes);
                  timeCell.dataset.label = meta.timerLabel || `${tr.children[2]?.textContent || ''}`;
                  timeCell.setAttribute('tabindex','0');
                  timeCell.setAttribute('role','button');
                  timeCell.setAttribute('aria-label', `Démarrer le chronomètre (${timeCell.textContent.trim()})`);
                  timeCell.title = 'Cliquer pour lancer le chronomètre';
                  timeCell.addEventListener('click', handleTimeCellClick);
                  timeCell.addEventListener('keydown', handleTimeCellKey);
                } else {
                  timeCell.classList.remove('time-cell');
                }
              }
              const btn = document.createElement('button');
              btn.textContent = '✓';
              btn.title = 'Marquer comme faite';
              btn.dataset.id = id;
              btn.dataset.type = type;
              btn.addEventListener('click', handleMarkDoneViewAction);
              const td = document.createElement('td');
              td.appendChild(btn);
              tr.appendChild(td);
            });
          }
          // Construire la liste des tâches déjà faites aujourd'hui
          const doneRows = [];
          // Actions marquées Fait aujourd'hui (non archivées)
          for (const a of (actions || [])) {
            if (a.archived) continue;
            if (a.statusTask === 'Fait') {
              const doneDate = a.doneDate ? parseDate(a.doneDate) : null;
              if (doneDate && fmtDate(doneDate) === todayStr) {
                doneRows.push([
                  escapeHtml(a.id),
                  escapeHtml(projMap.get(a.idProject) || a.idProject || ''),
                  escapeHtml(a.task || ''),
                  escapeHtml(a.dueDate || ''),
                  'Fait',
                  escapeHtml(a.owner || '')
                ]);
              }
            }
          }
          // Tâches de routine marquées faites aujourd'hui
          if (doneRoutineToday.tasks) {
            const routineMap = new Map((routines || []).map(r => [r.id, r]));
            const taskMap = new Map((rTasks || []).map(t => [t.id, t]));
            for (const ridKey of Object.keys(doneRoutineToday.tasks)) {
              const idx = ridKey.lastIndexOf('-RT');
              if (idx > 0) {
                const routineId = ridKey.substring(0, idx);
                const taskId = ridKey.substring(idx + 1);
                const r = routineMap.get(routineId);
                const t = taskMap.get(taskId);
                if (r && t) {
                  doneRows.push([
                    escapeHtml(ridKey),
                    escapeHtml(r.name || r.id),
                    escapeHtml(t.title || ''),
                    '',
                    'Fait',
                    ''
                  ]);
                }
              }
            }
          }
          fillRows(document.querySelector('#tblViewActionDone tbody'), doneRows);
        } catch (err2) {
          console.warn('Erreur lors de la préparation des boutons et de la liste faite', err2);
        }
      } catch (err) {
        console.warn('Erreur lors de l\'affichage des routines et actions', err);
      }
      return; // empêcher l'exécution de l'ancien code d'affichage des routines
      // Affichage des routines du jour et dispatch des tâches dans le bloc Actions
      const tbodyR = document.querySelector('#tblViewRoutineToday tbody');
      if (tbodyR) tbodyR.innerHTML = '';
      // Les tâches de routines seront ajoutées au tableau Actions
      for (const r of (routines||[])){
        if (r.archived || r.active===false) continue;
        let show = false;
        if (!r.frequency || r.frequency==='daily') show = true;
        else if (r.frequency==='weekly' && Array.isArray(r.dow)) show = r.dow.includes(todayDate.getDay());
        else if (r.frequency==='monthly') show = (r.dom && Number(r.dom) === todayDate.getDate());
        if (!show) continue;
        const tasksAll = (rTasks||[]).filter(t => t.routineId===r.id && !t.archived);
        tasksAll.sort((a,b) => (a.order||0)-(b.order||0));
        const selMode = routineModes[r.id] || 'short';
        // Mapping des étiquettes de mode en anglais/français afin de supporter les valeurs « Court », « Normal », « Long ».
        const tasksForMode = tasksAll.filter(t => {
          if (t.mode){
            // Convertir la valeur du champ mode en minuscule sans accents et comparer avec selMode
            const frToEn = { 'Court':'short', 'court':'short', 'Normal':'normal', 'normal':'normal', 'Long':'long', 'long':'long' };
            const m = frToEn[String(t.mode)] || String(t.mode).toLowerCase();
            return m === selMode;
          }
          if (selMode === 'short') return (t.short != null && t.short > 0);
          if (selMode === 'normal') return (t.normal != null && t.normal > 0);
          if (selMode === 'long') return (t.long != null && t.long > 0);
          return false;
        });
        // Ajouter les tâches de cette routine dans le bloc Actions (actRows)
        for (const t of tasksForMode){
          const rowId = `${r.id}-${t.id}`;
          if (doneRoutineToday.tasks && doneRoutineToday.tasks[rowId]) continue;
          // Calculer durée
          let dur;
          if (t.mode){ dur = t.duration != null ? t.duration : 0; }
          else { dur = (selMode==='short'? t.short : selMode==='normal'? t.normal : t.long); }
          actRows.push([ rowId, r.name||r.id, t.title||'', '', 'À faire', '' ]);
        }
        // Ajouter une seule ligne pour la routine dans le tableau Routine
        if (tasksForMode.length > 0){
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${escapeHtml(r.id)}</td>
            <td>${escapeHtml(r.name||r.id)}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><span class="routine-status" data-rid="${escapeHtml(r.id)}">À faire</span></td>`;
          // Colonne 5 : boutons de mode
          const modeTd = tr.children[4];
          ['short','normal','long'].forEach(m => {
            const btn = document.createElement('button');
            btn.textContent = m.charAt(0).toUpperCase();
            btn.dataset.routine = r.id;
            btn.dataset.mode = m;
            btn.title = m;
            if (m === selMode) btn.classList.add('active');
            btn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              routineModes[r.id] = m;
              refreshViews();
            });
            modeTd.appendChild(btn);
          });
          // Colonne 6 : responsable vide
          tr.children[5].textContent = '';
          // Événement d'ouverture du popup
          tr.addEventListener('click', (ev) => {
            if (ev.target.closest('button')) return;
            showRoutineTasksPopup(r.id, selMode);
          });
          // Gérer statut : marquer toutes les tâches de cette routine comme faites pour aujourd'hui
          const stSpan = tr.querySelector('span.routine-status');
          stSpan.addEventListener('click', (ev) => {
            ev.stopPropagation();
            for (const t of tasksForMode){
              const rid = `${r.id}-${t.id}`;
              if (!doneRoutineToday.tasks) doneRoutineToday.tasks = {};
              doneRoutineToday.tasks[rid] = true;
            }
            saveDoneRoutineToday();
            showToast('Routine marquée comme faite pour aujourd\'hui');
            refreshViews();
          });
          if (tbodyR) tbodyR.appendChild(tr);
        }
      }
      // Actions for today / in progress
      const acts = (await idb.getAll(db,'actions'))||[];
      const actRows = [];
      const projMap2 = new Map(projects.map(p=> [p.id, p.title||p.id]));
      acts.forEach(a => {
        if (a.archived) return;
        const st = a.statusTask || '';
        const done = a.doneDate ? parseDate(a.doneDate) : null;
        const start = a.startDate ? parseDate(a.startDate) : null;
        const due = a.dueDate ? parseDate(a.dueDate) : null;
        const showAct = ((st !== 'Fait') && ((due && fmtDate(due)===todayStr) || (start && start <= todayDate && !done)));
        if (showAct){
          actRows.push([ a.id, projMap2.get(a.idProject)||a.idProject||'', a.task||'', a.dueDate||'', st||'', a.owner||'' ]);
        }
      });
      fillRows(document.querySelector('#tblViewActionToday tbody'), actRows);
      // ---- Surcharge de l'affichage des routines et actions ----
      // Pour la version 3.4.13, on remplace l'ancien comportement où chaque tâche de routine
      // apparaissait dans le tableau « Routines ». À la place, une seule ligne par routine
      // est affichée et les tâches du mode sélectionné sont injectées dans le tableau des actions.
      try{
        const tbodyR_new = document.querySelector('#tblViewRoutineToday tbody');
        if (tbodyR_new) tbodyR_new.innerHTML = '';
        const routineActRows = [];
        for (const r of (routines||[])){
          if (r.archived || r.active === false) continue;
          // Vérifier si la routine doit être exécutée aujourd'hui
          let isToday = false;
          if (!r.frequency || r.frequency === 'daily') isToday = true;
          else if (r.frequency === 'weekly' && Array.isArray(r.dow)) isToday = r.dow.includes(todayDate.getDay());
          else if (r.frequency === 'monthly') isToday = (r.dom && Number(r.dom) === todayDate.getDate());
          if (!isToday) continue;
          // Charger toutes les tâches de cette routine et trier
          const allTasks = (rTasks||[]).filter(t => t.routineId === r.id && !t.archived);
          allTasks.sort((a,b) => (a.order||0) - (b.order||0));
          const sel = routineModes[r.id] || 'short';
          const tasksForMode = allTasks.filter(t => {
            if (t.mode){
              const frToEn = { 'Court':'short', 'court':'short', 'Normal':'normal', 'normal':'normal', 'Long':'long', 'long':'long' };
              const m = frToEn[String(t.mode)] || String(t.mode).toLowerCase();
              return m === sel;
            }
            if (sel === 'short') return (t.short != null && t.short > 0);
            if (sel === 'normal') return (t.normal != null && t.normal > 0);
            if (sel === 'long') return (t.long != null && t.long > 0);
            return false;
          });
          // Déterminer si toutes les tâches du mode ont été faites aujourd'hui
          let doneAll = true;
          for (const t of tasksForMode){
            const rid = `${r.id}-${t.id}`;
            if (!doneRoutineToday.tasks || !doneRoutineToday.tasks[rid]){ doneAll = false; break; }
          }
          // Construire une ligne de routine
          if (tbodyR_new){
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${escapeHtml(r.id)}</td>
              <td>${escapeHtml(r.name||r.id)}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td><span class="routine-status" data-rid="${escapeHtml(r.id)}">${doneAll ? 'Fait' : 'À faire'}</span></td>`;
            // boutons de mode dans la 5e colonne (index 4)
            const modeCell = tr.children[4];
            ['short','normal','long'].forEach(m => {
              const b = document.createElement('button');
              b.textContent = m.charAt(0).toUpperCase();
              b.dataset.routine = r.id;
              b.dataset.mode = m;
              b.title = m;
              if (m === sel) b.classList.add('active');
              b.addEventListener('click', ev => {
                ev.stopPropagation();
                routineModes[r.id] = m;
                refreshViews();
              });
              modeCell.appendChild(b);
            });
            // Clic ligne pour afficher popup
            tr.addEventListener('click', ev => {
              if (ev.target.closest('button') || ev.target.closest('span.routine-status')) return;
              showRoutineTasksPopup(r.id, sel);
            });
            // Clic sur statut pour marquer ou réinitialiser
            const stEl = tr.querySelector('span.routine-status');
            stEl.addEventListener('click', ev => {
              ev.stopPropagation();
              if (!doneRoutineToday.tasks) doneRoutineToday.tasks = {};
              const markAsDone = stEl.textContent.trim() !== 'Fait';
              for (const t of tasksForMode){
                const rid2 = `${r.id}-${t.id}`;
                if (markAsDone) doneRoutineToday.tasks[rid2] = true;
                else delete doneRoutineToday.tasks[rid2];
              }
              saveDoneRoutineToday();
              showToast(markAsDone ? 'Routine marquée comme faite' : 'Routine réinitialisée');
              refreshViews();
            });
            tbodyR_new.appendChild(tr);
          }
          // Insérer les tâches non faites dans la liste d'actions
          for (const t of tasksForMode){
            const rid3 = `${r.id}-${t.id}`;
            if (doneRoutineToday.tasks && doneRoutineToday.tasks[rid3]) continue;
            routineActRows.push([
              escapeHtml(rid3),
              escapeHtml(r.name||r.id),
              escapeHtml(t.title||''),
              '',
              'À faire',
              ''
            ]);
          }
        }
        // Préparer les actions normales de la journée
        const actsAll = (await idb.getAll(db,'actions'))||[];
        const actRowsNew = [];
        const projMap = new Map(projects.map(p => [p.id, p.title||p.id]));
        actsAll.forEach(a => {
          if (a.archived) return;
          const st = a.statusTask || '';
          const done = a.doneDate ? parseDate(a.doneDate) : null;
          const start = a.startDate ? parseDate(a.startDate) : null;
          const due = a.dueDate ? parseDate(a.dueDate) : null;
          const showAct = ((st !== 'Fait') && ((due && fmtDate(due) === todayStr) || (start && start <= todayDate && !done)));
          if (showAct){
            actRowsNew.push([
              escapeHtml(a.id),
              escapeHtml(projMap.get(a.idProject)||a.idProject||''),
              escapeHtml(a.task||''),
              escapeHtml(a.dueDate||''),
              escapeHtml(st||''),
              escapeHtml(a.owner||'')
            ]);
          }
        });
        routineActRows.forEach(row => actRowsNew.push(row));
        fillRows(document.querySelector('#tblViewActionToday tbody'), actRowsNew);
      }catch(err){ console.warn('vue override error', err); }
    }catch(e){ console.warn('refreshViews routine/action today error', e); }
  }

  // ---------- Archives ----------
  /**
   * Rafraîchit la vue des éléments archivés (actions et routines).
   * Cette fonction lit en base toutes les actions et routines, filtre celles
   * marquées comme archivées et alimente les tableaux dédiés dans la vue
   * « Archivés ». Elle ajoute également les gestionnaires d'événements pour
   * restaurer (dé‑archiver) ou supprimer définitivement les éléments.
   */
  async function refreshArchives(){
    // Charger l'ensemble des objets nécessaires en parallèle
    const [actions, projects, routines, systems] = await Promise.all([
      idb.getAll(db,'actions'),
      idb.getAll(db,'projects'),
      idb.getAll(db,'routines'),
      idb.getAll(db,'systems')
    ]);
    // Maps pour convertir ID -> libellé
    const projMap = new Map((projects||[]).map(p => [p.id, p.title || p.id]));
    const sysMap  = new Map((systems||[]).map(s => [s.id, s.title || s.id]));
    // ------ Actions archivées ------
    const actTb = document.querySelector('#tblArchivedActions tbody');
    if (actTb){
      actTb.innerHTML = '';
      const archivedActions = (actions||[]).filter(a => a.archived);
      for (const a of archivedActions){
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-id">${escapeHtml(a.id)}</td>
          <td>${escapeHtml(projMap.get(a.idProject) || a.idProject || '')}</td>
          <td>${escapeHtml(a.task || '')}</td>
          <td>${escapeHtml(a.dueDate || '')}</td>
          <td>${escapeHtml(String(a.points || 0))}</td>
          <td>${escapeHtml(a.statusTask || '')}</td>
          <td class="mask-name">${escapeHtml(a.owner || '')}</td>
          <td><button data-unarchive-action="${escapeHtml(a.id)}" aria-label="Restaurer l'action">↩️</button> <button class="secondary" data-del-action="${escapeHtml(a.id)}" aria-label="Supprimer définitivement">🗑️</button></td>`;
        actTb.appendChild(tr);
      }
      // Gestionnaires pour restaurer et supprimer définitivement une action
      actTb.querySelectorAll('button[data-unarchive-action]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.unarchiveAction;
        const a = await idb.get(db,'actions', id);
        if (!a) return;
        a.archived = false;
        await idb.put(db,'actions', a);
        await audit('unarchive','actions', id);
        showToast('Action restaurée');
        refreshArchives();
        refreshActions();
      }));
      actTb.querySelectorAll('button[data-del-action]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.delAction;
        if (!confirm(`Supprimer définitivement ${id} ?`)) return;
        const a = await idb.get(db,'actions', id);
        if (a){
          await idb.put(db,'trash',{id:'TR-'+a.id, store:'actions', ts:Date.now(), item:a});
          await idb.del(db,'actions', id);
          await audit('delete','actions', id);
        }
        showToast('Action supprimée');
        refreshArchives();
        refreshTrash();
      }));
    }
    // ------ Routines archivées ------
    const rtTb = document.querySelector('#tblArchivedRoutines tbody');
    if (rtTb){
      rtTb.innerHTML = '';
      const archivedRoutines = (routines||[]).filter(r => r.archived);
      for (const r of archivedRoutines){
        const freqLabel = (r.frequency==='daily'? 'Quotid.' : r.frequency==='weekly'? 'Hebdo.' : r.frequency==='monthly'? 'Mens.' : (r.frequency||''));
        const activeLabel = (r.active===false ? 'Non' : 'Oui');
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-id">${escapeHtml(r.id)}</td>
          <td>${escapeHtml(sysMap.get(r.idSystem) || r.idSystem || '')}</td>
          <td>${escapeHtml(r.name || '')}</td>
          <td>${escapeHtml(freqLabel)}</td>
          <td>${escapeHtml(activeLabel)}</td>
          <td><button data-unarchive-routine="${escapeHtml(r.id)}" aria-label="Restaurer la routine">↩️</button> <button class="secondary" data-del-routine="${escapeHtml(r.id)}" aria-label="Supprimer définitivement">🗑️</button></td>`;
        rtTb.appendChild(tr);
      }
      // Gestionnaires pour restaurer et supprimer définitivement une routine
      rtTb.querySelectorAll('button[data-unarchive-routine]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.unarchiveRoutine;
        const r = await idb.get(db,'routines', id);
        if (!r) return;
        r.archived = false;
        await idb.put(db,'routines', r);
        await audit('unarchive','routines', id);
        showToast('Routine restaurée');
        refreshArchives();
        if (window.refreshRoutines) window.refreshRoutines();
      }));
      rtTb.querySelectorAll('button[data-del-routine]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.delRoutine;
        if (!confirm('Supprimer définitivement cette routine et ses tâches ?')) return;
        const tasks = await idb.indexGetAll(db,'routineTasks','byRoutine', id);
        for (const t of (tasks||[])){
          await idb.del(db,'routineTasks', t.id);
          await audit('delete','routineTasks', t.id);
        }
        const r = await idb.get(db,'routines', id);
        if (r){
          await idb.put(db,'trash',{id:'TR-'+r.id, store:'routines', ts:Date.now(), item:r});
          await idb.del(db,'routines', id);
          await audit('delete','routines', id);
        }
        showToast('Routine supprimée');
        refreshArchives();
        refreshTrash();
      }));
    }
  }
  // Expose for external calls (used by refreshView)
  window.refreshArchives = refreshArchives;

  // ---------- Routines (periodic actions) ----------
  let editingRoutineId = null;
  let routineViewMode = 'short';
// Active ou désactive l’auto‑priorisation des actions dans l’affichage des actions.
let autoPrioActive = false;

// --- Gestion des entrées Red‑Team ---
// Les entrées Red‑Team servent à mémoriser les tâches terminées qui doivent
// faire l’objet d’une analyse structurée (Red‑Team). Elles sont stockées
// dans le localStorage sous la clé 'redteamEntries'. Le flux est le suivant :
//  - Lorsqu’une action est marquée comme « Fait », on crée une entrée
//    Red‑Team et on marque la tâche comme 'done_pending_redteam'.
//  - L’utilisateur peut traiter l’entrée via la vue Red‑Team, remplir
//    un formulaire et committer l’analyse. Tant que ce commit n’est pas
//    effectué, la tâche n’est pas archivable.

let redTeamEntries = [];

function loadRedTeam(){
  try{
    redTeamEntries = JSON.parse(localStorage.getItem('redteamEntries') || '[]');
    if (!Array.isArray(redTeamEntries)) redTeamEntries = [];
  }catch(e){ redTeamEntries = []; }
}

function saveRedTeam(){
  localStorage.setItem('redteamEntries', JSON.stringify(redTeamEntries));
}

function createRedTeamEntry(action){
  // Vérifier qu’une entrée existe déjà pour cette tâche (non committée)
  const exists = redTeamEntries.find(rt => rt.taskId === action.id && rt.status !== 'committed' && rt.status !== 'dismissed');
  if (exists) return exists;
  const entry = {
    id: 'RT' + Date.now(),
    taskId: action.id,
    title: action.task || action.id,
    dateAdded: fmtDate(new Date()),
    status: 'to_process',
    suggestedTime: '5–15min',
    autoSummary: ((action.comments || action.task || '') + '').substring(0,200),
    createdBy: (window.currentUser || 'Moi'),
    // Champs dynamiques supplémentaires pouvant être remplis dans le formulaire
    decision: '', cause: '', impact: '', correctif: '', lesson: '', energy: '', lien_commit: ''
  };
  redTeamEntries.unshift(entry);
  saveRedTeam();
  refreshRedTeam();
  return entry;
}

async function refreshRedTeam(){
  loadRedTeam();
  const tbody = document.querySelector('#tblRedTeam tbody');
  const validationBody = document.querySelector('#tblValidationQueue tbody');
  if (!tbody && !validationBody) return;
  if (tbody) tbody.innerHTML = '';
  if (validationBody) validationBody.innerHTML = '';
  const [actions, globals, systems, projects, routines] = await Promise.all([
    idb.getAll(db,'actions'),
    idb.getAll(db,'globals'),
    idb.getAll(db,'systems'),
    idb.getAll(db,'projects'),
    idb.getAll(db,'routines')
  ]);
  if (tbody){
    // Inclure des pseudo‑entrées pour les actions marquées Fait mais non archivées et sans redteam entry committée
    const pseudo = [];
    (actions||[]).forEach(a => {
      if (a.archived) return;
      // N'inclure en pseudo-entrée que les actions terminées (Fait) qui n'ont pas
      // déjà une entrée Red-Team et qui n'ont pas été validées manuellement
      if (a.statusTask === 'Fait'){
        const hasEntry = redTeamEntries.some(rt => rt.taskId === a.id && rt.status !== 'dismissed');
        if (!hasEntry && !a.redTeamCommitted){
          pseudo.push({ id:'PA'+a.id, taskId:a.id, title:a.task||a.id, dateAdded: a.doneDate||'', status:'Fait', pseudo:true });
        }
      }
    });
    // Filtrer uniquement les entrées non dismissées
    const list = redTeamEntries.filter(rt => rt.status !== 'dismissed');
    list.sort((a,b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
    // Concaténer pseudo entrées en haut
    const finalList = pseudo.concat(list);
    for (const rt of finalList){
      const tr = document.createElement('tr');
      let statusLabel;
      if (rt.pseudo){ statusLabel = 'Fait'; }
      else {
        statusLabel = rt.status === 'to_process' ? 'À traiter' : (rt.status === 'in_progress' ? 'En cours' : (rt.status === 'committed' ? 'Validé' : 'Ignoré'));
      }
      tr.innerHTML = `
        <td>${escapeHtml(rt.title)}</td>
        <td>${escapeHtml(rt.dateAdded)}</td>
        <td>${escapeHtml(statusLabel)}</td>
        <td>
          ${rt.pseudo
            ? `<button data-commit-pseudo="${escapeHtml(rt.taskId)}" aria-label="Valider">✅</button>`
            : `<button data-rt="${escapeHtml(rt.id)}" aria-label="Traiter">📝</button>${rt.status !== 'committed' ? ` <button data-commit-rt="${escapeHtml(rt.id)}" aria-label="Valider">✅</button>` : ''}`}
        </td>`;
      tbody.appendChild(tr);
    }
    // Attacher événements de traitement aux vraies entrées
    tbody.querySelectorAll('button[data-rt]').forEach(btn => btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.rt;
      openRedTeamForm(id);
    }));

    // Bouton de validation rapide pour les entrées Red-Team existantes
    tbody.querySelectorAll('button[data-commit-rt]').forEach(btn => btn.addEventListener('click', async (e) => {
      const rtId = e.currentTarget.dataset.commitRt;
      // Recharger les données
      loadRedTeam();
      const entry = redTeamEntries.find(rt => rt.id === rtId);
      if (!entry) return;
      if (entry.status === 'committed') return;
      entry.status = 'committed';
      entry.dateCommitted = fmtDate(new Date());
      saveRedTeam();
      // Mettre à jour la tâche associée
      const action = await idb.get(db,'actions', entry.taskId);
      if (action){
        action.statusTask = 'Fait';
        action.redTeamCommitted = true;
        await idb.put(db,'actions', action);
        await audit('update','actions', action.id);
      }
      showToast('Entrée Red‑Team validée');
      refreshRedTeam();
      refreshActions();
    }));

    // Bouton de validation rapide pour les tâches pseudo (Fait mais sans Red-Team)
    tbody.querySelectorAll('button[data-commit-pseudo]').forEach(btn => btn.addEventListener('click', async (e) => {
      const taskId = e.currentTarget.dataset.commitPseudo;
      // Mettre à jour l’action pour indiquer que la Red-Team a été effectuée
      const a = await idb.get(db, 'actions', taskId);
      if (a){
        a.redTeamCommitted = true;
        await idb.put(db, 'actions', a);
        await audit('update','actions', a.id);
      }
      showToast('Tâche validée — vous pouvez l’archiver');
      refreshRedTeam();
      refreshActions();
    }));
  }

  if (validationBody){
    const queue = gatherValidationQueue({ globals, systems, projects, routines });
    if (!queue.length){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" class="muted">Aucun élément en attente de validation.</td>';
      validationBody.appendChild(tr);
    } else {
      for (const item of queue){
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-id">${escapeHtml(item.id || '')}</td>
          <td>${escapeHtml(item.type)}</td>
          <td>${escapeHtml(item.title || '')}</td>
          <td>${escapeHtml(item.createdAt || '')}</td>
          <td>${escapeHtml(item.dueDate || '')}</td>
          <td>
            <button data-confirm-validation="${escapeHtml(item.id || '')}" data-store="${escapeHtml(item.store)}" aria-label="Confirmer">✅</button>
            <button class="secondary" data-reject-validation="${escapeHtml(item.id || '')}" data-store="${escapeHtml(item.store)}" aria-label="Supprimer">🗑️</button>
          </td>`;
        validationBody.appendChild(tr);
      }
    }
    validationBody.querySelectorAll('button[data-confirm-validation]').forEach(btn => btn.addEventListener('click', (e) => {
      const store = e.currentTarget.dataset.store;
      const id = e.currentTarget.dataset.confirmValidation;
      confirmValidationItem(store, id);
    }));
    validationBody.querySelectorAll('button[data-reject-validation]').forEach(btn => btn.addEventListener('click', (e) => {
      const store = e.currentTarget.dataset.store;
      const id = e.currentTarget.dataset.rejectValidation;
      rejectValidationItem(store, id);
    }));
  }
}

async function confirmValidationItem(store, id){
  if (!store || !id) return;
  try{
    const item = await idb.get(db, store, id);
    if (!item) return;
    const meta = (item.validation && typeof item.validation === 'object') ? { ...item.validation } : {};
    meta.status = 'confirmed';
    meta.confirmedAt = fmtDate(today());
    if (!meta.createdAt) meta.createdAt = fmtDate(today());
    if (!meta.dueDate){
      const due = computeValidationDue(meta) || today();
      meta.dueDate = fmtDate(due);
    }
    item.validation = meta;
    await idb.put(db, store, item);
    await audit('validate', store, id);
    showToast('Élément confirmé');
  }catch(err){
    console.warn('Erreur lors de la confirmation de validation différée', err);
    showToast('Erreur lors de la confirmation');
  }
  refreshStoreAfterValidation(store);
  refreshRedTeam();
  refreshDashboard();
}

async function rejectValidationItem(store, id){
  if (!store || !id) return;
  const label = VALIDATION_TARGETS[store]?.label || 'cet élément';
  if (!confirm(`Supprimer définitivement ${label.toLowerCase()} ?`)) return;
  try{
    if (store === 'routines'){
      const tasks = await idb.indexGetAll(db,'routineTasks','byRoutine', id);
      for (const t of tasks || []){
        await idb.del(db,'routineTasks', t.id);
        await audit('delete','routineTasks', t.id);
      }
    }
    await idb.del(db, store, id);
    await audit('delete', store, id);
    showToast(`${label} supprimé`);
  }catch(err){
    console.warn('Erreur lors de la suppression de validation différée', err);
    showToast('Erreur lors de la suppression');
  }
  refreshStoreAfterValidation(store);
  refreshRedTeam();
  refreshDashboard();
}

function openRedTeamForm(entryId){
  loadRedTeam();
  const entry = redTeamEntries.find(rt => rt.id === entryId);
  if (!entry) return;
  const form = document.getElementById('formRedTeam');
  if (!form) return;
  form.dataset.rtid = entryId;
  // Remplir les champs
  form.title.value = entry.title;
  form.duration.value = entry.suggestedTime;
  form.time.value = entry.time || '';
  form.success.value = entry.success || '';
  form.drain.value = entry.drain || '';
  form.decision.value = entry.decision || '';
  form.cause.value = entry.cause || '';
  form.impact.value = entry.impact || '';
  form.correctif.value = entry.correctif || '';
  form.lesson.value = entry.lesson || '';
  form.energy.value = entry.energy || '';
  form.lien_commit.value = entry.lien_commit || '';
  // Afficher le formulaire
  form.classList.remove('collapsed');
  try{ form.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){}
}

function handleRedTeamCommit(e){
  e.preventDefault();
  const form = e.currentTarget;
  const entryId = form.dataset.rtid;
  loadRedTeam();
  const entry = redTeamEntries.find(rt => rt.id === entryId);
  if (!entry) return;
  // Validation minimaliste
  if (!form.decision.value.trim() || !form.cause.value.trim() || !form.impact.value.trim() || !form.correctif.value.trim() || !form.lesson.value.trim() || !form.energy.value){
    alert('Veuillez remplir tous les champs obligatoires avant de committer.');
    return;
  }
  // Enregistrer dans l’entrée
  entry.status = 'committed';
  entry.time = form.time.value;
  entry.success = form.success.value;
  entry.drain = form.drain.value;
  entry.decision = form.decision.value;
  entry.cause = form.cause.value;
  entry.impact = form.impact.value;
  entry.correctif = form.correctif.value;
  entry.lesson = form.lesson.value;
  entry.energy = form.energy.value;
  entry.lien_commit = form.lien_commit.value;
  entry.dateCommitted = fmtDate(new Date());
  saveRedTeam();
  // Mettre à jour la tâche associée : passer de done_pending_redteam à Fait
  (async () => {
    const action = await idb.get(db, 'actions', entry.taskId);
    if (action){
      action.statusTask = 'Fait';
      await idb.put(db, 'actions', action);
      await audit('update','actions', action.id);
    }
    refreshActions();
  })();
  showToast('✅ Commit structurel ajouté — vous pouvez maintenant archiver la tâche.');
  form.classList.add('collapsed');
  refreshRedTeam();
}

function handleRedTeamDismiss(){
  const form = document.getElementById('formRedTeam');
  const entryId = form.dataset.rtid;
  loadRedTeam();
  const entry = redTeamEntries.find(rt => rt.id === entryId);
  if (!entry) return;
  if (!confirm('Ignorer cette entrée Red‑Team ?')) return;
  entry.status = 'dismissed';
  saveRedTeam();
  form.classList.add('collapsed');
  showToast('Entrée Red‑Team ignorée');
  refreshRedTeam();
}

// Affiche une fenêtre modale simple listant les tâches d’une routine pour un mode donné
// Pour une première implémentation, on utilise alert() ; ceci peut être remplacé
// par une boîte modale plus élégante à l'avenir.
window.showRoutineTasksPopup = async function(routineId, mode){
  try{
    const rTasks = await idb.getAll(db,'routineTasks');
    const tasksAll = (rTasks||[]).filter(t => t.routineId === routineId && !t.archived);
    tasksAll.sort((a,b) => (a.order||0)-(b.order||0));
    const tasksForMode = tasksAll.filter(t => {
      if (t.mode) return t.mode === mode;
      if (mode === 'short') return (t.short != null && t.short > 0);
      if (mode === 'normal') return (t.normal != null && t.normal > 0);
      if (mode === 'long') return (t.long != null && t.long > 0);
      return false;
    });
    const lines = tasksForMode.map(t => {
      let dur;
      if (t.mode){ dur = t.duration != null ? t.duration : 0; }
      else { dur = (mode==='short'? t.short : mode==='normal'? t.normal : t.long); }
      return `• ${t.title||''} (${dur||''})`;
    });
    alert('Tâches ('+mode+'):\n' + lines.join('\n'));
  }catch(e){ console.warn('Erreur popup routine', e); alert('Erreur lors du chargement des tâches.'); }
};

// --- Gestion des routines vues individuelles ---
// Permettre de sélectionner un mode (short/normal/long) par routine dans la vue
// et de marquer des tâches de routine comme "fait" pour la journée.
let routineModes = {};
let doneRoutineToday = { date:'', tasks:{} };

function loadDoneRoutineToday(){
  try{
    const dt = JSON.parse(localStorage.getItem('doneRoutineToday') || '{}');
    const todayStr = fmtDate(today());
    if (dt && dt.date === todayStr){ doneRoutineToday = dt; }
    else { doneRoutineToday = { date: todayStr, tasks:{} }; saveDoneRoutineToday(); }
  }catch(e){ doneRoutineToday = { date: fmtDate(today()), tasks:{} }; saveDoneRoutineToday(); }
}
function saveDoneRoutineToday(){
  localStorage.setItem('doneRoutineToday', JSON.stringify(doneRoutineToday));
}


  /**
   * Gestionnaire de clic pour marquer une action ou une tâche de routine comme faite
   * dans l’onglet Vues. Pour les actions, on met à jour le statut dans IndexedDB
   * et on indique la date de fin. Pour les tâches de routine, on enregistre dans
   * la structure doneRoutineToday pour cette journée. Dans les deux cas la liste
   * est rafraîchie.
   */
  function handleMarkDoneViewAction(ev){
    ev.stopPropagation();
    const btn = ev.currentTarget;
    const id = btn.dataset.id;
    const type = btn.dataset.type;
    if (!id) return;
    if (type === 'routine') {
      // Marquer une tâche de routine comme faite dans la mémoire du jour
      if (!doneRoutineToday.tasks) doneRoutineToday.tasks = {};
      doneRoutineToday.tasks[id] = true;
      saveDoneRoutineToday();
      showToast('Tâche de routine marquée faite');
      refreshViews();
    } else {
      // Mettre à jour l’action pour la passer en statut « Fait » aujourd’hui
      (async () => {
        const a = await idb.get(db,'actions', id);
        if (a){
          a.statusTask = 'Fait';
          a.doneDate = fmtDate(today());
          // Indiquer qu’une Red-Team doit être faite avant archivage
          delete a.redTeamCommitted;
          await idb.put(db,'actions', a);
          await audit('update','actions', a.id);
        }
        showToast('Tâche marquée faite');
        refreshViews();
        refreshRedTeam();
      })();
    }
  }

  function bindRoutines(){
    // Populate system select when opening form
    async function fillRoutineSystemSelect(){
      const sel = document.querySelector('#formRoutine select[name=idSystem]');
      if (!sel) return;
      const systems = await idb.getAll(db,'systems');
      sel.innerHTML = '<option value="">—</option>';
      systems.forEach(s => { const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.title || s.id; sel.appendChild(opt); });
    }
    // Toggle schedule fields depending on frequency
    function toggleRoutineScheduleFields(){
      const freq = document.querySelector('#formRoutine select[name=frequency]')?.value || 'daily';
      const wk = document.querySelector('.routine-weekly');
      const mo = document.querySelector('.routine-monthly');
      if (wk) wk.style.display = (freq==='weekly') ? '' : 'none';
      if (mo) mo.style.display = (freq==='monthly') ? '' : 'none';
    }
    window.toggleRoutineScheduleFields = toggleRoutineScheduleFields;
    // Show form for new or existing routine
    async function showRoutineForm(id=null){
      editingRoutineId = null;
      const form = document.getElementById('formRoutine');
      if (!form) return;
      await fillRoutineSystemSelect();
      // Clear tasks list
      const tb = document.querySelector('#tblRoutineTasks tbody');
      if (tb) tb.innerHTML='';
      resetObjectives('routineObjectives', []);
      // Reset day-of-week checkboxes and day-of-month
      form.querySelectorAll('input[name=dow]').forEach(cb=> cb.checked=false);
      form.querySelector('input[name=dom]').value='';
      form.querySelector('input[name=autoCreate]').checked=false;
      form.querySelector('input[name=name]').value='';
      form.querySelector('select[name=idSystem]').value='';
      form.querySelector('select[name=frequency]').value='daily';
      toggleRoutineScheduleFields();
      document.getElementById('titleRoutineForm').textContent = 'Nouvelle routine';
      if (id){
        editingRoutineId = id;
        const routine = await idb.get(db,'routines', id);
        if (routine){
          form.querySelector('input[name=name]').value = routine.name || '';
          form.querySelector('select[name=idSystem]').value = routine.idSystem || '';
          form.querySelector('select[name=frequency]').value = routine.frequency || 'daily';
          toggleRoutineScheduleFields();
          if (routine.frequency==='weekly' && Array.isArray(routine.dow)){
            form.querySelectorAll('input[name=dow]').forEach(cb => { cb.checked = routine.dow.includes(Number(cb.value)); });
          }
          if (routine.frequency==='monthly' && routine.dom){
            form.querySelector('input[name=dom]').value = routine.dom;
          }
          form.querySelector('input[name=autoCreate]').checked = !!routine.autoCreate;
          document.getElementById('titleRoutineForm').textContent = 'Modifier routine';
          resetObjectives('routineObjectives', routine.objectives || []);
          // Load tasks
          const tasks = await idb.indexGetAll(db,'routineTasks','byRoutine', id);
          tasks.sort((a,b) => (a.order||0)-(b.order||0));
          tasks.forEach(t => {
            // Pass through both legacy and new fields; addRoutineTaskRow will normalize
            addRoutineTaskRow({
              title: t.title || '',
              duration: t.duration != null ? t.duration : undefined,
              mode: t.mode || undefined,
              short: t.short != null ? t.short : '',
              normal: t.normal != null ? t.normal : '',
              long: t.long != null ? t.long : ''
            });
          });
        }
      }
      form.classList.remove('collapsed');
    }
    window.showRoutineForm = showRoutineForm;
    function closeRoutineForm(){
      const f = document.getElementById('formRoutine');
      if (f) f.classList.add('collapsed');
      const tb = document.querySelector('#tblRoutineTasks tbody');
      if (tb) tb.innerHTML='';
      editingRoutineId = null;
      resetObjectives('routineObjectives', []);
    }
    window.closeRoutineForm = closeRoutineForm;
    function addRoutineTaskRow(task={}){
      // Add a new row for a routine task. Includes duplicate and remove actions.
      const tb = document.querySelector('#tblRoutineTasks tbody');
      if (!tb) return;
      const tr = document.createElement('tr');
      // Convert legacy task properties into unified duration + mode. If task.mode/duration are provided, use them; otherwise
      // infer mode from non-zero short/normal/long values. Default to 'short' with zero duration.
      let mode = task.mode || '';
      let duration = task.duration;
      if (!mode){
        // Determine mode from non-zero durations
        const s = task.short != null && task.short !== '' ? Number(task.short) : 0;
        const n = task.normal != null && task.normal !== '' ? Number(task.normal) : 0;
        const l = task.long != null && task.long !== '' ? Number(task.long) : 0;
        if (s > 0){ mode = 'short'; duration = s; }
        else if (n > 0){ mode = 'normal'; duration = n; }
        else if (l > 0){ mode = 'long'; duration = l; }
        else {
          mode = 'short'; duration = 0;
        }
      }
      const time = task.timeOfDay || 'morning';
      tr.innerHTML = `
        <td><input type="text" name="rtTitle" value="${escapeHtml(task.title||'')}" required></td>
        <td><input type="number" name="rtDuration" min="0" step="1" value="${duration!=null? escapeHtml(String(duration)) : ''}" /></td>
        <td>
          <select name="rtMode">
            <option value="short" ${mode==='short'?'selected':''}>Court</option>
            <option value="normal" ${mode==='normal'?'selected':''}>Normal</option>
            <option value="long" ${mode==='long'?'selected':''}>Long</option>
          </select>
        </td>
        <td>
          <select name="rtTime">
            <option value="morning" ${time==='morning'?'selected':''}>Matin</option>
            <option value="afternoon" ${time==='afternoon'?'selected':''}>Aprem</option>
            <option value="evening" ${time==='evening'?'selected':''}>Soir</option>
          </select>
        </td>
        <td>
          <button type="button" class="secondary" data-duplicate-task title="Dupliquer">📄</button>
          <button type="button" class="secondary" data-remove-task title="Supprimer">🗑️</button>
        </td>`;
      tb.appendChild(tr);
      // Remove handler
      tr.querySelector('[data-remove-task]').addEventListener('click', () => tr.remove());
      // Duplicate handler: clone the current row values into a new row
      tr.querySelector('[data-duplicate-task]').addEventListener('click', () => {
        const title = tr.querySelector('input[name=rtTitle]').value || '';
        const dur = tr.querySelector('input[name=rtDuration]').value;
        const md = tr.querySelector('select[name=rtMode]').value;
        const tm = tr.querySelector('select[name=rtTime]').value;
        addRoutineTaskRow({ title, duration: dur, mode: md, timeOfDay: tm });
      });
    }
    window.addRoutineTaskRow = addRoutineTaskRow;
    async function handleRoutineSubmit(e){
      e.preventDefault();
      const form = e.currentTarget;
      const name = form.querySelector('input[name=name]').value.trim();
      const idSystem = form.querySelector('select[name=idSystem]').value || '';
      const frequency = form.querySelector('select[name=frequency]').value || 'daily';
      const autoCreate = form.querySelector('input[name=autoCreate]').checked;
      const objectives = collectObjectives('routineObjectives');
      if (!validateObjectives(objectives)){
        alert('Chaque routine doit comporter au minimum un objectif temporel, un objectif de résultat et un objectif sur la méthode.');
        return;
      }
      // day-of-week list
      const dow = [];
      form.querySelectorAll('input[name=dow]:checked').forEach(cb => dow.push(Number(cb.value)));
      const domVal = form.querySelector('input[name=dom]').value;
      const dom = domVal ? Number(domVal) : null;
      let rid = editingRoutineId;
      let isUpdate = false;
      if (rid){ isUpdate = true; }
      else {
        rid = await nextId('R','routines');
      }
      const existing = isUpdate ? await idb.get(db,'routines', rid) : null;
      // Build routine object
      const routine = existing ? { ...existing } : { id: rid, active:true, archived:false };
      routine.idSystem = idSystem;
      routine.name = name;
      routine.frequency = frequency;
      routine.autoCreate = autoCreate ? true : false;
      routine.objectives = objectives;
      if (!existing) routine.archived = false;
      delete routine.dow;
      delete routine.dom;
      if (frequency==='weekly') routine.dow = dow;
      if (frequency==='monthly') routine.dom = dom;
      ensureValidationMetadata('routines', existing, routine);
      // Save routine
      await idb.put(db,'routines', routine);
      await audit(isUpdate?'update':'create','routines', rid);
      // Delete old tasks when updating
      if (isUpdate){
        // When updating an existing routine we need to remove any previously
        // stored tasks before inserting the new set. To maintain an audit
        // trail, record each deletion in the audit log. In earlier versions
        // these deletions were silent which made it harder to trace changes.
        const olds = await idb.indexGetAll(db,'routineTasks','byRoutine', rid);
        for (const t of olds){
          await idb.del(db,'routineTasks', t.id);
          await audit('delete','routineTasks', t.id);
        }
      }
      // Save tasks
      const rows = form.querySelectorAll('#tblRoutineTasks tbody tr');
      let order = 0;
      for (const tr of rows){
        const title = tr.querySelector('input[name=rtTitle]').value.trim();
        const durVal = tr.querySelector('input[name=rtDuration]')?.value;
        const duration = parseInt(durVal || '0') || 0;
        const modeSel = tr.querySelector('select[name=rtMode]');
        const mode = modeSel ? modeSel.value : 'short';
        const timeSel = tr.querySelector('select[name=rtTime]');
        const timeOfDay = timeSel ? timeSel.value : 'morning';
        // Compute legacy fields for backward compatibility: duration stored per mode
        let short = 0, normal = 0, long = 0;
        if (mode === 'short') short = duration;
        else if (mode === 'normal') normal = duration;
        else if (mode === 'long') long = duration;
        const tid = await nextId('RT','routineTasks');
        const taskObj = { id: tid, routineId: rid, title, short, normal, long, order: order++, archived:false, mode, duration, timeOfDay };
        await idb.put(db,'routineTasks', taskObj);
        await audit('create','routineTasks', tid);
      }
      showToast('Routine enregistrée');
      closeRoutineForm();
      refreshRoutines();
    }
    window.handleRoutineSubmit = handleRoutineSubmit;
    async function refreshRoutines(){
      const [routines, systems] = await Promise.all([ idb.getAll(db,'routines'), idb.getAll(db,'systems') ]);
      const sysMap = new Map((systems||[]).map(s=> [s.id, s.title||s.id]));
      let list = (routines||[]).filter(r => !r.archived);
      const search = (document.getElementById('searchRoutines')?.value || '').toLowerCase();
      if (search){
        list = list.filter(r => (r.name||'').toLowerCase().includes(search) || (r.id||'').toLowerCase().includes(search));
      }
      const tb = document.querySelector('#tblRoutines tbody');
      if (!tb) return;
      tb.innerHTML='';
      for (const r of list){
        const freqLabel = (r.frequency === 'daily' ? 'Quotid.' : r.frequency === 'weekly' ? 'Hebdo.' : r.frequency === 'monthly' ? 'Mens.' : r.frequency);
        const active = (r.active === false ? 'Non' : 'Oui');
        const tr = document.createElement('tr');
        // Build each cell explicitly and assign textContent instead of innerHTML. This
        // prevents HTML entities in user data (e.g. a routine name containing
        // `<script>`) from being decoded into tags. Buttons are inserted via
        // innerHTML because their markup is controlled by the app and contains no
        // user‑supplied values.
        const tdId = document.createElement('td');
        tdId.className = 'col-id';
        tdId.textContent = r.id;
        const tdSys = document.createElement('td');
        tdSys.textContent = sysMap.get(r.idSystem) || r.idSystem || '';
        const tdName = document.createElement('td');
        tdName.textContent = r.name || '';
        const tdFreq = document.createElement('td');
        tdFreq.textContent = freqLabel;
        const tdAct = document.createElement('td');
        tdAct.textContent = active;
        const tdActions = document.createElement('td');
        // Use data attributes on the buttons for edit/archive/delete. Escape the ID
        // when embedding into the attribute to avoid invalid markup.
        tdActions.innerHTML = `
          <button data-edit-routine="${escapeHtml(r.id)}" aria-label="Modifier la routine">✏️</button>
          <button data-dup-routine="${escapeHtml(r.id)}" aria-label="Dupliquer la routine">📄</button>
          <button data-archive-routine="${escapeHtml(r.id)}" aria-label="Archiver la routine">📦</button>
          <button class="secondary" data-del-routine="${escapeHtml(r.id)}" aria-label="Supprimer la routine">🗑️</button>
        `;
        tr.appendChild(tdId);
        tr.appendChild(tdSys);
        tr.appendChild(tdName);
        tr.appendChild(tdFreq);
        tr.appendChild(tdAct);
        tr.appendChild(tdActions);
        tb.appendChild(tr);
      }
      tb.querySelectorAll('button[data-edit-routine]').forEach(btn => btn.addEventListener('click', () => showRoutineForm(btn.dataset.editRoutine)));
      // Dupliquer une routine (copie complète des tâches)
      tb.querySelectorAll('button[data-dup-routine]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.dupRoutine;
        const r = await idb.get(db,'routines', id);
        if (!r) return;
        const tasks = await idb.indexGetAll(db,'routineTasks','byRoutine', id);
        const newId = await nextId('R','routines');
        // Préparer la nouvelle routine en copiant les champs existants. On supprime les propriétés système
        // spécifiques et on ajuste le nom pour indiquer qu'il s'agit d'une copie.
        const newRoutine = Object.assign({}, r);
        newRoutine.id = newId;
        newRoutine.name = (r.name || '') + ' (copie)';
        // Activer la routine et s'assurer qu'elle n'est pas archivée
        newRoutine.active = true;
        newRoutine.archived = false;
        delete newRoutine.validation;
        ensureValidationMetadata('routines', null, newRoutine);
        await idb.put(db,'routines', newRoutine);
        await audit('create','routines', newId);
        // Dupliquer chaque tâche de routine
        for (const t of (tasks||[])){
          const newTaskId = await nextId('RT','routineTasks');
          const nt = Object.assign({}, t);
          nt.id = newTaskId;
          nt.idRoutine = newId;
          await idb.put(db,'routineTasks', nt);
          await audit('create','routineTasks', newTaskId);
        }
        showToast('Routine dupliquée');
        refreshRoutines();
      }));
      tb.querySelectorAll('button[data-archive-routine]').forEach(btn => btn.addEventListener('click', async ()=> {
        const id = btn.dataset.archiveRoutine;
        const r = await idb.get(db,'routines', id);
        if (!r) return;
        r.archived = true;
        await idb.put(db,'routines', r);
        await audit('archive','routines', id);
        showToast('Routine archivée');
        refreshRoutines();
      }));
      tb.querySelectorAll('button[data-del-routine]').forEach(btn => btn.addEventListener('click', async ()=> {
        const id = btn.dataset.delRoutine;
        if (!confirm('Supprimer définitivement cette routine et ses tâches ?')) return;
        const tasks = await idb.indexGetAll(db,'routineTasks','byRoutine', id);
        for (const t of (tasks||[])){ await idb.del(db,'routineTasks', t.id); await audit('delete','routineTasks', t.id); }
        await idb.del(db,'routines', id);
        await audit('delete','routines', id);
        showToast('Routine supprimée');
        refreshRoutines();
      }));
    }
    window.refreshRoutines = refreshRoutines;
    // Bind UI events
    const freqSel = document.querySelector('#formRoutine select[name=frequency]');
    if (freqSel) freqSel.addEventListener('change', toggleRoutineScheduleFields);
    const btnAddRoutine = document.getElementById('btnAddRoutine');
    if (btnAddRoutine) btnAddRoutine.addEventListener('click', () => showRoutineForm());
    const btnCancelRoutine = document.getElementById('cancelRoutine');
    if (btnCancelRoutine) btnCancelRoutine.addEventListener('click', () => closeRoutineForm());
    const formRoutine = document.getElementById('formRoutine');
    if (formRoutine) formRoutine.addEventListener('submit', handleRoutineSubmit);
    const btnAddRoutineTask = document.getElementById('btnAddRoutineTask');
    if (btnAddRoutineTask) btnAddRoutineTask.addEventListener('click', () => addRoutineTaskRow());
    const searchInput = document.getElementById('searchRoutines');
    if (searchInput) searchInput.addEventListener('input', () => refreshRoutines());
    makeSortable(document.getElementById('tblRoutines'), refreshRoutines);
    // Initial refresh after binding
    refreshRoutines();
  }

  async function refreshParams(){
    $('#formThresholds').varRed.value = thresholds.varRed; $('#formThresholds').varAmber.value = thresholds.varAmber;
    $('#formThresholds').spiRed.value = thresholds.spiRed; $('#formThresholds').spiAmber.value = thresholds.spiAmber;
    $('#formThresholds').dueSoonDays.value = thresholds.dueSoonDays;
    $('#formThresholds').onsubmit = async (e) => { e.preventDefault(); const v = formGet(e.currentTarget); thresholds = { varRed:Number(v.varRed)||0, varAmber:Number(v.varAmber)||0, spiRed:Number(v.spiRed)||0, spiAmber:Number(v.spiAmber)||0, dueSoonDays:Number(v.dueSoonDays)||7 }; await saveThresholds(thresholds); showToast('Seuils enregistrés'); };
    $('#formEnums').domains.value = (enums.domains||[]).join('\\n'); $('#formEnums').statuses.value = (enums.statuses||[]).join('\\n'); $('#formEnums').priorities.value = (enums.priorities||[]).join('\\n'); $('#formEnums').units.value = (enums.units||[]).join('\\n'); $('#formEnums').taskStatuses.value = (enums.taskStatuses||[]).join('\\n'); $('#formEnums').collaborators.value = (enums.collaborators||[]).join('\\n');
    $('#formEnums').onsubmit = async (e) => { e.preventDefault(); const v=formGet(e.currentTarget); enums = { domains:taToList(v.domains), statuses:taToList(v.statuses), priorities:taToList(v.priorities), units:taToList(v.units), taskStatuses:taToList(v.taskStatuses), collaborators:taToList(v.collaborators), modes: defaultEnums.modes }; await saveEnums(enums); showToast('Listes enregistrées'); };
    await renderCapsEditor();
  }
  function taToList(txt){ return (txt||'').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean); }
  async function renderCapsEditor(){
    const tb = $('#tblCaps tbody'); tb.innerHTML='';
    const names = Object.keys(capacities||{});
    for (const name of names){ const tr = document.createElement('tr'); tr.innerHTML = `<td>${escapeHtml(name)}</td><td><input type="number" step="1" min="0" value="${Number(capacities[name]||0)}" data-cap="${escapeHtml(name)}" /></td><td><button data-delcap="${escapeHtml(name)}" class="secondary">🗑️</button></td>`; tb.appendChild(tr); }
    $('#btnAddCap').onclick = ()=> { const name = prompt('Nom du collaborateur ?'); if (!name) return; if (capacities[name]!=null) return alert('Déjà existant'); capacities[name]=20; renderCapsEditor(); };
    $('#btnSaveCaps').onclick = async ()=> { tb.querySelectorAll('input[data-cap]').forEach(inp => { capacities[inp.dataset.cap]=Number(inp.value)||0; }); await saveCaps(capacities); showToast('Capacités enregistrées'); refreshDashboard(); };
    tb.querySelectorAll('button[data-delcap]').forEach(btn => btn.addEventListener('click', ()=> { delete capacities[btn.dataset.delcap]; renderCapsEditor(); }));
  }

  // ---------- Data, integrity, files ----------
  async function refreshData(){ await refreshSnapshots(); await refreshTrash(); await refreshAudit(); await refreshFiles(); $('#integrityResults').textContent = 'Clique sur “Scanner” pour vérifier les liens et règles (invariants).'; }
  async function scanIntegrity(){
    const [globals, systems, projects, actions] = await Promise.all([ idb.getAll(db,'globals'), idb.getAll(db,'systems'), idb.getAll(db,'projects'), idb.getAll(db,'actions') ]);
    const gSet = new Set(globals.map(g=>g.id)), sSet = new Set(systems.map(s=>s.id)), pSet = new Set(projects.map(p=>p.id));
    const issues = [];
    for (const p of projects){ if (p.idGlobal && !gSet.has(p.idGlobal)) issues.push({type:'Projet sans Global', id:p.id, detail:p.idGlobal}); if (p.idSystem && !sSet.has(p.idSystem)) issues.push({type:'Projet sans Système', id:p.id, detail:p.idSystem}); if (Number(p.target)<0) issues.push({type:'Projet cible négative', id:p.id, detail:p.target}); }
    for (const a of actions){ if (a.idProject && !pSet.has(a.idProject)) issues.push({type:'Action sans Projet', id:a.id, detail:a.idProject}); if (a.points<0) issues.push({type:'Action points négatifs', id:a.id, detail:a.points}); }
    const out = $('#integrityResults'); out.innerHTML='';
    if (!issues.length) { out.textContent='✔️ Aucune incohérence trouvée.'; return; }
    const ul=document.createElement('ul');
    for (const it of issues){
      const li=document.createElement('li');
      li.innerHTML = `${escapeHtml(it.type)} — <strong>${escapeHtml(it.id)}</strong> → ${escapeHtml(String(it.detail))}`;
      if (it.type==='Action sans Projet'){ const btn=document.createElement('button'); btn.textContent='Supprimer action'; btn.className='secondary'; btn.onclick = async ()=> { await idb.del(db,'actions', it.id); li.remove(); await audit('delete','actions',it.id); }; li.appendChild(document.createTextNode(' ')); li.appendChild(btn); }
      if (it.type==='Projet sans Global' || it.type==='Projet sans Système'){ const btn=document.createElement('button'); btn.textContent='Supprimer projet'; btn.className='secondary'; btn.onclick = async ()=> { await idb.del(db,'projects', it.id); li.remove(); await audit('delete','projects',it.id); }; li.appendChild(document.createTextNode(' ')); li.appendChild(btn); }
      ul.appendChild(li);
    }
    out.appendChild(ul);
  }

  async function createSnapshot(){ const payload = await exportPayload(); const id = 'SS-' + new Date().toISOString().replace(/[:.]/g,'-'); await idb.put(db,'snapshots', { id, ts: Date.now(), size: JSON.stringify(payload).length, payload }); showToast('Snapshot créé'); refreshSnapshots(); }
  async function refreshSnapshots(){ const shots = await idb.getAll(db,'snapshots'); const tb = $('#tblSnapshots tbody'); tb.innerHTML=''; for (const s of (shots||[]).sort((a,b)=> b.ts-a.ts)){ const tr=document.createElement('tr'); tr.innerHTML = `<td class="ro">${escapeHtml(s.id)}</td><td>${new Date(s.ts).toLocaleString()}</td><td>${s.size} o</td><td><button data-restore="${escapeHtml(s.id)}">Restaurer</button> <button class="secondary" data-dels="${escapeHtml(s.id)}">🗑️</button></td>`; tb.appendChild(tr); } tb.querySelectorAll('button[data-restore]').forEach(btn => btn.addEventListener('click', async ()=> { const s=await idb.get(db,'snapshots', btn.dataset.restore); if (!s) return; await importPayload(s.payload); showToast('Snapshot restauré'); refreshAll(); })); tb.querySelectorAll('button[data-dels]').forEach(btn => btn.addEventListener('click', async ()=> { await idb.del(db,'snapshots', btn.dataset.dels); refreshSnapshots(); })); }

  async function refreshTrash(){ const items = await idb.getAll(db,'trash'); const tb=$('#tblTrash tbody'); tb.innerHTML=''; for (const t of (items||[]).sort((a,b)=> b.ts-a.ts)){ const tr=document.createElement('tr'); tr.innerHTML = `<td class="ro">${escapeHtml(t.store)}</td><td>${escapeHtml(t.id)}</td><td>${new Date(t.ts).toLocaleString()}</td><td><button data-restore="${escapeHtml(t.id)}">Restaurer</button> <button class="secondary" data-del="${escapeHtml(t.id)}">Purger</button></td>`; tb.appendChild(tr); } tb.querySelectorAll('button[data-restore]').forEach(btn => btn.addEventListener('click', async ()=> { const t = await idb.get(db,'trash', btn.dataset.restore); if (!t) return; await idb.put(db, t.store, t.item); await idb.del(db,'trash', t.id); await audit('restore', t.store, t.item.id); refreshTrash(); refreshAll(); })); tb.querySelectorAll('button[data-del]').forEach(btn => btn.addEventListener('click', async ()=> { await idb.del(db,'trash', btn.dataset.del); refreshTrash(); })); }

  async function refreshAudit(){ const logs = (await idb.getAll(db,'audit')||[]).sort((a,b)=> b.ts-a.ts).slice(0,200); const tb = $('#tblAudit tbody'); tb.innerHTML=''; for (const l of logs){ const tr=document.createElement('tr'); tr.innerHTML = `<td>${new Date(l.ts).toLocaleString()}</td><td>${escapeHtml(l.op)}</td><td>${escapeHtml(l.store)}</td><td>${escapeHtml(l.id)}</td>`; tb.appendChild(tr); } }

  // Files (attachments)
  async function uploadFiles(){
    const input = $('#fileAttach'); const projId = $('#attachProjectId').value.trim() || '';
    const files = input.files; if (!files || !files.length) return alert('Choisissez un ou plusieurs fichiers.');
    for (const f of files){ const id = await nextId('F','files'); const buf = await f.arrayBuffer(); await idb.put(db,'files',{ id, name:f.name, type:f.type, size:f.size, projectId: projId, data: new Uint8Array(buf) }); await audit('create','files',id); }
    input.value=''; showToast('Pièces jointes ajoutées'); refreshFiles();
  }
  async function refreshFiles(){ const list = await idb.getAll(db,'files'); const tb = $('#tblFiles tbody'); tb.innerHTML=''; for (const f of list){ const tr=document.createElement('tr'); tr.innerHTML = `<td class="ro">${escapeHtml(f.id)}</td><td>${escapeHtml(f.name)}</td><td>${escapeHtml(f.type)}</td><td>${escapeHtml(String(f.size))}</td><td>${escapeHtml(f.projectId||'')}</td><td><button data-dl="${escapeHtml(f.id)}">⬇️</button> <button class="secondary" data-del="${escapeHtml(f.id)}">🗑️</button></td>`; tb.appendChild(tr); } tb.querySelectorAll('button[data-dl]').forEach(btn=> btn.addEventListener('click', async ()=> { const f=await idb.get(db,'files', btn.dataset.dl); const blob = new Blob([f.data], { type:f.type||'application/octet-stream' }); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=f.name||'file'; a.click(); URL.revokeObjectURL(url); })); tb.querySelectorAll('button[data-del]').forEach(btn=> btn.addEventListener('click', async ()=> { await idb.del(db,'files', btn.dataset.del); await audit('delete','files', btn.dataset.del); refreshFiles(); })); }

  // Templates
  async function saveTemplate(e){ e.preventDefault(); const f=e.currentTarget; const v=formGet(f); const actions = taToList(v.tplActions); if (!v.tplName.trim()) return alert('Nom requis.'); await idb.put(db,'templates', { name:v.tplName.trim(), actions }); showToast('Template enregistré'); f.reset(); refreshTplSelect(); }
  async function refreshTplSelect(){ const list = await idb.getAll(db,'templates'); const sel = $('#tplSelect'); if (!sel) return; sel.innerHTML=''; list.forEach(t => sel.append(new Option(t.name, t.name))); }
  async function applyTemplate(){ const projId = $('#tplProjectId').value.trim(); const tplName = $('#tplSelect').value; if (!projId || !tplName) return alert('Projet et template requis.'); const tpl = await idb.get(db,'templates', tplName); if (!tpl) return alert('Template introuvable'); for (const t of tpl.actions){ const id = await nextId('A','actions'); await idb.put(db,'actions', { id, idProject:projId, task:t, owner:'', startDate:'', dueDate:'', doneDate:'', estHours:1, realHours:0, points:1, statusTask:'À faire', tag:'', comments:'' }); await audit('create','actions', id); } showToast('Actions créées depuis le template'); refreshActions(); }

  // Export / Import
  async function exportPayload(){ const [globals, systems, projects, actions, files, templates, audit] = await Promise.all([ idb.getAll(db,'globals'), idb.getAll(db,'systems'), idb.getAll(db,'projects'), idb.getAll(db,'actions'), idb.getAll(db,'files'), idb.getAll(db,'templates'), idb.getAll(db,'audit') ]); return { version:DB_VERSION, exportedAt:new Date().toISOString(), enums, thresholds, capacities, globals, systems, projects, actions, files, templates, audit }; }
  async function exportJSON(){ const payload = await exportPayload(); downloadBlob(JSON.stringify(payload,null,2), 'application/json', 'klaro_export_v3_3r.json'); }
  async function importJSON(){ const file = pickFirstFile(['application/json','.json']); if (!file) return alert('Choisis un fichier JSON.'); const text = await file.text(); let payload; try{ payload = JSON.parse(text); }catch(e){ return alert('JSON invalide'); } await importPayload(payload); showToast('Import JSON terminé'); refreshAll(); }
  async function importPayload(payload){
    if (payload.enums) await saveEnums(payload.enums);
    if (payload.thresholds) await saveThresholds(payload.thresholds);
    if (payload.capacities) await saveCaps(payload.capacities);
    await Promise.all(['globals','systems','projects','actions','files','templates','audit'].map(s=> idb.clear(db,s)));
    for (const s of ['globals','systems','projects','actions','files','templates','audit']){ for (const o of (payload[s]||[])) await idb.put(db,s,o); }
  }
  function pickFirstFile(accepts){ const input = $('#fileImport'); if (!input || !input.files || !input.files.length) return null; for (const f of input.files){ if (!accepts.length) return f; const ok = accepts.some(a => (a.startsWith('.') ? f.name.endsWith(a) : (f.type===a))); if (ok) return f; } return input.files[0]; }
  function downloadBlob(data, mime, filename){ const blob = new Blob([data], {type:mime}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }
  function toCSV(arr){ if (!arr.length) return ''; const keys = Object.keys(arr[0]); const escape = v => `"${String(v??'').replace(/"/g,'""')}"`; const header = keys.map(escape).join(','); const rows = arr.map(o => keys.map(k => escape(o[k])).join(',')); return [header, ...rows].join('\\n'); }
  async function exportCSV(kind){ const arr = await idb.getAll(db, kind); downloadBlob(toCSV(arr), 'text/csv', `${kind}.csv`); }
  async function importCSV(kind){ const file = pickFirstFile(['text/csv','.csv']); if (!file) return alert('Choisis un CSV.'); const text = await file.text(); const rows = text.split(/\\r?\\n/).filter(Boolean).map(line => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g,'').replace(/""/g,'"'))); const header = rows.shift(); if (!header) return alert('CSV vide'); const items = rows.map(cols => { const o={}; header.forEach((h,i)=>o[h]=cols[i]); return o; }); for (const it of items){ await idb.put(db, kind, it); await audit('import', kind, it.id||''); } showToast(`Import ${kind}: ${items.length} ligne(s)`); if (kind==='projects') refreshProjects(); else refreshActions(); }

  async function handleCustomExport(e){
    e.preventDefault();
    const form = e.currentTarget;
    const stores = Array.from(form.querySelectorAll('input[name=exportStores]:checked')).map(cb => cb.value);
    if (!stores.length) return alert('Sélectionnez au moins un module à exporter.');
    const format = form.querySelector('select[name=exportFormat]')?.value || 'klaro';
    const filterText = form.querySelector('textarea[name=exportFilter]')?.value || '';
    let filters = {};
    if (filterText.trim()){
      try { filters = JSON.parse(filterText); }
      catch(err){ return alert('Filtre JSON invalide.'); }
    }
    const payload = {
      type: 'klaro-package',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      config: { enums, thresholds, capacities },
      stores: {}
    };
    const storeCounts = [];
    for (const store of stores){
      try {
        const data = await idb.getAll(db, store);
        const filtered = applyExportFilter(data||[], filters[store]);
        payload.stores[store] = filtered;
        storeCounts.push(`${store}: ${filtered.length}`);
      } catch(err){
        console.warn('Export personnalisé — store inconnu', store, err);
      }
    }
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    if (format === 'klaro'){
      downloadBlob(JSON.stringify(payload, null, 2), 'application/json', `klaro_pack_${ts}.klaro`);
    } else {
      const minimal = { stores: payload.stores, config: payload.config, version: APP_VERSION };
      downloadBlob(JSON.stringify(minimal, null, 2), 'application/json', `klaro_export_${ts}.json`);
    }
    const summary = storeCounts.length ? ` (${storeCounts.join(', ')})` : '';
    showToast('Export personnalisé généré' + summary);
  }
  function matchesExportCriterion(value, expected){
    if (expected == null){
      return value == null || value === '';
    }
    if (Array.isArray(expected)){
      if (Array.isArray(value)) return expected.some(v => value.includes(v));
      return expected.includes(value);
    }
    if (typeof expected === 'object'){
      if (Array.isArray(value)){
        if (expected.contains != null) return value.includes(expected.contains);
        if (Array.isArray(expected.containsAny)) return expected.containsAny.some(v => value.includes(v));
        if (Array.isArray(expected.containsAll)) return expected.containsAll.every(v => value.includes(v));
      }
      if (typeof value === 'number'){
        if (expected.min != null && value < expected.min) return false;
        if (expected.max != null && value > expected.max) return false;
      }
      if (Object.prototype.hasOwnProperty.call(expected,'in')){
        const list = Array.isArray(expected.in) ? expected.in : [expected.in];
        if (Array.isArray(value)) return list.some(v => value.includes(v));
        return list.includes(value);
      }
      if (Object.prototype.hasOwnProperty.call(expected,'equals')) return String(value ?? '') === String(expected.equals);
      if (Object.prototype.hasOwnProperty.call(expected,'not')) return String(value ?? '') !== String(expected.not);
    }
    if (Array.isArray(value)){
      return value.includes(expected);
    }
    return String(value ?? '') === String(expected ?? '');
  }
  function applyExportFilter(items, criteria){
    if (!criteria || typeof criteria !== 'object') return items;
    return items.filter(item => Object.entries(criteria).every(([key, expected]) => matchesExportCriterion(item?.[key], expected)));
  }
  async function handleCustomImport(e){
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = document.getElementById('customImportFile');
    if (!fileInput || !fileInput.files || !fileInput.files.length) return alert('Sélectionnez un fichier .klaro ou .json.');
    const file = fileInput.files[0];
    let payload;
    try { payload = JSON.parse(await file.text()); }
    catch(err){ return alert('Fichier invalide ou corrompu.'); }
    const stores = Array.from(form.querySelectorAll('input[name=importStores]:checked')).map(cb => cb.value);
    if (!stores.length) return alert('Choisissez au moins un module à importer.');
    const strategy = form.querySelector('select[name=importStrategy]')?.value || 'merge';
    const sourceStores = payload.stores || payload;
    if (!sourceStores || typeof sourceStores !== 'object') return alert('Le fichier ne contient pas de données exploitables.');
    if (payload.config){
      if (payload.config.enums) await saveEnums(payload.config.enums);
      if (payload.config.thresholds) await saveThresholds(payload.config.thresholds);
      if (payload.config.capacities) await saveCaps(payload.config.capacities);
    }
    const storeCounts = [];
    for (const store of stores){
      const entries = sourceStores[store];
      if (!Array.isArray(entries) || !Object.prototype.hasOwnProperty.call(STORES, store)) continue;
      if (strategy === 'replace'){ await idb.clear(db, store); }
      const keyPath = STORES[store];
      let imported = 0;
      for (const entry of entries){
        if (!entry || typeof entry !== 'object') continue;
        if (keyPath && (entry[keyPath] == null || entry[keyPath] === '')){
          entry[keyPath] = `${store}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        }
        await idb.put(db, store, entry);
        await audit('import', store, entry?.[keyPath] || entry?.id || entry?.name || '');
        imported++;
      }
      storeCounts.push(`${store}: ${imported}`);
    }
    const importSummary = storeCounts.length ? ` (${storeCounts.join(', ')})` : '';
    showToast('Import personnalisé terminé' + importSummary);
    refreshAll();
  }

  // ---------- Helpers ----------
  function groupBy(arr,key){ const m={}; for (const x of arr){ const k=x[key]; (m[k]||(m[k]=[])).push(x);} return m; }
  function countBy(arr,key){ const m={}; for (const x of arr){ const k=x[key]??''; m[k]=(m[k]||0)+1; } return m; }
  function avg(arr){ return arr.length? arr.reduce((s,x)=> s+(Number(x)||0),0)/arr.length : 0; }
  function fillRows(tb, rows){ tb.innerHTML=''; for (const r of rows){ const tr=document.createElement('tr'); tr.innerHTML=r.map(c=>`<td>${escapeHtml(String(c??''))}</td>`).join(''); tb.appendChild(tr); } }
  function taToList(txt){ return (txt||'').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean); }

  // ---------- Charts ----------
  function drawDonut(canvas, parts){
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    const sum = parts.reduce((s,p)=> s + p.v, 0) || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Préparer les couleurs basées sur la couleur d'accent avec éclaircissement progressif
    const style = getComputedStyle(document.documentElement);
    let baseColor = style.getPropertyValue('--accent') || '#7fb4ff';
    baseColor = String(baseColor).trim();
    function lighten(hex, factor){
      const clean = hex.replace('#','');
      const r0 = parseInt(clean.substring(0,2),16);
      const g0 = parseInt(clean.substring(2,4),16);
      const b0 = parseInt(clean.substring(4,6),16);
      const r = Math.min(255, Math.round(r0 + (255 - r0) * factor));
      const g = Math.min(255, Math.round(g0 + (255 - g0) * factor));
      const b = Math.min(255, Math.round(b0 + (255 - b0) * factor));
      return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
    }
    const colors = parts.map((_, i) => lighten(baseColor, (parts.length<=1) ? 0 : (i / Math.max(1, parts.length - 1)) * 0.4));
    let a0 = -Math.PI / 2;
    parts.forEach((p,i) => {
      const a = a0 + (p.v / sum) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, a0, a);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      a0 = a;
    });
  }
  function drawSparkline(canvas, series){
    const ctx=canvas.getContext('2d'), w=canvas.width, h=canvas.height; ctx.clearRect(0,0,w,h);
    if (!series.length) return;
    const min=Math.min(...series), max=Math.max(...series), pad=6;
    ctx.beginPath();
    series.forEach((v,i)=>{ const x=pad + (w-2*pad)*i/(series.length-1); const y=h-pad - (h-2*pad)*((v-min)/((max-min)||1)); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke();
  }
  function drawBars(canvas, series){
    const ctx=canvas.getContext('2d'), w=canvas.width, h=canvas.height; ctx.clearRect(0,0,w,h);
    const n=series.length, barW=Math.max(10, Math.floor((w-20)/Math.max(1,n))), gap=6, maxVal=Math.max(...series.map(s=> Math.max(s.load,s.cap,1)));
    series.forEach((s,i)=>{ const x=10+i*(barW+gap); const rh = Math.round((s.load/maxVal)*(h-30)); const ch = Math.round((s.cap/maxVal)*(h-30)); ctx.fillRect(x, h-rh-10, barW, rh); ctx.strokeRect(x, h-ch-10, barW, ch); });
  }

  // Dessine un histogramme simple (une seule valeur par entrée) avec couleur d'accent
  function drawSimpleBars(canvas, series){
    const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height; ctx.clearRect(0,0,w,h);
    if (!series || !series.length) return;
    const style = getComputedStyle(document.documentElement);
    let color = style.getPropertyValue('--accent');
    if (!color) color = '#7fb4ff';
    color = color.trim();
    const n = series.length; const barW = Math.max(10, Math.floor((w-20)/Math.max(1,n))); const gap = 6;
    const maxVal = Math.max(...series.map(s => s.load || 0)) || 1;
    series.forEach((s,i) => {
      const x = 10 + i * (barW + gap);
      const rh = Math.round((s.load / maxVal) * (h - 30));
      ctx.fillStyle = color;
      ctx.fillRect(x, h - rh - 10, barW, rh);
    });
  }

  // ---------- Report per element ----------
  async function openReport(kind, id){
    let container = document.getElementById('reportView'); if (!container){ container=document.createElement('section'); container.id='reportView'; document.body.appendChild(container); }
    container.innerHTML = '<div class="report"><h1>Rapport</h1><div id="reportContent">Génération...</div><div class="form-actions"><button onclick="window.print()">🖨️ Imprimer / PDF</button></div></div>';
    const [globals, systems, projects, actions, files] = await Promise.all([ idb.getAll(db,'globals'), idb.getAll(db,'systems'), idb.getAll(db,'projects'), idb.getAll(db,'actions'), idb.getAll(db,'files') ]);
    const projById = new Map(projects.map(p=> [p.id,p]));
    const sysById = new Map(systems.map(s=> [s.id,s]));
    const glById = new Map(globals.map(g=> [g.id,g]));
    function rels(k,id){
      if (k==='global'){ const g=glById.get(id); const sys=systems.filter(s=>s.idGlobal===id); const projs=projects.filter(p=>p.idGlobal===id); const acts=actions.filter(a=> projs.some(p=>p.id===a.idProject)); return { g, sys, projs, acts }; }
      if (k==='system'){ const s=sysById.get(id); const g=glById.get(s?.idGlobal); const projs=projects.filter(p=>p.idSystem===id); const acts=actions.filter(a=> projs.some(p=>p.id===a.idProject)); return { g, s, projs, acts }; }
      if (k==='project'){ const p=projById.get(id); const s=sysById.get(p?.idSystem); const g=glById.get(p?.idGlobal); const acts=actions.filter(a=> a.idProject===id); return { g, s, p, acts }; }
      if (k==='action'){ const a=actions.find(x=>x.id===id); const p=projById.get(a?.idProject); const s=sysById.get(p?.idSystem); const g=glById.get(p?.idGlobal); return { g, s, p, a }; }
      return {};
    }
    const r = rels(kind,id);
    let html = '';
    function row(o){ return Object.keys(o||{}).map(k=> `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(String(o[k]??''))}</td></tr>`).join(''); }
    if (r.g){ html += `<h2>Global</h2><table class="table">${row(r.g)}</table>`; }
    if (r.s){ html += `<h2>Système</h2><table class="table">${row(r.s)}</table>`; }
    if (r.p){ html += `<h2>Projet</h2><table class="table">${row(r.p)}</table>`; }
    if (r.a){ html += `<h2>Action</h2><table class="table">${row(r.a)}</table>`; }
    if (r.projs){ html += `<h2>Projets liés</h2><table class="table"><thead><tr><th>ID</th><th>Titre</th><th>Statut</th><th>Fin</th></tr></thead><tbody>` + r.projs.map(p=> `<tr><td>${p.id}</td><td>${escapeHtml(p.title||'')}</td><td>${escapeHtml(p.status||'')}</td><td>${escapeHtml(p.plannedEnd||'')}</td></tr>`).join('') + `</tbody></table>`; }
    if (r.acts){ html += `<h2>Actions liées</h2><table class="table"><thead><tr><th>ID</th><th>Task</th><th>Due</th><th>Pts</th><th>Statut</th></tr></thead><tbody>` + r.acts.map(a=> `<tr><td>${a.id}</td><td>${escapeHtml(a.task||'')}</td><td>${escapeHtml(a.dueDate||'')}</td><td>${escapeHtml(String(a.points||0))}</td><td>${escapeHtml(a.statusTask||'')}</td></tr>`).join('') + `</tbody></table>`; }
    document.getElementById('reportContent').innerHTML = html + `<p class="muted">Généré le ${new Date().toLocaleString()}</p>`;
    container.classList.add('show'); window.scrollTo(0,0);
  }

  // ---------- Watchlist ----------
  const WL_KEY='klaro:watchlist:projects';
  function getWatchlist(){ try{ return JSON.parse(localStorage.getItem(WL_KEY)||'[]'); }catch(e){ return []; } }
  function setWatchlist(arr){ localStorage.setItem(WL_KEY, JSON.stringify(arr||[])); }
  function paintWatchlistDatalist(projects){ const dl=$('#dl-projects'); if (!dl) return; dl.innerHTML=''; projects.forEach(p=>{ const opt=document.createElement('option'); opt.value = p.id; opt.label = p.title||p.id; dl.appendChild(opt); }); }
  async function paintWatchlist(){
    const ul = $('#watchlistProjects'); if (!ul) return;
    const [projects] = await Promise.all([ idb.getAll(db,'projects') ]);
    const map = new Map(projects.map(p=> [p.id,p.title||p.id]));
    const wl = getWatchlist();
    ul.innerHTML='';
    wl.forEach(id=>{
      const li=document.createElement('li'); li.className='chip';
      li.innerHTML=`<span>${escapeHtml(map.get(id)||id)}</span> <button data-rm="${escapeHtml(id)}">✕</button>`;
      ul.appendChild(li);
    });
    ul.querySelectorAll('button[data-rm]').forEach(btn=> btn.addEventListener('click', ()=>{ const id=btn.dataset.rm; const arr=getWatchlist().filter(x=>x!==id); setWatchlist(arr); paintWatchlist(); }));
  }

  // ---------- Saved views ----------
  document.addEventListener('click', async (e)=>{
    if (e.target && e.target.id==='btnSaveCurrentView'){
      const name = ($('#savedViewName')?.value||'').trim(); const target=$('#savedViewTarget')?.value||'projects';
      if (!name) return alert('Nom requis');
      const filters = getFilters(target); const sort = getSort(target);
      const arr = getSavedViews(); arr.push({ name, target, filters, sort, ts:Date.now() }); setSavedViews(arr); paintSavedViews();
      showToast('Vue enregistrée');
    }
  });
  async function paintSavedViews(){
    const tb = $('#tblSavedViews tbody'); if (!tb) return;
    const arr = getSavedViews();
    tb.innerHTML='';
    for (const v of arr){
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(v.name)}</td><td>${escapeHtml(v.target)}</td><td><code>${escapeHtml(JSON.stringify({filters:v.filters, sort:v.sort}))}</code></td><td><button data-apply-view="${escapeHtml(v.name)}">Appliquer</button> <button class="secondary" data-del-view="${escapeHtml(v.name)}">🗑️</button></td>`;
      tb.appendChild(tr);
    }
    tb.querySelectorAll('button[data-apply-view]').forEach(btn=> btn.addEventListener('click', ()=>{
      const v = getSavedViews().find(x=>x.name===btn.dataset.applyView); if (!v) return;
      setFilters(v.target, v.filters||[]); setSort(v.target, v.sort||{}); forceRefresh(v.target);
      showView(v.target);
    }));
    tb.querySelectorAll('button[data-del-view]').forEach(btn=> btn.addEventListener('click', ()=>{
      const arr=getSavedViews().filter(x=> x.name!==btn.dataset.delView); setSavedViews(arr); paintSavedViews();
    }));
  }

  // ---------- Gantt ----------
  async function renderGantt(targetId='dashGantt'){
    const container = document.getElementById(targetId); if (!container) return; container.innerHTML='';
    const projects = await idb.getAll(db,'projects');
    const start = today(); const days = 56;
    const header = document.createElement('div'); header.className='header';
    const dayW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gantt-day')) || 20;
    for (let i=0;i<days;i++){ const d = dateAddDays(start,i); const el=document.createElement('div'); el.className='day'; el.title=fmtDate(d); header.appendChild(el); }
    container.appendChild(header);
    for (const p of projects){
      const row = document.createElement('div');
      row.className = 'row';
      const name = document.createElement('div');
      name.className = 'name';
      // Escape the project title to avoid injecting untrusted HTML into the DOM.
      name.textContent = p.title || p.id;
      const timeline = document.createElement('div');
      timeline.className = 'timeline';
      // Shade weekends across the entire timeline. This helps visually
      // differentiate working days from weekends. We compute this once per row
      // rather than per project so that weekend shading lines up across rows.
      for (let d = 0; d < days; d++){
        const dt = dateAddDays(start, d);
        if (dt.getDay() === 0 || dt.getDay() === 6){
          const w = document.createElement('div');
          w.className = 'weekend';
          w.style.left = (d * dayW) + 'px';
          w.style.width = dayW + 'px';
          timeline.appendChild(w);
        }
      }
      // Draw a vertical line for today so the user knows where they are in the
      // schedule. Position is relative to the start of the Gantt window.
      const todayLine = document.createElement('div');
      todayLine.className = 'today';
      todayLine.style.left = ((daysBetween(start, today()) || 0) * dayW) + 'px';
      timeline.appendChild(todayLine);
      // Only draw a bar if the project has both a start and an end date.
      const s = parseDate(p.startDate), e = parseDate(p.plannedEnd);
      if (s && e){
        const startCol = Math.max(0, daysBetween(start, s) || 0);
        const endCol = Math.min(days - 1, daysBetween(start, e) || 0);
        if (endCol >= 0){
          const bar = document.createElement('div');
          bar.className = 'bar';
          // Apply a CSS class based on the project status. This allows
          // different colours for different statuses defined in styles.css.
          const status = String(p.status || '').toLowerCase();
          // Map French status labels to class suffixes.
          const statusMap = {
            'idée': 'idea',
            'planifié': 'planned',
            'en cours': 'progress',
            'bloqué': 'blocked',
            'terminé': 'done',
            'annulé': 'cancelled'
          };
          const cls = statusMap[status] || 'idea';
          bar.classList.add('status-' + cls);
          // Position and size the bar based on start/end columns. Add a small
          // negative margin so adjacent bars don’t merge visually.
          bar.style.left = (startCol * dayW) + 'px';
          bar.style.width = Math.max(8, (endCol - startCol + 1) * dayW - 2) + 'px';
          // Provide a tooltip with basic info about the project for quick reference.
          bar.title = `${p.title || p.id} — ${p.status || ''} (${p.startDate || ''} → ${p.plannedEnd || ''})`;
          // Permettre un clic sur la barre pour ouvrir la fiche projet en édition. Ceci
          // améliore l’exploitabilité du Gantt en facilitant la navigation.
          bar.dataset.pid = p.id;
          bar.tabIndex = 0; // pour accessibilité clavier
          bar.setAttribute('role','button');
          bar.addEventListener('click', () => {
            // Ouvrir le formulaire projet en édition lorsque l’on clique sur la barre
            openForm('project', p);
          });
          timeline.appendChild(bar);
        }
      }
      row.appendChild(name);
      row.appendChild(timeline);
      container.appendChild(row);
    }
  }

  // Démarrer automatiquement l'application lorsque le DOM est prêt. Cette
  // instruction est placée juste avant la fin de l'IIFE afin d'accéder à
  // la fonction init() définie ci-dessus. Sans cet appel, aucune des
  // liaisons d'événements ni l'initialisation de la base ne sont exécutées.
  if (typeof init === 'function') {
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', () => init());
  }
})(); // IIFE fin

// ---- Report print hotkey (button in UI) - NO keyboard shortcuts globally ----

// ---- Simple helpers in global scope for printing ----
function downloadCSV(items, filename){
  if (!items || !items.length){ alert('Rien à exporter'); return; }
  const keys = Object.keys(items[0]);
  const escape = v => `"${String(v??'').replace(/"/g,'""')}"`;
  const header = keys.map(escape).join(',');
  const rows = items.map(o => keys.map(k => escape(o[k])).join(',')).join('\\n');
  const data = [header, rows].join('\\n');
  const blob = new Blob([data], {type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename||'export.csv'; a.click(); URL.revokeObjectURL(url);
}
