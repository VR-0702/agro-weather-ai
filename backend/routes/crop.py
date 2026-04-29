from flask import Blueprint, request, jsonify
from services.crop_service import get_crops_for_month

crop_bp = Blueprint('crop', __name__)

@crop_bp.route('/', methods=['GET'])
def crops():
    month = request.args.get('month', None)
    try:
        data = get_crops_for_month(month)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
