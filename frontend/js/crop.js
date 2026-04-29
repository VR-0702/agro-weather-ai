const CROP_API        = 'http://localhost:5501/api/crop';


const OPENWEATHER_KEY = CONFIG.OPENWEATHER_KEY; 
const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

const SEASON_CLASSES = { Rabi:'season-rabi', Kharif:'season-kharif', Zaid:'season-zaid' };
const SEASON_ICONS   = { Rabi:'❄️', Kharif:'☔', Zaid:'☀️' };
const WATER_COLORS   = { Low:'#4caf50', Medium:'#2196f3', High:'#f44336' };

// Full crop database — all 12 months with detailed info
const CROP_DB = {
  1:  { month:'January',   season:'Rabi',   crops:[
    {name:'Wheat',       emoji:'🌾', duration:'120-150 days', water:'Medium', soil:'Loamy',  tip:'Irrigate at crown root initiation stage. Watch for yellow rust disease.'},
    {name:'Mustard',     emoji:'🌻', duration:'110-140 days', water:'Low',    soil:'Sandy',  tip:'Apply sulfur fertilizer @ 20 kg/acre. Check for aphid infestation.'},
    {name:'Peas',        emoji:'🫛', duration:'60-90 days',   water:'Medium', soil:'Loamy',  tip:'Harvest when pods are plump but still green. Avoid waterlogging.'},
    {name:'Potato',      emoji:'🥔', duration:'70-120 days',  water:'High',   soil:'Sandy',  tip:'Earthing-up at 30 days increases yield. Watch for late blight.'},
    {name:'Gram/Chana',  emoji:'🫘', duration:'90-120 days',  water:'Low',    soil:'Clay',   tip:'Drought tolerant. Avoid excess irrigation — causes fungal issues.'},
  ]},
  2:  { month:'February',  season:'Rabi',   crops:[
    {name:'Wheat',       emoji:'🌾', duration:'120-150 days', water:'Medium', soil:'Loamy',  tip:'Last irrigation before grain filling. Apply urea top dressing.'},
    {name:'Barley',      emoji:'🌾', duration:'90-120 days',  water:'Low',    soil:'Sandy',  tip:'Best for saline/alkaline soils. Less water than wheat.'},
    {name:'Sunflower',   emoji:'🌻', duration:'90-120 days',  water:'Medium', soil:'Loamy',  tip:'Sow now for summer harvest. Needs full sunlight.'},
    {name:'Onion',       emoji:'🧅', duration:'100-120 days', water:'Medium', soil:'Loamy',  tip:'Transplant seedlings now. Stop irrigation 10 days before harvest.'},
  ]},
  3:  { month:'March',     season:'Zaid',   crops:[
    {name:'Mung Bean',   emoji:'🫘', duration:'60-75 days',   water:'Medium', soil:'Loamy',  tip:'Quick growing summer crop. Fixes nitrogen in soil.'},
    {name:'Watermelon',  emoji:'🍉', duration:'80-110 days',  water:'High',   soil:'Sandy',  tip:'Needs warm weather. 3m spacing between plants.'},
    {name:'Cucumber',    emoji:'🥒', duration:'50-70 days',   water:'High',   soil:'Loamy',  tip:'Train vines on trellis. Harvest every 2-3 days.'},
    {name:'Bottle Gourd',emoji:'🟢🥒🌿', duration:'60-90 days',   water:'Medium', soil:'Loamy',  tip:'Fast growing. Good market price in summer.'},
    {name:'Bitter Gourd',emoji:'🥬', duration:'55-75 days',   water:'Medium', soil:'Loamy',  tip:'Rich in medicinal value. Good export demand.'},
  ]},
  4:  { month:'April',     season:'Zaid',   crops:[
    {name:'Okra/Bhindi', emoji:'🌿', duration:'50-65 days',   water:'Medium', soil:'Sandy',  tip:'Direct sow. Harvest every 2 days for tender pods.'},
    {name:'Cowpea',      emoji:'🫘', duration:'60-90 days',   water:'Low',    soil:'Sandy',  tip:'Drought tolerant. Dual purpose — grain + fodder.'},
    {name:'Maize',       emoji:'🌽', duration:'80-110 days',  water:'Medium', soil:'Loamy',  tip:'Pre-kharif sowing. Needs good drainage.'},
    {name:'Pumpkin',     emoji:'🎃', duration:'90-120 days',  water:'Medium', soil:'Loamy',  tip:'Large spreading vine. 3x3m spacing needed.'},
  ]},
  5:  { month:'May',       season:'Kharif', crops:[
    {name:'Sugarcane',   emoji:'🎋', duration:'10-12 months', water:'High',   soil:'Clay',   tip:'Plant early for better yield. Needs frequent irrigation in May.'},
    {name:'Cotton',      emoji:'🌿', duration:'150-180 days', water:'Medium', soil:'Black',  tip:'Choose BT cotton varieties. Sow before monsoon.'},
    {name:'Sesame',      emoji:'🌾', duration:'70-90 days',   water:'Low',    soil:'Sandy',  tip:'Very heat tolerant. Good oil crop for dry areas.'},
    {name:'Moong',       emoji:'🫘', duration:'60-75 days',   water:'Low',    soil:'Loamy',  tip:'Short duration. Can be grown between two main crops.'},
  ]},
  6:  { month:'June',      season:'Kharif', crops:[
    {name:'Rice/Paddy',  emoji:'🌾', duration:'110-150 days', water:'High',   soil:'Clay',   tip:'Transplant after monsoon onset. Maintain 5cm water level.'},
    {name:'Maize',       emoji:'🌽', duration:'80-110 days',  water:'Medium', soil:'Loamy',  tip:'Sow with first monsoon rain. Best kharif crop.'},
    {name:'Soybean',     emoji:'🫘', duration:'90-120 days',  water:'Medium', soil:'Loamy',  tip:'Needs warm & moist conditions. Apply Rhizobium culture.'},
    {name:'Groundnut',   emoji:'🥜', duration:'100-130 days', water:'Medium', soil:'Sandy',  tip:'Kharif groundnut season. Apply gypsum at flowering.'},
    {name:'Arhar/Tur',   emoji:'🫛', duration:'120-180 days', water:'Low',    soil:'Sandy',  tip:'Drought tolerant. Long duration — plan accordingly.'},
  ]},
  7:  { month:'July',      season:'Kharif', crops:[
    {name:'Rice/Paddy',  emoji:'🌾', duration:'110-150 days', water:'High',   soil:'Clay',   tip:'Maintain water level. Apply nitrogen fertilizer at tillering.'},
    {name:'Soybean',     emoji:'🫘', duration:'90-120 days',  water:'Medium', soil:'Loamy',  tip:'Apply phosphate fertilizer. Watch for stem fly attack.'},
    {name:'Pigeon Pea',  emoji:'🫛', duration:'120-180 days', water:'Low',    soil:'Sandy',  tip:'Drought tolerant. Do not waterlog — roots will rot.'},
    {name:'Turmeric',    emoji:'🌿', duration:'210-270 days', water:'High',   soil:'Loamy',  tip:'Plant in ridges. Mulching reduces water loss.'},
    {name:'Ginger',      emoji:'🫚', duration:'180-240 days', water:'High',   soil:'Loamy',  tip:'Partial shade preferred. Rich organic matter needed.'},
  ]},
  8:  { month:'August',    season:'Kharif', crops:[
    {name:'Rice/Paddy',  emoji:'🌾', duration:'110-150 days', water:'High',   soil:'Clay',   tip:'Pod development stage. Watch for neck blast disease.'},
    {name:'Groundnut',   emoji:'🥜', duration:'100-130 days', water:'Medium', soil:'Sandy',  tip:'Pod development stage. Stop irrigation 2 weeks before harvest.'},
    {name:'Maize',       emoji:'🌽', duration:'80-110 days',  water:'Medium', soil:'Loamy',  tip:'Silking/tasseling stage. Critical irrigation period.'},
    {name:'Vegetables',  emoji:'🥬', duration:'30-60 days',   water:'Medium', soil:'Loamy',  tip:'Sow leafy vegetables for September harvest.'},
  ]},
  9:  { month:'September', season:'Rabi',   crops:[
    {name:'Carrot',      emoji:'🥕', duration:'70-80 days',   water:'Medium', soil:'Sandy',  tip:'Loose sandy soil needed for straight roots. Thin seedlings.'},
    {name:'Spinach',     emoji:'🥬', duration:'40-50 days',   water:'Medium', soil:'Loamy',  tip:'Cool weather crop. Quick harvest. High nutritional value.'},
    {name:'Fenugreek',   emoji:'🌿', duration:'25-30 days',   water:'Low',    soil:'Loamy',  tip:'Very fast growing. Leaves + seeds both valuable.'},
    {name:'Coriander',   emoji:'🌿', duration:'40-45 days',   water:'Low',    soil:'Loamy',  tip:'Sow densely for leaf harvest, sparse for seeds.'},
    {name:'Radish',      emoji:'🫛', duration:'25-40 days',   water:'Medium', soil:'Sandy',  tip:'Fastest vegetable. Ready in 25 days.'},
  ]},
  10: { month:'October',   season:'Rabi',   crops:[
    {name:'Wheat',       emoji:'🌾', duration:'120-150 days', water:'Medium', soil:'Loamy',  tip:'Timely sowing gives 15-20% more yield. Use certified seeds.'},
    {name:'Chickpea',    emoji:'🫘', duration:'90-120 days',  water:'Low',    soil:'Sandy',  tip:'Sow in well-drained loamy soil. Excellent dryland crop.'},
    {name:'Lentil/Masoor',emoji:'🫘',duration:'80-110 days',  water:'Low',    soil:'Loamy',  tip:'Very low water requirement. Good for rainfed areas.'},
    {name:'Mustard',     emoji:'🌻', duration:'110-140 days', water:'Low',    soil:'Sandy',  tip:'Best sowing time in India. High oil content varieties available.'},
    {name:'Garlic',      emoji:'🧄', duration:'130-180 days', water:'Medium', soil:'Loamy',  tip:'Plant cloves 5cm deep. Good export value.'},
  ]},
  11: { month:'November',  season:'Rabi',   crops:[
    {name:'Wheat',       emoji:'🌾', duration:'120-150 days', water:'Medium', soil:'Loamy',  tip:'Late sowing — use late sown varieties. Still good yield possible.'},
    {name:'Peas',        emoji:'🫛', duration:'60-90 days',   water:'Medium', soil:'Loamy',  tip:'Cold weather enhances sweetness. Harvest before pods dry.'},
    {name:'Cauliflower', emoji:'🥦', duration:'60-90 days',   water:'Medium', soil:'Loamy',  tip:'Transplant 4-week old seedlings. Tie leaves to protect curd.'},
    {name:'Cabbage',     emoji:'🥬', duration:'70-90 days',   water:'Medium', soil:'Loamy',  tip:'Cool weather crop. Apply boron for better head formation.'},
    {name:'Potato',      emoji:'🥔', duration:'70-120 days',  water:'High',   soil:'Sandy',  tip:'Late planting but good yield possible. Watch for frost.'},
  ]},
  12: { month:'December',  season:'Rabi',   crops:[
    {name:'Wheat',       emoji:'🌾', duration:'120-150 days', water:'Medium', soil:'Loamy',  tip:'First irrigation 21 days after sowing. Critical for germination.'},
    {name:'Tomato',      emoji:'🍅', duration:'70-90 days',   water:'Medium', soil:'Loamy',  tip:'Protect from frost with polythene cover. High winter prices.'},
    {name:'Cauliflower', emoji:'🥦', duration:'60-90 days',   water:'Medium', soil:'Loamy',  tip:'Winter cauliflower harvest. Blanch by tying outer leaves.'},
    {name:'Peas',        emoji:'🫛', duration:'60-90 days',   water:'Medium', soil:'Loamy',  tip:'Late December sowing still possible in mild climates.'},
    {name:'Broccoli',    emoji:'🥦', duration:'60-80 days',   water:'Medium', soil:'Loamy',  tip:'Better price than cauliflower. Cold weather improves quality.'},
  ]},
};

let selectedMonth = new Date().getMonth() + 1;
let currentTemp   = null;
let currentCity   = null;

// Fetch live temp to give weather-based tips
async function fetchCurrentWeather() {
  const city = prompt('Apni city enter karo (weather-based tips ke liye):', 'Delhi') || 'Delhi';
  currentCity = city;
  if (OPENWEATHER_KEY === 'YAHAN_APNI_KEY_DAALO') return;
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`);
    const d   = await res.json();
    currentTemp = d.main?.temp;
  } catch {}
}

function initMonthTabs() {
  const tabsEl = document.getElementById('monthTabs');
  MONTHS.forEach((name, idx) => {
    const month = idx + 1;
    const btn   = document.createElement('button');
    btn.className = 'month-tab' + (month === selectedMonth ? ' active' : '');
    btn.innerHTML = `<span>${name.slice(0,3)}</span>`;
    btn.onclick   = () => loadCrops(month);
    tabsEl.appendChild(btn);
  });
}

async function loadCrops(month) {
  selectedMonth = month;
  document.querySelectorAll('.month-tab').forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === month);
  });

  const grid = document.getElementById('cropGrid');
  grid.innerHTML = `<div class="loading-overlay" style="grid-column:1/-1;"><div class="spinner"></div><p>Loading crops...</p></div>`;

  // Use local DB (accurate, no API needed)
  const data = CROP_DB[month];
  renderCrops(data, month);
}

function renderCrops(data, month) {
  const grid  = document.getElementById('cropGrid');
  const title = document.getElementById('selectedMonthTitle');
  const sub   = document.getElementById('selectedMonthSub');
  const badge = document.getElementById('seasonBadge');

  title.textContent = `${MONTHS[month-1]} — Best Crops`;
  sub.textContent   = `${data.crops.length} recommended crops • ${data.season} Season`;
  badge.innerHTML   = `<div class="season-banner ${SEASON_CLASSES[data.season] || 'season-rabi'}">${SEASON_ICONS[data.season]} ${data.season} Season</div>`;

  // Weather-based tip banner
  let weatherTip = '';
  if (currentTemp !== null) {
    const tipColor = currentTemp > 35 ? '#ffebee' : currentTemp < 10 ? '#e3f2fd' : '#e8f5e9';
    const tipText  = currentTemp > 35
      ? `🌡️ ${currentCity} mein aaj ${Math.round(currentTemp)}°C — garmi zyada hai, irrigation double karo!`
      : currentTemp < 10
      ? `❄️ ${currentCity} mein aaj ${Math.round(currentTemp)}°C — frost se crops protect karo!`
      : `✅ ${currentCity} mein aaj ${Math.round(currentTemp)}°C — farming ke liye perfect conditions!`;
    weatherTip = `<div style="background:${tipColor}; border-radius:12px; padding:0.85rem 1.25rem; margin-bottom:1.5rem; font-size:0.9rem; border-left:4px solid var(--green-bright);">${tipText}</div>`;
  }

  grid.innerHTML = weatherTip + data.crops.map((crop, i) => `
    <div class="crop-detail-card fade-in" style="animation-delay:${i * 0.07}s;">
      <div style="font-size:3rem; margin-bottom:0.75rem; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.15));">${crop.emoji}</div>
      <div class="crop-name" style="font-size:1.15rem;">${crop.name}</div>

      <div class="crop-stat-row" style="margin-top:0.6rem;">
        <span class="badge badge-green">⏱️ ${crop.duration}</span>
        <span class="badge" style="background:#e3f2fd; color:#1565c0;">🪨 ${crop.soil} Soil</span>
      </div>

      <div style="margin-top:0.6rem;">
        <span class="badge" style="background:${crop.water==='Low'?'#e8f5e9':crop.water==='High'?'#ffebee':'#e3f2fd'}; color:${WATER_COLORS[crop.water]};">
          💧 ${crop.water} Water Need
        </span>
      </div>

      <div class="tip-box" style="margin-top:1rem;">💡 ${crop.tip}</div>

      <div style="margin-top:1rem;">
        <a href="chatbot.html"
           onclick="sessionStorage.setItem('cropQuery','${MONTHS[month-1]} mein ${crop.name} ki kheti ke baare mein batao — best practices, fertilizer, aur disease prevention')"
           class="btn btn-secondary btn-sm" style="width:100%;">
          🤖 ${crop.name} ke baare mein poochho
        </a>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initMonthTabs();
  loadCrops(selectedMonth);
});
