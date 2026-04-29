const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// =============================
// 🌤️ WEATHER BY CITY
// =============================
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;
  const API_KEY = process.env.OPENWEATHER_KEY;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.json({ error: "Weather fetch failed" });
  }
});

// =============================
// 🌬️ AIR QUALITY INDEX (AQI)
// =============================
app.get("/api/weather/aqi", async (req, res) => {
  const { lat, lon } = req.query;
  const API_KEY = process.env.OPENWEATHER_KEY;

  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.json({ error: "AQI fetch failed" });
  }
});

// =============================
// 📍 REVERSE GEO (LAT/LON → CITY)
// =============================
app.get("/api/weather/geo", async (req, res) => {
  const { lat, lon } = req.query;
  const API_KEY = process.env.OPENWEATHER_KEY;

  try {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.json({ error: "Geo fetch failed" });
  }
});

// =============================
// 📡 WEATHER BY COORDINATES
// =============================
app.get("/api/weather/coords", async (req, res) => {
  const { lat, lon } = req.query;
  const API_KEY = process.env.OPENWEATHER_KEY;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.json({ error: "Coords weather failed" });
  }
});

// =============================
// 🚀 START SERVER
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});