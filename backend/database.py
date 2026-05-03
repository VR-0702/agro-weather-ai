import sqlite3
import os
import hashlib
import secrets
import time

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'kisanai.db')

# ===== CONNECTION =====
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

# ===== INIT TABLES =====
def init_db():
    conn = get_db()
    cur  = conn.cursor()

    # Users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            is_verified INTEGER DEFAULT 0,
            created_at  INTEGER NOT NULL,
            last_login  INTEGER,
            avatar      TEXT DEFAULT '👨‍🌾'
        )
    ''')

    # OTP table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS otps (
            id         TEXT PRIMARY KEY,
            email      TEXT NOT NULL,
            otp        TEXT NOT NULL,
            type       TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            used       INTEGER DEFAULT 0
        )
    ''')

    # Sessions table (JWT-like tokens)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token      TEXT PRIMARY KEY,
            user_id    TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # User plants table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS user_plants (
            id              TEXT PRIMARY KEY,
            user_id         TEXT NOT NULL,
            plant_id        TEXT NOT NULL,
            plant_name      TEXT NOT NULL,
            plant_hindi     TEXT NOT NULL,
            plant_icon      TEXT NOT NULL,
            category        TEXT NOT NULL,
            stages          TEXT NOT NULL,
            total_days      INTEGER NOT NULL,
            water_schedule  TEXT NOT NULL,
            season          TEXT NOT NULL,
            start_date      INTEGER NOT NULL,
            health          TEXT DEFAULT 'good',
            last_photo_date INTEGER,
            last_analysis   TEXT,
            notes           TEXT DEFAULT '',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized!")

# ===== PASSWORD HASHING =====
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{hashed.hex()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hashed = stored.split(':')
        check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return check.hex() == hashed
    except Exception:
        return False

# ===== SESSION TOKENS =====
def create_session(user_id: str) -> str:
    token      = secrets.token_urlsafe(32)
    expires_at = int(time.time()) + (7 * 24 * 3600)  # 7 days
    conn = get_db()
    conn.execute(
        'INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
        (token, user_id, expires_at, int(time.time()))
    )
    conn.commit()
    conn.close()
    return token

def get_user_from_token(token: str):
    conn = get_db()
    row  = conn.execute(
        'SELECT u.* FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?',
        (token, int(time.time()))
    ).fetchone()
    conn.close()
    return dict(row) if row else None

def delete_session(token: str):
    conn = get_db()
    conn.execute('DELETE FROM sessions WHERE token = ?', (token,))
    conn.commit()
    conn.close()

# ===== OTP =====
def generate_otp(email: str, otp_type: str) -> str:
    otp        = str(secrets.randbelow(900000) + 100000)  # 6 digit
    otp_id     = secrets.token_hex(8)
    expires_at = int(time.time()) + 600  # 10 minutes
    conn = get_db()
    # Invalidate old OTPs
    conn.execute('UPDATE otps SET used=1 WHERE email=? AND type=? AND used=0', (email, otp_type))
    conn.execute(
        'INSERT INTO otps (id, email, otp, type, expires_at, used) VALUES (?, ?, ?, ?, ?, 0)',
        (otp_id, email, otp, otp_type, expires_at)
    )
    conn.commit()
    conn.close()
    return otp

def verify_otp(email: str, otp: str, otp_type: str) -> bool:
    conn = get_db()
    row  = conn.execute(
        'SELECT id FROM otps WHERE email=? AND otp=? AND type=? AND used=0 AND expires_at > ?',
        (email, otp, otp_type, int(time.time()))
    ).fetchone()
    if row:
        conn.execute('UPDATE otps SET used=1 WHERE id=?', (row['id'],))
        conn.commit()
    conn.close()
    return row is not None

# ===== USER OPERATIONS =====
def create_user(name: str, email: str, password: str) -> dict:
    user_id  = secrets.token_hex(8)
    hashed   = hash_password(password)
    conn = get_db()
    conn.execute(
        'INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
        (user_id, name, email, hashed, int(time.time()))
    )
    conn.commit()
    conn.close()
    return {"id": user_id, "name": name, "email": email}

def get_user_by_email(email: str):
    conn = get_db()
    row  = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str):
    conn = get_db()
    row  = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def verify_user_email(email: str):
    conn = get_db()
    conn.execute('UPDATE users SET is_verified=1 WHERE email=?', (email,))
    conn.commit()
    conn.close()

def update_password(email: str, new_password: str):
    conn = get_db()
    conn.execute('UPDATE users SET password=? WHERE email=?', (hash_password(new_password), email))
    conn.commit()
    conn.close()

def update_last_login(user_id: str):
    conn = get_db()
    conn.execute('UPDATE users SET last_login=? WHERE id=?', (int(time.time()), user_id))
    conn.commit()
    conn.close()

# ===== PLANT OPERATIONS =====
def save_plant(plant_data: dict):
    conn = get_db()
    conn.execute('''
        INSERT OR REPLACE INTO user_plants
        (id, user_id, plant_id, plant_name, plant_hindi, plant_icon, category,
         stages, total_days, water_schedule, season, start_date, health,
         last_photo_date, last_analysis, notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (
        plant_data['id'], plant_data['user_id'], plant_data['plant_id'],
        plant_data['plant_name'], plant_data['plant_hindi'], plant_data['plant_icon'],
        plant_data['category'], plant_data['stages'], plant_data['total_days'],
        plant_data['water_schedule'], plant_data['season'], plant_data['start_date'],
        plant_data.get('health', 'good'), plant_data.get('last_photo_date'),
        plant_data.get('last_analysis'), plant_data.get('notes', '')
    ))
    conn.commit()
    conn.close()

def get_user_plants(user_id: str):
    conn = get_db()
    rows = conn.execute('SELECT * FROM user_plants WHERE user_id=? ORDER BY start_date DESC', (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_plant(plant_id: str, user_id: str, updates: dict):
    allowed = ['health', 'last_photo_date', 'last_analysis', 'notes']
    sets    = ', '.join([f"{k}=?" for k in updates if k in allowed])
    vals    = [updates[k] for k in updates if k in allowed]
    if not sets: return
    conn = get_db()
    conn.execute(f'UPDATE user_plants SET {sets} WHERE id=? AND user_id=?', vals + [plant_id, user_id])
    conn.commit()
    conn.close()

def delete_plant(plant_id: str, user_id: str):
    conn = get_db()
    conn.execute('DELETE FROM user_plants WHERE id=? AND user_id=?', (plant_id, user_id))
    conn.commit()
    conn.close()

# Run init on import
init_db()
