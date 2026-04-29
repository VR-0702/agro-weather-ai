from flask import Blueprint, request, jsonify
from services.rain_service import predict_rain

rain_bp = Blueprint('rain', __name__)

@rain_bp.route('/predict', methods=['POST'])
def rain_predict():
    data = request.get_json()
    try:
        result = predict_rain(
            temperature=data.get('temperature', 25),
            humidity=data.get('humidity', 60),
            pressure=data.get('pressure', 1013),
            cloud=data.get('cloud', 40),
            wind=data.get('wind', 10)
        )
        return jsonify({"success": True, "prediction": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
