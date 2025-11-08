/*
 * Module d’auto‑priorisation des tâches pour Kairos.
 *
 * Fournit des fonctions pour calculer un score de priorité pour une tâche
 * en fonction de son impact, de son urgence, de son effort estimé et de
 * l’alignement énergétique entre l’énergie requise et l’énergie
 * actuelle de l’utilisateur. Ces fonctions peuvent être utilisées pour
 * trier automatiquement les actions afin de proposer un ordre
 * d’exécution optimal.
 */

// Valeurs par défaut pour les poids (exprimés en fraction de 1)
const DEFAULT_WEIGHTS = { w1: 0.4, w2: 0.25, w3: 0.2, w4: 0.15 };

/**
 * Normalise une valeur comprise entre 1 et 10 vers un intervalle [0,1].
 * Si la valeur est manquante ou hors bornes, on retourne 0.5 comme valeur
 * neutre afin d’éviter les scores nuls qui pourraient biaiser le calcul.
 * @param {number|string} v Valeur en entrée (1–10)
 * @returns {number} Valeur normalisée entre 0 et 1
 */
function norm(v){
  const n = Number(v);
  if (Number.isFinite(n) && n >= 1 && n <= 10) return n / 10;
  return 0.5;
}

/**
 * Calcule le score d’une tâche en fonction de plusieurs facteurs.
 *
 * @param {Object} task L’objet tâche contenant les champs suivants :
 *   - impact: 1–10 (importance ou valeur générée)
 *   - urgency: 1–10 (proximité de l’échéance)
 *   - effort_estimate: 1–10 (niveau d’effort requis)
 *   - energy_required: 1–10 (énergie nécessaire pour accomplir la tâche)
 * @param {number} userEnergyNow Niveau d’énergie actuel de l’utilisateur (1–10)
 * @param {Object} weights Poids à appliquer pour chaque facteur (w1–w4). Si non fourni, DEFAULT_WEIGHTS est utilisé.
 * @returns {Object} Un objet contenant le score (0–100) et le détail de chaque composant normalisé.
 */
function calculateTaskScore(task, userEnergyNow, weights = DEFAULT_WEIGHTS){
  const impactNorm = norm(task.impact);
  const urgencyNorm = norm(task.urgency);
  const effortNorm = norm(task.effort_estimate);
  const energyReqNorm = norm(task.energy_required);
  const userEnergyNorm = norm(userEnergyNow);
  // Alignement énergétique : plus la différence entre l’énergie requise et
  // l’énergie actuelle est faible, plus le score est élevé. On divise par 1 car
  // les valeurs sont déjà sur [0,1].
  const energyAlignment = 1 - Math.abs(userEnergyNorm - energyReqNorm);
  // Formule du score : combine impact, urgence, effort (préférant les tâches à faible effort)
  // et alignement énergétique. On inverse effortNorm pour favoriser les tâches
  // nécessitant moins d’effort.
  const score = (weights.w1 * impactNorm + weights.w2 * urgencyNorm + weights.w3 * (1 - effortNorm) + weights.w4 * energyAlignment) * 100;
  return {
    score,
    impactNorm,
    urgencyNorm,
    effortNorm,
    energyAlignment
  };
}

/**
 * Trie une liste de tâches selon leur score de priorité.
 *
 * @param {Array<Object>} tasks Liste d’actions à prioriser. Les tâches doivent
 *   contenir les propriétés nécessaires pour le calcul du score (impact,
 *   urgency, effort_estimate, energy_required). Toute tâche manquant un
 *   champ sera normalisée sur 0.5.
 * @param {number} userEnergyNow Niveau d’énergie actuel de l’utilisateur (1–10)
 * @param {Object} options Options optionnelles :
 *   - weights : poids personnalisés pour le calcul du score.
 *   - decorate : si vrai, ajoute la propriété _score et _breakdown à chaque tâche.
 * @returns {Array<Object>} Nouvelle liste triée par score décroissant.
 */
function autoPrioritizeTasks(tasks, userEnergyNow, options = {}){
  const { weights = DEFAULT_WEIGHTS, decorate = false } = options;
  // Cloner la liste pour ne pas muter l’originale
  const list = tasks.slice();
  list.forEach(t => {
    const res = calculateTaskScore(t, userEnergyNow, weights);
    if (decorate){
      t._score = res.score;
      t._breakdown = res;
    }
  });
  // Trier par score décroissant
  list.sort((a,b) => {
    const as = a._score !== undefined ? a._score : calculateTaskScore(a, userEnergyNow, weights).score;
    const bs = b._score !== undefined ? b._score : calculateTaskScore(b, userEnergyNow, weights).score;
    return bs - as;
  });
  return list;
}

// Exposer les fonctions globalement afin qu’elles soient accessibles depuis app.js
window.calculateTaskScore = calculateTaskScore;
window.autoPrioritizeTasks = autoPrioritizeTasks;