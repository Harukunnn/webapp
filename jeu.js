/*
  Module J.E.U. — Journal d'Évolution Universel

  Ce script gère la persistance et l'affichage du journal d'évolution.
  Les entrées sont stockées dans localStorage sous la clé 'journal_evolution'.
  Il expose les fonctions suivantes dans l'espace global :
    addCommitJEU(entry): enregistre une nouvelle entrée et rafraîchit l'affichage
    getJEUEntries(filter): renvoie la liste filtrée des entrées
    generateMetaReport(): génère un rapport Markdown des 10 derniers commits
    renderJEUView(): actualise la timeline de la vue JEU

  Le formulaire JEU est situé dans index.html (section #view-jeu) et est
  initialisé au chargement de la page. Lorsque la vue JEU est activée,
  renderJEUView() est appelée automatiquement via refreshView() dans app.js.
*/
(function(){
  const STORAGE_KEY = 'journal_evolution';
  let journal = [];

  function load(){
    try { journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ journal = []; }
  }
  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
  }
  /**
   * Ajoute une nouvelle entrée au journal et déclenche la sauvegarde.
   * @param {Object} entry
   */
  function addCommitJEU(entry){
    load();
    const nextId = journal.length ? (journal[journal.length-1].id || 0) + 1 : 1;
    entry.id = nextId;
    // s'assurer que la date est définie
    entry.date = entry.date || new Date().toISOString().substring(0,10);
    journal.push(entry);
    save();
    renderTimeline();
    // rapport automatique toutes les 10 entrées
    if (journal.length % 10 === 0){
      try{ generateMetaReport(); }catch(e){ console.warn('JEU: erreur génération rapport auto', e); }
    }
    // notification douce (si showToast est disponible)
    if (typeof window.showToast === 'function'){
      showToast('✅ Commit structurel ajouté au Journal d’Évolution Universel');
    }
  }
  /**
   * Retourne la liste des entrées en appliquant un filtre facultatif.
   * @param {Object} filter
   */
  function getJEUEntries(filter){
    load();
    if (!filter || Object.keys(filter).length===0) return [...journal];
    return journal.filter(e => {
      for (const k of Object.keys(filter)){
        if (filter[k] && String(e[k]||'').toLowerCase().indexOf(String(filter[k]).toLowerCase())<0) return false;
      }
      return true;
    });
  }
  /**
   * Génère un rapport Markdown des 10 dernières entrées et télécharge le fichier.
   */
  function generateMetaReport(){
    load();
    if (!journal.length) return;
    const last10 = journal.slice(-10);
    let md = '# Bibliothèque d’apprentissage (derniers commits)\n\n';
    last10.forEach(e => {
      md += `## 🧭 ${e.date} — ${e.projet}\n`;
      md += `**Décision :** ${e.decision || ''}\n\n`;
      md += `**Cause :** ${e.cause || ''}\n\n`;
      md += `**Impact :** ${e.impact || ''}\n\n`;
      md += `**Correctif :** ${e.correctif || ''}\n\n`;
      md += `**Leçon :** ${e.lecon || ''}\n\n`;
      md += `**Énergie :** ${e.energie || ''}/10\n\n`;
      if (e.lien_commit) md += `[Lien commit](${e.lien_commit})\n\n`;
    });
    const blob = new Blob([md], { type:'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JEU_bibliotheque.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  /**
   * Affiche les cartes du journal dans la timeline de la vue JEU.
   */
  function renderTimeline(){
    const container = document.getElementById('jeuTimeline');
    if (!container) return;
    load();
    container.innerHTML = '';
    journal.slice().reverse().forEach(e => {
      const card = document.createElement('div');
      card.className = 'card';
      const h4 = document.createElement('h4');
      h4.textContent = `${e.date} — ${e.projet || ''}`;
      card.appendChild(h4);
      const fields = [
        { label:'Décision', value:e.decision },
        { label:'Cause', value:e.cause },
        { label:'Impact', value:e.impact },
        { label:'Correctif', value:e.correctif },
        { label:'Leçon', value:e.lecon },
        { label:'Énergie', value:`${e.energie || ''}/10` },
        { label:'Lien commit', value:e.lien_commit }
      ];
      fields.forEach(f => {
        if (!f.value) return;
        const div = document.createElement('div');
        div.className = 'field';
        div.innerHTML = `<strong>${escapeHtml(f.label)} :</strong> ${escapeHtml(String(f.value))}`;
        card.appendChild(div);
      });
      container.appendChild(card);
    });
  }
  /**
   * Initialise la vue JEU : charge les projets, attache les événements et prépare la timeline.
   */
  function renderJEUView(){
    // Remplir la liste des projets dans le formulaire
    try{
      const form = document.getElementById('formJEU');
      if (form){
        const sel = form.querySelector('select[name="projet"]');
        if (sel){
          sel.innerHTML = '';
          sel.append(new Option('—',''));
          // Récupérer les projets via IndexedDB (si disponible)
          if (window.idb && window.db){
            idb.getAll(db,'projects').then(projs => {
              (projs||[]).forEach(p => {
                sel.append(new Option((p.title && p.title.trim())? p.title.trim() : p.id, p.title || p.id));
              });
            });
          }
        }
      }
    }catch(e){ console.warn('JEU: erreur lors du chargement des projets', e); }
    renderTimeline();
  }
  /**
   * Initialise les gestionnaires d’événements et la timeline au chargement de la page.
   */
  function initJEU(){
    // Timeline initiale
    renderTimeline();
    // Bouton nouveau commit (dans index)
    const btnNew = document.getElementById('btnJEUNew');
    if (btnNew){ btnNew.addEventListener('click', () => {
      const formEl = document.getElementById('formJEU');
      if (!formEl) return;
      formEl.classList.remove('collapsed');
      // Forcer l'affichage en cas de règles CSS conflictuelles. En remettant
      // display à la valeur par défaut (vide), on laisse le CSS définir le
      // mode d'affichage correct (block). Cela contourne le bug où la forme
      // restait invisible dans l'intégration au tableau de bord.
      formEl.style.display = '';
      formEl.dataset.editing = '';
      // Scroller pour s'assurer que le formulaire est visible.
      try{ formEl.scrollIntoView({ behavior:'smooth', block:'nearest' }); }catch(e){}
    }); }
    const btnReport = document.getElementById('btnJEUReport');
    if (btnReport){ btnReport.addEventListener('click', () => generateMetaReport()); }
    // Annuler
    const btnCancel = document.getElementById('cancelJEU');
    if (btnCancel){ btnCancel.addEventListener('click', () => {
      const formEl = document.getElementById('formJEU');
      if (!formEl) return;
      formEl.reset();
      formEl.classList.add('collapsed');
      formEl.style.display = 'none';
    }); }
    // Soumission du formulaire
    const form = document.getElementById('formJEU');
    if (form){ form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const entry = {
        date: fd.get('date'),
        projet: fd.get('projet') || '',
        decision: fd.get('decision') || '',
        cause: fd.get('cause') || '',
        impact: fd.get('impact') || '',
        correctif: fd.get('correctif') || '',
        lecon: fd.get('lecon') || '',
        energie: Number(fd.get('energie') || 0),
        lien_commit: fd.get('lien_commit') || ''
      };
      // Validation simple
      if (!entry.decision || !entry.cause || !entry.impact || !entry.correctif || !entry.lecon){
        alert('Tous les champs texte sont obligatoires');
        return;
      }
      addCommitJEU(entry);
      form.reset();
      form.classList.add('collapsed');
    }); }
  }
  // Attacher initJEU au chargement du document. Si l'app est utilisée dans
  // index.html, initJEU sera appelée à la fin du chargement de la page.
  if (document.readyState !== 'loading') initJEU();
  else document.addEventListener('DOMContentLoaded', initJEU);
  // Exposer certaines fonctions globalement pour l'intégration avec app.js
  window.addCommitJEU = addCommitJEU;
  window.getJEUEntries = getJEUEntries;
  window.generateMetaReport = generateMetaReport;
  window.renderJEUView = renderJEUView;
  // Afin de permettre au code principal (app.js) de réinitialiser correctement le module
  // JEU (par exemple après l'initialisation globale ou lors du changement de vue),
  // nous exposons également initJEU sur l'objet global. Sans cette ligne, window.initJEU
  // reste indéfini, ce qui empêchait app.js de ré-attacher les gestionnaires d'événements
  // dans certains scénarios (notamment dans l'intégration au tableau de bord principal).
  window.initJEU = initJEU;
})();