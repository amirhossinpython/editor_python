import sqlite3
from datetime import datetime

DATABASE = 'codes.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''
        CREATE TABLE IF NOT EXISTS codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()

def save_code(title, code):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO codes (title, code) VALUES (?, ?)',
            (title, code)
        )
        conn.commit()
        return cursor.lastrowid

def get_recent_codes(limit=5):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
        SELECT id, title, created_at 
        FROM codes 
        ORDER BY created_at DESC 
        LIMIT ?
        ''', (limit,))
        return cursor.fetchall()

# Initialize database on first run
init_db()