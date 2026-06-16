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
        "SELECT e.id, e.full_name FROM sessions s JOIN employees e ON e.id = s.employee_id WHERE s.token = %s",
        (token,),
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {'id': row[0], 'full_name': row[1]}


FIELDS = [
    'series', 'number', 'husband', 'husband_birth', 'husband_surname_after',
    'wife', 'wife_birth', 'wife_surname_after', 'marriage_date',
    'act_number', 'issue_date', 'place', 'registrar',
]


def handler(event: dict, context) -> dict:
    '''Свидетельства о браке ЗАГС: сохранение и получение списка'''
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
            cur.execute(
                "SELECT id, series, number, husband, wife, marriage_date, act_number, created_at "
                "FROM certificates ORDER BY id DESC LIMIT 100"
            )
            rows = cur.fetchall()
            cur.close()
            items = [
                {
                    'id': r[0], 'series': r[1], 'number': r[2], 'husband': r[3],
                    'wife': r[4], 'marriage_date': r[5], 'act_number': r[6], 'created_at': r[7],
                }
                for r in rows
            ]
            return resp(200, {'certificates': items})

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO certificates "
                "(series, number, husband, husband_birth, husband_surname_after, "
                "wife, wife_birth, wife_surname_after, marriage_date, act_number, "
                "issue_date, place, registrar, created_by) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (
                    body.get('series'), body.get('number'), body.get('husband'),
                    body.get('husband_birth'), body.get('husband_surname_after'),
                    body.get('wife'), body.get('wife_birth'), body.get('wife_surname_after'),
                    body.get('marriage_date'), body.get('act_number'), body.get('issue_date'),
                    body.get('place'), body.get('registrar'), user['id'],
                ),
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return resp(200, {'id': new_id})

        if method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            cert_id = params.get('id')
            if not cert_id or not str(cert_id).isdigit():
                return resp(400, {'error': 'Не указано свидетельство'})
            cur = conn.cursor()
            cur.execute("DELETE FROM certificates WHERE id = %d" % int(cert_id))
            conn.commit()
            cur.close()
            return resp(200, {'deleted': int(cert_id)})

        return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()
