/* =====================================================================
   COACH A FIGHTER — STATS MAKER / BUILD PLANNER

   SOURCE OF TRUTH:
   - Current OVR and Max OVR are set MANUALLY by the user (matching what
     the game shows them) — the calculator never overwrites these.
   - Points available = Max OVR - Current OVR. Every 10 stat points
     allocated to a stat = 1 point = 1 OVR (POINTS_PER_OVR), so allocating
     points can never silently create a mismatched OVR number.
   - The separate formula OVR = 80 + floor(totalStats/10), capped at 120,
     is the game's real stat->OVR formula. It's used for the Target Build
     feasibility check and for computing OVR from Fighter Database totals
     (since fighters only have a total, not a manually-tracked OVR) — it
     does NOT drive the main Current/Max OVR inputs.
   ===================================================================== */

/* ================= CONFIG (existing game formulas — edit here only) ================= */
const BASE_OVR = 80;          // fighter starts at 80 OVR with 0 total stat points
const MAX_OVR_CAP = 120;      // hard game cap
const POINTS_PER_OVR = 10;    // 10 stat points = 1 OVR = 1 allocation "point"
const MAX_STAT = 3000;        // per-stat ceiling
/* ======================================================================================= */

const STATS = [
  {key:'dexterity', name:'Dexterity', abbr:'DEX',  color:'#22E7F0'},
  {key:'agility',   name:'Agility',   abbr:'AGL',  color:'#5CF2C0'},
  {key:'stamina',   name:'Stamina',   abbr:'STM',  color:'#3FDB8C'},
  {key:'endurance', name:'Endurance', abbr:'ENDR', color:'#B98AF0'},
  {key:'power',     name:'Power',     abbr:'PWR',  color:'#FF7A3D'},
];
const statByKey = key => STATS.find(s => s.key === key);
const emptyStats = () => ({dexterity:0, agility:0, stamina:0, endurance:0, power:0});

/* Exact per-training-session stat gains (existing formula, reused by Predict Final Stats).
   Some training types have a side effect: Dexterity/Endurance training also grants Power. */
const TRAINING_GAINS = {
  power:     {power:3},
  endurance: {endurance:3, power:1},
  dexterity: {dexterity:2, power:1},
  agility:   {agility:1},
  stamina:   {stamina:3},
};

/* ================= ACTIVE WORKING CODES ================= */
const activeCodes = [
  {code:"Update2!",  rewards:["💰 25,000 Cash","🎲 10 Real Rerolls","⭐ 5 Legend Rerolls","🎟️ 1 Skip Token"]},
  {code:"Refresh2!", rewards:["💰 25,000 Cash","🎲 10 Real Rerolls","⭐ 10 Legend Rerolls","🎟️ 2 Skip Tokens"]},
  {code:"1MVISITS!", rewards:["💰 100,000 Cash","🎲 10 Real Rerolls","⭐ 15 Legend Rerolls","🎟️ 1 Skip Token"]},
  {code:"2MVISITS!", rewards:["💰 100,000 Cash","🎲 20 Real Rerolls","⭐ 25 Legend Rerolls","🎟️ 2 Skip Tokens"]},
  {code:"Refresh3!", rewards:["💰 25,000 Cash","🎲 10 Real Rerolls","⭐ 10 Legend Rerolls","🎟️ 2 Skip Tokens"]},
  {code:"Ippo!",     rewards:["💰 100,000 Cash","🎲 10 Real Rerolls","⭐ 10 Legend Rerolls","🎟️ 2 Skip Tokens"]},
  {code:"5MVISITS!", rewards:["💰 100,000 Cash","🎲 20 Real Rerolls","⭐ 125 Legend Rerolls","🎟️ 2 Skip Tokens"]},
];

/* ================= FIGHTER DATABASE =================
   `total` = Total Stats (Endurance + Stamina + Speed/Agility + Dexterity + Power, reach excluded).
   `rarity` + `price` for the top-30 ranked roster come directly from the
   in-game Fighters Stats Ranking board. Fighters without a `rarity` are
   extra reference entries outside that ranked board (no price shown).
   Per-stat breakdown is an ESTIMATED split from `total` for card display
   (only totals were tracked) — edit `splitProfile` per fighter if you
   know their real per-stat numbers.
======================================================== */
const FIGHTERS = [
  {name:'Apollo Creed',           total:1275, classification:'GOAT',   rarity:'EVENT',    price:'🎟️ EVENT',     splitProfile:[0.24,0.22,0.18,0.14,0.22]},
  {name:'Hitman',                 total:1188, classification:'GOAT',   rarity:'GOAT',     price:'🪙 5,000,000', splitProfile:[0.20,0.20,0.20,0.18,0.22]},
  {name:'Ippo',                   total:1140, classification:'GOAT',   rarity:'GOAT',     price:'🪙 5,000,000', splitProfile:[0.22,0.22,0.18,0.16,0.22]},
  {name:'PACMAN',                 total:1095, classification:'GOAT',   rarity:'GOAT',     price:'🪙 5,000,000', splitProfile:[0.22,0.24,0.16,0.14,0.24]},
  {name:'Muhammad Ali',           total:1000, classification:'GOAT',   rarity:'GOAT',     price:'💵 20,000,000', splitProfile:[0.24,0.26,0.18,0.14,0.18]},
  {name:'Roberto Durán',          total:995,  classification:'GOAT',   rarity:'GOAT',     price:'💵 20,000,000', splitProfile:[0.26,0.20,0.20,0.16,0.18]},
  {name:'Floyd Mayweather Jr.',   total:975,  classification:'GOAT',   rarity:'GOAT',     price:'💵 20,000,000', splitProfile:[0.30,0.24,0.18,0.14,0.14]},
  {name:'Joe Louis',              total:960,  classification:'GOAT',   rarity:'GOAT',     price:'💵 20,000,000', splitProfile:[0.20,0.16,0.18,0.16,0.30]},
  {name:'Rocky Marciano',         total:950,  classification:'GOAT',   rarity:'GOAT',     price:'💵 20,000,000', splitProfile:[0.16,0.16,0.20,0.20,0.28]},
  {name:'Iron Mike',              total:885,  classification:'GOAT',   rarity:'GOAT',     price:'💵 20,000,000', splitProfile:[0.18,0.20,0.16,0.14,0.32]},
  {name:'Thomas Hearns',          total:880,  classification:'LEGEND', rarity:'LEGEND_5M',price:'🪙 5,000,000', splitProfile:[0.22,0.20,0.16,0.14,0.28]},
  {name:'Henry Armstrong',        total:855,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.18,0.20,0.26,0.20,0.16]},
  {name:'Roy Jones Jr.',          total:840,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.24,0.28,0.16,0.14,0.18]},
  {name:'Evander Holyfield',      total:835,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.18,0.16,0.20,0.22,0.24]},
  {name:'Julio César Chávez',     total:805,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.20,0.16,0.24,0.22,0.18]},
  {name:'Pernell Whitaker',       total:800,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.28,0.26,0.18,0.14,0.14]},
  {name:'Manny Pacquiao',         total:735,  classification:'LEGEND', rarity:'LEGEND_5M',price:'🪙 5,000,000', splitProfile:[0.22,0.28,0.18,0.14,0.18]},
  {name:'Tyson Fury',             total:685,  classification:'LEGEND', rarity:'LEGEND_5M',price:'🪙 5,000,000', splitProfile:[0.20,0.16,0.18,0.24,0.22]},
  {name:'Francis Ngannou',        total:685,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.14,0.16,0.18,0.20,0.32]},
  {name:'Gennady "GGG" Golovkin', total:670,  classification:'LEGEND', rarity:'LEGEND_5M',price:'🪙 5,000,000', splitProfile:[0.18,0.16,0.18,0.18,0.30]},
  {name:'Naoya Inoue',            total:665,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.22,0.22,0.16,0.14,0.26]},
  {name:'Vitali Klitschko',       total:665,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.16,0.14,0.18,0.22,0.30]},
  {name:'Artur Beterbiev',        total:665,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.16,0.14,0.18,0.20,0.32]},
  {name:'Sugar Ray Robinson',     total:650,  classification:'LEGEND', rarity:'LEGEND_5M',price:'🪙 5,000,000', splitProfile:[0.26,0.24,0.18,0.14,0.18]},
  {name:'Sugar Ray Leonard',      total:650,  classification:'LEGEND', rarity:'LEGEND_5M',price:'🪙 5,000,000', splitProfile:[0.24,0.26,0.16,0.14,0.20]},
  {name:'Gervonta "Tank" Davis',  total:650,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.20,0.22,0.16,0.14,0.28]},
  {name:'Chris Eubank',           total:650,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.20,0.18,0.18,0.20,0.24]},
  {name:'Larry Holmes',           total:650,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.20,0.16,0.20,0.20,0.24]},
  {name:'Ilia Topuria',           total:640,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.20,0.20,0.18,0.18,0.24]},
  {name:'Naseem Hamed',           total:495,  classification:'LEGEND', rarity:'LEGEND_2M',price:'💎 2,000,000', splitProfile:[0.20,0.24,0.16,0.14,0.26]},

  /* Extra reference fighters outside the ranked 30-fighter roster (no rarity/price shown) */
  {name:'Ryan Garcia',            total:440,  classification:'LEGEND', splitProfile:[0.24,0.24,0.16,0.14,0.22]},
  {name:'Canelo Alvarez',         total:430,  classification:'LEGEND', splitProfile:[0.20,0.18,0.18,0.20,0.24]},
  {name:'Anthony Joshua',         total:420,  classification:'LEGEND', splitProfile:[0.16,0.14,0.18,0.20,0.32]},
  {name:'Terence Crawford',       total:420,  classification:'LEGEND', splitProfile:[0.26,0.22,0.18,0.14,0.20]},
  {name:'Dmitry Bivol',           total:418,  classification:'LEGEND', splitProfile:[0.20,0.18,0.20,0.22,0.20]},
  {name:'Joe Frazier',            total:418,  classification:'LEGEND', splitProfile:[0.16,0.16,0.22,0.20,0.26]},
  {name:'Sonny Liston',           total:418,  classification:'LEGEND', splitProfile:[0.16,0.14,0.18,0.20,0.32]},
  {name:'Oleksandr Usyk',         total:418,  classification:'LEGEND', splitProfile:[0.22,0.22,0.20,0.18,0.18]},
  {name:'Devin Haney',            total:415,  classification:'LEGEND', splitProfile:[0.26,0.22,0.18,0.16,0.18]},
  {name:'Errol Spence Jr.',       total:372,  classification:'LEGEND', splitProfile:[0.22,0.18,0.18,0.18,0.24]},
  {name:'George Foreman',         total:352,  classification:'LEGEND', splitProfile:[0.14,0.14,0.18,0.22,0.32]},
  {name:'Abdullah Mason',         total:347,  classification:'LEGEND', splitProfile:[0.20,0.20,0.18,0.18,0.24]},
  {name:'Adrien Broner',          total:347,  classification:'LEGEND', splitProfile:[0.24,0.22,0.16,0.16,0.22]},
  {name:'Chris Eubank Jr.',       total:347,  classification:'LEGEND', splitProfile:[0.20,0.18,0.18,0.20,0.24]},
  {name:'Nigel Benn',             total:347,  classification:'LEGEND', splitProfile:[0.16,0.16,0.18,0.20,0.30]},
  {name:'Teofimo Lopez',          total:347,  classification:'LEGEND', splitProfile:[0.22,0.22,0.18,0.16,0.22]},
  {name:'Vasyl Lomachenko',       total:347,  classification:'LEGEND', splitProfile:[0.28,0.28,0.16,0.12,0.16]},
  {name:'Lennox Lewis',           total:347,  classification:'LEGEND', splitProfile:[0.16,0.14,0.18,0.22,0.30]},
];

/* deterministic estimated per-stat split from total + optional weight profile */
function estimateFighterStats(fighter){
  const w = fighter.splitProfile || [0.2,0.2,0.2,0.2,0.2];
  const order = ['dexterity','agility','stamina','endurance','power'];
  const out = {};
  let running = 0;
  order.forEach((key,i) => {
    if (i === order.length-1){
      out[key] = fighter.total - running;
    } else {
      const v = Math.round(fighter.total * w[i]);
      out[key] = v;
      running += v;
    }
  });
  return out;
}

/* ================= SINGLE SOURCE OF TRUTH =================
   planner.baseline + planner.allocated => the stat numbers shown everywhere.
   Current OVR / Max OVR live directly on the #currentOvrInput / #maxOvrInput
   fields — read live, never cached, never derived from stat totals.
============================================================= */
const planner = {
  fighterName: null,
  baseline: {dexterity:400, agility:400, stamina:400, endurance:400, power:400},
  allocated: emptyStats(),
  editingBuildId: null,
};

const el = id => document.getElementById(id);

function currentOvrManual(){ const v = parseInt(el('currentOvrInput').value,10); return isNaN(v) ? 0 : v; }
function maxOvrManual(){ const v = parseInt(el('maxOvrInput').value,10); return isNaN(v) ? 0 : v; }
function statTotal(statsObj){ return STATS.reduce((a,s)=>a+(statsObj[s.key]||0),0); }
function currentStat(key){ return planner.baseline[key] + planner.allocated[key]; }
function currentStatsObj(){
  const out = {};
  STATS.forEach(s => out[s.key] = currentStat(s.key));
  return out;
}
function pointsTotal(){ return Math.max(0, maxOvrManual() - currentOvrManual()); }
function pointsUsed(){ return Math.round(statTotal(planner.allocated) / POINTS_PER_OVR); }
function pointsRemaining(){ return Math.max(0, pointsTotal() - pointsUsed()); }
function projectedOvr(){ return Math.min(maxOvrManual(), currentOvrManual() + pointsUsed()); }

/* game's real stat->OVR formula (used for Target Build + Fighter DB, NOT the main hero) */
function rawOvrFromTotal(total){ return BASE_OVR + Math.floor(total/POINTS_PER_OVR); }
function ovrFromTotal(total){ return Math.min(MAX_OVR_CAP, rawOvrFromTotal(total)); }

/* ================= TAB NAV ================= */
function initTabs(){
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      el(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}
function goToTab(name){
  const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
  if (btn) btn.click();
}

/* ================= BASELINE STAT INPUTS ================= */
function buildBaselineRows(){
  const wrap = el('baselineRows');
  wrap.innerHTML = '';
  STATS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <div class="stat-name"><span class="dot" style="background:${s.color}"></span>${s.name}</div>
      <div class="field-mini">
        <span class="fl">Baseline</span>
        <input type="number" id="base-${s.key}" min="0" max="${MAX_STAT}" value="${planner.baseline[s.key]}">
      </div>
    `;
    wrap.appendChild(row);
    row.querySelector(`#base-${s.key}`).addEventListener('input', e => {
      planner.baseline[s.key] = Math.max(0, Math.min(MAX_STAT, parseInt(e.target.value,10) || 0));
      planner.allocated = emptyStats(); // editing baseline resets this session's point allocation only
      recalcAll();
    });
  });
}

/* ================= TRAINING ALLOCATION (%) + PREDICT FINAL STATS =================
   This is a separate, read-only PREVIEW tool — it never touches planner.allocated
   (the actual point-spend build planner below it). It answers "if I trained using
   this % split, what would my Current Stats above end up as?" using the exact same
   TRAINING_GAINS formula as the rest of the site. Trainings available = (Max OVR -
   Current OVR) * POINTS_PER_OVR, matching the same OVR<->points ratio used everywhere. */
let splitPct = {dexterity:20, agility:20, stamina:20, endurance:20, power:20};

function buildSplitRows(){
  const wrap = el('splitRows');
  if (!wrap) return;
  wrap.innerHTML = '';
  STATS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'split-row';
    row.innerHTML = `
      <div class="sname">${s.name}</div>
      <input type="range" min="0" max="100" value="${splitPct[s.key]}" id="split-range-${s.key}">
      <div class="spct-wrap">
        <input type="number" min="0" max="100" value="${splitPct[s.key]}" id="split-num-${s.key}" class="spct-input">
        <span class="spct-sign">%</span>
      </div>
    `;
    wrap.appendChild(row);
    const applyValue = (val) => {
      const othersSum = STATS.reduce((a,st) => st.key === s.key ? a : a + splitPct[st.key], 0);
      const maxAllowed = Math.max(0, 100 - othersSum);
      if (val > maxAllowed) val = maxAllowed;
      if (val < 0) val = 0;
      splitPct[s.key] = val;
      el(`split-range-${s.key}`).value = val;
      el(`split-num-${s.key}`).value = val;
      updateSplitTotal();
      updateSliderMaxes();
    };
    row.querySelector(`#split-range-${s.key}`).addEventListener('input', e => applyValue(parseInt(e.target.value,10) || 0));
    row.querySelector(`#split-num-${s.key}`).addEventListener('input', e => applyValue(parseInt(e.target.value,10) || 0));
    row.querySelector(`#split-num-${s.key}`).addEventListener('blur', e => { e.target.value = splitPct[s.key]; });
  });
  updateSplitTotal();
  updateSliderMaxes();
}
function updateSliderMaxes(){
  STATS.forEach(s => {
    const inp = el(`split-range-${s.key}`);
    const numInp = el(`split-num-${s.key}`);
    if (!inp) return;
    const othersSum = STATS.reduce((a,st) => st.key === s.key ? a : a + splitPct[st.key], 0);
    const maxAllowed = Math.max(0, 100 - othersSum);
    inp.max = maxAllowed;
    if (numInp) numInp.max = maxAllowed;
    if (parseInt(inp.value,10) > maxAllowed) inp.value = maxAllowed;
  });
}
function updateSplitTotal(){
  const sum = STATS.reduce((a,s)=>a+splitPct[s.key],0);
  const disp = el('splitTotalDisplay');
  if (!disp) return;
  disp.textContent = sum + '%';
  disp.className = 'v ' + (sum===100 ? 'ok' : 'bad');
  const note = el('splitIncompleteNote');
  if (note) note.textContent = sum < 100 ? `Please allocate the remaining ${100-sum}%.` : (sum > 100 ? `Over-allocated by ${sum-100}% — reduce a slider.` : '');
}

function splitTrainingsByAllocation(trainings, pctMap){
  const result = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  let running = 0;
  STATS.forEach((s,i) => {
    let n;
    if (i === STATS.length-1){ n = trainings - running; }
    else { n = Math.round(trainings * (pctMap[s.key]/100)); running += n; }
    result[s.key] = n;
  });
  return result;
}
function computeGainsFromTrainingCounts(trainingCounts){
  let gained = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  STATS.forEach(s => {
    const n = trainingCounts[s.key] || 0;
    const gains = TRAINING_GAINS[s.key];
    Object.keys(gains).forEach(statKey => { gained[statKey] += n * gains[statKey]; });
  });
  return gained;
}

if (el('predictBtn')) el('predictBtn').addEventListener('click', () => {
  const errEl = el('predictError');
  if (errEl) errEl.textContent = '';
  const sum = STATS.reduce((a,s)=>a+splitPct[s.key],0);
  if (sum !== 100){
    if (errEl) errEl.textContent = `Total Allocation must equal 100% before predicting (currently ${sum}%).`;
    return;
  }
  const trainings = Math.max(0, (maxOvrManual() - currentOvrManual())) * POINTS_PER_OVR;
  if (trainings <= 0){
    if (errEl) errEl.textContent = 'Max OVR must be greater than Current OVR to predict training gains.';
    return;
  }
  const counts = splitTrainingsByAllocation(trainings, splitPct);
  const gained = computeGainsFromTrainingCounts(counts);

  const base = planner.baseline;
  let html = `<div class="result-summary">
    <div class="rs-card"><div class="v">${trainings}</div><div class="l">Trainings</div></div>
    <div class="rs-card"><div class="v">${Math.min(maxOvrManual(), currentOvrManual() + Math.round(trainings/POINTS_PER_OVR))}</div><div class="l">Final OVR</div></div>
  </div>`;
  STATS.forEach(s => {
    const final = Math.min(MAX_STAT, base[s.key] + gained[s.key]);
    const gain = final - base[s.key];
    html += `<div class="final-stat-row"><div class="fname"><span class="dot" style="background:${s.color}"></span>${s.name}</div><div class="fval">${final} ${gain>0?`<span class="gain">(+${gain})</span>`:''}</div></div>`;
  });
  const wrap = el('resultsWrap');
  if (wrap) wrap.innerHTML = html;
});

/* ================= CLASSIFICATION (based on Projected OVR) ================= */
function classificationForOvr(ovr){
  if (ovr >= 115) return {label:'GOAT', emoji:'🐐'};
  if (ovr >= 100) return {label:'LEGEND', emoji:'⭐'};
  if (ovr >= 90)  return {label:'ELITE', emoji:'🏆'};
  return {label:'PRO', emoji:'🥊'};
}
/* ================= RECALC (kept as a no-op call point for compatibility with existing call sites) ================= */
function recalcAll(){
  // Fighter Classification and Final Build panels were removed from the Build tab.
  // The underlying data functions (projectedOvr, classificationForOvr, etc.) are
  // still used elsewhere (Save Build, build history, compare) and are untouched.
}

if (el('currentOvrInput')) el('currentOvrInput').addEventListener('input', recalcAll);
if (el('maxOvrInput')) el('maxOvrInput').addEventListener('input', recalcAll);

/* ================= SAVE / MY BUILDS (localStorage) ================= */
const STORAGE_KEY = 'cafSavedBuilds';
function loadHistoryFromStorage(){
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch(e){ console.error('[Fighter Calc] Failed to read saved builds:', e); return []; }
}
function persistHistory(list){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch(e){ console.error('[Fighter Calc] Failed to save builds:', e); }
}
let history = loadHistoryFromStorage();

function currentBuildSnapshot(name){
  return {
    id: planner.editingBuildId || (Date.now() + '-' + Math.floor(Math.random()*1000)),
    name,
    fighterName: planner.fighterName,
    baseline: {...planner.baseline},
    allocated: {...planner.allocated},
    currentOvr: currentOvrManual(),
    maxOvr: maxOvrManual(),
    ovr: projectedOvr(),
    time: new Date().toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
  };
}

if (el('saveBuildBtn')) el('saveBuildBtn').addEventListener('click', () => {
  const errEl = el('saveError'); errEl.textContent = '';
  const nameInput = el('buildNameInput');
  const name = (nameInput.value || '').trim() || `Build ${new Date().toLocaleDateString()}`;
  const snap = currentBuildSnapshot(name);
  const idx = history.findIndex(b => b.id === snap.id);
  if (idx >= 0) history[idx] = snap; else history.unshift(snap);
  if (history.length > 40) history = history.slice(0,40);
  persistHistory(history);
  planner.editingBuildId = snap.id;
  nameInput.value = name;
  renderHistory();
  populateBuildSelectors();
});

function renderHistory(){
  const wrap = el('historyList');
  if (history.length === 0){ wrap.innerHTML = '<div class="placeholder-note">No builds saved yet.</div>'; return; }
  wrap.innerHTML = '';
  history.forEach(build => {
    const cls = classificationForOvr(build.ovr);
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-top"><span class="history-name">${cls.emoji} ${build.name}</span><span class="history-time">${build.time}</span></div>
      <div class="history-detail">OVR ${build.ovr} / ${build.maxOvr} <span class="${classBadgeClass(cls.label)}">${cls.label}</span></div>
      <div class="history-actions">
        <button class="load-btn">Load</button>
        <button class="edit-btn">Edit</button>
        <button class="del-btn">Delete</button>
      </div>
    `;
    item.querySelector('.load-btn').addEventListener('click', () => loadBuild(build.id, false));
    item.querySelector('.edit-btn').addEventListener('click', () => loadBuild(build.id, true));
    item.querySelector('.del-btn').addEventListener('click', () => deleteBuild(build.id));
    wrap.appendChild(item);
  });
}

function loadBuild(id, editMode){
  const build = history.find(b => b.id === id);
  if (!build) return;
  planner.fighterName = build.fighterName;
  planner.baseline = {...build.baseline};
  planner.allocated = {...build.allocated};
  planner.editingBuildId = editMode ? build.id : null;
  if (el('currentOvrInput')) el('currentOvrInput').value = build.currentOvr;
  if (el('maxOvrInput')) el('maxOvrInput').value = build.maxOvr;
  if (el('buildNameInput')) el('buildNameInput').value = editMode ? build.name : '';
  buildBaselineRows();
  recalcAll();
  goToTab('build');
}
function deleteBuild(id){
  history = history.filter(b => b.id !== id);
  persistHistory(history);
  renderHistory();
  populateBuildSelectors();
}

/* ================= SHARE BUILD ================= */
if (el('shareBuildBtn')) el('shareBuildBtn').addEventListener('click', async () => {
  const statusEl = el('shareStatus');
  const payload = { n: planner.fighterName, b: planner.baseline, a: planner.allocated, c: currentOvrManual(), m: maxOvrManual() };
  const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
  const url = `${location.origin}${location.pathname}?build=${encoded}`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(url);
      statusEl.textContent = 'Share link copied to clipboard!'; statusEl.style.color = 'var(--good)';
    } else { statusEl.textContent = url; }
  } catch(e){ statusEl.textContent = url; }
});

function checkForSharedBuild(){
  const params = new URLSearchParams(location.search);
  const encoded = params.get('build');
  if (!encoded) return;
  try {
    const payload = JSON.parse(decodeURIComponent(atob(encoded)));
    el('sharedBanner').style.display = 'flex';
    el('loadSharedBtn').addEventListener('click', () => {
      planner.fighterName = payload.n || null;
      planner.baseline = {...emptyStats(), ...payload.b};
      planner.allocated = {...emptyStats(), ...payload.a};
      if (el('currentOvrInput') && payload.c != null) el('currentOvrInput').value = payload.c;
      if (el('maxOvrInput') && payload.m != null) el('maxOvrInput').value = payload.m;
      buildBaselineRows();
      recalcAll();
      el('sharedBanner').style.display = 'none';
      goToTab('build');
    });
  } catch(e){ console.error('[Fighter Calc] Bad shared build link:', e); }
}

/* ================= COMPARE (uses saved builds) ================= */
function populateBuildSelectors(){
  const selA = el('buildASelect'), selB = el('buildBSelect');
  if (!selA || !selB) return;
  if (history.length === 0){
    selA.innerHTML = '<option value="">No builds saved</option>';
    selB.innerHTML = '<option value="">No builds saved</option>';
    return;
  }
  const options = history.map(b => `<option value="${b.id}">${b.name} (OVR ${b.ovr})</option>`).join('');
  selA.innerHTML = options; selB.innerHTML = options;
  if (history.length > 1) selB.selectedIndex = 1;
}

if (el('compareBtn')) el('compareBtn').addEventListener('click', () => {
  const errEl = el('compareError'); errEl.textContent = '';
  if (history.length < 2){ errEl.textContent = 'Save at least two builds before comparing.'; return; }
  const idA = el('buildASelect').value, idB = el('buildBSelect').value;
  if (!idA || !idB){ errEl.textContent = 'Select two builds to compare.'; return; }
  if (idA === idB){ errEl.textContent = 'Pick two different builds to compare.'; return; }
  const a = history.find(b=>b.id===idA), b = history.find(b=>b.id===idB);
  if (a && b) renderBuildComparison(a, b);
});

function finalStatsOf(build){
  const out = {};
  STATS.forEach(s => out[s.key] = (build.baseline[s.key]||0) + (build.allocated[s.key]||0));
  return out;
}

function renderBuildComparison(a, b){
  const wrap = el('compareResults');
  const statsA = finalStatsOf(a), statsB = finalStatsOf(b);
  const aWinsOvr = a.ovr > b.ovr, bWinsOvr = b.ovr > a.ovr;

  let rows = '';
  const advA = [], advB = [];
  STATS.forEach(s => {
    const va = statsA[s.key], vb = statsB[s.key];
    const aWin = va > vb, bWin = vb > va;
    if (aWin) advA.push(`${s.name} +${va-vb}`);
    if (bWin) advB.push(`${s.name} +${vb-va}`);
    rows += `<div class="build-compare-row"><div class="bc-stat"><span class="dot" style="background:${s.color}"></span>${s.name}</div><div class="bc-val ${aWin?'bc-win':''}">${va}</div><div class="bc-val ${bWin?'bc-win':''}">${vb}</div></div>`;
  });

  const speedA = statsA.agility+statsA.dexterity, speedB = statsB.agility+statsB.dexterity;
  const defA = statsA.endurance+statsA.stamina, defB = statsB.endurance+statsB.stamina;
  const spreadA = Math.max(...Object.values(statsA)) - Math.min(...Object.values(statsA));
  const spreadB = Math.max(...Object.values(statsB)) - Math.min(...Object.values(statsB));

  wrap.innerHTML = `
    <div class="build-compare-head"><div></div><div class="bc-name ${aWinsOvr?'bc-win':''}">${a.name}</div><div class="bc-name ${bWinsOvr?'bc-win':''}">${b.name}</div></div>
    <div class="build-compare-row"><div class="bc-stat">OVR</div><div class="bc-val ${aWinsOvr?'bc-win':''}">${a.ovr}</div><div class="bc-val ${bWinsOvr?'bc-win':''}">${b.ovr}</div></div>
    ${rows}
    <div class="compare-advantages">
      <div><b>${a.name} advantages:</b> ${advA.length ? advA.join(', ') : 'None'}</div>
      <div><b>${b.name} advantages:</b> ${advB.length ? advB.join(', ') : 'None'}</div>
    </div>
    <div class="compare-tags">
      <span class="tag">Best for Power: <b>${statsA.power>=statsB.power ? a.name : b.name}</b></span>
      <span class="tag">Best for Speed: <b>${speedA>=speedB ? a.name : b.name}</b></span>
      <span class="tag">Best for Defense: <b>${defA>=defB ? a.name : b.name}</b></span>
      <span class="tag">Most Balanced: <b>${spreadA<=spreadB ? a.name : b.name}</b></span>
    </div>
  `;
}

/* ================= FIGHTER DATABASE =================
   Simple catalog: Name, Classification (GOAT/LEGEND), Price. No ranking,
   no rarity legend, no distributed/training stats shown here — clicking a
   card still loads that fighter's stats into the Build Planner, but the
   Fighters section itself stays a clean catalog. ================= */
function classBadgeClass(c){
  if (!c) return '';
  return 'class-badge class-' + c.toLowerCase().replace(/[^a-z0-9]/g,'');
}

function buildFighterCards(filter){
  const wrap = el('fighterCardsWrap');
  if (!wrap) return;
  const q = (filter||'').trim().toLowerCase();
  const base = q ? FIGHTERS.filter(f => f.name.toLowerCase().includes(q)) : FIGHTERS;
  const list = [...base].sort((a,b) => b.total - a.total);
  if (list.length === 0){ wrap.innerHTML = '<div class="placeholder-note">No fighters match your search.</div>'; return; }

  wrap.innerHTML = '';
  list.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'fighter-card fighter-card-simple';
    card.innerHTML = `
      <div class="fc-rank">#${i+1}</div>
      <div class="fc-name">${f.name}</div>
      <div class="${classBadgeClass(f.classification)}">${f.classification === 'GOAT' ? '🐐 GOAT' : '⭐ LEGEND'}</div>
      <div class="fc-total">Total Base Stats: ${f.total.toLocaleString()}</div>
      <div class="fc-price">${f.price || '—'}</div>
      <button type="button" class="btn ghost load-fighter-btn">Load Into Planner</button>
    `;
    card.querySelector('.load-fighter-btn').addEventListener('click', () => {
      planner.fighterName = f.name;
      planner.baseline = estimateFighterStats(f);
      planner.allocated = emptyStats();
      const seedOvr = ovrFromTotal(f.total);
      el('currentOvrInput').value = seedOvr;
      el('maxOvrInput').value = Math.min(MAX_OVR_CAP, seedOvr + 10);
      planner.editingBuildId = null;
      buildBaselineRows();
      recalcAll();
      goToTab('build');
    });
    wrap.appendChild(card);
  });
}
if (el('fighterSearchInput')) el('fighterSearchInput').addEventListener('input', e => buildFighterCards(e.target.value));

/* ================= CODES ================= */
function buildCodesGrid(){
  const wrap = el('codesGrid');
  if (!wrap) return;
  wrap.innerHTML = '';
  activeCodes.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'code-card';
    card.innerHTML = `
      <div class="code-card-head"><div class="code-name">${c.code}</div><div class="active-badge">🟢 ACTIVE</div></div>
      <div class="code-rewards">${c.rewards.map(r=>`<div class="code-reward-item">${r}</div>`).join('')}</div>
      <button type="button" class="btn copy-code-btn" id="copy-code-${idx}">Copy Code</button>
    `;
    wrap.appendChild(card);
    card.querySelector(`#copy-code-${idx}`).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(c.code);
        const original = btn.textContent;
        btn.textContent = '✓ Copied!'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 2000);
      } catch(e){ btn.textContent = 'Copy failed'; setTimeout(()=>{btn.textContent='Copy Code';},2000); }
    });
  });
}

/* ================= SCREENSHOT STAT SCANNER (OCR) ================= */
let scannedImageDataUrl = null;
if (el('scanToggleBtn')) el('scanToggleBtn').addEventListener('click', () => el('scanPanel').classList.toggle('open'));

if (el('scanFileInput')) el('scanFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file){ scannedImageDataUrl = null; el('scanStatsBtn').disabled = true; return; }
  el('scanFileName').textContent = file.name;
  el('scanDetected').innerHTML = '';
  el('scanStatus').textContent = '';
  const reader = new FileReader();
  reader.onload = evt => {
    scannedImageDataUrl = evt.target.result;
    el('scanPreviewWrap').innerHTML = `<img src="${scannedImageDataUrl}" class="scan-preview-img" alt="Uploaded fighter stats screenshot">`;
    el('scanStatsBtn').disabled = false;
  };
  reader.readAsDataURL(file);
});

if (el('scanStatsBtn')) el('scanStatsBtn').addEventListener('click', async () => {
  if (!scannedImageDataUrl){ el('scanStatus').textContent = 'Upload an image first.'; return; }
  if (typeof Tesseract === 'undefined'){ el('scanStatus').textContent = 'OCR engine failed to load. Refresh and try again.'; return; }
  el('scanStatsBtn').disabled = true;
  el('scanStatus').textContent = 'Scanning image… this can take a few seconds.';
  el('scanDetected').innerHTML = '';
  try {
    const { data } = await Tesseract.recognize(scannedImageDataUrl, 'eng');
    renderDetectedStats(parseStatsFromText(data.text || ''));
    el('scanStatus').textContent = '';
  } catch(err){
    console.error('[Fighter Calc] OCR failed:', err);
    el('scanStatus').textContent = 'Scan failed. Try a clearer or larger screenshot.';
  } finally { el('scanStatsBtn').disabled = false; }
});

function parseStatsFromText(text){
  const cleaned = text.replace(/,/g,' ');
  const results = {};
  STATS.forEach(s => {
    const labelPattern = `(?:${s.name}|${s.abbr})`;
    const regex = new RegExp('\\b'+labelPattern+'\\b[^0-9]{0,20}(\\d{1,5})','i');
    const match = cleaned.match(regex);
    if (match) results[s.key] = Math.max(0, Math.min(MAX_STAT, parseInt(match[1],10) || 0));
  });
  return results;
}

function renderDetectedStats(results){
  const wrap = el('scanDetected');
  const foundCount = STATS.filter(s => results[s.key] !== undefined).length;
  if (foundCount === 0){
    wrap.innerHTML = '<div class="scan-note bad">No stats were detected — enter them manually above, or try a clearer screenshot.</div>';
    return;
  }
  let html = '<div class="scan-note">Detected stats — review before applying (uncertain ones are left blank, not guessed):</div>';
  STATS.forEach(s => {
    const val = results[s.key];
    const found = val !== undefined;
    html += `<div class="scan-detect-row"><div class="sd-name"><span class="dot" style="background:${s.color}"></span>${s.name}</div><input type="number" min="0" max="${MAX_STAT}" id="scan-val-${s.key}" value="${found?val:''}" placeholder="Not found — enter manually"><span class="sd-mark ${found?'ok':'bad'}">${found?'✓':'?'}</span></div>`;
  });
  html += '<button type="button" class="btn" id="applyScanBtn">Apply Stats &amp; Open Build Planner</button>';
  wrap.innerHTML = html;

  el('applyScanBtn').addEventListener('click', () => {
    STATS.forEach(s => {
      const inp = el(`scan-val-${s.key}`);
      if (inp && inp.value !== '') planner.baseline[s.key] = Math.max(0, Math.min(MAX_STAT, parseInt(inp.value,10) || 0));
    });
    planner.allocated = emptyStats();
    planner.fighterName = null;
    const seedOvr = rawOvrFromTotal(statTotal(planner.baseline));
    if (seedOvr > maxOvrManual()) el('maxOvrInput').value = Math.min(MAX_OVR_CAP, seedOvr + 10);
    el('currentOvrInput').value = Math.min(MAX_OVR_CAP, seedOvr);
    buildBaselineRows();
    recalcAll();
    goToTab('build');
  });
}

/* ================= INIT ================= */
try { initTabs(); } catch(e){ console.error(e); }
try { checkForSharedBuild(); } catch(e){ console.error(e); }
try { buildBaselineRows(); } catch(e){ console.error(e); }
try { buildSplitRows(); } catch(e){ console.error(e); }
try { buildAllocRows(); } catch(e){ console.error(e); }
try { buildTargetRows(); } catch(e){ console.error(e); }
try { renderHistory(); } catch(e){ console.error(e); }
try { populateBuildSelectors(); } catch(e){ console.error(e); }
try { buildFighterCards(); } catch(e){ console.error(e); }
try { buildCodesGrid(); } catch(e){ console.error(e); }
try { recalcAll(); } catch(e){ console.error(e); }
