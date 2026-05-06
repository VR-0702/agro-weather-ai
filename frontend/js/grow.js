// ===== AUTH CHECK =====
var currentUser = JSON.parse(localStorage.getItem('kisanai_user') || 'null');
if (!currentUser) window.location.href = 'login.html';
document.getElementById('userName').textContent = currentUser ? currentUser.name : '';

function doLogout() {
  localStorage.removeItem('kisanai_user');
  window.location.href = 'login.html';
}

// ===== PLANT DATABASE =====
var PLANTS = {
  vegetables: [
    { id:'tomato',    name:'Tamatar',     hindi:'टमाटर',   icon:'🍅', days:75,  water:'har 2 din', season:'Kharif/Rabi',  stages:['Seed','Sprout','Sapling','Flowering','Fruiting','Harvest'] },
    { id:'spinach',   name:'Palak',       hindi:'पालक',    icon:'🥬', days:40,  water:'roz',       season:'Rabi',         stages:['Seed','Sprout','Sapling','Leafy','Full Grown','Harvest'] },
    { id:'potato',    name:'Aloo',        hindi:'आलू',     icon:'🥔', days:90,  water:'har 3 din', season:'Rabi',         stages:['Seed','Sprout','Vine','Flowering','Tuber','Harvest'] },
    { id:'onion',     name:'Pyaaz',       hindi:'प्याज',   icon:'🧅', days:120, water:'har 3 din', season:'Rabi',         stages:['Seed','Sprout','Sapling','Bulbing','Mature','Harvest'] },
    { id:'okra',      name:'Bhindi',      hindi:'भिंडी',   icon:'🌿', days:55,  water:'har 2 din', season:'Kharif',       stages:['Seed','Sprout','Sapling','Flowering','Podding','Harvest'] },
    { id:'brinjal',   name:'Baingan',     hindi:'बैंगन',   icon:'🍆', days:80,  water:'har 2 din', season:'Kharif',       stages:['Seed','Sprout','Sapling','Flowering','Fruiting','Harvest'] },
  ],
  fruits: [
    { id:'mango',     name:'Aam',         hindi:'आम',      icon:'🥭', days:365, water:'har 7 din', season:'Garmi',        stages:['Seed','Sprout','Sapling','Young Tree','Flowering','Fruiting'] },
    { id:'banana',    name:'Kela',        hindi:'केला',    icon:'🍌', days:300, water:'har 3 din', season:'Saal bhar',    stages:['Sucker','Sprout','Sapling','Shoot','Flowering','Fruiting'] },
    { id:'papaya',    name:'Papita',      hindi:'पपीता',   icon:'🍈', days:180, water:'har 2 din', season:'Saal bhar',    stages:['Seed','Sprout','Sapling','Young','Flowering','Fruiting'] },
    { id:'guava',     name:'Amrood',      hindi:'अमरूद',   icon:'🍏', days:270, water:'har 5 din', season:'Saal bhar',    stages:['Seed','Sprout','Sapling','Young Tree','Flowering','Fruiting'] },
  ],
  trees: [
    { id:'neem',      name:'Neem',        hindi:'नीम',     icon:'🌳', days:730, water:'har 7 din', season:'Saal bhar',    stages:['Seed','Sprout','Sapling','Young','Mature','Full Grown'] },
    { id:'tulsi',     name:'Tulsi',       hindi:'तुलसी',   icon:'🌿', days:60,  water:'roz',       season:'Saal bhar',    stages:['Seed','Sprout','Sapling','Growing','Bushy','Full Grown'] },
    { id:'bamboo',    name:'Baans',       hindi:'बांस',    icon:'🎋', days:365, water:'har 3 din', season:'Saal bhar',    stages:['Seed','Sprout','Shoot','Young','Mature','Full Grown'] },
  ],
  crops: [
    { id:'wheat',     name:'Gehu',        hindi:'गेहूं',   icon:'🌾', days:150, water:'har 10 din',season:'Rabi',         stages:['Sowing','Germination','Tillering','Jointing','Flowering','Harvest'] },
    { id:'rice',      name:'Chawal',      hindi:'चावल',   icon:'🌾', days:130, water:'regular',   season:'Kharif',       stages:['Nursery','Transplant','Tillering','Panicle','Flowering','Harvest'] },
    { id:'maize',     name:'Makka',       hindi:'मक्का',   icon:'🌽', days:100, water:'har 5 din', season:'Kharif',       stages:['Sowing','Germination','Seedling','Tasseling','Silking','Harvest'] },
    { id:'mustard',   name:'Sarson',      hindi:'सरसों',   icon:'🌻', days:130, water:'har 15 din',season:'Rabi',         stages:['Sowing','Germination','Rosette','Stem','Flowering','Harvest'] },
  ],
  flowers: [
    { id:'rose',      name:'Gulab',       hindi:'गुलाब',   icon:'🌹', days:90,  water:'har 2 din', season:'Saal bhar',    stages:['Cutting','Rooting','Sapling','Budding','Blooming','Full Bloom'] },
    { id:'marigold',  name:'Genda',       hindi:'गेंदा',   icon:'🌼', days:60,  water:'har 2 din', season:'Saal bhar',    stages:['Seed','Sprout','Sapling','Budding','Blooming','Full Bloom'] },
    { id:'sunflower', name:'Surajmukhi',  hindi:'सूरजमुखी',icon:'🌻', days:80,  water:'har 3 din', season:'Rabi/Zaid',    stages:['Seed','Sprout','Sapling','Stem','Budding','Blooming'] },
  ],
};

// Growing guides for each plant type
var GUIDES = {
  tomato:   { soil:'Loamy, pH 6-7. Organic compost milao.', steps:['Beej 0.5cm gehre daalo','7-10 din mein ugega','Jab 15cm ho transplant karo','Support ke liye stake lagao','Pani regular do, waterlog nahi','Kide ke liye neem spray karo'] },
  spinach:  { soil:'Sandy loam, pH 6-7. Nitrogen zyada.', steps:['Seedbed tayar karo','Beej chidako 1cm gehre','5 din mein ug aata hai','Thin karo 10cm spacing','Roz pani do subah','40 din mein harvest karo'] },
  potato:   { soil:'Sandy loam, pH 5.5-6.5. Loose soil.', steps:['Seed potato 5cm gehre','2-3 hatheli spacing','Earthing up karo jab 20cm ho','Blight se bachao spray se','Pani 3 din mein ek baar','Patte peele hone par harvest karo'] },
  mango:    { soil:'Deep loamy, pH 5.5-7.5. Well drained.', steps:['Gunda ya cutting lagao','Dhoop mein rakho','Pehle saal regular pani','Pruning mat karo','Flowering mein calcium spray','Harvest jab rang badal jaye'] },
  wheat:    { soil:'Clay loam, pH 6-7.5. Phosphorus dalo.', steps:['Khet jotai karo 3 baar','Beej 5cm gehre 20cm spacing','Germination 7-10 din','Crown root irrigation zaroori','Urea top dressing tillering pe','Combine se harvest karo'] },
  rose:     { soil:'Loamy with compost, pH 6-6.5. Drain.', steps:['Cutting 15cm lo','IBA rooting hormone lagao','Sandy mix mein lagao','Nami rakho 3 hafte','Roots ke baad transplant','Deadhead karo zyada flowers ke liye'] },
  default:  { soil:'Loamy soil with organic compost. pH 6-7.', steps:['Beej ya cutting tayar karo','Soil achhi tarah se taiyar karo','Pani niyamit do','Dhoop zaroori hai','Kide se bachao','Samay par harvest karo'] },
};

// ===== STATE =====
var selectedPlant = null;
var selectedCategory = 'vegetables';
var currentPhotoPlantId = null;
var userPlants = [];

// ===== INIT =====
function init() {
  loadUserPlants();
  renderCategoryTabs();
  renderPlantGrid('vegetables');
  renderMyPlants();

  // Show selector if no plants
  if (userPlants.length === 0) {
    showSelector(false);
  }
}

// ===== LOAD/SAVE =====
function getUserKey() { return 'gwm_plants_' + currentUser.id; }

function loadUserPlants() {
  userPlants = JSON.parse(localStorage.getItem(getUserKey()) || '[]');
  // Update growth progress
  userPlants.forEach(function(p) {
    var daysPassed = Math.floor((Date.now() - p.startDate) / 86400000);
    p.progress = Math.min(100, Math.round((daysPassed / p.totalDays) * 100));
    p.currentStageIdx = Math.min(p.stages.length - 1, Math.floor((daysPassed / p.totalDays) * (p.stages.length - 1)));
  });
  saveUserPlants();
}

function saveUserPlants() {
  localStorage.setItem(getUserKey(), JSON.stringify(userPlants));
}

// ===== CATEGORY TABS =====
function renderCategoryTabs() {
  var tabs = document.getElementById('categoryTabs');
  var cats = { vegetables:'🥕 Sabziyan', fruits:'🍎 Phal', trees:'🌳 Ped', crops:'🌾 Fasal', flowers:'🌸 Phool' };
  tabs.innerHTML = Object.keys(cats).map(function(k) {
    return '<button class="cat-tab' + (k === selectedCategory ? ' active' : '') + '" onclick="selectCategory(\'' + k + '\')">' + cats[k] + '</button>';
  }).join('');
}

function selectCategory(cat) {
  selectedCategory = cat;
  selectedPlant = null;
  document.getElementById('growBtn').style.display = 'none';
  document.getElementById('plantGuideSection').style.display = 'none';
  document.querySelectorAll('.cat-tab').forEach(function(b) { b.classList.remove('active'); });
  event.target.classList.add('active');
  renderPlantGrid(cat);
}

// ===== PLANT GRID =====
function renderPlantGrid(cat) {
  var grid = document.getElementById('plantGrid');
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
  selectedPlant = { ...PLANTS[cat].find(function(p) { return p.id === id; }), category: cat };
  document.querySelectorAll('.plant-card').forEach(function(c) { c.classList.remove('selected'); });
  document.getElementById('pc_' + id).classList.add('selected');

  // Show guide
  var guide = GUIDES[id] || GUIDES.default;
  document.getElementById('guideTitle').textContent = selectedPlant.icon + ' ' + selectedPlant.hindi + ' — Kaise Ugayein';
  document.getElementById('guideSteps').innerHTML =
    '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">🪨 Mitti: ' + guide.soil + '</div>' +
    guide.steps.map(function(s, i) {
      return '<div style="display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.4rem;">' +
        '<span style="background:var(--green-mid);color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0;">' + (i+1) + '</span>' +
        '<span style="font-size:0.82rem;color:var(--text);">' + s + '</span></div>';
    }).join('');

  document.getElementById('plantGuideSection').style.display = 'block';
  document.getElementById('growBtn').style.display = 'block';
  document.getElementById('growBtn').textContent = '🌱 ' + selectedPlant.hindi + ' Ugana Shuru Karo!';
}

// ===== START GROWING =====
function startGrowing() {
  if (!selectedPlant) return;

  var newPlant = {
    id:             Date.now().toString(),
    plantId:        selectedPlant.id,
    name:           selectedPlant.name,
    hindi:          selectedPlant.hindi,
    icon:           selectedPlant.icon,
    category:       selectedPlant.category,
    stages:         selectedPlant.stages,
    totalDays:      selectedPlant.days,
    water:          selectedPlant.water,
    season:         selectedPlant.season,
    startDate:      Date.now(),
    progress:       0,
    currentStageIdx:0,
    health:         'good',
    lastPhotoDate:  null,
    lastAnalysis:   null,
    notes:          '',
  };

  userPlants.push(newPlant);
  saveUserPlants();
  hideSelector();
  renderMyPlants();
}

// ===== RENDER MY PLANTS =====
function renderMyPlants() {
  var grid = document.getElementById('plantsGrid');

  if (userPlants.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">' +
      '<span class="big-icon">🌱</span>' +
      '<div style="font-family:Syne,sans-serif;font-weight:700;font-size:1.1rem;margin-bottom:0.5rem;">Abhi koi plant nahi!</div>' +
      '<div style="font-size:0.85rem;color:var(--text-muted);">Upar se plant choose karo aur grow karna shuru karo.</div>' +
      '</div>';
    return;
  }

  grid.innerHTML = userPlants.map(function(p) {
    return renderPotCard(p);
  }).join('');
}

function renderPotCard(p) {
  var stage = p.stages[p.currentStageIdx] || p.stages[0];
  var daysLeft = Math.max(0, p.totalDays - Math.floor((Date.now() - p.startDate) / 86400000));
  var daysPassed = Math.floor((Date.now() - p.startDate) / 86400000);

  var healthClass = p.health === 'good' ? 'health-good' : p.health === 'warn' ? 'health-warn' : 'health-bad';
  var healthText  = p.health === 'good' ? '✅ Healthy' : p.health === 'warn' ? '⚠️ Check Karo' : '❌ Problem';

  // Current task based on stage
  var tasks = {
    0: { label: '💧 Pani do', desc: p.water + ' mein ek baar' },
    1: { label: '☀️ Dhoop dikhao', desc: 'Roz 6+ ghante dhoop chahiye' },
    2: { label: '🌿 Fertilizer do', desc: 'Nitrogen fertilizer spray karo' },
    3: { label: '✂️ Pruning karo', desc: 'Dead leaves hatao' },
    4: { label: '🔍 Inspect karo', desc: 'Kide ya disease check karo' },
    5: { label: '🎉 Harvest ready!', desc: 'Fasal kaatne ka samay aa gaya!' },
  };
  var task = tasks[Math.min(p.currentStageIdx, 5)];

  // Weekly photo check needed?
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
      '<div class="pot-name">' + p.icon + ' ' + p.hindi + '</div>' +
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
        '<button onclick="openPhotoModal(\'' + p.id + '\')" class="photo-btn">📷 Photo Upload</button>' +
        '<button onclick="deletePlant(\'' + p.id + '\')" style="max-width:40px;">🗑️</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ===== PLANT SVG ANIMATION =====
function renderPlantSVG(stageIdx, totalStages, icon) {
  var pct = stageIdx / Math.max(totalStages - 1, 1);
  var h   = Math.round(20 + pct * 110); // 20px to 130px height
  var stemW = Math.round(2 + pct * 4);
  var leafS = Math.round(10 + pct * 30);

  var svg = '<svg class="plant-svg" width="' + (leafS * 3) + '" height="' + (h + 20) + '" viewBox="0 0 ' + (leafS*3) + ' ' + (h+20) + '">';

  // Stem
  svg += '<rect x="' + (leafS*1.4) + '" y="' + (20) + '" width="' + stemW + '" height="' + h + '" rx="' + (stemW/2) + '" fill="#4caf50"/>';

  // Leaves (appear progressively)
  if (pct > 0.15) {
    svg += '<ellipse cx="' + (leafS*1.4 - leafS*0.6) + '" cy="' + (20 + h*0.6) + '" rx="' + (leafS*0.7) + '" ry="' + (leafS*0.35) + '" fill="#66bb6a" transform="rotate(-20,' + (leafS*1.4 - leafS*0.6) + ',' + (20+h*0.6) + ')"/>';
  }
  if (pct > 0.3) {
    svg += '<ellipse cx="' + (leafS*1.4 + stemW + leafS*0.6) + '" cy="' + (20 + h*0.4) + '" rx="' + (leafS*0.8) + '" ry="' + (leafS*0.4) + '" fill="#81c784" transform="rotate(20,' + (leafS*1.4+stemW+leafS*0.6) + ',' + (20+h*0.4) + ')"/>';
  }
  if (pct > 0.5) {
    svg += '<ellipse cx="' + (leafS*1.4 - leafS*0.8) + '" cy="' + (20 + h*0.25) + '" rx="' + (leafS*0.9) + '" ry="' + (leafS*0.45) + '" fill="#4caf50" transform="rotate(-15,' + (leafS*1.4-leafS*0.8) + ',' + (20+h*0.25) + ')"/>';
  }
  if (pct > 0.7) {
    svg += '<ellipse cx="' + (leafS*1.4 + stemW + leafS*0.7) + '" cy="' + (20 + h*0.15) + '" rx="' + (leafS) + '" ry="' + (leafS*0.5) + '" fill="#388e3c" transform="rotate(15,' + (leafS*1.4+stemW+leafS*0.7) + ',' + (20+h*0.15) + ')"/>';
  }

  // Crown / top (fruit/flower at high stages)
  if (pct > 0.85) {
    svg += '<text x="' + (leafS*1.4 + stemW/2) + '" y="18" text-anchor="middle" font-size="16">' + icon + '</text>';
  } else if (pct > 0.0) {
    svg += '<circle cx="' + (leafS*1.4 + stemW/2) + '" cy="24" r="' + (4 + pct*6) + '" fill="#a5d6a7"/>';
  }

  // Seed (early stage)
  if (pct < 0.1) {
    svg += '<ellipse cx="' + (leafS*1.4 + stemW/2) + '" cy="' + (20 + h + 5) + '" rx="8" ry="5" fill="#8d6e63"/>';
  }

  svg += '</svg>';
  return svg;
}

// ===== PHOTO ANALYSIS =====
function openPhotoModal(plantId) {
  currentPhotoPlantId = plantId;
  var p = userPlants.find(function(x) { return x.id === plantId; });
  document.getElementById('photoModalPlantName').textContent = p ? (p.icon + ' ' + p.hindi + ' ki weekly health check karo') : '';
  document.getElementById('analysisResult').style.display = 'none';
  document.getElementById('photoInput').value = '';
  document.getElementById('photoModal').classList.add('open');
}

function analyzePhoto(event) {
  var file = event.target.files[0];
  if (!file) return;

  var result = document.getElementById('analysisResult');
  result.className = 'analysis-result';
  result.style.display = 'block';
  document.getElementById('analysisTitle').textContent = '🔍 Analyze ho raha hai...';
  document.getElementById('analysisText').textContent = 'AI dekh raha hai...';

  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];
    var plant  = userPlants.find(function(x) { return x.id === currentPhotoPlantId; });

    fetch('/api/chatbot/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64: base64, mimeType: file.type })
    }).then(function(r) { return r.json(); })
      .then(function(d) {
        var desc = d.success ? d.description : 'Image analyze nahi ho saki.';

        // Ask for health assessment
        return fetch('/api/chatbot/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: 'Is ' + (plant ? plant.hindi : 'plant') + ' ki image dekho. Seedha batao: 1) Healthy hai ya problem hai? 2) Agar problem hai to kya hai aur kaise thik kare? Max 100 words. Hindi mein jawab do.',
            image_description: desc,
            history: []
          })
        });
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var answer = d.success ? d.answer : 'Analysis nahi ho saki. Backend check karo.';
        var isHealthy = answer.toLowerCase().includes('healthy') || answer.includes('स्वस्थ') || answer.includes('ठीक') || answer.includes('अच्छ');

        result.className = 'analysis-result ' + (isHealthy ? 'healthy' : 'issue');
        document.getElementById('analysisTitle').textContent = isHealthy ? '✅ Plant Healthy Hai!' : '⚠️ Problem Mili!';
        document.getElementById('analysisText').textContent = answer;

        // Update plant health
        if (currentPhotoPlantId) {
          var p = userPlants.find(function(x) { return x.id === currentPhotoPlantId; });
          if (p) {
            p.health = isHealthy ? 'good' : 'warn';
            p.lastPhotoDate = Date.now();
            p.lastAnalysis = answer;
            saveUserPlants();
            renderMyPlants();
          }
        }
      })
      .catch(function() {
        result.className = 'analysis-result issue';
        document.getElementById('analysisTitle').textContent = '❌ Error';
        document.getElementById('analysisText').textContent = 'Backend se connect nahi ho saka. Flask server chalao.';
      });
  };
  reader.readAsDataURL(file);
}

// ===== GUIDE MODAL =====
function openGuideModal(plantId) {
  var p = userPlants.find(function(x) { return x.id === plantId; });
  if (!p) return;
  var guide = GUIDES[p.plantId] || GUIDES.default;

  document.getElementById('guideModalTitle').textContent = p.icon + ' ' + p.hindi + ' — Growing Guide';
  document.getElementById('guideModalBody').innerHTML =
    '<div style="background:var(--green-pale);border-radius:10px;padding:0.85rem;margin-bottom:1.25rem;">' +
    '<strong>🪨 Mitti:</strong> <span style="font-size:0.85rem;">' + guide.soil + '</span></div>' +
    '<div style="margin-bottom:1rem;">' +
    '<strong>💧 Pani:</strong> <span style="font-size:0.85rem;">' + p.water + ' mein ek baar</span></div>' +
    '<div style="margin-bottom:1rem;">' +
    '<strong>📅 Season:</strong> <span style="font-size:0.85rem;">' + p.season + '</span></div>' +
    '<div style="margin-bottom:1rem;">' +
    '<strong>⏱️ Samay:</strong> <span style="font-size:0.85rem;">~' + p.totalDays + ' din</span></div>' +
    '<div style="font-weight:700;margin-bottom:0.75rem;">📋 Steps:</div>' +
    guide.steps.map(function(s, i) {
      return '<div class="guide-step">' +
        '<div class="step-num">' + (i+1) + '</div>' +
        '<div><h4>' + s.split(' ').slice(0,3).join(' ') + '</h4><p>' + s + '</p></div>' +
        '</div>';
    }).join('') +
    '<div style="margin-top:1rem;background:var(--surface2);border-radius:10px;padding:1rem;">' +
    '<strong>🌱 Growth Stages:</strong><br>' +
    p.stages.map(function(s, i) {
      var active = i === p.currentStageIdx;
      var done   = i < p.currentStageIdx;
      return '<span style="display:inline-flex;align-items:center;gap:4px;margin:3px;padding:3px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;background:' +
        (active ? 'var(--green-mid)' : done ? 'var(--green-pale)' : 'var(--border)') + ';color:' +
        (active ? 'white' : done ? 'var(--green-mid)' : 'var(--text-muted)') + ';">' +
        (done ? '✓ ' : active ? '▶ ' : '') + s + '</span>';
    }).join('') +
    '</div>';

  document.getElementById('guideModal').classList.add('open');
}

// ===== UTILS =====
function deletePlant(plantId) {
  if (!confirm('Is plant ko hatana chahte ho?')) return;
  userPlants = userPlants.filter(function(p) { return p.id !== plantId; });
  saveUserPlants();
  renderMyPlants();
}

function showSelector(showBack) {
  document.getElementById('selectorSection').style.display = 'block';
  document.getElementById('myPlantsSection').style.display = 'none';
  if (showBack !== false) document.getElementById('backBtn').style.display = 'flex';
}

function hideSelector() {
  document.getElementById('selectorSection').style.display = 'none';
  document.getElementById('myPlantsSection').style.display = 'block';
  selectedPlant = null;
  document.getElementById('growBtn').style.display = 'none';
  document.getElementById('plantGuideSection').style.display = 'none';
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(function(m) {
  m.addEventListener('click', function(e) { if (e.target === m) m.classList.remove('open'); });
});

// ===== NOTIFICATIONS (Daily reminder) =====
function checkNotifications() {
  if (!('Notification' in window)) return;
  var lastNotif = localStorage.getItem('gwm_last_notif_' + currentUser.id);
  var today = new Date().toDateString();
  if (lastNotif === today) return;

  userPlants.forEach(function(p) {
    var task = ['Pani do','Dhoop dikhao','Fertilizer do','Pruning karo','Inspect karo','Harvest ready!'];
    var msg  = p.hindi + ' ko aaj ' + (task[Math.min(p.currentStageIdx, 5)]) + '!';
    if (Notification.permission === 'granted') {
      new Notification('KisanAI 🌱 ' + p.hindi, { body: msg, icon: '/favicon.ico' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function(perm) {
        if (perm === 'granted') new Notification('KisanAI 🌱', { body: msg });
      });
    }
  });
  localStorage.setItem('gwm_last_notif_' + currentUser.id, today);
}

// ===== START =====
init();
setTimeout(checkNotifications, 2000);
