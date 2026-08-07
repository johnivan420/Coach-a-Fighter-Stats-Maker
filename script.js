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

/* predict-panel state */
let rates = {dexterity:30, agility:30, stamina:30, endurance:30, power:30}; // gain per 10 trainings
let enabled = {dexterity:true, agility:true, stamina:true, endurance:true, power:true}; // stats toggled OFF are excluded from every prediction mode
let mode = 'one';
let selectedOneStat = 'power';
let splitPct = {dexterity:20, agility:20, stamina:20, endurance:20, power:20};
function enabledStats(){ return STATS.filter(s => enabled[s.key]); }

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
function totalBlocksNeeded(){ return requiredOvrIncrease(); } // 1 block = 10 trainings

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

  buildOneStatRadios();
  buildStrongestRanking();
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

/* ---------- gain rates ---------- */
function buildRateRows(){
  const wrap = el('rateRows');
  wrap.innerHTML = '';
  STATS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'rate-row' + (enabled[s.key] ? '' : ' disabled');
    row.innerHTML = `
      <div class="stat-name"><span class="dot" style="background:${s.color}"></span>${s.name}</div>
      <div class="field-mini">
        <span class="fl">Gain / 10 Trainings</span>
        <input type="number" id="rate-${s.key}" min="0" max="1000" value="${rates[s.key]}">
      </div>
      <button type="button" class="stat-toggle-btn ${enabled[s.key]?'on':'off'}" id="toggle-${s.key}">${enabled[s.key]?'Training ON':'Excluded'}</button>
    `;
    wrap.appendChild(row);
    row.querySelector(`#rate-${s.key}`).addEventListener('input', e => {
      rates[s.key] = Math.max(0, parseInt(e.target.value,10) || 0);
      buildOneStatRadios();
      buildStrongestRanking();
    });
    row.querySelector(`#toggle-${s.key}`).addEventListener('click', () => {
      enabled[s.key] = !enabled[s.key];
      buildRateRows();
      buildOneStatRadios();
      buildSplitRows();
      buildStrongestRanking();
    });
  });
}

/* ---------- mode tabs ---------- */
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    mode = tab.dataset.mode;
    document.querySelectorAll('.mode-tab').forEach(t=>t.classList.toggle('active', t===tab));
    document.querySelectorAll('.mode-panel').forEach(p=>p.classList.remove('show'));
    el(`mode-${mode}`).classList.add('show');
  });
});

/* ---------- one-stat mode ---------- */
function buildOneStatRadios(){
  const wrap = el('oneStatRadios');
  if (!wrap) return;
  wrap.innerHTML = '';
  const blocks = totalBlocksNeeded();
  const avail = enabledStats();
  if (avail.length === 0){
    wrap.innerHTML = '<div class="placeholder-note">All stats are excluded — turn Training ON for at least one stat above.</div>';
    return;
  }
  if (!enabled[selectedOneStat]) selectedOneStat = avail[0].key;
  avail.forEach(s => {
    const gain = blocks * rates[s.key];
    const row = document.createElement('label');
    row.className = 'radio-stat-row' + (selectedOneStat===s.key ? ' selected' : '');
    row.innerHTML = `
      <input type="radio" name="oneStat" value="${s.key}" ${selectedOneStat===s.key?'checked':''}>
      <span class="rname">${s.name}</span>
      <span class="rrate">+${gain} total</span>
    `;
    row.addEventListener('click', () => {
      selectedOneStat = s.key;
      buildOneStatRadios();
    });
    wrap.appendChild(row);
  });
}

/* ---------- split mode ---------- */
function buildSplitRows(){
  const wrap = el('splitRows');
  if (!wrap) return;
  wrap.innerHTML = '';
  const avail = enabledStats();
  if (avail.length === 0){
    wrap.innerHTML = '<div class="placeholder-note">All stats are excluded — turn Training ON for at least one stat above.</div>';
    updateSplitTotal();
    return;
  }
  avail.forEach(s => {
    const row = document.createElement('div');
    row.className = 'split-row';
    row.innerHTML = `
      <div class="sname">${s.name}</div>
      <input type="range" min="0" max="100" value="${splitPct[s.key]}" id="split-range-${s.key}">
      <div class="spct" id="split-pct-${s.key}">${splitPct[s.key]}%</div>
    `;
    wrap.appendChild(row);
    row.querySelector(`#split-range-${s.key}`).addEventListener('input', e => {
      splitPct[s.key] = parseInt(e.target.value,10);
      el(`split-pct-${s.key}`).textContent = splitPct[s.key] + '%';
      updateSplitTotal();
    });
  });
  updateSplitTotal();
}
function updateSplitTotal(){
  const sum = enabledStats().reduce((a,s)=>a+splitPct[s.key],0);
  const disp = el('splitTotalDisplay');
  disp.textContent = sum + '%';
  disp.className = 'v ' + (sum===100 ? 'ok' : 'bad');
}

/* ---------- strongest build mode ---------- */
function buildStrongestRanking(){
  const wrap = el('strongestRanking');
  if (!wrap) return;
  const blocks = totalBlocksNeeded();
  const avail = enabledStats();
  if (avail.length === 0){
    wrap.innerHTML = '<div class="placeholder-note">All stats are excluded — turn Training ON for at least one stat above.</div>';
    return;
  }
  const ranked = [...avail].sort((a,b) => rates[b.key]-rates[a.key]);
  const maxRate = ranked.length ? rates[ranked[0].key] : 0;
  wrap.innerHTML = '';
  ranked.forEach(s => {
    const gain = blocks * rates[s.key];
    const isBest = rates[s.key] === maxRate && maxRate > 0;
    const row = document.createElement('div');
    row.className = 'strongest-rank' + (isBest ? ' best' : '');
    row.innerHTML = `<span class="rname">${s.name}</span><span class="rgain">+${rates[s.key]}/10 trainings — ${gain} total if trained exclusively</span>`;
    wrap.appendChild(row);
  });
}

/* ---------- predict ---------- */
el('predictBtn').addEventListener('click', () => {
  const errEl = el('planError');
  errEl.textContent = '';
  const blocks = totalBlocksNeeded();
  const trainings = totalTrainingsNeeded();

  if (blocks <= 0){
    const max = parseInt(el('maxOvrInput').value,10) || 0;
    const cur = parseInt(el('currentOvrInput').value,10) || 0;
    if (max <= cur){
      errEl.textContent = 'Max OVR must be greater than Current OVR.';
      renderPlaceholder();
      return;
    }
  }

  let gained = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  const avail = enabledStats();
  if (avail.length === 0){
    errEl.textContent = 'All stats are excluded — turn Training ON for at least one stat.';
    return;
  }

  if (mode === 'one'){
    if (!enabled[selectedOneStat]){
      errEl.textContent = 'Selected stat is excluded from training — pick an enabled one.';
      return;
    }
    gained[selectedOneStat] = blocks * rates[selectedOneStat];
  } else if (mode === 'split'){
    const sum = avail.reduce((a,s)=>a+splitPct[s.key],0);
    if (sum !== 100){
      errEl.textContent = 'Split percentages (for enabled stats) must total exactly 100% before predicting.';
      return;
    }
    let running = 0;
    avail.forEach((s,i) => {
      let statBlocks;
      if (i === avail.length-1){
        statBlocks = blocks - running;
      } else {
        statBlocks = Math.round(blocks * (splitPct[s.key]/100));
        running += statBlocks;
      }
      gained[s.key] = statBlocks * rates[s.key];
    });
  } else if (mode === 'strongest'){
    const maxRate = Math.max(...avail.map(s=>rates[s.key]));
    const tied = avail.filter(s => rates[s.key] === maxRate && maxRate > 0);
    if (tied.length === 0){
      errEl.textContent = 'Set at least one gain rate above 0 (on an enabled stat) to find the strongest build.';
      return;
    }
    const perStatBlocks = Math.floor(blocks / tied.length);
    let remainder = blocks - perStatBlocks*tied.length;
    tied.forEach((s,i) => {
      const b = perStatBlocks + (i < remainder ? 1 : 0);
      gained[s.key] = b * rates[s.key];
    });
  }

  renderResults(gained, trainings, blocks);
});

function renderPlaceholder(){
  el('resultsWrap').innerHTML = '<div class="placeholder-note">Set your stats, choose a training plan, and hit Predict Final Stats.</div>';
}

function renderResults(gained, trainings, blocks){
  const totalGain = STATS.reduce((a,s)=>a+gained[s.key],0);
  const max = parseInt(el('maxOvrInput').value,10) || 0;
  const cur = parseInt(el('currentOvrInput').value,10) || 0;
  const finalOvr = Math.max(cur, max);

  const maxStatVal = Math.max(...STATS.map(s => currentStats[s.key] + gained[s.key]), 1);

  let html = `
    <div class="result-summary">
      <div class="rs-card"><div class="v">+${requiredOvrIncrease()}</div><div class="l">OVR Increase</div></div>
      <div class="rs-card"><div class="v">${trainings}</div><div class="l">Total Trainings</div></div>
      <div class="rs-card"><div class="v">+${totalGain}</div><div class="l">Total Stat Gained</div></div>
      <div class="rs-card"><div class="v">${finalOvr}</div><div class="l">Final OVR</div></div>
    </div>
  `;

  STATS.forEach(s => {
    const cur = currentStats[s.key];
    const gain = gained[s.key];
    const final = cur + gain;
    const curPct = (cur/maxStatVal*100);
    const gainPct = (gain/maxStatVal*100);
    html += `
      <div class="final-stat-row">
        <div class="fname">${s.name}</div>
        <div class="growth-track">
          <div class="growth-current" style="width:${curPct}%; background:${s.color}66;"></div>
          <div class="growth-gain" style="left:${curPct}%; width:${gainPct}%; background:${s.color};"></div>
        </div>
        <div class="fval">${final} <span class="gain">${gain>0?'(+'+gain+')':''}</span></div>
      </div>
    `;
  });

  el('resultsWrap').innerHTML = html;
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
  renderPlaceholder();
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
buildRateRows();
buildSplitRows();
buildOneStatRadios();
buildStrongestRanking();
updateHero();
