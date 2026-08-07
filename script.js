/* ================= CONFIG ================= */
const TRAININGS_PER_OVR = 10; // every 10 trainings = +1 OVR
const MAX_STAT = 3000;
/* ============================================ */

const STATS = [
  {key:'dexterity', name:'Dexterity', color:'#22E7F0'},
  {key:'agility',   name:'Agility',   color:'#5CF2C0'},
  {key:'stamina',   name:'Stamina',   color:'#3FDB8C'},
  {key:'endurance', name:'Endurance', color:'#B98AF0'},
  {key:'power',     name:'Power',     color:'#FF7A3D'},
];
const statByKey = key => STATS.find(s => s.key === key);

let currentStats = {dexterity:500, agility:500, stamina:500, endurance:500, power:500};
let caps = {dexterity:null, agility:null, stamina:null, endurance:null, power:null};
let statA = 'power';
let statB = 'dexterity';
let lastComparison = null;
let history = [];
let historyCounter = 0;

const el = id => document.getElementById(id);

function capFor(key){
  const room = MAX_STAT - currentStats[key];
  if (caps[key] === null || caps[key] === undefined) return Math.max(0, room);
  return Math.max(0, Math.min(caps[key], room));
}

/* ---------- stat inputs ---------- */
function buildStatInputRows(){
  const wrap = el('statInputRows');
  wrap.innerHTML = '';
  STATS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <div class="stat-name"><span class="dot" style="background:${s.color}"></span>${s.name}</div>
      <div class="field-mini">
        <span class="fl">Current</span>
        <input type="number" id="cur-${s.key}" min="0" max="${MAX_STAT}" value="${currentStats[s.key]}">
      </div>
      <div class="field-mini">
        <span class="fl">Cap (optional)</span>
        <input type="number" id="cap-${s.key}" min="0" max="${MAX_STAT}" placeholder="No limit" value="${caps[s.key] === null ? '' : caps[s.key]}">
      </div>
    `;
    wrap.appendChild(row);
    row.querySelector(`#cur-${s.key}`).addEventListener('input', e => {
      currentStats[s.key] = Math.max(0, Math.min(MAX_STAT, parseInt(e.target.value,10) || 0));
    });
    row.querySelector(`#cap-${s.key}`).addEventListener('input', e => {
      const v = e.target.value;
      caps[s.key] = v === '' ? null : Math.max(0, parseInt(v,10) || 0);
    });
  });
}

/* ---------- hero / OVR progress ---------- */
function requiredOvrIncrease(){
  const cur = parseInt(el('currentOvrInput').value,10) || 0;
  const max = parseInt(el('maxOvrInput').value,10) || 0;
  return Math.max(0, max - cur);
}
function totalTrainingsNeeded(){ return requiredOvrIncrease() * TRAININGS_PER_OVR; }

function updateHero(){
  const cur = parseInt(el('currentOvrInput').value,10) || 0;
  const max = parseInt(el('maxOvrInput').value,10) || 0;
  const inc = requiredOvrIncrease();
  const trainings = totalTrainingsNeeded();

  el('ovrIncreaseVal').textContent = inc;
  el('trainingsNeededVal').textContent = trainings;
  el('blocksNeededVal').textContent = inc;
  el('xpLeftLabel').textContent = `OVR ${cur}`;
  el('xpRightLabel').textContent = `OVR ${max}`;

  const span = max - cur;
  el('xpFill').style.width = (span > 0 ? 0 : 100) + '%';
}
el('currentOvrInput').addEventListener('input', updateHero);
el('maxOvrInput').addEventListener('input', updateHero);

/* ---------- compare selectors ---------- */
function populateSelectors(){
  const selA = el('statASelect');
  const selB = el('statBSelect');
  selA.innerHTML = STATS.map(s => `<option value="${s.key}" ${s.key===statA?'selected':''}>${s.name}</option>`).join('');
  selB.innerHTML = STATS.map(s => `<option value="${s.key}" ${s.key===statB?'selected':''}>${s.name}</option>`).join('');
  selA.addEventListener('change', e => { statA = e.target.value; });
  selB.addEventListener('change', e => { statB = e.target.value; });
}

/* ---------- compare logic ---------- */
el('compareBtn').addEventListener('click', () => runComparison(true));

function runComparison(showErrors){
  const errEl = el('compareError');
  errEl.textContent = '';
  if (statA === statB){
    if (showErrors) errEl.textContent = 'Pick two different stats to compare.';
    return;
  }
  const total = totalTrainingsNeeded();
  if (total <= 0){
    if (showErrors) errEl.textContent = 'Max OVR must be greater than Current OVR.';
    return;
  }

  const a = statByKey(statA), b = statByKey(statB);
  const capA = capFor(statA), capB = capFor(statB);
  const gainA = Math.min(total, capA);
  const gainB = Math.min(total, capB);
  const finalA = currentStats[statA] + gainA;
  const finalB = currentStats[statB] + gainB;

  lastComparison = {statA, statB, total, gainA, gainB, finalA, finalB, cappedA: gainA<total, cappedB: gainB<total};
  renderComparison();
}

function renderComparison(){
  const wrap = el('compareResults');
  if (!lastComparison){ wrap.innerHTML=''; return; }
  const {statA:aKey, statB:bKey, gainA, gainB, finalA, finalB, cappedA, cappedB} = lastComparison;
  const a = statByKey(aKey), b = statByKey(bKey);
  const aWins = finalA > finalB;
  const bWins = finalB > finalA;
  const diff = Math.abs(finalA - finalB);

  wrap.innerHTML = `
    <div class="compare-grid">
      <div class="compare-card ${aWins?'winner':''}">
        ${aWins?'<div class="win-badge">Higher</div>':''}
        <div class="cname">${a.name}</div>
        <div class="cfinal">${finalA}</div>
        <div class="cgain">+${gainA}${cappedA?' (cap reached)':''}</div>
        <div class="ccur">from ${currentStats[aKey]}</div>
      </div>
      <div class="compare-card ${bWins?'winner':''}">
        ${bWins?'<div class="win-badge">Higher</div>':''}
        <div class="cname">${b.name}</div>
        <div class="cfinal">${finalB}</div>
        <div class="cgain">+${gainB}${cappedB?' (cap reached)':''}</div>
        <div class="ccur">from ${currentStats[bKey]}</div>
      </div>
    </div>
    <div class="compare-diff">${diff===0 ? 'Both stats land at the same final value.' : `<b>${(aWins?a.name:b.name)}</b> ends ${diff} points higher if trained exclusively.`}</div>
  `;
}

/* ---------- save build ---------- */
el('saveBuildBtn').addEventListener('click', () => {
  const errEl = el('saveError');
  errEl.textContent = '';
  const nameInput = el('buildNameInput');
  historyCounter++;
  const label = nameInput.value.trim() || `Build #${historyCounter}`;

  const build = {
    id: Date.now() + '-' + historyCounter,
    label,
    time: new Date().toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
    currentOvr: parseInt(el('currentOvrInput').value,10) || 0,
    maxOvr: parseInt(el('maxOvrInput').value,10) || 0,
    stats: {...currentStats},
    caps: {...caps},
    comparison: lastComparison ? {...lastComparison} : null,
  };
  history.unshift(build);
  if (history.length > 25) history.pop();
  nameInput.value = '';
  renderHistory();
});

function renderHistory(){
  const wrap = el('historyList');
  if (history.length === 0){
    wrap.innerHTML = '<div class="placeholder-note">No builds saved yet.</div>';
    return;
  }
  wrap.innerHTML = '';
  history.forEach(build => {
    const item = document.createElement('div');
    item.className = 'history-item';
    let compareLine = 'No comparison run for this build.';
    if (build.comparison){
      const a = statByKey(build.comparison.statA), b = statByKey(build.comparison.statB);
      compareLine = `<b>${a.name}</b> ${build.comparison.finalA} vs <b>${b.name}</b> ${build.comparison.finalB}`;
    }
    item.innerHTML = `
      <div class="history-top">
        <span class="history-name">${build.label}</span>
        <span class="history-time">${build.time}</span>
      </div>
      <div class="history-detail">OVR ${build.currentOvr} → ${build.maxOvr}<br>${compareLine}</div>
      <div class="history-actions">
        <button class="load-btn" data-id="${build.id}">Load</button>
        <button class="del-btn" data-id="${build.id}">Delete</button>
      </div>
    `;
    item.querySelector('.load-btn').addEventListener('click', () => loadBuild(build.id));
    item.querySelector('.del-btn').addEventListener('click', () => deleteBuild(build.id));
    wrap.appendChild(item);
  });
}

function loadBuild(id){
  const build = history.find(b => b.id === id);
  if (!build) return;
  el('currentOvrInput').value = build.currentOvr;
  el('maxOvrInput').value = build.maxOvr;
  currentStats = {...build.stats};
  caps = {...build.caps};
  buildStatInputRows();
  updateHero();
  if (build.comparison){
    statA = build.comparison.statA;
    statB = build.comparison.statB;
    populateSelectors();
    lastComparison = {...build.comparison};
    renderComparison();
  } else {
    lastComparison = null;
    el('compareResults').innerHTML = '';
  }
}

function deleteBuild(id){
  history = history.filter(b => b.id !== id);
  renderHistory();
}

/* ---------- init ---------- */
buildStatInputRows();
populateSelectors();
updateHero();
