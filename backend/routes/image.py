from flask import Blueprint, request, jsonify, current_app
from services.image_service import describe_plant_image
import os, uuid

image_bp = Blueprint('image', __name__)

ALLOWED_EXT = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT

@image_bp.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image provided"}), 400

    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Invalid file type"}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        description = describe_plant_image(filepath)
        return jsonify({"success": True, "description": description, "filename": filename})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
