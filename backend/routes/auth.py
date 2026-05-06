from flask import Blueprint, request, jsonify
import os, re, smtplib, time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from database import (
    get_user_by_email, create_user, verify_password,
    create_session, delete_session, get_user_from_token,
    generate_otp, verify_otp, verify_user_email,
    update_password, update_last_login
)

auth_bp = Blueprint('auth', __name__)

# ===== EMAIL SENDER =====
def send_otp_email(to_email: str, otp: str, otp_type: str):
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_pass = os.environ.get('SMTP_PASS', '').replace(' ', '')
    smtp_from = os.environ.get('SMTP_FROM', smtp_user)

    subject = "KisanAI — Email Verify Karo" if otp_type == "verify" else "KisanAI — Password Reset OTP"

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e0e0e0;">
      <div style="background:linear-gradient(135deg,#1a3a1f,#2e7d32);padding:32px;text-align:center;">
        <div style="font-size:48px;">🌱</div>
        <h1 style="color:white;margin:8px 0 4px;font-size:24px;">KisanAI</h1>
        <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">Smart Agriculture Assistant</p>
      </div>
      <div style="padding:32px;text-align:center;background:white;">
        <h2 style="color:#1a3a1f;">{"Email Verify Karo" if otp_type=="verify" else "Password Reset"}</h2>
        <p style="color:#666;font-size:15px;">Aapka One-Time Password (OTP):</p>
        <div style="background:#e8f5e9;border:2px dashed #4caf50;border-radius:12px;padding:24px;margin:20px 0;display:inline-block;">
          <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#1a3a1f;font-family:monospace;">{otp}</div>
        </div>
        <p style="color:#999;font-size:13px;">Yeh OTP <strong>10 minute</strong> tak valid hai.</p>
        <p style="color:#bbb;font-size:12px;">Agar aapne request nahi ki, is email ko ignore karo.</p>
      </div>
      <div style="background:#f5f5f5;padding:16px;text-align:center;">
        <p style="color:#aaa;font-size:12px;margin:0;">KisanAI — Farmers ke liye AI Technology</p>
      </div>
    </div>
    """

    # Always log OTP to console (fallback)
    print(f"\n{'='*50}\n📧 OTP for {to_email}: {otp} (type: {otp_type})\n{'='*50}\n")

    if not smtp_user or not smtp_pass:
        print("⚠️  SMTP not configured — OTP printed above")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = f"KisanAI <{smtp_from}>"
        msg['To']      = to_email
        msg.attach(MIMEText(f"Aapka OTP: {otp} (10 min valid)", 'plain'))
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as s:
            s.ehlo()
            s.starttls()
            s.ehlo()
            s.login(smtp_user, smtp_pass)
            s.sendmail(smtp_from, [to_email], msg.as_string())

        print(f"✅ OTP email sent to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("❌ SMTP Auth failed — Gmail App Password check karo!")
        return False
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

# ===== VALIDATORS =====
def valid_email(e):
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', e))

def strong_password(pwd):
    if len(pwd) < 8:        return False, "Password kam se kam 8 characters ka hona chahiye"
    if not re.search(r'[A-Z]', pwd): return False, "Password mein ek Capital letter (A-Z) chahiye"
    if not re.search(r'[0-9]', pwd): return False, "Password mein ek number (0-9) chahiye"
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

# ===== ROUTES =====

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

    create_user(name, email, pwd)
    otp = generate_otp(email, 'verify')
    send_otp_email(email, otp, 'verify')

    return jsonify({"success": True, "message": f"OTP bheja gaya! {email} check karo.", "email": email})


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    d     = request.get_json() or {}
    email = d.get('email', '').strip().lower()
    otp   = d.get('otp', '').strip()

    if not verify_otp(email, otp, 'verify'):
        return jsonify({"success": False, "error": "OTP galat hai ya expire ho gaya"}), 400

    verify_user_email(email)
    user  = get_user_by_email(email)
    token = create_session(user['id'])
    update_last_login(user['id'])

    return jsonify({
        "success": True,
        "message": f"Welcome to KisanAI, {user['name']}!",
        "token": token,
        "user": {"id": user['id'], "name": user['name'], "email": user['email']}
    })


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    d        = request.get_json() or {}
    email    = d.get('email', '').strip().lower()
    otp_type = d.get('type', 'verify')

    if not get_user_by_email(email):
        return jsonify({"success": False, "error": "Email registered nahi hai"}), 404

    otp = generate_otp(email, otp_type)
    send_otp_email(email, otp, otp_type)
    return jsonify({"success": True, "message": "Naya OTP bheja gaya!"})


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

    if not user['is_verified']:
        otp = generate_otp(email, 'verify')
        send_otp_email(email, otp, 'verify')
        return jsonify({
            "success": False,
            "error": "Email verify nahi hai. OTP bheja gaya!",
            "needs_verification": True,
            "email": email
        }), 403

    token = create_session(user['id'])
    update_last_login(user['id'])
    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "token": token,
        "user": {"id": user['id'], "name": user['name'], "email": user['email']}
    })


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    d     = request.get_json() or {}
    email = d.get('email', '').strip().lower()

    user = get_user_by_email(email)
    if user:
        otp = generate_otp(email, 'reset')
        send_otp_email(email, otp, 'reset')

    return jsonify({"success": True, "message": "Agar email registered hai to OTP bheja gaya!", "email": email})


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    d    = request.get_json() or {}
    email = d.get('email', '').strip().lower()
    otp  = d.get('otp', '').strip()
    pwd  = d.get('new_password', '')

    ok, msg = strong_password(pwd)
    if not ok:
        return jsonify({"success": False, "error": msg}), 400
    if not verify_otp(email, otp, 'reset'):
        return jsonify({"success": False, "error": "OTP galat hai ya expire ho gaya"}), 400

    update_password(email, pwd)
    return jsonify({"success": True, "message": "Password reset ho gaya! Ab login karo."})


@auth_bp.route('/me', methods=['GET'])
def me():
    user, err, code = require_auth()
    if err: return err, code
    return jsonify({"success": True, "user": {"id": user['id'], "name": user['name'], "email": user['email']}})


@auth_bp.route('/logout', methods=['POST'])
def logout():
    token = get_token()
    if token: delete_session(token)
    return jsonify({"success": True})
