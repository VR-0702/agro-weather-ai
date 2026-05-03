from flask import Blueprint, request, jsonify
import os, re, time
from database import (
    get_user_by_email, create_user, verify_password,
    create_session, delete_session, get_user_from_token,
    generate_otp, verify_otp, verify_user_email,
    update_password, update_last_login
)

auth_bp = Blueprint('auth', __name__)

# ===== EMAIL SENDER =====
def send_otp_email(email: str, otp: str, otp_type: str):
    """Send OTP via email. Uses SMTP if configured, else logs to console."""
    subject = "KisanAI — Email Verify Karo" if otp_type == "verify" else "KisanAI — Password Reset OTP"
    body    = f"""
Namaste!

{'Aapka verification' if otp_type == 'verify' else 'Password reset'} OTP hai:

🔢 {otp}

Yeh OTP 10 minute tak valid hai.

Agar aapne request nahi ki, ignore karo.

— KisanAI Team 🌱
"""
    # Try SMTP
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')
    smtp_from = os.environ.get('SMTP_FROM', smtp_user)

    if smtp_host and smtp_user and smtp_pass:
        try:
            import smtplib
            from email.mime.text import MIMEText
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From']    = smtp_from
            msg['To']      = email
            port = int(os.environ.get('SMTP_PORT', 587))
            with smtplib.SMTP(smtp_host, port) as s:
                s.starttls()
                s.login(smtp_user, smtp_pass)
                s.sendmail(smtp_from, [email], msg.as_string())
            print(f"✅ OTP email sent to {email}")
            return True
        except Exception as e:
            print(f"❌ Email error: {e}")

    # Fallback — log to console (for development/Replit without SMTP)
    print(f"\n{'='*40}")
    print(f"📧 OTP for {email}: {otp}")
    print(f"Type: {otp_type}")
    print(f"{'='*40}\n")
    return True

# ===== VALIDATORS =====
def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email))

def is_strong_password(password: str) -> tuple:
    if len(password) < 8:
        return False, "Password kam se kam 8 characters ka hona chahiye"
    if not re.search(r'[A-Z]', password):
        return False, "Password mein ek bada letter (A-Z) hona chahiye"
    if not re.search(r'[0-9]', password):
        return False, "Password mein ek number hona chahiye"
    return True, "ok"

def get_token_from_request():
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        return auth[7:]
    return request.cookies.get('kisanai_token')

def require_auth():
    token = get_token_from_request()
    if not token:
        return None, jsonify({"success": False, "error": "Login karo pehle"}), 401
    user = get_user_from_token(token)
    if not user:
        return None, jsonify({"success": False, "error": "Session expire ho gaya. Dobara login karo"}), 401
    return user, None, None

# ===== ROUTES =====

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data     = request.get_json() or {}
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validate
    if not name or not email or not password:
        return jsonify({"success": False, "error": "Naam, email aur password sab chahiye"}), 400
    if len(name) < 2:
        return jsonify({"success": False, "error": "Naam bahut chhota hai"}), 400
    if not is_valid_email(email):
        return jsonify({"success": False, "error": "Email valid nahi hai"}), 400

    ok, msg = is_strong_password(password)
    if not ok:
        return jsonify({"success": False, "error": msg}), 400

    # Check existing
    if get_user_by_email(email):
        return jsonify({"success": False, "error": "Yeh email pehle se registered hai"}), 409

    # Create user (unverified)
    user = create_user(name, email, password)

    # Send OTP
    otp = generate_otp(email, 'verify')
    send_otp_email(email, otp, 'verify')

    return jsonify({
        "success": True,
        "message": f"Account ban gaya! {email} par OTP bheja gaya hai. Verify karo.",
        "email": email
    })


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data  = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp   = data.get('otp', '').strip()

    if not email or not otp:
        return jsonify({"success": False, "error": "Email aur OTP chahiye"}), 400

    if not verify_otp(email, otp, 'verify'):
        return jsonify({"success": False, "error": "OTP galat hai ya expire ho gaya"}), 400

    verify_user_email(email)
    user  = get_user_by_email(email)
    token = create_session(user['id'])
    update_last_login(user['id'])

    return jsonify({
        "success": True,
        "message": "Email verify ho gaya! Welcome to KisanAI 🌱",
        "token": token,
        "user": {"id": user['id'], "name": user['name'], "email": user['email']}
    })


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    data     = request.get_json() or {}
    email    = data.get('email', '').strip().lower()
    otp_type = data.get('type', 'verify')

    if not email:
        return jsonify({"success": False, "error": "Email chahiye"}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({"success": False, "error": "Email registered nahi hai"}), 404

    otp = generate_otp(email, otp_type)
    send_otp_email(email, otp, otp_type)

    return jsonify({"success": True, "message": "Naya OTP bheja gaya!"})


@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json() or {}
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"success": False, "error": "Email aur password chahiye"}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({"success": False, "error": "Email ya password galat hai"}), 401
    if not verify_password(password, user['password']):
        return jsonify({"success": False, "error": "Email ya password galat hai"}), 401
    if not user['is_verified']:
        # Resend OTP
        otp = generate_otp(email, 'verify')
        send_otp_email(email, otp, 'verify')
        return jsonify({
            "success": False,
            "error": "Email verify nahi hai",
            "needs_verification": True,
            "email": email
        }), 403

    token = create_session(user['id'])
    update_last_login(user['id'])

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['name']}! 🌱",
        "token": token,
        "user": {"id": user['id'], "name": user['name'], "email": user['email']}
    })


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data  = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({"success": False, "error": "Email chahiye"}), 400

    user = get_user_by_email(email)
    if not user:
        # Don't reveal if email exists
        return jsonify({"success": True, "message": "Agar email registered hai to OTP bheja jayega"})

    otp = generate_otp(email, 'reset')
    send_otp_email(email, otp, 'reset')

    return jsonify({"success": True, "message": "Password reset OTP bheja gaya!", "email": email})


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data         = request.get_json() or {}
    email        = data.get('email', '').strip().lower()
    otp          = data.get('otp', '').strip()
    new_password = data.get('new_password', '')

    if not email or not otp or not new_password:
        return jsonify({"success": False, "error": "Sab fields chahiye"}), 400

    ok, msg = is_strong_password(new_password)
    if not ok:
        return jsonify({"success": False, "error": msg}), 400

    if not verify_otp(email, otp, 'reset'):
        return jsonify({"success": False, "error": "OTP galat hai ya expire ho gaya"}), 400

    update_password(email, new_password)
    return jsonify({"success": True, "message": "Password reset ho gaya! Ab login karo."})


@auth_bp.route('/me', methods=['GET'])
def me():
    user, err_resp, code = require_auth()
    if err_resp: return err_resp, code
    return jsonify({
        "success": True,
        "user": {"id": user['id'], "name": user['name'], "email": user['email'], "avatar": user.get('avatar', '👨‍🌾')}
    })


@auth_bp.route('/logout', methods=['POST'])
def logout():
    token = get_token_from_request()
    if token:
        delete_session(token)
    return jsonify({"success": True, "message": "Logout ho gaye!"})
