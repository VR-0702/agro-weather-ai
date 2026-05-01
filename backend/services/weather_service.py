import requests
import os

# SAHI
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

def get_weather_data(city: str) -> dict:
    """Fetch real-time weather for a given city."""
    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }
    response = requests.get(BASE_URL, params=params, timeout=10)
    response.raise_for_status()
    raw = response.json()

    return {
        "city": raw["name"],
        "country": raw["sys"]["country"],
        "temperature": raw["main"]["temp"],
        "feels_like": raw["main"]["feels_like"],
        "humidity": raw["main"]["humidity"],
        "pressure": raw["main"]["pressure"],
        "wind_speed": raw["wind"]["speed"],
        "clouds": raw["clouds"]["all"],
        "description": raw["weather"][0]["description"].capitalize(),
        "icon": raw["weather"][0]["icon"],
        "visibility": raw.get("visibility", 0) // 1000,  # km
    }
