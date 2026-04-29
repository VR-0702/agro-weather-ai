from flask import Blueprint, request, jsonify
import requests, os

weather_bp = Blueprint('weather', __name__)
KEY = lambda: os.environ.get('OPENWEATHER_API_KEY', '')

@weather_bp.route('/', methods=['GET'])
def weather():
    city = request.args.get('city', 'Delhi')
    try:
        res = requests.get('https://api.openweathermap.org/data/2.5/weather',
            params={'q': city, 'appid': KEY(), 'units': 'metric'}, timeout=10)
        res.raise_for_status()
        return jsonify(res.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@weather_bp.route('/coords', methods=['GET'])
def weather_coords():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    try:
        res = requests.get('https://api.openweathermap.org/data/2.5/weather',
            params={'lat': lat, 'lon': lon, 'appid': KEY(), 'units': 'metric'}, timeout=10)
        return jsonify(res.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@weather_bp.route('/aqi', methods=['GET'])
def aqi():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    try:
        res = requests.get('https://api.openweathermap.org/data/2.5/air_pollution',
            params={'lat': lat, 'lon': lon, 'appid': KEY()}, timeout=10)
        return jsonify(res.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@weather_bp.route('/geo', methods=['GET'])
def geo():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    try:
        res = requests.get('https://api.openweathermap.org/geo/1.0/reverse',
            params={'lat': lat, 'lon': lon, 'limit': 1, 'appid': KEY()}, timeout=10)
        return jsonify(res.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
