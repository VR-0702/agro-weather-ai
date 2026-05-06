from flask import Blueprint, request, jsonify
import os, re, time
from database import (
    get_user_by_email, create_user, verify_password,
    create_session, delete_session, get_user_from_token,
    update_password, update_last_login, verify_user_email
)

auth_bp = Blueprint('auth', __name__)

def valid_email(e):
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', e))

def strong_password(pwd):
    if len(pwd) < 8:
        return False, "Password kam se kam 8 characters ka hona chahiye"
    if not re.search(r'[A-Z]', pwd):
        return False, "Password mein ek Capital letter (A-Z) chahiye"
    if not re.search(r'[0-9]', pwd):
        return False, "Password mein ek number (0-9) chahiye"
    return True, "ok"

def get_token():
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '): return auth[7:]
    return None

def require_auth():
    token = get_token()
    if not token:
        return None, jsonify({"success": False, "error": "Login karo pehle"}), 401
    user = get_user_from_token(token)
    if not user:
        return None, jsonify({"success": False, "error": "Session expire ho gaya"}), 401
    return user, None, None

# ===== SIGNUP =====
@auth_bp.route('/signup', methods=['POST'])
def signup():
    d     = request.get_json() or {}
    name  = d.get('name', '').strip()
    email = d.get('email', '').strip().lower()
    pwd   = d.get('password', '')

    if not name or not email or not pwd:
        return jsonify({"success": False, "error": "Naam, email aur password sab chahiye"}), 400
    if not valid_email(email):
        return jsonify({"success": False, "error": "Valid email daalo"}), 400
    ok, msg = strong_password(pwd)
    if not ok:
        return jsonify({"success": False, "error": msg}), 400
    if get_user_by_email(email):
        return jsonify({"success": False, "error": "Yeh email pehle se registered hai"}), 409

    uid = create_user(name, email, pwd)
    verify_user_email(email)  # auto verify — no OTP

    user  = get_user_by_email(email)
    token = create_session(user['id'])
    update_last_login(user['id'])

    return jsonify({
        "success": True,
        "message": f"Welcome to KisanAI, {name}!",
        "token":   token,
        "user":    {"id": user['id'], "name": user['name'], "email": user['email']}
    })

# ===== LOGIN =====
@auth_bp.route('/login', methods=['POST'])
def login():
    d     = request.get_json() or {}
    email = d.get('email', '').strip().lower()
    pwd   = d.get('password', '')

    if not email or not pwd:
        return jsonify({"success": False, "error": "Email aur password chahiye"}), 400

    user = get_user_by_email(email)
    if not user or not verify_password(pwd, user['password']):
        return jsonify({"success": False, "error": "Email ya password galat hai"}), 401

    token = create_session(user['id'])
    update_last_login(user['id'])

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "token":   token,
        "user":    {"id": user['id'], "name": user['name'], "email": user['email']}
    })

# ===== FORGOT PASSWORD =====
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    d     = request.get_json() or {}
    email = d.get('email', '').strip().lower()
    pwd   = d.get('new_password', '')

    if not email or not pwd:
        return jsonify({"success": False, "error": "Email aur naya password chahiye"}), 400
    if not get_user_by_email(email):
        return jsonify({"success": False, "error": "Yeh email registered nahi hai"}), 404
    ok, msg = strong_password(pwd)
    if not ok:
        return jsonify({"success": False, "error": msg}), 400

    update_password(email, pwd)
    return jsonify({"success": True, "message": "Password reset ho gaya! Ab login karo."})

# ===== ME =====
@auth_bp.route('/me', methods=['GET'])
def me():
    user, err, code = require_auth()
    if err: return err, code
    return jsonify({"success": True, "user": {"id": user['id'], "name": user['name'], "email": user['email']}})

# ===== LOGOUT =====
@auth_bp.route('/logout', methods=['POST'])
def logout():
    token = get_token()
    if token: delete_session(token)
    return jsonify({"success": True})
