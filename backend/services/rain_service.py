import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'rain_model.pkl')

def _train_and_save_model():
    """Train a basic rain prediction model and save it."""
    # Synthetic training data: [temp, humidity, pressure, cloud, wind]
    # Label: 1=Rain, 0=No Rain
    X = np.array([
        [35, 90, 1005, 80, 15],   # Rain
        [28, 85, 1008, 75, 12],   # Rain
        [22, 95, 1003, 90, 20],   # Rain
        [18, 88, 1006, 85, 18],   # Rain
        [30, 92, 1004, 88, 14],   # Rain
        [25, 78, 1010, 60, 8],    # Rain
        [20, 82, 1007, 70, 10],   # Rain
        [33, 87, 1006, 78, 16],   # Rain
        [15, 93, 1002, 92, 22],   # Rain
        [27, 89, 1005, 82, 13],   # Rain
        [38, 30, 1020, 5, 5],     # No Rain
        [40, 25, 1022, 3, 4],     # No Rain
        [35, 35, 1018, 10, 6],    # No Rain
        [32, 40, 1019, 15, 7],    # No Rain
        [30, 45, 1017, 20, 5],    # No Rain
        [28, 50, 1016, 25, 8],    # No Rain
        [25, 55, 1015, 30, 6],    # No Rain
        [22, 42, 1018, 12, 4],    # No Rain
        [36, 28, 1021, 8, 3],     # No Rain
        [34, 38, 1019, 18, 9],    # No Rain
    ])
    y = np.array([1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0])

    model = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    model.fit(X, y)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model

def _load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return _train_and_save_model()

_model = None

def predict_rain(temperature, humidity, pressure, cloud, wind) -> dict:
    global _model
    if _model is None:
        _model = _load_model()

    features = np.array([[temperature, humidity, pressure, cloud, wind]])
    prediction = _model.predict(features)[0]
    proba = _model.predict_proba(features)[0]

    return {
        "will_rain": bool(prediction),
        "rain_probability": round(float(proba[1]) * 100, 1),
        "no_rain_probability": round(float(proba[0]) * 100, 1),
        "message": "🌧️ Rain expected today!" if prediction else "☀️ No rain expected today."
    }
