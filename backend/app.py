from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.weather import weather_bp
from routes.rain import rain_bp
from routes.crop import crop_bp
from routes.image import image_bp
from routes.chatbot import chatbot_bp
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(__name__)
CORS(app)

# Config
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Register Blueprints
app.register_blueprint(weather_bp, url_prefix='/api/weather')
app.register_blueprint(rain_bp, url_prefix='/api/rain')
app.register_blueprint(crop_bp, url_prefix='/api/crop')
app.register_blueprint(image_bp, url_prefix='/api/image')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

@app.route('/api/status')
def status():
    return {"message": "🌱 Agro Weather AI Backend Running", "status": "ok"}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5501)