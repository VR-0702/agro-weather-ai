// ===== AUTH =====
var TOKEN       = localStorage.getItem('kisanai_token') || '';
var currentUser = JSON.parse(localStorage.getItem('kisanai_user') || 'null');

if (!TOKEN || !currentUser) { window.location.href = 'login.html'; }

var userNameEl = document.getElementById('userName');
if (userNameEl) userNameEl.textContent = currentUser ? currentUser.name : '';

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN };
}

function doLogout() {
  fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() }).catch(function(){});
  localStorage.removeItem('kisanai_token');
  localStorage.removeItem('kisanai_user');
  window.location.href = 'login.html';
}

// ===== PLANT DATABASE =====
var PLANTS = {
  vegetables: [
    { id:'tomato',   name:'Tamatar',    hindi:'टमाटर',   icon:'🍅', days:75,  water:'har 2 din', season:'Kharif/Rabi', stages:['Seed','Sprout','Sapling','Flowering','Fruiting','Harvest'] },
    { id:'spinach',  name:'Palak',      hindi:'पालक',    icon:'🥬', days:40,  water:'roz',       season:'Rabi',        stages:['Seed','Sprout','Sapling','Leafy','Full Grown','Harvest'] },
    { id:'potato',   name:'Aloo',       hindi:'आलू',     icon:'🥔', days:90,  water:'har 3 din', season:'Rabi',        stages:['Seed','Sprout','Vine','Flowering','Tuber','Harvest'] },
    { id:'onion',    name:'Pyaaz',      hindi:'प्याज',   icon:'🧅', days:120, water:'har 3 din', season:'Rabi',        stages:['Seed','Sprout','Sapling','Bulbing','Mature','Harvest'] },
    { id:'okra',     name:'Bhindi',     hindi:'भिंडी',   icon:'🌿', days:55,  water:'har 2 din', season:'Kharif',      stages:['Seed','Sprout','Sapling','Flowering','Podding','Harvest'] },
    { id:'brinjal',  name:'Baingan',    hindi:'बैंगन',   icon:'🍆', days:80,  water:'har 2 din', season:'Kharif',      stages:['Seed','Sprout','Sapling','Flowering','Fruiting','Harvest'] },
  ],
  fruits: [
    { id:'mango',    name:'Aam',        hindi:'आम',      icon:'🥭', days:365, water:'har 7 din', season:'Garmi',       stages:['Seed','Sprout','Sapling','Young Tree','Flowering','Fruiting'] },
    { id:'banana',   name:'Kela',       hindi:'केला',    icon:'🍌', days:300, water:'har 3 din', season:'Saal bhar',   stages:['Sucker','Sprout','Sapling','Shoot','Flowering','Fruiting'] },
    { id:'papaya',   name:'Papita',     hindi:'पपीता',   icon:'🍈', days:180, water:'har 2 din', season:'Saal bhar',   stages:['Seed','Sprout','Sapling','Young','Flowering','Fruiting'] },
    { id:'guava',    name:'Amrood',     hindi:'अमरूद',   icon:'🍏', days:270, water:'har 5 din', season:'Saal bhar',   stages:['Seed','Sprout','Sapling','Young Tree','Flowering','Fruiting'] },
  ],
  trees: [
    { id:'neem',     name:'Neem',       hindi:'नीम',     icon:'🌳', days:730, water:'har 7 din', season:'Saal bhar',   stages:['Seed','Sprout','Sapling','Young','Mature','Full Grown'] },
    { id:'tulsi',    name:'Tulsi',      hindi:'तुलसी',   icon:'🌿', days:60,  water:'roz',       season:'Saal bhar',   stages:['Seed','Sprout','Sapling','Growing','Bushy','Full Grown'] },
    { id:'bamboo',   name:'Baans',      hindi:'बांस',    icon:'🎋', days:365, water:'har 3 din', season:'Saal bhar',   stages:['Seed','Sprout','Shoot','Young','Mature','Full Grown'] },
  ],
  crops: [
    { id:'wheat',    name:'Gehu',       hindi:'गेहूं',   icon:'🌾', days:150, water:'har 10 din',season:'Rabi',        stages:['Sowing','Germination','Tillering','Jointing','Flowering','Harvest'] },
    { id:'rice',     name:'Chawal',     hindi:'चावल',    icon:'🌾', days:130, water:'regular',   season:'Kharif',      stages:['Nursery','Transplant','Tillering','Panicle','Flowering','Harvest'] },
    { id:'maize',    name:'Makka',      hindi:'मक्का',   icon:'🌽', days:100, water:'har 5 din', season:'Kharif',      stages:['Sowing','Germination','Seedling','Tasseling','Silking','Harvest'] },
    { id:'mustard',  name:'Sarson',     hindi:'सरसों',   icon:'🌻', days:130, water:'har 15 din',season:'Rabi',        stages:['Sowing','Germination','Rosette','Stem','Flowering','Harvest'] },
  ],
  flowers: [
    { id:'rose',     name:'Gulab',      hindi:'गुलाब',   icon:'🌹', days:90,  water:'har 2 din', season:'Saal bhar',   stages:['Cutting','Rooting','Sapling','Budding','Blooming','Full Bloom'] },
    { id:'marigold', name:'Genda',      hindi:'गेंदा',   icon:'🌼', days:60,  water:'har 2 din', season:'Saal bhar',   stages:['Seed','Sprout','Sapling','Budding','Blooming','Full Bloom'] },
    { id:'sunflower',name:'Surajmukhi', hindi:'सूरजमुखी',icon:'🌻', days:80,  water:'har 3 din', season:'Rabi/Zaid',   stages:['Seed','Sprout','Sapling','Stem','Budding','Blooming'] },
  ],
};

var GUIDES = {
  tomato:  { soil:'Loamy, pH 6-7. Organic compost milao.', steps:['Beej 0.5cm gehre daalo','7-10 din mein ugega','Jab 15cm ho transplant karo','Support ke liye stake lagao','Pani regular do, waterlog nahi','Kide ke liye neem spray karo'] },
  spinach: { soil:'Sandy loam, pH 6-7. Nitrogen zyada.', steps:['Seedbed tayar karo','Beej chidako 1cm gehre','5 din mein ug aata hai','10cm spacing rakho','Roz pani do subah','40 din mein harvest karo'] },
  potato:  { soil:'Sandy loam, pH 5.5-6.5. Loose soil.', steps:['Seed potato 5cm gehre','2-3 hatheli spacing','Earthing up karo jab 20cm ho','Blight se bachao spray se','Pani 3 din mein ek baar','Patte peele hone par harvest karo'] },
  mango:   { soil:'Deep loamy, pH 5.5-7.5. Well drained.', steps:['Gunda ya cutting lagao','Dhoop mein rakho','Pehle saal regular pani','Pruning mat karo','Flowering mein calcium spray','Harvest jab rang badal jaye'] },
  wheat:   { soil:'Clay loam, pH 6-7.5. Phosphorus dalo.', steps:['Khet jotai karo 3 baar','Beej 5cm gehre 20cm spacing','Germination 7-10 din','Crown root irrigation zaroori','Urea top dressing tillering pe','Combine se harvest karo'] },
  rose:    { soil:'Loamy with compost, pH 6-6.5.', steps:['Cutting 15cm lo','IBA rooting hormone lagao','Sandy mix mein lagao','Nami rakho 3 hafte','Roots ke baad transplant','Deadhead karo zyada flowers ke liye'] },
  default: { soil:'Loamy soil with organic compost. pH 6-7.', steps:['Beej ya cutting tayar karo','Soil achhi tarah taiyar karo','Pani niyamit do','Dhoop zaroori hai','Kide se bachao','Samay par harvest karo'] },
};

// ===== STATE =====
var selectedPlant    = null;
var selectedCategory = 'vegetables';
var currentPhotoPlantId = null;
var userPlants       = [];

// ===== INIT =====
function init() {
  renderCategoryTabs();
  renderPlantGrid('vegetables');
  renderMyPlants();

  // Load plants from backend
  loadUserPlants(function() {
    renderMyPlants();
    if (userPlants.length === 0) showSelector(false);
  });
}

// ===== LOAD PLANTS FROM BACKEND =====
function loadUserPlants(callback) {
  fetch('/api/plants/', { headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {
        userPlants = data.plants.map(function(p) {
          try {
            p.stages = JSON.parse(p.stages.replace(/'/g, '"'));
          } catch(e) {
            p.stages = p.stages.split(',');
          }
          var daysPassed   = Math.floor((Date.now() - p.start_date) / 86400000);
          p.startDate      = p.start_date;
          p.totalDays      = p.total_days;
          p.water          = p.water_schedule;
          p.hindi          = p.plant_hindi;
          p.icon           = p.plant_icon;
          p.plantId        = p.plant_id;
          p.progress       = Math.min(100, Math.round((daysPassed / p.total_days) * 100));
          p.currentStageIdx = Math.min(p.stages.length - 1, Math.floor((daysPassed / p.total_days) * (p.stages.length - 1)));
          p.lastPhotoDate  = p.last_photo_date;
          p.lastAnalysis   = p.last_analysis;
          return p;
        });
      }
      if (callback) callback();
    })
    .catch(function(e) {
      console.error('Plants load error:', e);
      if (callback) callback();
    });
}

// ===== CATEGORY TABS =====
function renderCategoryTabs() {
  var tabs = document.getElementById('categoryTabs');
  if (!tabs) return;
  var cats = { vegetables:'🥕 Sabziyan', fruits:'🍎 Phal', trees:'🌳 Ped', crops:'🌾 Fasal', flowers:'🌸 Phool' };
  tabs.innerHTML = Object.keys(cats).map(function(k) {
    return '<button class="cat-tab' + (k === selectedCategory ? ' active' : '') + '" onclick="selectCategory(\'' + k + '\')">' + cats[k] + '</button>';
  }).join('');
}

function selectCategory(cat) {
  selectedCategory = cat;
  selectedPlant    = null;
  var growBtn = document.getElementById('growBtn');
  if (growBtn) growBtn.style.display = 'none';
  var guideSection = document.getElementById('plantGuideSection');
  if (guideSection) guideSection.style.display = 'none';
  document.querySelectorAll('.cat-tab').forEach(function(b) { b.classList.remove('active'); });
  event.target.classList.add('active');
  renderPlantGrid(cat);
}

// ===== PLANT GRID =====
function renderPlantGrid(cat) {
  var grid   = document.getElementById('plantGrid');
  if (!grid) return;
  var plants = PLANTS[cat] || [];
  grid.innerHTML = plants.map(function(p) {
    return '<div class="plant-card" id="pc_' + p.id + '" onclick="selectPlant(\'' + p.id + '\',\'' + cat + '\')">' +
      '<span class="icon">' + p.icon + '</span>' +
      '<div class="name">' + p.hindi + '</div>' +
      '<div class="time">~' + p.days + ' din</div>' +
      '</div>';
  }).join('');
}

function selectPlant(id, cat) {
  selectedPlant = null;
  var catPlants = PLANTS[cat] || [];
  for (var i = 0; i < catPlants.length; i++) {
    if (catPlants[i].id === id) { selectedPlant = catPlants[i]; selectedPlant.category = cat; break; }
  }
  if (!selectedPlant) return;

  document.querySelectorAll('.plant-card').forEach(function(c) { c.classList.remove('selected'); });
  var pc = document.getElementById('pc_' + id);
  if (pc) pc.classList.add('selected');

  var guide = GUIDES[id] || GUIDES.default;
  var guideTitle = document.getElementById('guideTitle');
  if (guideTitle) guideTitle.textContent = selectedPlant.icon + ' ' + selectedPlant.hindi + ' — Kaise Ugayein';

  var guideSteps = document.getElementById('guideSteps');
  if (guideSteps) {
    guideSteps.innerHTML =
      '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">🪨 Mitti: ' + guide.soil + '</div>' +
      guide.steps.map(function(s, i) {
        return '<div style="display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.4rem;">' +
          '<span style="background:var(--green-mid);color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0;">' + (i+1) + '</span>' +
          '<span style="font-size:0.82rem;">' + s + '</span></div>';
      }).join('');
  }

  var guideSection = document.getElementById('plantGuideSection');
  if (guideSection) guideSection.style.display = 'block';
  var growBtn = document.getElementById('growBtn');
  if (growBtn) {
    growBtn.style.display = 'block';
    growBtn.textContent   = '🌱 ' + selectedPlant.hindi + ' Ugana Shuru Karo!';
  }
}

// ===== START GROWING =====
function startGrowing() {
  if (!selectedPlant) return;

  var payload = {
    plant_id:       selectedPlant.id,
    plant_name:     selectedPlant.name,
    plant_hindi:    selectedPlant.hindi,
    plant_icon:     selectedPlant.icon,
    category:       selectedPlant.category,
    stages:         JSON.stringify(selectedPlant.stages),
    total_days:     selectedPlant.days,
    water_schedule: selectedPlant.water,
    season:         selectedPlant.season,
    start_date:     Date.now(),
  };

  fetch('/api/plants/add', {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(payload)
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.success) {
      loadUserPlants(function() {
        hideSelector();
        renderMyPlants();
      });
    } else {
      alert('Error: ' + d.error);
    }
  })
  .catch(function(e) { console.error(e); });
}

// ===== RENDER MY PLANTS =====
function renderMyPlants() {
  var grid = document.getElementById('plantsGrid');
  if (!grid) return;

  if (userPlants.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">' +
      '<span class="big-icon">🌱</span>' +
      '<div style="font-family:Syne,sans-serif;font-weight:700;font-size:1.1rem;margin-bottom:0.5rem;">Abhi koi plant nahi!</div>' +
      '<div style="font-size:0.85rem;color:var(--text-muted);">Niche se plant choose karo aur grow karna shuru karo.</div>' +
      '</div>';
    return;
  }

  grid.innerHTML = userPlants.map(function(p) {
    return renderPotCard(p);
  }).join('');
}

function renderPotCard(p) {
  var stage      = p.stages[p.currentStageIdx] || p.stages[0];
  var daysPassed = Math.floor((Date.now() - p.start_date) / 86400000);
  var daysLeft   = Math.max(0, p.total_days - daysPassed);

  var healthClass = p.health === 'good' ? 'health-good' : p.health === 'warn' ? 'health-warn' : 'health-bad';
  var healthText  = p.health === 'good' ? '✅ Healthy' : p.health === 'warn' ? '⚠️ Check Karo' : '❌ Problem';

  var tasks = [
    { label:'💧 Pani do',        desc: p.water + ' mein ek baar' },
    { label:'☀️ Dhoop dikhao',   desc: 'Roz 6+ ghante dhoop chahiye' },
    { label:'🌿 Fertilizer do',  desc: 'Nitrogen fertilizer spray karo' },
    { label:'✂️ Pruning karo',   desc: 'Dead leaves hatao' },
    { label:'🔍 Inspect karo',   desc: 'Kide ya disease check karo' },
    { label:'🎉 Harvest ready!', desc: 'Fasal kaatne ka samay aa gaya!' },
  ];
  var task      = tasks[Math.min(p.currentStageIdx, 5)];
  var needsPhoto = !p.lastPhotoDate || (Date.now() - p.lastPhotoDate) > 7 * 86400000;

  return '<div class="pot-card">' +
    '<div class="pot-scene">' +
      renderPlantSVG(p.currentStageIdx, p.stages.length, p.icon) +
      '<div class="soil-base"></div>' +
      '<div class="soil-top"></div>' +
      '<div class="stage-badge">Stage: ' + stage + '</div>' +
      '<div class="health-badge ' + healthClass + '">' + healthText + '</div>' +
    '</div>' +
    '<div class="pot-info">' +
      '<div class="pot-name">' + p.icon + ' ' + p.plant_hindi + '</div>' +
      '<div class="pot-meta">' + daysPassed + ' din ho gaye · ' + daysLeft + ' din bache · ' + p.season + '</div>' +
      '<div class="progress-row">' +
        '<div class="progress-label">Growth</div>' +
        '<div class="progress"><div class="progress-bar" style="width:' + p.progress + '%"></div></div>' +
        '<div class="progress-pct">' + p.progress + '%</div>' +
      '</div>' +
      '<div class="task-row">' +
        '<div class="task-label">' + task.label + '</div>' +
        '<div class="task-desc">' + task.desc + '</div>' +
      '</div>' +
      (needsPhoto ? '<div style="background:#fff8e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.78rem;color:#f57f17;font-weight:600;margin-bottom:0.75rem;">📸 Weekly health check baaki hai!</div>' : '') +
      '<div class="pot-actions">' +
        '<button onclick="openGuideModal(\'' + p.id + '\')">📖 Guide</button>' +
        '<button onclick="openPhotoModal(\'' + p.id + '\')" class="photo-btn">📷 Photo</button>' +
        '<button onclick="deletePlant(\'' + p.id + '\')" style="max-width:42px;">🗑️</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ===== PLANT SVG =====
function renderPlantSVG(stageIdx, totalStages, icon) {
  var pct  = stageIdx / Math.max(totalStages - 1, 1);
  var h    = Math.round(20 + pct * 110);
  var sw   = Math.round(2 + pct * 4);
  var ls   = Math.round(10 + pct * 30);
  var cx   = ls * 1.5 + sw / 2;
  var svg  = '<svg class="plant-svg" width="' + (ls*3+sw) + '" height="' + (h+25) + '" viewBox="0 0 ' + (ls*3+sw) + ' ' + (h+25) + '">';
  svg += '<rect x="' + (ls*1.4) + '" y="20" width="' + sw + '" height="' + h + '" rx="' + (sw/2) + '" fill="#4caf50"/>';
  if (pct > 0.15) svg += '<ellipse cx="' + (ls*1.4-ls*0.6) + '" cy="' + (20+h*0.6) + '" rx="' + (ls*0.7) + '" ry="' + (ls*0.35) + '" fill="#66bb6a"/>';
  if (pct > 0.3)  svg += '<ellipse cx="' + (ls*1.4+sw+ls*0.6) + '" cy="' + (20+h*0.4) + '" rx="' + (ls*0.8) + '" ry="' + (ls*0.4) + '" fill="#81c784"/>';
  if (pct > 0.5)  svg += '<ellipse cx="' + (ls*1.4-ls*0.8) + '" cy="' + (20+h*0.25) + '" rx="' + (ls*0.9) + '" ry="' + (ls*0.45) + '" fill="#4caf50"/>';
  if (pct > 0.7)  svg += '<ellipse cx="' + (ls*1.4+sw+ls*0.7) + '" cy="' + (20+h*0.15) + '" rx="' + ls + '" ry="' + (ls*0.5) + '" fill="#388e3c"/>';
  if (pct > 0.85) svg += '<text x="' + (ls*1.4+sw/2) + '" y="18" text-anchor="middle" font-size="16">' + icon + '</text>';
  else if (pct > 0) svg += '<circle cx="' + (ls*1.4+sw/2) + '" cy="24" r="' + (4+pct*6) + '" fill="#a5d6a7"/>';
  if (pct < 0.1) svg += '<ellipse cx="' + (ls*1.4+sw/2) + '" cy="' + (20+h+5) + '" rx="8" ry="5" fill="#8d6e63"/>';
  svg += '</svg>';
  return svg;
}

// ===== PHOTO MODAL =====
function openPhotoModal(plantId) {
  currentPhotoPlantId = plantId;
  var p = null;
  for (var i = 0; i < userPlants.length; i++) { if (userPlants[i].id === plantId) { p = userPlants[i]; break; } }
  var nameEl = document.getElementById('photoModalPlantName');
  if (nameEl) nameEl.textContent = p ? (p.icon + ' ' + p.plant_hindi + ' ki weekly health check') : '';
  var result = document.getElementById('analysisResult');
  if (result) result.style.display = 'none';
  var inp = document.getElementById('photoInput');
  if (inp) inp.value = '';
  openModal('photoModal');
}

function analyzePhoto(event) {
  var file = event.target.files[0];
  if (!file) return;

  var result = document.getElementById('analysisResult');
  result.className = 'analysis-result';
  result.style.display = 'block';
  document.getElementById('analysisTitle').textContent = '🔍 Analyze ho raha hai...';
  document.getElementById('analysisText').textContent  = 'AI dekh raha hai...';

  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];
    var plant  = null;
    for (var i = 0; i < userPlants.length; i++) { if (userPlants[i].id === currentPhotoPlantId) { plant = userPlants[i]; break; } }

    fetch('/api/chatbot/analyze-image', {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ base64: base64, mimeType: file.type })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var desc = d.success ? d.description : 'Image analyze nahi ho saki.';
      return fetch('/api/chatbot/ask', {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({
          question: 'Is ' + (plant ? plant.plant_hindi : 'plant') + ' ki image dekho. Batao: 1) Healthy hai ya problem hai? 2) Kya problem hai aur kaise thik kare? Max 80 words. Hindi mein.',
          image_description: desc,
          history: []
        })
      });
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var answer    = d.success ? d.answer : 'Analysis nahi ho saki.';
      var isHealthy = answer.includes('स्वस्थ') || answer.includes('ठीक') || answer.includes('अच्छ') || answer.toLowerCase().includes('healthy');
      result.className = 'analysis-result ' + (isHealthy ? 'healthy' : 'issue');
      document.getElementById('analysisTitle').textContent = isHealthy ? '✅ Plant Healthy Hai!' : '⚠️ Problem Mili!';
      document.getElementById('analysisText').textContent  = answer;

      if (currentPhotoPlantId) {
        fetch('/api/plants/' + currentPhotoPlantId, {
          method:  'PUT',
          headers: authHeaders(),
          body:    JSON.stringify({ health: isHealthy ? 'good' : 'warn', last_photo_date: Date.now(), last_analysis: answer })
        }).then(function() {
          loadUserPlants(function() { renderMyPlants(); });
        });
      }
    })
    .catch(function() {
      result.className = 'analysis-result issue';
      document.getElementById('analysisTitle').textContent = '❌ Error';
      document.getElementById('analysisText').textContent  = 'Backend se connect nahi ho saka.';
    });
  };
  reader.readAsDataURL(file);
}

// ===== GUIDE MODAL =====
function openGuideModal(plantId) {
  var p = null;
  for (var i = 0; i < userPlants.length; i++) { if (userPlants[i].id === plantId) { p = userPlants[i]; break; } }
  if (!p) return;

  var guide = GUIDES[p.plant_id] || GUIDES.default;
  var title = document.getElementById('guideModalTitle');
  if (title) title.textContent = p.icon + ' ' + p.plant_hindi + ' — Guide';

  var body = document.getElementById('guideModalBody');
  if (body) {
    body.innerHTML =
      '<div style="background:var(--green-pale);border-radius:10px;padding:0.85rem;margin-bottom:1rem;"><strong>🪨 Mitti:</strong> ' + guide.soil + '</div>' +
      '<div style="margin-bottom:0.75rem;"><strong>💧 Pani:</strong> ' + p.water_schedule + '</div>' +
      '<div style="margin-bottom:0.75rem;"><strong>📅 Season:</strong> ' + p.season + '</div>' +
      '<div style="margin-bottom:0.75rem;"><strong>⏱️ Samay:</strong> ~' + p.total_days + ' din</div>' +
      '<div style="font-weight:700;margin-bottom:0.75rem;">📋 Steps:</div>' +
      guide.steps.map(function(s, i) {
        return '<div style="display:flex;gap:0.75rem;margin-bottom:0.85rem;">' +
          '<div style="width:28px;height:28px;background:var(--green-mid);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;">' + (i+1) + '</div>' +
          '<div style="font-size:0.85rem;padding-top:4px;">' + s + '</div></div>';
      }).join('') +
      '<div style="background:var(--surface2);border-radius:10px;padding:1rem;margin-top:0.5rem;"><strong>🌱 Stages:</strong><br>' +
      p.stages.map(function(s, i) {
        var active = i === p.currentStageIdx, done = i < p.currentStageIdx;
        return '<span style="display:inline-flex;align-items:center;gap:3px;margin:3px;padding:3px 8px;border-radius:12px;font-size:0.73rem;font-weight:600;background:' +
          (active ? 'var(--green-mid)' : done ? 'var(--green-pale)' : 'var(--border)') + ';color:' +
          (active ? 'white' : done ? 'var(--green-mid)' : 'var(--text-muted)') + ';">' +
          (done ? '✓ ' : active ? '▶ ' : '') + s + '</span>';
      }).join('') + '</div>';
  }
  openModal('guideModal');
}

// ===== DELETE =====
function deletePlant(plantId) {
  if (!confirm('Is plant ko hatana chahte ho?')) return;
  fetch('/api/plants/' + plantId, { method: 'DELETE', headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function() {
      loadUserPlants(function() { renderMyPlants(); });
    })
    .catch(console.error);
}

// ===== SHOW / HIDE SELECTOR =====
function showSelector(showBack) {
  document.getElementById('selectorSection').style.display = 'block';
  document.getElementById('myPlantsSection').style.display = 'none';
  var backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.style.display = (showBack === false) ? 'none' : 'flex';
  renderCategoryTabs();
  renderPlantGrid(selectedCategory);
  selectedPlant = null;
  var growBtn = document.getElementById('growBtn');
  if (growBtn) growBtn.style.display = 'none';
  var gs = document.getElementById('plantGuideSection');
  if (gs) gs.style.display = 'none';
}

function hideSelector() {
  document.getElementById('selectorSection').style.display = 'none';
  document.getElementById('myPlantsSection').style.display = 'block';
  selectedPlant = null;
}

// ===== MODAL =====
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(function(m) {
  m.addEventListener('click', function(e) { if (e.target === m) m.classList.remove('open'); });
});

// ===== START =====
document.addEventListener('DOMContentLoaded', function() {
  init();
});
