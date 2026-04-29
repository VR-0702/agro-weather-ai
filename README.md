# 🌱 KisanAI — Smart Agriculture Assistant

AI-powered agriculture assistant with weather forecasting, rain prediction (ML), crop recommendations, plant disease detection, and a multilingual AI chatbot.

---

## 🚀 Quick Setup

### 1. Clone & Install

```bash
cd agro_weather_ai
pip install -r requirements.txt
```

### 2. Set API Keys

```bash
cp .env.example .env
# Edit .env with your keys:
# - GROQ_API_KEY     → Get free at https://console.groq.com
# - OPENWEATHER_API_KEY → Get free at https://openweathermap.org/api
```

### 3. Run Backend

```bash
cd backend
python app.py
# Server starts at http://localhost:5000
```

### 4. Open Frontend

Open `frontend/index.html` in your browser (or use Live Server in VS Code).

---

## 🗂️ File Structure

```
agro_weather_ai/
│
├── backend/
│   ├── app.py                    # Flask entry point
│   ├── routes/
│   │   ├── weather.py            # GET /api/weather/?city=
│   │   ├── rain.py               # POST /api/rain/predict
│   │   ├── crop.py               # GET /api/crop/?month=
│   │   ├── image.py              # POST /api/image/upload
│   │   └── chatbot.py            # POST /api/chatbot/ask
│   ├── services/
│   │   ├── weather_service.py    # OpenWeatherMap integration
│   │   ├── rain_service.py       # ML rain prediction (RandomForest)
│   │   ├── crop_service.py       # Month-wise crop data
│   │   ├── image_service.py      # Groq vision (plant image analysis)
│   │   └── chatbot_service.py    # Groq LLaMA AI chatbot
│   ├── uploads/                  # Uploaded plant images
│   └── model/
│       └── rain_model.pkl        # Auto-generated ML model
│
├── frontend/
│   ├── index.html                # Dashboard (Weather + Rain Predictor)
│   ├── crop.html                 # Crop Planner
│   ├── chatbot.html              # AI Chat (main feature)
│   ├── css/
│   │   └── style.css             # Global styles
│   └── js/
│       ├── weather.js            # Weather fetch + render
│       ├── rain.js               # Rain prediction UI
│       ├── crop.js               # Crop recommendation UI
│       └── chatbot.js            # Chat, voice, image upload
│
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/?city=Delhi` | Real-time weather |
| POST | `/api/rain/predict` | ML rain prediction |
| GET | `/api/crop/?month=6` | Crop recommendations |
| POST | `/api/image/upload` | Upload & analyze plant image |
| POST | `/api/chatbot/ask` | AI chat response |

### Example: Chat API
```bash
curl -X POST http://localhost:5000/api/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Tomato ke patte peele ho rahe hain"}'
```

### Example: Rain Prediction
```bash
curl -X POST http://localhost:5000/api/rain/predict \
  -H "Content-Type: application/json" \
  -d '{"temperature":28,"humidity":85,"pressure":1006,"cloud":75,"wind":15}'
```

---

## 🤖 AI Features

### KisanAI Chatbot
- **Model:** Groq LLaMA 3.3 70B (fast, free)
- **Languages:** English, Hindi, Hinglish (auto-detected)
- **Structured response:** Plant → Problem → Cause → Organic Solution → Chemical Solution

### Plant Image Analysis
- **Model:** Groq LLaMA 4 Scout (vision)
- Upload any plant/crop image
- Automatic disease detection and description

### Rain Prediction ML
- **Model:** Random Forest Classifier (scikit-learn)
- **Features:** Temperature, Humidity, Pressure, Cloud Cover, Wind Speed
- Auto-trains and saves model on first run

---

## 🎤 Voice Features (Frontend)

- 🎙️ **Voice Input:** Click mic button, speak in Hindi or English
- 🔊 **Voice Output:** AI responses read aloud (toggle on/off)
- Uses Web Speech API (Chrome recommended)

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, Flask-CORS |
| AI/LLM | Groq API (LLaMA 3.3 70B + LLaMA 4 Vision) |
| ML | scikit-learn (RandomForest), joblib |
| Weather | OpenWeatherMap API |
| Frontend | HTML5, CSS3, Vanilla JS |
| Voice | Web Speech API |
| Fonts | Syne + DM Sans (Google Fonts) |

---

## 🌟 Key Features Summary

✅ Real-time weather with crop impact analysis  
✅ ML-powered rain prediction  
✅ Month-wise crop recommendations (all 12 months)  
✅ AI chatbot in English/Hindi/Hinglish  
✅ Plant disease detection from images  
✅ Voice input + text-to-speech output  
✅ Works offline with demo fallbacks  
✅ Mobile-responsive design  

---

## 📞 Support

For issues, check that:
1. Backend is running at `http://localhost:5000`
2. CORS is enabled (already configured)
3. API keys are set in `.env`

Frontend works in demo mode even without backend running! 🎉
