from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.weather import weather_bp
from routes.rain    import rain_bp
from routes.crop    import crop_bp
from routes.image   import image_bp
from routes.chatbot import chatbot_bp
from routes.auth    import auth_bp
from routes.plants  import plants_bp
from database import init_db
import os, pathlib

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

# ===== Auto-generate config.js from environment (for Replit) =====
groq_key        = os.environ.get('GROQ_API_KEY', '')
openweather_key = os.environ.get('OPENWEATHER_API_KEY', '')
config_path     = os.path.join(FRONTEND_DIR, 'config.js')
if groq_key or openweather_key:
    pathlib.Path(config_path).write_text(f"""const CONFIG = {{
  GROQ_API_KEY:    "{groq_key}",
  OPENWEATHER_KEY: "{openweather_key}"
}};""")
    print("✅ config.js generated from environment!")

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['UPLOAD_FOLDER']       = os.path.join(BASE_DIR, 'uploads')
app.config['MAX_CONTENT_LENGTH']  = 16 * 1024 * 1024
app.config['SECRET_KEY']          = os.environ.get('SECRET_KEY', 'kisanai-secret-change-in-prod')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Init DB
init_db()

# Register Blueprints
app.register_blueprint(weather_bp, url_prefix='/api/weather')
app.register_blueprint(rain_bp,    url_prefix='/api/rain')
app.register_blueprint(crop_bp,    url_prefix='/api/crop')
app.register_blueprint(image_bp,   url_prefix='/api/image')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
app.register_blueprint(auth_bp,    url_prefix='/api/auth')
app.register_blueprint(plants_bp,  url_prefix='/api/plants')

# Serve frontend
@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

@app.route('/api/status')
def status():
    return {"message": "🌱 KisanAI Backend Running", "status": "ok"}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
