import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LoginScreen from '@/components/LoginScreen';
import MarriageCertificate, { type CertData } from '@/components/MarriageCertificate';
import {
  api,
  getToken,
  clearToken,
  type Employee,
  type CertRecord,
} from '@/lib/api';

type TabKey = 'certificates' | 'registration' | 'staff' | 'settings';

const NAV: { key: TabKey; label: string; icon: string }[] = [
  { key: 'certificates', label: 'Свидетельства', icon: 'ScrollText' },
  { key: 'registration', label: 'Регистрация', icon: 'ClipboardList' },
  { key: 'staff', label: 'Сотрудники', icon: 'Users' },
  { key: 'settings', label: 'Настройки', icon: 'Settings' },
];

const DEFAULT_CERT: CertData = {
  series: 'I-МБ',
  number: '482917',
  husband: 'Соколов Дмитрий Андреевич',
  husbandBirth: '14.03.1992',
  husbandSurnameAfter: 'Соколов',
  wife: 'Орлова Екатерина Сергеевна',
  wifeBirth: '27.08.1994',
  wifeSurnameAfter: 'Соколова',
  marriageDate: '16.06.2026',
  actNumber: '156',
  issueDate: '16.06.2026',
  place: 'Дворец бракосочетания №1, г. Москва',
  registrar: 'Воронцова М. И.',
};

export default function Index() {
  const [me, setMe] = useState<Employee | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<TabKey>('certificates');

  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    api
      .me()
      .then((r) => setMe(r.employee))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center gov-pattern">
        <Icon name="Loader" className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!me) return <LoginScreen onLogin={setMe} />;

  const logout = () => {
    clearToken();
    setMe(null);
  };

  return (
    <div className="min-h-screen flex text-foreground gov-pattern">
      <aside className="no-print w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-sm flex flex-col">
        <div className="px-6 py-7 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Icon name="Landmark" className="text-primary" size={22} />
            </div>
            <div>
              <div className="font-serif text-2xl leading-none text-primary tracking-wide">ЗАГС</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Единый реестр
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-all ${
                tab === n.key
                  ? 'bg-primary/15 text-primary border border-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent'
              }`}
            >
              <Icon name={n.icon} size={18} />
              <span className="font-medium">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Icon name="LogOut" size={18} />
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="no-print sticky top-0 z-10 px-8 py-5 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground tracking-wide">
              {NAV.find((n) => n.key === tab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Отдел записи актов гражданского состояния
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{me.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {me.is_admin ? 'Администратор' : me.role}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center font-serif text-primary">
              {me.full_name[0]}
            </div>
          </div>
        </header>

        <div className="p-8">
          {tab === 'certificates' && <Certificates registrar={me.full_name} />}
          {tab === 'registration' && <Registration />}
          {tab === 'staff' && <Staff me={me} />}
          {tab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon name={icon} className="text-primary" size={18} />
      <h2 className="font-serif text-xl tracking-wide">{children}</h2>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary/40 border-border focus-visible:ring-primary"
      />
    </div>
  );
}

function Certificates({ registrar }: { registrar: string }) {
  const { toast } = useToast();
  const [data, setData] = useState<CertData>({ ...DEFAULT_CERT, registrar });
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof CertData, v: string) => setData((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.saveCertificate({
        series: data.series,
        number: data.number,
        husband: data.husband,
        husband_birth: data.husbandBirth,
        husband_surname_after: data.husbandSurnameAfter,
        wife: data.wife,
        wife_birth: data.wifeBirth,
        wife_surname_after: data.wifeSurnameAfter,
        marriage_date: data.marriageDate,
        act_number: data.actNumber,
        issue_date: data.issueDate,
        place: data.place,
        registrar: data.registrar,
      });
      toast({ title: 'Сохранено', description: 'Свидетельство добавлено в реестр' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid xl:grid-cols-2 gap-8 animate-fade-in">
      <Card className="no-print bg-card/70 border-border p-6 h-fit">
        <SectionTitle icon="ScrollText">Свидетельство о заключении брака</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Серия" value={data.series} onChange={(v) => upd('series', v)} />
          <Field label="Номер" value={data.number} onChange={(v) => upd('number', v)} />
          <div className="col-span-2">
            <Field label="Супруг (Ф.И.О.)" value={data.husband} onChange={(v) => upd('husband', v)} />
          </div>
          <Field label="Дата рожд. супруга" value={data.husbandBirth} onChange={(v) => upd('husbandBirth', v)} />
          <Field label="Фамилия мужа после брака" value={data.husbandSurnameAfter} onChange={(v) => upd('husbandSurnameAfter', v)} />
          <div className="col-span-2">
            <Field label="Супруга (Ф.И.О.)" value={data.wife} onChange={(v) => upd('wife', v)} />
          </div>
          <Field label="Дата рожд. супруги" value={data.wifeBirth} onChange={(v) => upd('wifeBirth', v)} />
          <Field label="Фамилия жены после брака" value={data.wifeSurnameAfter} onChange={(v) => upd('wifeSurnameAfter', v)} />
          <Field label="Дата заключения брака" value={data.marriageDate} onChange={(v) => upd('marriageDate', v)} />
          <Field label="Номер актовой записи" value={data.actNumber} onChange={(v) => upd('actNumber', v)} />
          <Field label="Дата выдачи" value={data.issueDate} onChange={(v) => upd('issueDate', v)} />
          <Field label="Регистратор" value={data.registrar} onChange={(v) => upd('registrar', v)} />
          <div className="col-span-2">
            <Field label="Место регистрации" value={data.place} onChange={(v) => upd('place', v)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={save} disabled={saving} variant="outline" className="flex-1 h-11 border-primary/40">
            <Icon name="Save" size={18} className="mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button onClick={() => window.print()} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90">
            <Icon name="Printer" size={18} className="mr-2" />
            Печать
          </Button>
        </div>
      </Card>

      <div>
        <div className="no-print">
          <SectionTitle icon="Eye">Предпросмотр официального бланка</SectionTitle>
        </div>
        <MarriageCertificate data={data} />
      </div>
    </div>
  );
}

function Registration() {
  const [items, setItems] = useState<CertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listCertificates()
      .then((r) => setItems(r.certificates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="bg-card/70 border-border p-6 animate-fade-in">
      <SectionTitle icon="ClipboardList">Журнал актовых записей</SectionTitle>
      {loading ? (
        <div className="py-10 text-center text-muted-foreground">
          <Icon name="Loader" className="animate-spin mx-auto" size={24} />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Icon name="FileX" size={40} className="mx-auto mb-3 opacity-50" />
          Записей пока нет. Создайте свидетельство во вкладке «Свидетельства».
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">№ акта</th>
                <th className="text-left px-4 py-3 font-medium">Серия/Номер</th>
                <th className="text-left px-4 py-3 font-medium">Супруги</th>
                <th className="text-left px-4 py-3 font-medium">Дата брака</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{r.act_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.series} № {r.number}</td>
                  <td className="px-4 py-3">{r.husband} / {r.wife}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.marriage_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Staff({ me }: { me: Employee }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', role: 'Регистратор', login: '', password: '', is_admin: false });
  const [adding, setAdding] = useState(false);

  const load = () => {
    api
      .listEmployees()
      .then((r) => setItems(r.employees))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!form.full_name || !form.login || !form.password) {
      toast({ title: 'Заполните поля', description: 'Ф.И.О., логин и пароль обязательны', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      await api.addEmployee(form);
      setForm({ full_name: '', role: 'Регистратор', login: '', password: '', is_admin: false });
      toast({ title: 'Сотрудник добавлен' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteEmployee(id);
      setItems((s) => s.filter((x) => x.id !== id));
      toast({ title: 'Сотрудник удалён' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-4">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            <Icon name="Loader" className="animate-spin mx-auto" size={24} />
          </div>
        ) : (
          items.map((p) => (
            <Card key={p.id} className="bg-card/70 border-border p-5 flex items-center gap-4 hover:border-primary/40 transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center font-serif text-xl text-primary shrink-0">
                {p.full_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.is_admin ? 'Администратор' : p.role} · логин: {p.login}
                </div>
              </div>
              {me.is_admin && p.id !== me.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(p.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              )}
            </Card>
          ))
        )}
      </div>

      {me.is_admin && (
        <Card className="bg-card/70 border-border p-6 h-fit">
          <SectionTitle icon="UserPlus">Новый сотрудник</SectionTitle>
          <div className="space-y-3">
            <Field label="Ф.И.О." value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
            <Field label="Должность" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
            <Field label="Логин" value={form.login} onChange={(v) => setForm((f) => ({ ...f, login: v }))} />
            <Field label="Пароль" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
            <label className="flex items-center gap-2 text-sm cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.is_admin}
                onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
                className="accent-[hsl(var(--primary))] h-4 w-4"
              />
              Права администратора
            </label>
            <Button onClick={add} disabled={adding} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
              <Icon name="Plus" size={18} className="mr-2" />
              {adding ? 'Добавление...' : 'Добавить сотрудника'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Settings() {
  const opts = [
    { icon: 'Building2', title: 'Реквизиты учреждения', desc: 'Наименование, адрес, ОГРН отдела ЗАГС' },
    { icon: 'FileSignature', title: 'Шаблоны документов', desc: 'Форматы свидетельств и печатных бланков' },
    { icon: 'ShieldCheck', title: 'Безопасность', desc: 'Права доступа и журнал действий' },
    { icon: 'Bell', title: 'Уведомления', desc: 'Оповещения о новых записях' },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
      {opts.map((o) => (
        <Card key={o.title} className="bg-card/70 border-border p-6 flex items-start gap-4 hover:border-primary/40 transition-colors cursor-pointer">
          <div className="h-11 w-11 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center shrink-0">
            <Icon name={o.icon} className="text-primary" size={20} />
          </div>
          <div>
            <div className="font-medium">{o.title}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{o.desc}</div>
          </div>
          <Icon name="ChevronRight" className="text-muted-foreground ml-auto self-center" size={18} />
        </Card>
      ))}
    </div>
  );
}
