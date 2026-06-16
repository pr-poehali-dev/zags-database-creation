const URLS = {
  auth: 'https://functions.poehali.dev/e9149b54-e5b3-48ca-af2d-47d21860ca66',
  employees: 'https://functions.poehali.dev/8fe19890-0aae-41e6-b048-ac9a9d0bb400',
  certificates: 'https://functions.poehali.dev/d842fadc-e4e3-44ef-9450-be9bcc4bf8ef',
};

const TOKEN_KEY = 'zags_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function call(url: string, method: string, body?: unknown, query?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['X-Auth-Token'] = token;
  const res = await fetch(url + (query ? `?${query}` : ''), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

export interface Employee {
  id: number;
  full_name: string;
  role: string;
  login?: string;
  is_admin: boolean;
}

export interface CertRecord {
  id: number;
  series: string;
  number: string;
  husband: string;
  wife: string;
  marriage_date: string;
  act_number: string;
  created_at?: string;
}

export const api = {
  login: (login: string, password: string) =>
    call(URLS.auth, 'POST', { login, password }) as Promise<{ token: string; employee: Employee }>,
  me: () => call(URLS.auth, 'GET') as Promise<{ employee: Employee }>,

  listEmployees: () => call(URLS.employees, 'GET') as Promise<{ employees: Employee[] }>,
  addEmployee: (e: { full_name: string; role: string; login: string; password: string; is_admin: boolean }) =>
    call(URLS.employees, 'POST', e) as Promise<{ id: number }>,
  deleteEmployee: (id: number) =>
    call(URLS.employees, 'DELETE', undefined, `id=${id}`) as Promise<{ deleted: number }>,

  listCertificates: () =>
    call(URLS.certificates, 'GET') as Promise<{ certificates: CertRecord[] }>,
  saveCertificate: (c: Record<string, string>) =>
    call(URLS.certificates, 'POST', c) as Promise<{ id: number }>,
};
