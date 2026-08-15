/* ================= CONFIG ================= */
const TRAININGS_PER_OVR = 10; // every 10 trainings = +1 OVR
const MAX_STAT = 3000;

// Exact stat gains per single training session of each type.
// Each training type can raise its primary stat AND (for some types) a secondary stat.
const TRAINING_GAINS = {
  power:     {power:3},                // Power Training: +3 Power only
  endurance: {endurance:3, power:1},   // Endurance Training: +3 Endurance, +1 Power
  dexterity: {dexterity:2, power:1},   // Dexterity Training: +2 Dexterity, +1 Power
  agility:   {agility:1},              // Agility Training: +1 Agility only
  stamina:   {stamina:3},              // Stamina Training: +3 Stamina only
};
/* ============================================ */

/* ================= ACTIVE WORKING CODES =================
   To add/update a code later, just add/edit an entry below.
================================================================= */
const activeCodes = [
  {
    code: "Update2!",
    rewards: [
      "💰 25,000 Cash",
      "🎲 10 Real Rerolls",
      "⭐ 5 Legend Rerolls",
      "🎟️ 1 Skip Token"
    ]
  },
  {
    code: "Refresh2!",
    rewards: [
      "💰 25,000 Cash",
      "🎲 10 Real Rerolls",
      "⭐ 10 Legend Rerolls",
      "🎟️ 2 Skip Tokens"
    ]
  },
  {
    code: "1MVISITS!",
    rewards: [
      "💰 100,000 Cash",
      "🎲 10 Real Rerolls",
      "⭐ 15 Legend Rerolls",
      "🎟️ 1 Skip Token"
    ]
  },
  {
    code: "2MVISITS!",
    rewards: [
      "💰 100,000 Cash",
      "🎲 20 Real Rerolls",
      "⭐ 25 Legend Rerolls",
      "🎟️ 2 Skip Tokens"
    ]
  },
  {
    code: "Refresh3!",
    rewards: [
      "💰 25,000 Cash",
      "🎲 10 Real Rerolls",
      "⭐ 10 Legend Rerolls",
      "🎟️ 2 Skip Tokens"
    ]
  },
  {
    code: "Ippo!",
    rewards: [
      "💰 100,000 Cash",
      "🎲 10 Real Rerolls",
      "⭐ 10 Legend Rerolls",
      "🎟️ 2 Skip Tokens"
    ]
  },
  {
    code: "5MVISITS!",
    rewards: [
      "💰 100,000 Cash",
      "🎲 20 Real Rerolls",
      "⭐ 125 Legend Rerolls",
      "🎟️ 2 Skip Tokens"
    ]
  }
];

const STATS = [
  {key:'dexterity', name:'Dexterity', abbr:'DEX',  color:'#22E7F0'},
  {key:'agility',   name:'Agility',   abbr:'AGL',  color:'#5CF2C0'},
  {key:'stamina',   name:'Stamina',   abbr:'STM',  color:'#3FDB8C'},
  {key:'endurance', name:'Endurance', abbr:'ENDR', color:'#B98AF0'},
  {key:'power',     name:'Power',     abbr:'PWR',  color:'#FF7A3D'},
];
const statByKey = key => STATS.find(s => s.key === key);

/* ================= FIGHTER BASE STATS REFERENCE =================
   To add a fighter later, just add a new line below:
   {name:'Fighter Name', total:1234, classification:'GOAT'}
   — use total:null if unknown (shows as —)
   — classification is flexible: 'GOAT', 'LEGEND', or any future tier name
================================================================= */
const FIGHTERS = [
  {name:'Apollo Creed',           total:1275, classification:'GOAT'},
  {name:'Joe Louis',              total:960,  classification:'GOAT'},
  {name:'Roberto Durán',          total:995,  classification:'GOAT'},
  {name:'Muhammad Ali',           total:1000, classification:'GOAT'},
  {name:'Floyd Mayweather Jr.',   total:975,  classification:'GOAT'},
  {name:'Rocky Marciano',         total:950,  classification:'GOAT'},
  {name:'Iron Mike',              total:885,  classification:'GOAT'},
  {name:'Thomas Hearns',          total:880,  classification:'LEGEND'},
  {name:'Henry Armstrong',        total:855,  classification:'LEGEND'},
  {name:'Roy Jones Jr.',          total:840,  classification:'LEGEND'},
  {name:'Evander Holyfield',      total:835,  classification:'LEGEND'},
  {name:'Julio César Chávez',     total:805,  classification:'LEGEND'},
  {name:'Pernell Whitaker',       total:800,  classification:'LEGEND'},
  {name:'Manny Pacquiao',         total:735,  classification:'LEGEND'},
  {name:'Tyson Fury',             total:685,  classification:'LEGEND'},
  {name:'Francis Ngannou',        total:685,  classification:'LEGEND'},
  {name:'Gennady "GGG" Golovkin', total:670,  classification:'LEGEND'},
  {name:'Artur Beterbiev',        total:665,  classification:'LEGEND'},
  {name:'Naoya Inoue',            total:665,  classification:'LEGEND'},
  {name:'Vitali Klitschko',       total:665,  classification:'LEGEND'},
  {name:'Sugar Ray Robinson',     total:650,  classification:'LEGEND'},
  {name:'Sugar Ray Leonard',      total:650,  classification:'LEGEND'},
  {name:'Larry Holmes',           total:650,  classification:'LEGEND'},
  {name:'Chris Eubank',           total:650,  classification:'LEGEND'},
  {name:'Gervonta "Tank" Davis',  total:650,  classification:'LEGEND'},
  {name:'Ilia Topuria',           total:640,  classification:'LEGEND'},
  {name:'Naseem Hamed',           total:495,  classification:'LEGEND'},
  {name:'Ryan Garcia',            total:440,  classification:'LEGEND'},
  {name:'Canelo Alvarez',         total:430,  classification:'LEGEND'},
  {name:'Anthony Joshua',         total:420,  classification:'LEGEND'},
  {name:'Terence Crawford',       total:420,  classification:'LEGEND'},
  {name:'Dmitry Bivol',           total:418,  classification:'LEGEND'},
  {name:'Joe Frazier',            total:418,  classification:'LEGEND'},
  {name:'Sonny Liston',           total:418,  classification:'LEGEND'},
  {name:'Oleksandr Usyk',         total:418,  classification:'LEGEND'},
  {name:'Devin Haney',            total:415,  classification:'LEGEND'},
  {name:'Errol Spence Jr.',       total:372,  classification:'LEGEND'},
  {name:'George Foreman',         total:352,  classification:'LEGEND'},
  {name:'Abdullah Mason',         total:347,  classification:'LEGEND'},
  {name:'Adrien Broner',          total:347,  classification:'LEGEND'},
  {name:'Chris Eubank Jr.',       total:347,  classification:'LEGEND'},
  {name:'Nigel Benn',             total:347,  classification:'LEGEND'},
  {name:'Teofimo Lopez',          total:347,  classification:'LEGEND'},
  {name:'Vasyl Lomachenko',       total:347,  classification:'LEGEND'},
  {name:'Lennox Lewis',           total:347,  classification:'LEGEND'},
];

let currentStats = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
let history = [];
let historyCounter = 0;

/* percentage allocation for prediction */
let splitPct = {dexterity:20, agility:20, stamina:20, endurance:20, power:20};

/* scanner state */
let scannedImageDataUrl = null;

const el = id => document.getElementById(id);

/* ---------- stat inputs ---------- */
function buildStatInputRows(){
  const wrap = el('statInputRows');
  if (!wrap){ console.error('[Fighter Calc] Missing element with id="statInputRows" in index.html'); return; }
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
    `;
    wrap.appendChild(row);
    row.querySelector(`#cur-${s.key}`).addEventListener('input', e => {
      currentStats[s.key] = Math.max(0, Math.min(MAX_STAT, parseInt(e.target.value,10) || 0));
    });
  });
}

/* ---------- hero / OVR progress ---------- */
function requiredOvrIncrease(){
  const curEl = el('currentOvrInput');
  const maxEl = el('maxOvrInput');
  if (!curEl || !maxEl) return 0;
  const cur = parseInt(curEl.value,10) || 0;
  const max = parseInt(maxEl.value,10) || 0;
  return Math.max(0, max - cur);
}
function totalTrainingsNeeded(){ return requiredOvrIncrease() * TRAININGS_PER_OVR; }
function totalBlocksNeeded(){ return requiredOvrIncrease(); } // 1 block = 10 trainings

function updateHero(){
  const curEl = el('currentOvrInput');
  const maxEl = el('maxOvrInput');
  if (!curEl || !maxEl){ console.error('[Fighter Calc] Missing currentOvrInput or maxOvrInput in index.html'); return; }
  const cur = parseInt(curEl.value,10) || 0;
  const max = parseInt(maxEl.value,10) || 0;
  const inc = requiredOvrIncrease();
  const trainings = totalTrainingsNeeded();

  if (el('ovrIncreaseVal')) el('ovrIncreaseVal').textContent = inc;
  if (el('trainingsNeededVal')) el('trainingsNeededVal').textContent = trainings;
  if (el('blocksNeededVal')) el('blocksNeededVal').textContent = inc;
  if (el('xpLeftLabel')) el('xpLeftLabel').textContent = `OVR ${cur}`;
  if (el('xpRightLabel')) el('xpRightLabel').textContent = `OVR ${max}`;

  const span = max - cur;
  if (el('xpFill')) el('xpFill').style.width = (span > 0 ? 0 : 100) + '%';
}
if (el('currentOvrInput')) el('currentOvrInput').addEventListener('input', updateHero);
if (el('maxOvrInput')) el('maxOvrInput').addEventListener('input', updateHero);

/* ---------- compare builds ---------- */
function populateBuildSelectors(){
  const selA = el('buildASelect');
  const selB = el('buildBSelect');
  if (!selA || !selB){ console.error('[Fighter Calc] Missing buildASelect or buildBSelect in index.html'); return; }
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

if (el('compareBtn')) el('compareBtn').addEventListener('click', () => {
  const errEl = el('compareError');
  if (errEl) errEl.textContent = '';

  if (history.length < 2){
    if (errEl) errEl.textContent = 'Save at least two builds before comparing.';
    if (el('compareResults')) el('compareResults').innerHTML = '';
    return;
  }

  const idA = el('buildASelect').value;
  const idB = el('buildBSelect').value;

  if (!idA || !idB){
    if (errEl) errEl.textContent = 'Select two builds to compare.';
    return;
  }
  if (idA === idB){
    if (errEl) errEl.textContent = 'Pick two different builds to compare.';
    return;
  }

  const buildA = history.find(b => b.id === idA);
  const buildB = history.find(b => b.id === idB);
  if (!buildA || !buildB){
    if (errEl) errEl.textContent = 'Could not find the selected builds.';
    return;
  }

  renderBuildComparison(buildA, buildB);
});

function renderBuildComparison(a, b){
  const wrap = el('compareResults');
  if (!wrap) return;
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

/* ---------- training allocation (%) ---------- */
function buildSplitRows(){
  const wrap = el('splitRows');
  if (!wrap){ console.error('[Fighter Calc] Missing element with id="splitRows" in index.html'); return; }
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

    row.querySelector(`#split-range-${s.key}`).addEventListener('input', e => {
      applyValue(parseInt(e.target.value,10) || 0);
    });
    row.querySelector(`#split-num-${s.key}`).addEventListener('input', e => {
      applyValue(parseInt(e.target.value,10) || 0);
    });
    row.querySelector(`#split-num-${s.key}`).addEventListener('blur', e => {
      e.target.value = splitPct[s.key];
    });
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
}

/* ---------- shared training math (used by both the main predictor and the simulator) ---------- */
function splitTrainingsByAllocation(trainings, pctMap){
  const result = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  let running = 0;
  STATS.forEach((s,i) => {
    let n;
    if (i === STATS.length-1){
      n = trainings - running;
    } else {
      n = Math.round(trainings * (pctMap[s.key]/100));
      running += n;
    }
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
function computeGainsForAllocation(trainings, pctMap){
  return computeGainsFromTrainingCounts(splitTrainingsByAllocation(trainings, pctMap));
}

/* ---------- predict ---------- */
if (el('predictBtn')) el('predictBtn').addEventListener('click', () => {
  const errEl = el('predictError');
  if (errEl) errEl.textContent = '';
  const blocks = totalBlocksNeeded();
  const trainings = totalTrainingsNeeded();

  if (blocks <= 0){
    const max = parseInt(el('maxOvrInput').value,10) || 0;
    const cur = parseInt(el('currentOvrInput').value,10) || 0;
    if (max <= cur){
      if (errEl) errEl.textContent = 'Max OVR must be greater than Current OVR.';
      resetPredictionResults();
      return;
    }
  }

  const sum = STATS.reduce((a,s)=>a+splitPct[s.key],0);
  if (sum !== 100){
    if (errEl) errEl.textContent = 'Percentages must total exactly 100% before predicting.';
    return;
  }

  const gained = computeGainsForAllocation(trainings, splitPct);

  renderResults(gained, trainings, blocks);
});

function resetPredictionResults(){
  const wrap = el('resultsWrap');
  if (!wrap) return;
  wrap.innerHTML = '<div class="placeholder-note">Set your stats and percentages, then hit Predict Final Stats.</div>';
}

function renderResults(gained, trainings, blocks){
  const wrap = el('resultsWrap');
  if (!wrap){ console.error('[Fighter Calc] Missing element with id="resultsWrap" in index.html'); return; }

  const cappedFinals = {};
  const cappedGains = {};
  STATS.forEach(s => {
    const cur = currentStats[s.key];
    const final = Math.min(MAX_STAT, cur + gained[s.key]);
    cappedFinals[s.key] = final;
    cappedGains[s.key] = final - cur;
  });

  const totalGain = STATS.reduce((a,s)=>a+cappedGains[s.key],0);
  const max = parseInt(el('maxOvrInput').value,10) || 0;
  const cur = parseInt(el('currentOvrInput').value,10) || 0;
  const finalOvr = Math.max(cur, max);

  const maxStatVal = Math.max(...STATS.map(s => cappedFinals[s.key]), 1);

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
    const final = cappedFinals[s.key];
    const gain = cappedGains[s.key];
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

  wrap.innerHTML = html;
}

/* ---------- save build ---------- */
if (el('saveBuildBtn')) el('saveBuildBtn').addEventListener('click', () => {
  const errEl = el('saveError');
  if (errEl) errEl.textContent = '';
  const nameInput = el('buildNameInput');
  historyCounter++;
  const label = (nameInput && nameInput.value.trim()) || `Build #${historyCounter}`;

  const build = {
    id: Date.now() + '-' + historyCounter,
    label,
    time: new Date().toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
    currentOvr: parseInt(el('currentOvrInput').value,10) || 0,
    maxOvr: parseInt(el('maxOvrInput').value,10) || 0,
    stats: {...currentStats},
  };
  history.unshift(build);
  if (history.length > 25) history.pop();
  if (nameInput) nameInput.value = '';
  renderHistory();
  populateBuildSelectors();
});

function renderHistory(){
  const wrap = el('historyList');
  if (!wrap) return;
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
  if (el('currentOvrInput')) el('currentOvrInput').value = build.currentOvr;
  if (el('maxOvrInput')) el('maxOvrInput').value = build.maxOvr;
  currentStats = {...build.stats};
  buildStatInputRows();
  updateHero();
  resetPredictionResults();
}

function deleteBuild(id){
  history = history.filter(b => b.id !== id);
  renderHistory();
  populateBuildSelectors();
  if (el('compareResults')) el('compareResults').innerHTML = '';
}

/* ---------- screenshot stat scanner (client-side OCR via Tesseract.js) ---------- */
if (el('scanToggleBtn')) el('scanToggleBtn').addEventListener('click', () => {
  const panel = el('scanPanel');
  if (!panel) return;
  panel.classList.toggle('open');
});

if (el('scanFileInput')) el('scanFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  const previewWrap = el('scanPreviewWrap');
  const nameLabel = el('scanFileName');
  const scanBtn = el('scanStatsBtn');
  const detectedWrap = el('scanDetected');
  const statusEl = el('scanStatus');
  if (!file){
    scannedImageDataUrl = null;
    if (scanBtn) scanBtn.disabled = true;
    return;
  }
  if (nameLabel) nameLabel.textContent = file.name;
  if (detectedWrap) detectedWrap.innerHTML = '';
  if (statusEl) statusEl.textContent = '';
  const reader = new FileReader();
  reader.onload = evt => {
    scannedImageDataUrl = evt.target.result;
    if (previewWrap) previewWrap.innerHTML = `<img src="${scannedImageDataUrl}" class="scan-preview-img" alt="Uploaded fighter stats screenshot">`;
    if (scanBtn) scanBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

if (el('scanStatsBtn')) el('scanStatsBtn').addEventListener('click', async () => {
  const statusEl = el('scanStatus');
  const scanBtn = el('scanStatsBtn');
  const detectedWrap = el('scanDetected');

  if (!scannedImageDataUrl){
    if (statusEl) statusEl.textContent = 'Upload an image first.';
    return;
  }
  if (typeof Tesseract === 'undefined'){
    if (statusEl) statusEl.textContent = 'OCR engine failed to load. Check your connection and refresh the page.';
    return;
  }

  if (scanBtn) scanBtn.disabled = true;
  if (statusEl) statusEl.textContent = 'Scanning image… this can take a few seconds.';
  if (detectedWrap) detectedWrap.innerHTML = '';

  try {
    const { data } = await Tesseract.recognize(scannedImageDataUrl, 'eng');
    const results = parseStatsFromText(data.text || '');
    if (statusEl) statusEl.textContent = '';
    renderDetectedStats(results);
  } catch (err){
    console.error('[Fighter Calc] OCR failed:', err);
    if (statusEl) statusEl.textContent = 'Scan failed. Try a clearer or larger screenshot.';
  } finally {
    if (scanBtn) scanBtn.disabled = false;
  }
});

function parseStatsFromText(text){
  const cleaned = text.replace(/,/g, ' ');
  const results = {};
  STATS.forEach(s => {
    const labelPattern = `(?:${s.name}|${s.abbr})`;
    const regex = new RegExp('\\b' + labelPattern + '\\b[^0-9]{0,20}(\\d{1,5})', 'i');
    const match = cleaned.match(regex);
    if (match){
      const val = Math.max(0, Math.min(MAX_STAT, parseInt(match[1],10) || 0));
      results[s.key] = val;
    }
  });
  return results;
}

function renderDetectedStats(results){
  const wrap = el('scanDetected');
  if (!wrap) return;
  const foundCount = STATS.filter(s => results[s.key] !== undefined).length;

  if (foundCount === 0){
    wrap.innerHTML = '<div class="scan-note bad">No stats were detected. Try a clearer, larger, or better-lit screenshot — or enter values manually below.</div>';
    return;
  }

  let html = '<div class="scan-note">Detected Stats — review and correct if needed:</div>';
  STATS.forEach(s => {
    const val = results[s.key];
    const found = val !== undefined;
    html += `
      <div class="scan-detect-row">
        <div class="sd-name"><span class="dot" style="background:${s.color}"></span>${s.name}</div>
        <input type="number" min="0" max="${MAX_STAT}" id="scan-val-${s.key}" value="${found ? val : ''}" placeholder="Not found">
        <span class="sd-mark ${found ? 'ok' : 'bad'}">${found ? '✓' : '?'}</span>
      </div>
    `;
  });
  html += '<button type="button" class="btn" id="applyScanBtn">Apply Stats</button>';
  wrap.innerHTML = html;

  el('applyScanBtn').addEventListener('click', () => {
    STATS.forEach(s => {
      const inp = el(`scan-val-${s.key}`);
      if (inp && inp.value !== ''){
        currentStats[s.key] = Math.max(0, Math.min(MAX_STAT, parseInt(inp.value,10) || 0));
      }
    });
    buildStatInputRows();
    updateHero();
    const statusEl = el('scanStatus');
    if (statusEl){
      statusEl.textContent = 'Stats applied to Current Stats above!';
      statusEl.classList.add('good');
      setTimeout(() => {
        if (el('scanStatus')){
          el('scanStatus').textContent = '';
          el('scanStatus').classList.remove('good');
        }
      }, 3000);
    }
  });
}

/* ---------- fighter base stats reference ---------- */
let selectedFighterName = null;

function classBadgeClass(c){
  if (!c) return '';
  return 'class-badge class-' + c.toLowerCase().replace(/[^a-z0-9]/g,'');
}

function buildFighterList(filter){
  const wrap = el('fighterListWrap');
  if (!wrap){ console.error('[Fighter Calc] Missing element with id="fighterListWrap" in index.html'); return; }
  const q = (filter || '').trim().toLowerCase();
  const base = q ? FIGHTERS.filter(f => f.name.toLowerCase().includes(q)) : FIGHTERS;
  const list = [...base].sort((a,b) => {
    if (a.total === null && b.total === null) return 0;
    if (a.total === null) return 1;
    if (b.total === null) return -1;
    return b.total - a.total;
  });

  if (list.length === 0){
    wrap.innerHTML = '<div class="placeholder-note">No fighters match your search.</div>';
    return;
  }

  wrap.innerHTML = '';
  list.forEach(f => {
    const row = document.createElement('div');
    row.className = 'fighter-row' + (f.name === selectedFighterName ? ' selected' : '');
    row.innerHTML = `
      <div class="fr-name">${f.name}${f.classification ? `<span class="${classBadgeClass(f.classification)}">${f.classification}</span>` : ''}</div>
      <div class="fr-total">${f.total === null ? '—' : f.total.toLocaleString()}</div>
    `;
    row.addEventListener('click', () => {
      selectedFighterName = f.name;
      renderSelectedFighterCard(f);
      buildFighterList(el('fighterSearchInput') ? el('fighterSearchInput').value : '');
    });
    wrap.appendChild(row);
  });
}

function renderSelectedFighterCard(f){
  const card = el('fighterSelectedCard');
  if (!card) return;
  card.innerHTML = `
    <div class="fsc-name">${f.name}</div>
    ${f.classification ? `<div class="${classBadgeClass(f.classification)} fsc-class-badge">${f.classification}</div>` : ''}
    <div class="fsc-total">${f.total === null ? '—' : f.total.toLocaleString()}</div>
    <div class="fsc-label">Total Base Stats</div>
  `;
  card.classList.add('show');
}

if (el('fighterSearchInput')) el('fighterSearchInput').addEventListener('input', e => {
  buildFighterList(e.target.value);
});

/* ---------- active working codes ---------- */
function buildCodesGrid(){
  const wrap = el('codesGrid');
  if (!wrap){ console.error('[Fighter Calc] Missing element with id="codesGrid" in index.html'); return; }
  wrap.innerHTML = '';
  activeCodes.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'code-card';
    const rewardsHtml = c.rewards.map(r => `<div class="code-reward-item">${r}</div>`).join('');
    card.innerHTML = `
      <div class="code-card-head">
        <div class="code-name">${c.code}</div>
        <div class="active-badge">🟢 ACTIVE</div>
      </div>
      <div class="code-rewards">${rewardsHtml}</div>
      <button type="button" class="btn copy-code-btn" id="copy-code-${idx}">Copy Code</button>
    `;
    wrap.appendChild(card);

    card.querySelector(`#copy-code-${idx}`).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText){
          await navigator.clipboard.writeText(c.code);
        } else {
          const tmp = document.createElement('textarea');
          tmp.value = c.code;
          tmp.style.position = 'fixed';
          tmp.style.opacity = '0';
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand('copy');
          document.body.removeChild(tmp);
        }
        const original = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      } catch (err){
        console.error('[Fighter Calc] Clipboard copy failed:', err);
        btn.textContent = 'Copy failed';
        setTimeout(() => { btn.textContent = 'Copy Code'; }, 2000);
      }
    });
  });
}

/* ---------- Virtual Training Simulator: compact live build editor (sandbox — never touches saved Current Stats/builds unless Apply Training is pressed) ----------
   ARCHITECTURE: simSessionCounts is the single source of truth (how many training
   sessions of each type have been applied since the last Sync/Reset). simStats and
   simCurrentOvr are always DERIVED fresh from simSnapshot + simSessionCounts via
   recomputeSimState() — never mutated incrementally. This guarantees positive and
   negative training are always exact opposites and nothing is ever left hidden. */
let simStats = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
let simSessionCounts = {dexterity:0, agility:0, stamina:0, endurance:0, power:0}; // sessions applied per training type, can be reduced (never below 0)
let simCurrentOvr = 80;
let simMaxOvr = 120;
let simSplitPct = {dexterity:20, agility:20, stamina:20, endurance:20, power:20};
let simSnapshot = null;   // {stats:{...}, ovr:n, maxOvr:n} — the fixed baseline everything is derived from
let simHistory = [];      // training history log, newest first
let simSessionsTrained = 0; // = sum of simSessionCounts, kept in sync by recomputeSimState()
let simUndoStack = [];    // stack of {sessionCounts:{...}, historyLen} for Undo Last
let lastSimFighterName = null; // set when a Fighter Base Stats row was clicked before syncing, for the Final Build classification chip

function fmtOvr(n){
  return (Math.round(n * 10) / 10).toString().replace(/\.0$/, '');
}
function simSessionsToMax(){
  return Math.max(0, Math.round((simMaxOvr - simCurrentOvr) * TRAININGS_PER_OVR));
}
function simSnapshotNow(){
  simSnapshot = { stats: {...simStats}, ovr: simCurrentOvr, maxOvr: simMaxOvr };
}

/* THE single recompute step — call after any change to simSessionCounts, simSnapshot, or simMaxOvr */
function recomputeSimState(){
  const baseStats = simSnapshot ? simSnapshot.stats : {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  const baseOvr = simSnapshot ? simSnapshot.ovr : 0;
  const gained = computeGainsFromTrainingCounts(simSessionCounts);
  STATS.forEach(s => {
    simStats[s.key] = Math.max(0, Math.min(MAX_STAT, baseStats[s.key] + gained[s.key]));
  });
  simSessionsTrained = STATS.reduce((a,s)=>a+simSessionCounts[s.key],0);
  simCurrentOvr = Math.min(simMaxOvr, baseOvr + simSessionsTrained / TRAININGS_PER_OVR);
}

function pushSimUndo(){
  simUndoStack.push({ sessionCounts: {...simSessionCounts}, historyLen: simHistory.length });
  if (simUndoStack.length > 25) simUndoStack.shift();
}

/* Describe the exact stat effects of N sessions of a training type, e.g. "Dexterity +2, Power +1" */
function trainingEffectSummary(key, sessions, sign){
  const gains = TRAINING_GAINS[key];
  const parts = Object.keys(gains).map(statKey => {
    const amt = gains[statKey] * sessions * sign;
    return `${statByKey(statKey).name} ${amt>=0?'+':''}${amt}`;
  });
  return parts.join(', ');
}

/* ---------- master render: keeps every connected section in sync off one shared state ---------- */
function renderSim(){
  renderSimOvrBar();
  renderSimMaxBanner();
  renderSimStatRows();
  renderSimHistory();
  renderSimGoalProgress();
  renderSimRecommendedPreview();
  renderSimFinalDisplay();
  renderSimTrainButtonsState();
}

function renderSimOvrBar(){
  if (el('simCurrentOvrInput') && document.activeElement !== el('simCurrentOvrInput')) el('simCurrentOvrInput').value = fmtOvr(simCurrentOvr);
  if (el('simMaxOvrInput') && document.activeElement !== el('simMaxOvrInput')) el('simMaxOvrInput').value = simMaxOvr;
  if (el('simRemainingPotential')) el('simRemainingPotential').textContent = fmtOvr(Math.max(0, simMaxOvr - simCurrentOvr));
}

function renderSimMaxBanner(){
  const banner = el('simMaxBanner');
  if (!banner) return;
  if (simSessionsToMax() <= 0){
    banner.innerHTML = `<div class="sim-banner sim-banner-max">🏆 MAX OVR REACHED — ${fmtOvr(simCurrentOvr)} / ${simMaxOvr}</div>`;
    banner.classList.add('show');
  } else {
    banner.innerHTML = '';
    banner.classList.remove('show');
  }
}

function renderSimTrainButtonsState(){
  // Positive training disables at Max OVR; negative training always stays available so the user can experiment freely.
  const maxed = simSessionsToMax() <= 0;
  ['simTrain1','simTrain5','simTrain10','simTrain50','simTrain100'].forEach(id => {
    const btn = el(id);
    if (btn) btn.disabled = maxed;
  });
  STATS.forEach(s => {
    ['1','5','10'].forEach(n => {
      const incBtn = el(`sim-inc-${s.key}-${n}`);
      if (incBtn) incBtn.disabled = maxed || simStats[s.key] >= MAX_STAT;
      const decBtn = el(`sim-dec-${s.key}-${n}`);
      if (decBtn) decBtn.disabled = simSessionCounts[s.key] <= 0;
    });
  });
}

/* ---------- Fighter Stats: compact rows with direct session-based training controls ---------- */
function renderSimStatRows(){
  const wrap = el('simStatRows');
  if (!wrap){ console.error('[Fighter Calc] Missing element with id="simStatRows" in index.html'); return; }
  wrap.innerHTML = '';
  STATS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'sim-stat-row';
    row.innerHTML = `
      <div class="ssr-name"><span class="dot" style="background:${s.color}"></span>${s.name}</div>
      <div class="ssr-val">${simStats[s.key]}</div>
      <div class="ssr-controls">
        <button type="button" class="ssr-btn ssr-neg" id="sim-dec-${s.key}-10">-10</button>
        <button type="button" class="ssr-btn ssr-neg" id="sim-dec-${s.key}-5">-5</button>
        <button type="button" class="ssr-btn ssr-neg" id="sim-dec-${s.key}-1">-1</button>
        <button type="button" class="ssr-btn ssr-pos" id="sim-inc-${s.key}-1">+1</button>
        <button type="button" class="ssr-btn ssr-pos" id="sim-inc-${s.key}-5">+5</button>
        <button type="button" class="ssr-btn ssr-pos" id="sim-inc-${s.key}-10">+10</button>
      </div>
    `;
    wrap.appendChild(row);
    row.querySelector(`#sim-dec-${s.key}-10`).addEventListener('click', () => adjustSimTraining(s.key, -10));
    row.querySelector(`#sim-dec-${s.key}-5`).addEventListener('click', () => adjustSimTraining(s.key, -5));
    row.querySelector(`#sim-dec-${s.key}-1`).addEventListener('click', () => adjustSimTraining(s.key, -1));
    row.querySelector(`#sim-inc-${s.key}-1`).addEventListener('click', () => adjustSimTraining(s.key, 1));
    row.querySelector(`#sim-inc-${s.key}-5`).addEventListener('click', () => adjustSimTraining(s.key, 5));
    row.querySelector(`#sim-inc-${s.key}-10`).addEventListener('click', () => adjustSimTraining(s.key, 10));
  });
}

/* Each button represents SESSIONS of that stat's training type — e.g. "+1 Dexterity" means
   1 Dexterity Training session (+2 Dexterity, +1 Power). "-1" reverses exactly one session
   of whatever has actually been applied — never a raw point subtraction. */
function adjustSimTraining(key, sessionDelta){
  const statName = statByKey(key).name;

  if (sessionDelta > 0){
    const ovrRoom = simSessionsToMax();
    const primaryGain = TRAINING_GAINS[key][key];
    const statRoom = Math.floor((MAX_STAT - simStats[key]) / primaryGain);
    const apply = Math.min(sessionDelta, ovrRoom, Math.max(0, statRoom));
    if (apply <= 0) return;
    pushSimUndo();
    simSessionCounts[key] += apply;
    recomputeSimState();
    const capped = apply < sessionDelta;
    simHistory.unshift(`<b>${statName} Training +${apply}</b>${capped ? ' <span class="sim-history-capped">(capped)</span>' : ''}<br>${trainingEffectSummary(key, apply, 1)}<br><span class="sim-manual-tag">OVR ${fmtOvr(simCurrentOvr - apply/TRAININGS_PER_OVR)} → ${fmtOvr(simCurrentOvr)}</span>`);
  } else {
    const remove = Math.min(Math.abs(sessionDelta), simSessionCounts[key]);
    if (remove <= 0) return;
    pushSimUndo();
    const beforeOvr = simCurrentOvr;
    simSessionCounts[key] -= remove;
    recomputeSimState();
    simHistory.unshift(`<b>${statName} Training -${remove}</b><br>${trainingEffectSummary(key, remove, -1)}<br><span class="sim-manual-tag">OVR ${fmtOvr(beforeOvr)} → ${fmtOvr(simCurrentOvr)}</span>`);
  }
  renderSim();
}

/* ---------- Bulk Training buttons — adds sessions across all types via the % allocation ---------- */
function applyLiveTraining(requestedSessions){
  const available = simSessionsToMax();
  if (available <= 0) return;
  const actual = Math.min(requestedSessions, available);
  pushSimUndo();
  const counts = splitTrainingsByAllocation(actual, simSplitPct);
  STATS.forEach(s => { simSessionCounts[s.key] += counts[s.key]; });
  const beforeOvr = simCurrentOvr;
  recomputeSimState();

  if (actual === 1){
    simHistory.unshift(`Bulk Training ×1 → OVR ${fmtOvr(beforeOvr)} → ${fmtOvr(simCurrentOvr)}`);
  } else {
    simHistory.unshift(`<b>Bulk Training +${actual} sessions</b><br>${fmtOvr(beforeOvr)} OVR → ${fmtOvr(simCurrentOvr)} OVR`);
  }
  if (actual < requestedSessions){
    simHistory.unshift(`<span class="sim-history-capped">Capped at Max OVR — only ${actual} of ${requestedSessions} requested sessions were applied.</span>`);
  }
  renderSim();
}
if (el('simTrain1')) el('simTrain1').addEventListener('click', () => applyLiveTraining(1));
if (el('simTrain5')) el('simTrain5').addEventListener('click', () => applyLiveTraining(5));
if (el('simTrain10')) el('simTrain10').addEventListener('click', () => applyLiveTraining(10));
if (el('simTrain50')) el('simTrain50').addEventListener('click', () => applyLiveTraining(50));
if (el('simTrain100')) el('simTrain100').addEventListener('click', () => applyLiveTraining(100));

/* ---------- Undo ---------- */
if (el('simUndoBtn')) el('simUndoBtn').addEventListener('click', () => {
  if (simUndoStack.length === 0) return;
  const prev = simUndoStack.pop();
  simSessionCounts = prev.sessionCounts;
  const removeCount = simHistory.length - prev.historyLen;
  if (removeCount > 0) simHistory.splice(0, removeCount);
  recomputeSimState();
  renderSim();
});

/* ---------- Training History ---------- */
function renderSimHistory(){
  const wrap = el('simHistoryList');
  if (!wrap) return;
  if (simHistory.length === 0){
    wrap.innerHTML = '<div class="placeholder-note">No training performed yet.</div>';
    return;
  }
  wrap.innerHTML = simHistory.slice(0, 25).map(h => `<div class="sim-history-row">${h}</div>`).join('');
}

/* ---------- Sim training allocation (%) — compact slider rows, drives Bulk Training split ---------- */
function buildSimSplitRows(){
  const wrap = el('simSplitRows');
  if (!wrap) return;
  wrap.innerHTML = '';
  STATS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'split-row';
    row.innerHTML = `
      <div class="sname">${s.name}</div>
      <input type="range" min="0" max="100" value="${simSplitPct[s.key]}" id="sim-split-range-${s.key}">
      <div class="spct-wrap">
        <input type="number" min="0" max="100" value="${simSplitPct[s.key]}" id="sim-split-num-${s.key}" class="spct-input">
        <span class="spct-sign">%</span>
      </div>
    `;
    wrap.appendChild(row);

    const applyValue = (val) => {
      const othersSum = STATS.reduce((a,st) => st.key === s.key ? a : a + simSplitPct[st.key], 0);
      const maxAllowed = Math.max(0, 100 - othersSum);
      if (val > maxAllowed) val = maxAllowed;
      if (val < 0) val = 0;
      simSplitPct[s.key] = val;
      el(`sim-split-range-${s.key}`).value = val;
      el(`sim-split-num-${s.key}`).value = val;
      updateSimSplitTotal();
      updateSimSliderMaxes();
    };

    row.querySelector(`#sim-split-range-${s.key}`).addEventListener('input', e => applyValue(parseInt(e.target.value,10) || 0));
    row.querySelector(`#sim-split-num-${s.key}`).addEventListener('input', e => applyValue(parseInt(e.target.value,10) || 0));
    row.querySelector(`#sim-split-num-${s.key}`).addEventListener('blur', e => { e.target.value = simSplitPct[s.key]; });
  });
  updateSimSplitTotal();
  updateSimSliderMaxes();
}
function updateSimSliderMaxes(){
  STATS.forEach(s => {
    const inp = el(`sim-split-range-${s.key}`);
    const numInp = el(`sim-split-num-${s.key}`);
    if (!inp) return;
    const othersSum = STATS.reduce((a,st) => st.key === s.key ? a : a + simSplitPct[st.key], 0);
    const maxAllowed = Math.max(0, 100 - othersSum);
    inp.max = maxAllowed;
    if (numInp) numInp.max = maxAllowed;
    if (parseInt(inp.value,10) > maxAllowed) inp.value = maxAllowed;
  });
}
function updateSimSplitTotal(){
  const sum = STATS.reduce((a,s)=>a+simSplitPct[s.key],0);
  const disp = el('simSplitTotalDisplay');
  if (!disp) return;
  disp.textContent = sum + '%';
  disp.className = 'v ' + (sum===100 ? 'ok' : 'bad');
}

/* ---------- Sim Current/Max OVR inputs (live, no button) ---------- */
if (el('simCurrentOvrInput')) el('simCurrentOvrInput').addEventListener('input', e => {
  // Manually editing Current OVR re-bases the snapshot at this value with zero sessions trained,
  // so derived state stays consistent (single source of truth).
  const v = Math.max(0, parseFloat(e.target.value) || 0);
  simSessionCounts = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  simSnapshot = { stats: {...simStats}, ovr: Math.min(v, simMaxOvr), maxOvr: simMaxOvr };
  recomputeSimState();
  renderSim();
});
if (el('simMaxOvrInput')) el('simMaxOvrInput').addEventListener('input', e => {
  const v = Math.max(1, parseInt(e.target.value,10) || 1);
  simMaxOvr = v;
  if (simSnapshot) simSnapshot.maxOvr = v;
  recomputeSimState();
  renderSim();
});

/* ---------- Sync / Reset / Apply ---------- */
function simSyncFromMain(){
  simStats = {...currentStats};
  const startOvr = parseInt((el('currentOvrInput') && el('currentOvrInput').value),10) || 0;
  simMaxOvr = parseInt((el('maxOvrInput') && el('maxOvrInput').value),10) || Math.max(startOvr + 1, 100);
  simSessionCounts = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  simHistory = [];
  simUndoStack = [];
  simSnapshot = { stats: {...simStats}, ovr: Math.min(startOvr, simMaxOvr), maxOvr: simMaxOvr };
  recomputeSimState();
  renderSim();
}
if (el('simSyncBtn')) el('simSyncBtn').addEventListener('click', () => {
  lastSimFighterName = selectedFighterName;
  simSyncFromMain();
});

if (el('simResetBtn')) el('simResetBtn').addEventListener('click', () => {
  simSessionCounts = {dexterity:0, agility:0, stamina:0, endurance:0, power:0};
  simHistory = [];
  simUndoStack = [];
  if (!simSnapshot){
    simSnapshot = { stats: {dexterity:0, agility:0, stamina:0, endurance:0, power:0}, ovr: 0, maxOvr: simMaxOvr };
  }
  simMaxOvr = simSnapshot.maxOvr;
  recomputeSimState();
  renderSim();
});

if (el('simApplyTrainingBtn')) el('simApplyTrainingBtn').addEventListener('click', () => {
  currentStats = {...simStats};
  if (el('currentOvrInput')) el('currentOvrInput').value = Math.round(simCurrentOvr);
  if (el('maxOvrInput')) el('maxOvrInput').value = simMaxOvr;
  buildStatInputRows();
  updateHero();
  const banner = el('simMaxBanner');
  if (banner){
    banner.innerHTML = `<div class="sim-banner sim-banner-good">✓ Applied to Main Calculator above</div>` + banner.innerHTML;
    banner.classList.add('show');
  }
});

/* ---------- Desired Result: live goal progress with progress bars (no Calculate button needed) ---------- */
function readGoalTargets(){
  const targets = {};
  let any = false;
  STATS.forEach(s => {
    const field = el(`simGoal${s.name}`);
    if (field && field.value !== ''){
      targets[s.key] = parseInt(field.value,10) || 0;
      any = true;
    }
  });
  return {targets, any};
}

function renderSimGoalProgress(){
  const wrap = el('simGoalProgress');
  if (!wrap) return;
  const ovrRaw = el('simGoalOvr') ? el('simGoalOvr').value : '';
  const desiredOvr = ovrRaw === '' ? null : parseInt(ovrRaw,10);
  const { targets, any } = readGoalTargets();

  if (desiredOvr === null && !any){
    wrap.innerHTML = '<div class="placeholder-note">Set a Desired OVR and/or target stats above to track live progress.</div>';
    return;
  }

  let html = '';

  if (desiredOvr !== null){
    if (desiredOvr > simMaxOvr){
      html += `<div class="sim-goal-bar-row sim-goal-warn">⚠️ Desired OVR (${desiredOvr}) exceeds Max OVR (${simMaxOvr}). The simulator will never train past ${simMaxOvr}.</div>`;
    } else {
      const pct = Math.min(100, Math.max(0, (simCurrentOvr / desiredOvr) * 100));
      const reached = simCurrentOvr >= desiredOvr;
      html += `
        <div class="sim-goal-bar-row">
          <div class="sgbr-top"><span class="sgbr-name">OVR</span><span class="sgbr-nums">${fmtOvr(simCurrentOvr)} / ${desiredOvr}</span></div>
          <div class="sgbr-track"><div class="sgbr-fill" style="width:${pct}%;"></div></div>
          <div class="sgbr-bottom">${reached ? '<span class="sim-goal-done-tag">✓ OVR GOAL REACHED</span>' : `Remaining: ${fmtOvr(desiredOvr - simCurrentOvr)}`}</div>
        </div>`;
    }
  }

  STATS.forEach(s => {
    if (targets[s.key] !== undefined){
      const cur = simStats[s.key];
      const target = targets[s.key];
      const pct = target > 0 ? Math.min(100, Math.max(0, (cur/target)*100)) : 100;
      const reached = cur >= target;
      html += `
        <div class="sim-goal-bar-row">
          <div class="sgbr-top"><span class="sgbr-name">${s.name}</span><span class="sgbr-nums">${cur} / ${target}</span></div>
          <div class="sgbr-track"><div class="sgbr-fill" style="width:${pct}%; background:${s.color};"></div></div>
          <div class="sgbr-bottom">${reached ? `<span class="sim-goal-done-tag">✓ ${s.name.toUpperCase()} GOAL REACHED</span>` : `Remaining: ${target-cur} &nbsp;·&nbsp; ${pct.toFixed(0)}%`}</div>
        </div>`;
    }
  });

  wrap.innerHTML = html;
}
['simGoalOvr','simGoalDexterity','simGoalAgility','simGoalStamina','simGoalPower','simGoalEndurance'].forEach(id => {
  const field = el(id);
  if (field) field.addEventListener('input', () => { renderSimGoalProgress(); renderSimRecommendedPreview(); renderSimFinalDisplay(); });
});

/* ---------- Recommended Training: always-live preview, auto-recomputes on every change ---------- */
function computeOptimizedPlan(targets){
  const dexGap = Math.max(0, (targets.dexterity ?? simStats.dexterity) - simStats.dexterity);
  const aglGap = Math.max(0, (targets.agility ?? simStats.agility) - simStats.agility);
  const stmGap = Math.max(0, (targets.stamina ?? simStats.stamina) - simStats.stamina);
  const endGap = Math.max(0, (targets.endurance ?? simStats.endurance) - simStats.endurance);
  const pwrTarget = targets.power ?? null;

  const dexSessions = Math.ceil(dexGap / TRAINING_GAINS.dexterity.dexterity);
  const aglSessions = Math.ceil(aglGap / TRAINING_GAINS.agility.agility);
  const stmSessions = Math.ceil(stmGap / TRAINING_GAINS.stamina.stamina);
  const endSessions = Math.ceil(endGap / TRAINING_GAINS.endurance.endurance);

  const byproductPower = dexSessions * (TRAINING_GAINS.dexterity.power || 0) + endSessions * (TRAINING_GAINS.endurance.power || 0);
  const pwrGapRemaining = pwrTarget === null ? 0 : Math.max(0, (pwrTarget - simStats.power) - byproductPower);
  const pwrSessions = Math.ceil(pwrGapRemaining / TRAINING_GAINS.power.power);

  const counts = {dexterity:dexSessions, agility:aglSessions, stamina:stmSessions, endurance:endSessions, power:pwrSessions};
  let totalSessions = STATS.reduce((a,s)=>a+counts[s.key],0);

  const available = simSessionsToMax();
  const capped = totalSessions > available;
  if (capped) totalSessions = available;

  return { counts, totalSessions, capped, rawTotal: dexSessions+aglSessions+stmSessions+endSessions+pwrSessions };
}

function renderSimRecommendedPreview(){
  const wrap = el('simRecommendedPreview');
  if (!wrap) return;
  const { targets, any } = readGoalTargets();
  const ovrRaw = el('simGoalOvr') ? el('simGoalOvr').value : '';
  const desiredOvr = ovrRaw === '' ? null : parseInt(ovrRaw,10);

  if (!any && desiredOvr === null){
    wrap.innerHTML = '<div class="placeholder-note">Set a target above to see a live training recommendation.</div>';
    return;
  }

  if (!any && desiredOvr !== null){
    if (desiredOvr > simMaxOvr){
      wrap.innerHTML = `<div class="sim-side-effect" style="color:var(--bad);">Desired OVR exceeds Max OVR — cannot be reached.</div>`;
      return;
    }
    const ovrGap = desiredOvr - simCurrentOvr;
    if (ovrGap <= 0){
      wrap.innerHTML = `<div class="sim-side-effect" style="color:var(--good);">Desired OVR already reached.</div>`;
      return;
    }
    const totalSessions = Math.round(ovrGap * TRAININGS_PER_OVR);
    wrap.innerHTML = `<div class="sim-side-effect">Any allocation works — ${totalSessions} trainings needed to reach ${desiredOvr} OVR. Use Bulk Training or per-stat buttons above with your current % split.</div>`;
    return;
  }

  const plan = computeOptimizedPlan(targets);
  if (plan.totalSessions <= 0 && plan.rawTotal <= 0){
    wrap.innerHTML = `<div class="sim-side-effect" style="color:var(--good);">Target(s) already met.</div>`;
    return;
  }
  const gained = computeGainsFromTrainingCounts(plan.counts);
  let html = '';
  STATS.forEach(s => {
    if (gained[s.key] > 0) html += `<div class="sim-side-effect">${s.name}: +${gained[s.key]}</div>`;
  });
  const expectedOvr = Math.min(simMaxOvr, simCurrentOvr + plan.totalSessions/TRAININGS_PER_OVR);
  html += `<div class="sim-side-effect"><b>Expected OVR: ${fmtOvr(expectedOvr)}</b> &nbsp;(${plan.totalSessions} trainings)</div>`;
  if (plan.capped) html += `<div class="sim-side-effect" style="color:var(--bad);">Capped by remaining Max OVR potential — full target may not be reachable yet.</div>`;
  wrap.innerHTML = html;
}

/* ---------- Optimize Training: applies the recommended plan's allocation % and commits the training ---------- */
if (el('simOptimizeBtn')) el('simOptimizeBtn').addEventListener('click', () => {
  const errEl = el('simGoalError');
  if (errEl) errEl.textContent = '';
  const { targets, any } = readGoalTargets();
  if (!any){
    if (errEl) errEl.textContent = 'Enter at least one target stat to optimize an allocation. (A Desired-OVR-only goal has no compositional trade-off.)';
    return;
  }
  const plan = computeOptimizedPlan(targets);
  if (plan.rawTotal <= 0){
    if (errEl) errEl.textContent = 'Target(s) already met — nothing to optimize.';
    return;
  }
  if (plan.totalSessions <= 0){
    if (errEl) errEl.textContent = 'Fighter is already at Max OVR — no training available.';
    return;
  }

  const newSplit = {};
  let running = 0;
  STATS.forEach((s,i) => {
    if (i === STATS.length-1){
      newSplit[s.key] = 100 - running;
    } else {
      const pct = plan.rawTotal > 0 ? Math.round((plan.counts[s.key]/plan.rawTotal)*100) : 0;
      newSplit[s.key] = pct;
      running += pct;
    }
  });
  simSplitPct = newSplit;
  buildSimSplitRows();

  pushSimUndo();
  const beforeOvr = simCurrentOvr;
  STATS.forEach(s => { simSessionCounts[s.key] += plan.counts[s.key]; });
  recomputeSimState();
  simHistory.unshift(`<b>Optimized Training (+${plan.totalSessions} sessions)</b><br>${fmtOvr(beforeOvr)} OVR → ${fmtOvr(simCurrentOvr)} OVR`);
  renderSim();
});

/* ---------- Final Trained Build ---------- */
function renderSimFinalDisplay(){
  const wrap = el('simFinalDisplay');
  if (!wrap) return;
  if (!simSnapshot){
    wrap.innerHTML = '<div class="placeholder-note">Hit "Sync From Current Stats" to set a starting point, then train the simulated fighter to see the final build here.</div>';
    return;
  }

  let statRows = '';
  let totalIncrease = 0;
  STATS.forEach(s => {
    const before = simSnapshot.stats[s.key];
    const after = simStats[s.key];
    const inc = after - before;
    totalIncrease += inc;
    statRows += `
      <div class="sim-final-row">
        <div class="sfr-name"><span class="dot" style="background:${s.color}"></span>${s.name}</div>
        <div class="sfr-nums">${before} → ${after}</div>
        <div class="sfr-diff">${inc>0?'+':''}${inc}</div>
      </div>
    `;
  });

  const ovrGained = simCurrentOvr - simSnapshot.ovr;
  const remainingPotential = Math.max(0, simMaxOvr - simCurrentOvr);
  const maxReached = simSessionsToMax() <= 0;

  const ovrRaw = el('simGoalOvr') ? el('simGoalOvr').value : '';
  const desiredOvr = ovrRaw === '' ? null : parseInt(ovrRaw,10);
  let goalStatusHtml = '';
  if (desiredOvr !== null){
    if (desiredOvr > simMaxOvr){
      goalStatusHtml = `<div class="sim-banner sim-banner-warn">Desired OVR exceeds the fighter's maximum potential.<br>Desired: ${desiredOvr} &nbsp; Maximum: ${simMaxOvr}</div>`;
    } else if (simCurrentOvr >= desiredOvr){
      goalStatusHtml = `<div class="sim-banner sim-banner-good">✓ DESIRED GOAL REACHED</div>`;
    } else {
      goalStatusHtml = `<div class="sim-banner sim-banner-pending">Goal not reached — ${fmtOvr(desiredOvr - simCurrentOvr)} more OVR needed</div>`;
    }
  }
  if (maxReached){
    goalStatusHtml += `<div class="sim-banner sim-banner-max">🏆 MAX OVR REACHED</div>`;
  }

  const fighterMeta = lastSimFighterName ? FIGHTERS.find(f => f.name === lastSimFighterName) : null;
  const classHtml = fighterMeta && fighterMeta.classification
    ? `<div class="sim-final-fighter-name">${fighterMeta.name} <span class="${classBadgeClass(fighterMeta.classification)}">${fighterMeta.classification}</span></div>`
    : '';

  wrap.innerHTML = `
    ${classHtml}
    <div class="sim-final-head">Final OVR: <b>${fmtOvr(simCurrentOvr)} / ${simMaxOvr}</b></div>
    <div class="sim-final-rows">${statRows}</div>
    <div class="result-summary" style="margin-top:10px;">
      <div class="rs-card"><div class="v">${ovrGained>0?'+':''}${fmtOvr(ovrGained)}</div><div class="l">Total OVR Gained</div></div>
      <div class="rs-card"><div class="v">${fmtOvr(remainingPotential)}</div><div class="l">Remaining Potential</div></div>
      <div class="rs-card"><div class="v">${simSessionsTrained}</div><div class="l">Training Performed</div></div>
      <div class="rs-card"><div class="v">${totalIncrease>0?'+':''}${totalIncrease}</div><div class="l">Total Stat Increase</div></div>
    </div>
    ${goalStatusHtml}
  `;
}

/* ---------- init (each step guarded so one failure can't block the rest) ---------- */
try { buildStatInputRows(); } catch (e) { console.error('[Fighter Calc] buildStatInputRows failed:', e); }
try { populateBuildSelectors(); } catch (e) { console.error('[Fighter Calc] populateBuildSelectors failed:', e); }
try { buildSplitRows(); } catch (e) { console.error('[Fighter Calc] buildSplitRows failed:', e); }
try { updateHero(); } catch (e) { console.error('[Fighter Calc] updateHero failed:', e); }
try { buildFighterList(); } catch (e) { console.error('[Fighter Calc] buildFighterList failed:', e); }
try { buildCodesGrid(); } catch (e) { console.error('[Fighter Calc] buildCodesGrid failed:', e); }
try { buildSimSplitRows(); } catch (e) { console.error('[Fighter Calc] buildSimSplitRows failed:', e); }
try { simSyncFromMain(); } catch (e) { console.error('[Fighter Calc] simSyncFromMain failed:', e); }
