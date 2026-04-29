const RAIN_API = 'http://localhost:5501/api/rain';

async function predictRain() {
  const temp     = parseFloat(document.getElementById('rainTemp').value);
  const humidity = parseFloat(document.getElementById('rainHumidity').value);
  const pressure = parseFloat(document.getElementById('rainPressure').value);
  const cloud    = parseFloat(document.getElementById('rainCloud').value);
  const wind     = parseFloat(document.getElementById('rainWind').value);

  const resultDiv = document.getElementById('rainResult');
  resultDiv.innerHTML = `<div class="loading-overlay"><div class="spinner"></div><p>Running ML model...</p></div>`;

  try {
    const res = await fetch(`${RAIN_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature: temp, humidity, pressure, cloud, wind })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    renderRainResult(json.prediction);
  } catch {
    // Demo fallback based on simple heuristic
    const rainProb = Math.min(99, Math.max(1,
      Math.round((humidity * 0.4) + (cloud * 0.3) + ((100 - pressure + 1013) * 0.5) - (temp * 0.3))
    ));
    renderRainResult({
      will_rain: rainProb > 55,
      rain_probability: rainProb,
      no_rain_probability: 100 - rainProb,
      message: rainProb > 55 ? '🌧️ Rain expected today!' : '☀️ No rain expected today.'
    });
  }
}

function renderRainResult(data) {
  const resultDiv = document.getElementById('rainResult');
  const pct = data.rain_probability;
  const deg = Math.round(pct * 3.6); // 0-360 degrees for conic
  const color = data.will_rain ? '#1565c0' : '#f9a825';
  const bgColor = data.will_rain ? '#e3f2fd' : '#fff8e1';
  const icon = data.will_rain ? '🌧️' : '☀️';
  const tips = data.will_rain
    ? ['Cover sensitive crops with shade nets', 'Ensure proper field drainage', 'Postpone pesticide spraying', 'Harvest mature crops if possible']
    : ['Good time for fertilizer application', 'Schedule irrigation today', 'Ideal for pesticide spraying', 'Good for field operations'];

  resultDiv.innerHTML = `
    <div style="text-align:center; padding:1rem 0;" class="fade-in">
      <div style="
        width:140px; height:140px; border-radius:50%;
        background: conic-gradient(${color} ${deg}deg, #e0e0e0 ${deg}deg);
        display:flex; align-items:center; justify-content:center;
        margin:0 auto 1rem; position:relative;
      ">
        <div style="
          width:100px; height:100px; background:white;
          border-radius:50%; position:absolute;
          display:flex; align-items:center; justify-content:center;
        ">
          <span style="font-family:'Syne',sans-serif; font-size:1.5rem; font-weight:800; color:${color};">${pct}%</span>
        </div>
      </div>

      <div style="font-size:2rem; margin-bottom:0.5rem;">${icon}</div>
      <div style="font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; margin-bottom:0.25rem;">${data.message}</div>
      <div style="font-size:0.85rem; color:var(--text-muted);">Rain probability: ${pct}% | No rain: ${data.no_rain_probability}%</div>

      <div style="background:${bgColor}; border-radius:12px; padding:1rem; margin-top:1.25rem; text-align:left;">
        <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.5rem; color:var(--text);">💡 Farming Tips for Today:</div>
        ${tips.map(t => `<div style="font-size:0.83rem; color:var(--text-muted); padding:2px 0;">• ${t}</div>`).join('')}
      </div>
    </div>`;
}
