const AQI_INFO = [
  { label: 'Good',      color: '#4caf50', bg: '#e8f5e9', icon: '😊', crop: 'Farming ke liye perfect!' },
  { label: 'Fair',      color: '#8bc34a', bg: '#f1f8e9', icon: '🙂', crop: 'Crops ke liye theek hai.' },
  { label: 'Moderate',  color: '#ff9800', bg: '#fff3e0', icon: '😐', crop: 'Sensitive crops protect karo.' },
  { label: 'Poor',      color: '#f44336', bg: '#ffebee', icon: '😷', crop: 'Open farming avoid karo.' },
  { label: 'Very Poor', color: '#b71c1c', bg: '#ffcdd2', icon: '🚫', crop: 'Khet mein kaam mat karo!' },
];

async function loadWeather() {
  const city    = document.getElementById('cityInput')?.value?.trim() || 'Delhi';
  const display = document.getElementById('weatherDisplay');
  if (!display) return;

  display.innerHTML = `<div class="loading-overlay"><div class="spinner"></div><p>Fetching weather for <strong>${city}</strong>...</p></div>`;

  try {
    // Weather from backend
    const wRes = await fetch(`/api/weather/?city=${encodeURIComponent(city)}`);
    if (!wRes.ok) throw new Error('City not found');
    const w = await wRes.json();
    if (w.error) throw new Error(w.error);

    // AQI from backend
    const lat = w.coord?.lat;
    const lon = w.coord?.lon;
    let aqi = null;
    if (lat && lon) {
      try {
        const aqiRes  = await fetch(`/api/weather/aqi?lat=${lat}&lon=${lon}`);
        const aqiData = await aqiRes.json();
        aqi = aqiData?.list?.[0];
      } catch {}
    }

    renderWeather({
      city:        w.name,
      country:     w.sys.country,
      temperature: w.main.temp,
      temp_min:    w.main.temp_min,
      temp_max:    w.main.temp_max,
      feels_like:  w.main.feels_like,
      humidity:    w.main.humidity,
      pressure:    w.main.pressure,
      wind_speed:  Math.round(w.wind.speed * 3.6),
      wind_deg:    w.wind.deg || 0,
      clouds:      w.clouds.all,
      description: w.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()),
      icon:        w.weather[0].icon,
      visibility:  Math.round((w.visibility || 0) / 1000),
      sunrise:     w.sys.sunrise,
      sunset:      w.sys.sunset,
      aqi:         aqi ? aqi.main.aqi : null,
      pm25:        aqi ? aqi.components.pm2_5?.toFixed(1) : null,
      pm10:        aqi ? aqi.components.pm10?.toFixed(1)  : null,
      co:          aqi ? aqi.components.co?.toFixed(1)    : null,
      no2:         aqi ? aqi.components.no2?.toFixed(1)   : null,
    });

  } catch (err) {
    display.innerHTML = `<div class="alert alert-danger" style="margin:0;">❌ <strong>${err.message}</strong> — City name sahi likho</div>`;
  }
}

function windDirection(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function renderWeather(d) {
  const display  = document.getElementById('weatherDisplay');
  const iconUrl  = `https://openweathermap.org/img/wn/${d.icon}@4x.png`;
  const heatInfo = d.temperature > 40 ? { msg: '🔥 Extreme Heat!',   color: '#b71c1c' }
                 : d.temperature > 35 ? { msg: '🌡️ Heat Stress Risk', color: '#e64a19' }
                 : d.temperature < 5  ? { msg: '❄️ Frost Risk!',      color: '#1565c0' }
                 : d.temperature < 15 ? { msg: '🧥 Cold Stress',      color: '#1976d2' }
                 :                      { msg: '✅ Good for Crops',    color: '#2e7d32' };

  const aqiInfo = d.aqi ? AQI_INFO[d.aqi - 1] : null;

  display.innerHTML = `
    <div class="fade-in" style="background:linear-gradient(135deg,#1565c0 0%,#0d47a1 100%);border-radius:20px;color:white;overflow:hidden;box-shadow:0 8px 32px rgba(21,101,192,0.35);">
      <div style="display:flex;align-items:flex-start;gap:1rem;padding:1.75rem 2rem 1rem;">
        <div style="flex:1;">
          <div style="font-size:0.85rem;opacity:0.7;margin-bottom:2px;">📍 ${d.city}, ${d.country}</div>
          <div style="font-family:'Syne',sans-serif;font-size:4.5rem;font-weight:800;line-height:1;letter-spacing:-2px;">${Math.round(d.temperature)}°<span style="font-size:2rem;">C</span></div>
          <div style="font-size:1rem;opacity:0.9;margin:4px 0;">${d.description}</div>
          <div style="font-size:0.82rem;opacity:0.65;">Feels like ${Math.round(d.feels_like)}°C &nbsp;|&nbsp; H: ${Math.round(d.temp_max)}° &nbsp; L: ${Math.round(d.temp_min)}°</div>
        </div>
        <div style="text-align:right;">
          <img src="${iconUrl}" onerror="this.style.display='none'" style="width:90px;height:90px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.3));" />
          <div style="background:${heatInfo.color};border-radius:8px;padding:5px 10px;font-size:0.78rem;font-weight:700;margin-top:6px;">${heatInfo.msg}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,0.1);margin:0 1.5rem;border-radius:12px;overflow:hidden;">
        ${statBox('💧','Humidity',d.humidity+'%')}
        ${statBox('📊','Pressure',d.pressure+' hPa')}
        ${statBox('💨','Wind',d.wind_speed+' km/h '+windDirection(d.wind_deg))}
        ${statBox('☁️','Clouds',d.clouds+'%')}
        ${statBox('👁️','Visibility',d.visibility+' km')}
        ${statBox('🌅','Sunrise',formatTime(d.sunrise))}
        ${statBox('🌇','Sunset',formatTime(d.sunset))}
        ${statBox('🌡️','Max/Min',Math.round(d.temp_max)+'° / '+Math.round(d.temp_min)+'°')}
      </div>
      ${aqiInfo ? `
      <div style="margin:1rem 1.5rem;background:${aqiInfo.bg};border-radius:12px;padding:1rem 1.25rem;color:#1b2e1c;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;">
          <div>
            <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0.6;margin-bottom:4px;">🌬️ Air Quality Index</div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:${aqiInfo.color};">${d.aqi}</span>
              <div>
                <div style="font-weight:700;color:${aqiInfo.color};font-size:1rem;">${aqiInfo.icon} ${aqiInfo.label}</div>
                <div style="font-size:0.78rem;opacity:0.7;">${aqiInfo.crop}</div>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;">
            ${aqiStat('PM2.5',d.pm25,'μg/m³')}${aqiStat('PM10',d.pm10,'μg/m³')}
            ${aqiStat('CO',d.co,'μg/m³')}${aqiStat('NO₂',d.no2,'μg/m³')}
          </div>
        </div>
        <div style="margin-top:10px;">
          <div style="height:6px;border-radius:99px;background:linear-gradient(to right,#4caf50,#8bc34a,#ff9800,#f44336,#b71c1c);position:relative;">
            <div style="position:absolute;top:-3px;left:${((d.aqi-1)/4)*100}%;width:12px;height:12px;background:white;border:2px solid ${aqiInfo.color};border-radius:50%;transform:translateX(-50%);box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.65rem;opacity:0.5;margin-top:4px;">
            <span>Good</span><span>Fair</span><span>Moderate</span><span>Poor</span><span>Very Poor</span>
          </div>
        </div>
      </div>` : ''}
      <div style="padding:0.75rem 1.75rem 1.25rem;font-size:0.75rem;opacity:0.45;text-align:right;">Source: OpenWeatherMap • Updated just now</div>
    </div>`;

  if (document.getElementById('rainTemp')) {
    document.getElementById('rainTemp').value     = Math.round(d.temperature);
    document.getElementById('rainHumidity').value = d.humidity;
    document.getElementById('rainPressure').value = d.pressure;
    document.getElementById('rainCloud').value    = d.clouds;
    document.getElementById('rainWind').value     = d.wind_speed;
  }
}

function statBox(icon, label, value) {
  return `<div style="background:rgba(255,255,255,0.08);padding:0.75rem;text-align:center;"><div style="font-size:1.1rem;">${icon}</div><div style="font-size:0.7rem;opacity:0.6;margin:2px 0;text-transform:uppercase;letter-spacing:0.5px;">${label}</div><div style="font-weight:700;font-size:0.88rem;">${value}</div></div>`;
}

function aqiStat(label, val, unit) {
  return `<div style="font-size:0.75rem;"><span style="opacity:0.6;">${label}:</span> <strong>${val || 'N/A'}</strong> <span style="opacity:0.5;font-size:0.65rem;">${unit}</span></div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cityInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') loadWeather();
  });
});

// ===== LOCATION-BASED CROP RECOMMENDATION =====
async function getLocationAndRecommend() {
  const btn = document.getElementById('locationBtn');
  const box = document.getElementById('cropRecoBox');
  if (btn) { btn.disabled = true; btn.textContent = 'Locating...'; }
  if (box) box.innerHTML = '<div class="loading-overlay"><div class="spinner"></div><p>Location dhundh raha hun...</p></div>';

  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
    );
    const { latitude: lat, longitude: lon } = pos.coords;

    // Reverse geocode — backend se
    const geoRes  = await fetch(`/api/weather/geo?lat=${lat}&lon=${lon}`);
    const geoData = await geoRes.json();
    const city    = geoData[0]?.name || 'Your Location';
    const state   = geoData[0]?.state || '';

    const cityInput = document.getElementById('cityInput');
    if (cityInput) cityInput.value = city;

    // Weather by coords — backend se
    const wRes = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`);
    const w    = await wRes.json();

    const temp     = w.main.temp;
    const humidity = w.main.humidity;
    const clouds   = w.clouds.all;
    const month    = new Date().getMonth() + 1;

    await loadWeather();

    const crops = getWeatherBasedCrops(temp, humidity, clouds, month);
    renderCropReco(city, state, temp, humidity, month, crops);

  } catch (err) {
    // City fallback
    const city = document.getElementById('cityInput')?.value?.trim() || 'Delhi';
    try {
      const wRes = await fetch(`/api/weather/?city=${encodeURIComponent(city)}`);
      const w    = await wRes.json();
      const month = new Date().getMonth() + 1;
      renderCropReco(city, '', w.main.temp, w.main.humidity, month,
        getWeatherBasedCrops(w.main.temp, w.main.humidity, w.clouds.all, month));
    } catch {
      if (box) box.innerHTML = '<div class="alert alert-danger">Location detect nahi hua. City manually enter karo.</div>';
    }
  }

  if (btn) { btn.disabled = false; btn.textContent = '📍 My Location Use Karo'; }
}

function getWeatherBasedCrops(temp, humidity, clouds, month) {
  const crops = [];
  const isKharif = month >= 6 && month <= 9;
  const isRabi   = month >= 10 || month <= 2;
  const isZaid   = month >= 3 && month <= 5;

  if (temp >= 25 && temp <= 38 && humidity >= 60 && isKharif) {
    crops.push({ name: 'धान (चावल)', reason: `${Math.round(temp)}°C aur ${humidity}% humidity — paddy perfect`, water: 'adhik', profit: 'adhik' });
    crops.push({ name: 'मक्का',      reason: 'Monsoon mein best kharif crop', water: 'madhyam', profit: 'adhik' });
    crops.push({ name: 'अरहर दाल',  reason: 'Kharif mein best legume crop', water: 'kam', profit: 'adhik' });
    crops.push({ name: 'मूंगफली',   reason: 'Warm humid conditions perfect', water: 'madhyam', profit: 'madhyam' });
  }
  if (temp >= 30 && humidity < 50 && isZaid) {
    crops.push({ name: 'मूंग दाल',  reason: `${Math.round(temp)}°C par fast growing`, water: 'kam', profit: 'madhyam' });
    crops.push({ name: 'तरबूज',     reason: 'Garmi mein best cash crop', water: 'madhyam', profit: 'adhik' });
    crops.push({ name: 'भिंडी',     reason: 'Heat tolerant vegetable', water: 'kam', profit: 'madhyam' });
    crops.push({ name: 'लौकी',      reason: 'Summer mein fast growth', water: 'madhyam', profit: 'madhyam' });
  }
  if (temp < 22 && isRabi) {
    crops.push({ name: 'गेहूं',     reason: `${Math.round(temp)}°C — gehu ke liye ideal`, water: 'madhyam', profit: 'adhik' });
    crops.push({ name: 'सरसों',    reason: 'Thandi mein best oil crop', water: 'kam', profit: 'adhik' });
    crops.push({ name: 'चना',      reason: 'Winter legume — kam paani', water: 'bahut kam', profit: 'madhyam' });
    crops.push({ name: 'मटर',      reason: 'Cool weather — high price', water: 'madhyam', profit: 'adhik' });
    crops.push({ name: 'आलू',      reason: 'Sardi mein high yield', water: 'adhik', profit: 'adhik' });
  }
  if (temp >= 20 && temp < 30) {
    if (isKharif) crops.push({ name: 'सोयाबीन', reason: 'Moderate temp + monsoon best', water: 'madhyam', profit: 'adhik' });
    crops.push({ name: 'टमाटर', reason: '20-25°C tomato ke liye best', water: 'madhyam', profit: 'adhik' });
  }
  if (clouds >= 60) crops.push({ name: 'पत्तागोभी', reason: 'Overcast conditions perfect', water: 'madhyam', profit: 'madhyam' });
  if (crops.length === 0) {
    crops.push({ name: 'गेहूं', reason: 'Har mausam reliable crop', water: 'madhyam', profit: 'adhik' });
    crops.push({ name: 'सब्जियां', reason: 'Local vegetables profitable', water: 'madhyam', profit: 'madhyam' });
  }
  return crops.slice(0, 6);
}

const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WATER_COLOR  = { 'adhik':'#2196f3', 'madhyam':'#4caf50', 'kam':'#ff9800', 'bahut kam':'#f44336' };
const PROFIT_COLOR = { 'adhik':'#4caf50', 'madhyam':'#ff9800', 'kam':'#f44336' };

function renderCropReco(city, state, temp, humidity, month, crops) {
  const box = document.getElementById('cropRecoBox');
  if (!box) return;
  const sec = document.getElementById('cropRecoSection');
  if (sec) { sec.style.display = 'block'; sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  const season = (month >= 6 && month <= 9) ? 'खरीफ' : (month >= 10 || month <= 2) ? 'रबी' : 'जायद';

  box.innerHTML = `
    <div style="background:white;border-radius:16px;border:1px solid var(--border);overflow:hidden;box-shadow:var(--shadow-sm);">
      <div style="background:linear-gradient(135deg,var(--green-deep),#2e7d32);color:white;padding:1.25rem 1.5rem;">
        <div style="font-size:0.75rem;opacity:0.7;margin-bottom:4px;">आपकी लोकेशन के अनुसार</div>
        <div style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;">${city}${state ? ', '+state : ''}</div>
        <div style="display:flex;gap:1rem;margin-top:0.75rem;flex-wrap:wrap;">
          <span style="background:rgba(255,255,255,0.15);border-radius:8px;padding:4px 12px;font-size:0.82rem;">${Math.round(temp)}°C तापमान</span>
          <span style="background:rgba(255,255,255,0.15);border-radius:8px;padding:4px 12px;font-size:0.82rem;">${humidity}% नमी</span>
          <span style="background:rgba(255,255,255,0.15);border-radius:8px;padding:4px 12px;font-size:0.82rem;">${MONTH_NAMES[month-1]} — ${season} सीजन</span>
        </div>
      </div>
      <div style="padding:1.25rem 1.5rem;">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.95rem;color:var(--green-deep);margin-bottom:1rem;">इस मौसम में बोएं ये फसलें</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem;">
          ${crops.map((c,i) => `
            <div style="border:1.5px solid var(--border);border-radius:12px;padding:1rem;transition:all 0.2s;" 
                 onmouseover="this.style.borderColor='var(--green-bright)'" onmouseout="this.style.borderColor='var(--border)'">
              <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;margin-bottom:6px;">${c.name}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;line-height:1.4;">${c.reason}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <span style="background:${WATER_COLOR[c.water]}22;color:${WATER_COLOR[c.water]};border-radius:6px;padding:2px 8px;font-size:0.72rem;font-weight:600;">पानी: ${c.water}</span>
                <span style="background:${PROFIT_COLOR[c.profit]}22;color:${PROFIT_COLOR[c.profit]};border-radius:6px;padding:2px 8px;font-size:0.72rem;font-weight:600;">मुनाफा: ${c.profit}</span>
              </div>
            </div>`).join('')}
        </div>
        <div style="margin-top:1rem;text-align:center;">
          <a href="chatbot.html" 
             onclick="sessionStorage.setItem('cropQuery','${city} mein ${MONTH_NAMES[month-1]} mein ${Math.round(temp)} degree temperature aur ${humidity}% humidity hai — kaunsi fasal best rahegi?')"
             class="btn btn-primary" style="font-size:0.85rem;">AI se aur detail poochho</a>
        </div>
      </div>
    </div>`;
}