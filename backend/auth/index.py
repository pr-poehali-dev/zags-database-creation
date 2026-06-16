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


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


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
