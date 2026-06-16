import json
import os
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


def auth(conn, event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not token:
        return None
    cur = conn.cursor()
    cur.execute(
        "SELECT e.id, e.is_admin FROM sessions s JOIN employees e ON e.id = s.employee_id WHERE s.token = %s",
        (token,),
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {'id': row[0], 'is_admin': row[1]}


def esc(v):
    return (v or '').replace("'", "''")


def handler(event: dict, context) -> dict:
    '''Управление сотрудниками ЗАГС: список, добавление и удаление'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    conn = db()
    try:
        user = auth(conn, event)
        if not user:
            return resp(401, {'error': 'Не авторизован'})

        if method == 'GET':
            cur = conn.cursor()
            cur.execute("SELECT id, full_name, role, login, is_admin FROM employees ORDER BY id")
            rows = cur.fetchall()
            cur.close()
            items = [
                {'id': r[0], 'full_name': r[1], 'role': r[2], 'login': r[3], 'is_admin': r[4]}
                for r in rows
            ]
            return resp(200, {'employees': items})

        if method == 'POST':
            if not user['is_admin']:
                return resp(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            full_name = esc(body.get('full_name'))
            role = esc(body.get('role') or 'Регистратор')
            login = esc(body.get('login'))
            password = esc(body.get('password'))
            is_admin = bool(body.get('is_admin'))
            if not full_name or not login or not password:
                return resp(400, {'error': 'Заполните Ф.И.О., логин и пароль'})
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM employees WHERE login = '%s'" % login)
            if cur.fetchone():
                cur.close()
                return resp(409, {'error': 'Логин уже занят'})
            cur.execute(
                "INSERT INTO employees (full_name, role, login, password, is_admin) "
                "VALUES ('%s','%s','%s','%s',%s) RETURNING id"
                % (full_name, role, login, password, 'TRUE' if is_admin else 'FALSE')
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return resp(200, {'id': new_id})

        if method == 'DELETE':
            if not user['is_admin']:
                return resp(403, {'error': 'Недостаточно прав'})
            params = event.get('queryStringParameters') or {}
            emp_id = params.get('id')
            if not emp_id or not str(emp_id).isdigit():
                return resp(400, {'error': 'Не указан сотрудник'})
            if int(emp_id) == user['id']:
                return resp(400, {'error': 'Нельзя удалить самого себя'})
            cur = conn.cursor()
            cur.execute("DELETE FROM employees WHERE id = %d" % int(emp_id))
            conn.commit()
            cur.close()
            return resp(200, {'deleted': int(emp_id)})

        return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()
