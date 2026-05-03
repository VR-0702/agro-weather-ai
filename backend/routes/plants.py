from flask import Blueprint, request, jsonify
import secrets
from routes.auth import require_auth
from database import save_plant, get_user_plants, update_plant, delete_plant

plants_bp = Blueprint('plants', __name__)

@plants_bp.route('/', methods=['GET'])
def get_plants():
    user, err, code = require_auth()
    if err: return err, code
    plants = get_user_plants(user['id'])
    return jsonify({"success": True, "plants": plants})

@plants_bp.route('/add', methods=['POST'])
def add_plant():
    user, err, code = require_auth()
    if err: return err, code

    data = request.get_json() or {}
    required = ['plant_id','plant_name','plant_hindi','plant_icon','category','stages','total_days','water_schedule','season','start_date']
    for field in required:
        if field not in data:
            return jsonify({"success": False, "error": f"Field missing: {field}"}), 400

    plant_data = {
        'id':             secrets.token_hex(8),
        'user_id':        user['id'],
        'plant_id':       data['plant_id'],
        'plant_name':     data['plant_name'],
        'plant_hindi':    data['plant_hindi'],
        'plant_icon':     data['plant_icon'],
        'category':       data['category'],
        'stages':         str(data['stages']),
        'total_days':     int(data['total_days']),
        'water_schedule': data['water_schedule'],
        'season':         data['season'],
        'start_date':     int(data['start_date']),
        'health':         'good',
        'last_photo_date':None,
        'last_analysis':  None,
        'notes':          data.get('notes', ''),
    }
    save_plant(plant_data)
    return jsonify({"success": True, "plant_id": plant_data['id'], "message": "Plant add ho gaya!"})

@plants_bp.route('/<plant_id>', methods=['PUT'])
def update_plant_route(plant_id):
    user, err, code = require_auth()
    if err: return err, code

    data = request.get_json() or {}
    update_plant(plant_id, user['id'], data)
    return jsonify({"success": True, "message": "Plant update ho gaya!"})

@plants_bp.route('/<plant_id>', methods=['DELETE'])
def delete_plant_route(plant_id):
    user, err, code = require_auth()
    if err: return err, code

    delete_plant(plant_id, user['id'])
    return jsonify({"success": True, "message": "Plant hata diya!"})
