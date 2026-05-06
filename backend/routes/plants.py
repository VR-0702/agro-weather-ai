from flask import Blueprint, request, jsonify
import secrets
from routes.auth import require_auth
from database import save_plant, get_user_plants, update_plant, delete_plant

plants_bp = Blueprint('plants', __name__)

@plants_bp.route('/', methods=['GET'])
def get_plants():
    user, err, code = require_auth()
    if err: return err, code
    return jsonify({"success": True, "plants": get_user_plants(user['id'])})

@plants_bp.route('/add', methods=['POST'])
def add_plant():
    user, err, code = require_auth()
    if err: return err, code
    d = request.get_json() or {}
    plant = {
        'id':             secrets.token_hex(8),
        'user_id':        user['id'],
        'plant_id':       d.get('plant_id',''),
        'plant_name':     d.get('plant_name',''),
        'plant_hindi':    d.get('plant_hindi',''),
        'plant_icon':     d.get('plant_icon',''),
        'category':       d.get('category',''),
        'stages':         str(d.get('stages',[])),
        'total_days':     int(d.get('total_days', 90)),
        'water_schedule': d.get('water_schedule',''),
        'season':         d.get('season',''),
        'start_date':     int(d.get('start_date', 0)),
    }
    save_plant(plant)
    return jsonify({"success": True, "plant_id": plant['id']})

@plants_bp.route('/<plant_id>', methods=['PUT'])
def update_plant_route(plant_id):
    user, err, code = require_auth()
    if err: return err, code
    update_plant(plant_id, user['id'], request.get_json() or {})
    return jsonify({"success": True})

@plants_bp.route('/<plant_id>', methods=['DELETE'])
def delete_plant_route(plant_id):
    user, err, code = require_auth()
    if err: return err, code
    delete_plant(plant_id, user['id'])
    return jsonify({"success": True})
