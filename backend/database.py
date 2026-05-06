import sqlite3, os, hashlib, secrets, time

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'kisanai.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            is_verified INTEGER DEFAULT 0,
            created_at  INTEGER NOT NULL,
            last_login  INTEGER
        );
        CREATE TABLE IF NOT EXISTS otps (
            id         TEXT PRIMARY KEY,
            email      TEXT NOT NULL,
            otp        TEXT NOT NULL,
            type       TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            used       INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token      TEXT PRIMARY KEY,
            user_id    TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        );
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
            notes           TEXT DEFAULT ''
        );
    ''')
    conn.commit()
    conn.close()
    print("Database ready!")

def hash_password(pwd):
    salt   = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', pwd.encode(), salt.encode(), 100000)
    return f"{salt}:{hashed.hex()}"

def verify_password(pwd, stored):
    try:
        salt, hashed = stored.split(':')
        check = hashlib.pbkdf2_hmac('sha256', pwd.encode(), salt.encode(), 100000)
        return check.hex() == hashed
    except:
        return False

def create_session(user_id):
    token = secrets.token_urlsafe(32)
    exp   = int(time.time()) + 7 * 24 * 3600
    conn  = get_db()
    conn.execute('INSERT INTO sessions VALUES (?,?,?,?)', (token, user_id, exp, int(time.time())))
    conn.commit(); conn.close()
    return token

def get_user_from_token(token):
    conn = get_db()
    row  = conn.execute(
        'SELECT u.* FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?',
        (token, int(time.time()))
    ).fetchone()
    conn.close()
    return dict(row) if row else None

def delete_session(token):
    conn = get_db()
    conn.execute('DELETE FROM sessions WHERE token=?', (token,))
    conn.commit(); conn.close()

def generate_otp(email, otp_type):
    otp  = str(secrets.randbelow(900000) + 100000)
    exp  = int(time.time()) + 600
    conn = get_db()
    conn.execute('UPDATE otps SET used=1 WHERE email=? AND type=? AND used=0', (email, otp_type))
    conn.execute('INSERT INTO otps VALUES (?,?,?,?,?,0)', (secrets.token_hex(8), email, otp, otp_type, exp))
    conn.commit(); conn.close()
    return otp

def verify_otp(email, otp, otp_type):
    conn = get_db()
    row  = conn.execute(
        'SELECT id FROM otps WHERE email=? AND otp=? AND type=? AND used=0 AND expires_at>?',
        (email, otp, otp_type, int(time.time()))
    ).fetchone()
    if row:
        conn.execute('UPDATE otps SET used=1 WHERE id=?', (row['id'],))
        conn.commit()
    conn.close()
    return row is not None

def create_user(name, email, password):
    uid  = secrets.token_hex(8)
    conn = get_db()
    conn.execute('INSERT INTO users (id,name,email,password,created_at) VALUES (?,?,?,?,?)',
                 (uid, name, email, hash_password(password), int(time.time())))
    conn.commit(); conn.close()
    return uid

def get_user_by_email(email):
    conn = get_db()
    row  = conn.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
    conn.close()
    return dict(row) if row else None

def verify_user_email(email):
    conn = get_db()
    conn.execute('UPDATE users SET is_verified=1 WHERE email=?', (email,))
    conn.commit(); conn.close()

def update_password(email, new_pwd):
    conn = get_db()
    conn.execute('UPDATE users SET password=? WHERE email=?', (hash_password(new_pwd), email))
    conn.commit(); conn.close()

def update_last_login(user_id):
    conn = get_db()
    conn.execute('UPDATE users SET last_login=? WHERE id=?', (int(time.time()), user_id))
    conn.commit(); conn.close()

def save_plant(data):
    conn = get_db()
    conn.execute('''INSERT OR REPLACE INTO user_plants
        (id,user_id,plant_id,plant_name,plant_hindi,plant_icon,category,
         stages,total_days,water_schedule,season,start_date,health,
         last_photo_date,last_analysis,notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (data['id'], data['user_id'], data['plant_id'], data['plant_name'],
         data['plant_hindi'], data['plant_icon'], data['category'],
         data['stages'], data['total_days'], data['water_schedule'],
         data['season'], data['start_date'], data.get('health','good'),
         data.get('last_photo_date'), data.get('last_analysis'), data.get('notes','')))
    conn.commit(); conn.close()

def get_user_plants(user_id):
    conn = get_db()
    rows = conn.execute('SELECT * FROM user_plants WHERE user_id=? ORDER BY start_date DESC', (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_plant(plant_id, user_id, updates):
    allowed = ['health','last_photo_date','last_analysis','notes']
    fields  = {k: v for k, v in updates.items() if k in allowed}
    if not fields: return
    sets = ', '.join(f"{k}=?" for k in fields)
    vals = list(fields.values()) + [plant_id, user_id]
    conn = get_db()
    conn.execute(f'UPDATE user_plants SET {sets} WHERE id=? AND user_id=?', vals)
    conn.commit(); conn.close()

def delete_plant(plant_id, user_id):
    conn = get_db()
    conn.execute('DELETE FROM user_plants WHERE id=? AND user_id=?', (plant_id, user_id))
    conn.commit(); conn.close()

init_db()
