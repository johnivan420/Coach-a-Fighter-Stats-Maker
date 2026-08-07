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
let history = [];
let historyCounter = 0;

const el = id => document.getElementById(id);

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

/* ---------- compare builds ---------- */
function populateBuildSelectors(){
  const selA = el('buildASelect');
  const selB = el('buildBSelect');
  if (history.length === 0){
    selA.innerHTML = '<option value="">No builds saved</option>';
    selB.innerHTML = '<option value="">No builds saved</option>';
    return;
  }
  const options = history.map(b => `<option value="${b.id}">${b.label} — ${b.time}</option>`).join('');
  selA.innerHTML = options;
  selB.innerHTML = options;
  if (history.length > 1){
    selB.selectedIndex = 1;
  }
}

el('compareBtn').addEventListener('click', () => {
  const errEl = el('compareError');
  errEl.textContent = '';

  if (history.length < 2){
    errEl.textContent = 'Save at least two builds before comparing.';
    el('compareResults').innerHTML = '';
    return;
  }

  const idA = el('buildASelect').value;
  const idB = el('buildBSelect').value;

  if (!idA || !idB){
    errEl.textContent = 'Select two builds to compare.';
    return;
  }
  if (idA === idB){
    errEl.textContent = 'Pick two different builds to compare.';
    return;
  }

  const buildA = history.find(b => b.id === idA);
  const buildB = history.find(b => b.id === idB);
  if (!buildA || !buildB){
    errEl.textContent = 'Could not find the selected builds.';
    return;
  }

  renderBuildComparison(buildA, buildB);
});

function renderBuildComparison(a, b){
  const wrap = el('compareResults');
  const aWinsOvr = a.maxOvr > b.maxOvr;
  const bWinsOvr = b.maxOvr > a.maxOvr;

  let rows = '';
  let totalA = 0, totalB = 0;
  STATS.forEach(s => {
    const va = a.stats[s.key];
    const vb = b.stats[s.key];
    totalA += va;
    totalB += vb;
    const aWin = va > vb;
    const bWin = vb > va;
    rows += `
      <div class="build-compare-row">
        <div class="bc-stat"><span class="dot" style="background:${s.color}"></span>${s.name}</div>
        <div class="bc-val ${aWin ? 'bc-win' : ''}">${va}</div>
        <div class="bc-val ${bWin ? 'bc-win' : ''}">${vb}</div>
      </div>`;
  });

  const totalAWin = totalA > totalB;
  const totalBWin = totalB > totalA;
  const diff = Math.abs(totalA - totalB);

  wrap.innerHTML = `
    <div class="build-compare-head">
      <div></div>
      <div class="bc-name ${totalAWin ? 'bc-win' : ''}">${a.label}</div>
      <div class="bc-name ${totalBWin ? 'bc-win' : ''}">${b.label}</div>
    </div>
    <div class="build-compare-row">
      <div class="bc-stat">Target OVR</div>
      <div class="bc-val ${aWinsOvr ? 'bc-win' : ''}">${a.maxOvr}</div>
      <div class="bc-val ${bWinsOvr ? 'bc-win' : ''}">${b.maxOvr}</div>
    </div>
    ${rows}
    <div class="build-compare-row build-compare-total">
      <div class="bc-stat">Total Stats</div>
      <div class="bc-val ${totalAWin ? 'bc-win' : ''}">${totalA}</div>
      <div class="bc-val ${totalBWin ? 'bc-win' : ''}">${totalB}</div>
    </div>
    <div class="compare-diff">${diff===0 ? 'Both builds have equal total stats.' : `<b>${totalAWin ? a.label : b.label}</b> has ${diff} more total stat points.`}</div>
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
  };
  history.unshift(build);
  if (history.length > 25) history.pop();
  nameInput.value = '';
  renderHistory();
  populateBuildSelectors();
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
    item.innerHTML = `
      <div class="history-top">
        <span class="history-name">${build.label}</span>
        <span class="history-time">${build.time}</span>
      </div>
      <div class="history-detail">OVR ${build.currentOvr} → ${build.maxOvr}</div>
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
}

function deleteBuild(id){
  history = history.filter(b => b.id !== id);
  renderHistory();
  populateBuildSelectors();
  el('compareResults').innerHTML = '';
}

/* ---------- init ---------- */
buildStatInputRows();
populateBuildSelectors();
updateHero();
