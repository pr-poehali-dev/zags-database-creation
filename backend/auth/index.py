import json
import os
import secrets
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

SETUP_SQL = """
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    series TEXT, number TEXT, husband TEXT, husband_birth TEXT,
    husband_surname_after TEXT, wife TEXT, wife_birth TEXT,
    wife_surname_after TEXT, marriage_date TEXT, act_number TEXT,
    issue_date TEXT, place TEXT, registrar TEXT, created_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO employees (full_name, role, login, password, is_admin)
VALUES ('Воронцова Мария Игоревна', 'Руководитель отдела', 'admin', 'admin123', TRUE)
ON CONFLICT (login) DO NOTHING;
"""


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ensure_schema(conn):
    cur = conn.cursor()
    cur.execute(SETUP_SQL)
    conn.commit()
    cur.close()


def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def get_employee(conn, token):
    if not token:
        return None
    cur = conn.cursor()
    cur.execute(
        "SELECT e.id, e.full_name, e.role, e.login, e.is_admin "
        "FROM sessions s JOIN employees e ON e.id = s.employee_id "
        "WHERE s.token = %s",
        (token,),
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {'id': row[0], 'full_name': row[1], 'role': row[2], 'login': row[3], 'is_admin': row[4]}


def handler(event: dict, context) -> dict:
    '''Авторизация сотрудников ЗАГС: вход по логину/паролю и проверка сессии'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    conn = db()
    try:
        ensure_schema(conn)

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            login = (body.get('login') or '').strip()
            password = body.get('password') or ''
            cur = conn.cursor()
            cur.execute(
                "SELECT id, full_name, role, is_admin FROM employees "
                "WHERE login = %s AND password = %s",
                (login, password),
            )
            row = cur.fetchone()
            if not row:
                cur.close()
                return resp(401, {'error': 'Неверный логин или пароль'})
            token = secrets.token_hex(24)
            cur.execute(
                "INSERT INTO sessions (token, employee_id) VALUES (%s, %s)",
                (token, row[0]),
            )
            conn.commit()
            cur.close()
            return resp(200, {
                'token': token,
                'employee': {'id': row[0], 'full_name': row[1], 'role': row[2], 'is_admin': row[3]},
            })

        if method == 'GET':
            token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            emp = get_employee(conn, token)
            if not emp:
                return resp(401, {'error': 'Не авторизован'})
            return resp(200, {'employee': emp})

        return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()
