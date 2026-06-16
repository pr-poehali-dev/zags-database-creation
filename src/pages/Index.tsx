import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type TabKey = 'certificates' | 'registration' | 'staff' | 'settings';

const NAV: { key: TabKey; label: string; icon: string }[] = [
  { key: 'certificates', label: 'Свидетельства', icon: 'ScrollText' },
  { key: 'registration', label: 'Регистрация', icon: 'ClipboardList' },
  { key: 'staff', label: 'Сотрудники', icon: 'Users' },
  { key: 'settings', label: 'Настройки', icon: 'Settings' },
];

interface CertData {
  series: string;
  number: string;
  husband: string;
  husbandBirth: string;
  wife: string;
  wifeBirth: string;
  surnameAfter: string;
  marriageDate: string;
  actNumber: string;
  place: string;
  registrar: string;
}

const EMPTY: CertData = {
  series: 'I-МБ',
  number: '№ 482917',
  husband: 'Соколов Дмитрий Андреевич',
  husbandBirth: '14.03.1992',
  wife: 'Орлова Екатерина Сергеевна',
  wifeBirth: '27.08.1994',
  surnameAfter: 'Соколова',
  marriageDate: '16.06.2026',
  actNumber: '156',
  place: 'Дворец бракосочетания №1, г. Москва',
  registrar: 'Воронцова М. И.',
};

export default function Index() {
  const [tab, setTab] = useState<TabKey>('certificates');
  const [data, setData] = useState<CertData>(EMPTY);

  const upd = (k: keyof CertData, v: string) =>
    setData((d) => ({ ...d, [k]: v }));

  return (
    <div className="min-h-screen flex text-foreground gov-pattern">
      {/* Sidebar */}
      <aside className="no-print w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-sm flex flex-col">
        <div className="px-6 py-7 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Icon name="Landmark" className="text-primary" size={22} />
            </div>
            <div>
              <div className="font-serif text-2xl leading-none text-primary tracking-wide">
                ЗАГС
              </div>
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

        <div className="px-6 py-5 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Система активна
          </div>
          <div className="mt-2">Версия 1.0 · Защищённый доступ</div>
        </div>
      </aside>

      {/* Main */}
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
              <div className="text-sm font-medium">Воронцова М. И.</div>
              <div className="text-xs text-muted-foreground">Регистратор</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center font-serif text-primary">
              В
            </div>
          </div>
        </header>

        <div className="p-8">
          {tab === 'certificates' && (
            <Certificates data={data} upd={upd} />
          )}
          {tab === 'registration' && <Registration />}
          {tab === 'staff' && <Staff />}
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
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary/40 border-border focus-visible:ring-primary"
      />
    </div>
  );
}

function Certificates({
  data,
  upd,
}: {
  data: CertData;
  upd: (k: keyof CertData, v: string) => void;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Form */}
      <Card className="no-print bg-card/70 border-border p-6">
        <SectionTitle icon="ScrollText">Свидетельство о заключении брака</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Серия" value={data.series} onChange={(v) => upd('series', v)} />
          <Field label="Номер" value={data.number} onChange={(v) => upd('number', v)} />
          <div className="col-span-2">
            <Field label="Супруг (Ф.И.О.)" value={data.husband} onChange={(v) => upd('husband', v)} />
          </div>
          <Field label="Дата рожд. супруга" value={data.husbandBirth} onChange={(v) => upd('husbandBirth', v)} />
          <Field label="Фамилия после брака" value={data.surnameAfter} onChange={(v) => upd('surnameAfter', v)} />
          <div className="col-span-2">
            <Field label="Супруга (Ф.И.О.)" value={data.wife} onChange={(v) => upd('wife', v)} />
          </div>
          <Field label="Дата рожд. супруги" value={data.wifeBirth} onChange={(v) => upd('wifeBirth', v)} />
          <Field label="Дата заключения брака" value={data.marriageDate} onChange={(v) => upd('marriageDate', v)} />
          <Field label="Номер актовой записи" value={data.actNumber} onChange={(v) => upd('actNumber', v)} />
          <Field label="Регистратор" value={data.registrar} onChange={(v) => upd('registrar', v)} />
          <div className="col-span-2">
            <Field label="Место регистрации" value={data.place} onChange={(v) => upd('place', v)} />
          </div>
        </div>
        <Button
          onClick={() => window.print()}
          className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
        >
          <Icon name="Printer" size={18} className="mr-2" />
          Печать свидетельства
        </Button>
      </Card>

      {/* Preview / print */}
      <div>
        <SectionTitle icon="Eye">Предпросмотр документа</SectionTitle>
        <CertificatePreview data={data} />
      </div>
    </div>
  );
}

function CertificatePreview({ data }: { data: CertData }) {
  return (
    <div className="print-area cert-paper rounded-md shadow-2xl p-10 text-[#2a2419] relative overflow-hidden animate-scale-in">
      <div
        className="absolute inset-3 border-2 rounded pointer-events-none"
        style={{ borderColor: '#b8975188' }}
      />
      <div
        className="absolute inset-[18px] border rounded pointer-events-none"
        style={{ borderColor: '#b8975144' }}
      />

      <div className="relative text-center">
        <div className="flex justify-center mb-3">
          <div className="h-14 w-14 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#9a7b3e' }}>
            <Icon name="Landmark" size={26} style={{ color: '#9a7b3e' }} />
          </div>
        </div>
        <div className="text-[11px] uppercase tracking-[0.25em]" style={{ color: '#7a6840' }}>
          Российская Федерация
        </div>
        <h3 className="font-serif text-3xl mt-3 mb-1" style={{ color: '#5a4a22' }}>
          Свидетельство
        </h3>
        <div className="font-serif text-lg" style={{ color: '#7a6840' }}>
          о заключении брака
        </div>

        <div className="my-5 text-sm font-medium" style={{ color: '#5a4a22' }}>
          {data.series} {data.number}
        </div>

        <div className="text-left text-sm space-y-3 mt-6 px-2" style={{ color: '#2a2419' }}>
          <p className="leading-relaxed">
            Гражданин{' '}
            <b className="font-semibold">{data.husband}</b>, {data.husbandBirth} г.р.
          </p>
          <p className="leading-relaxed">
            и гражданка{' '}
            <b className="font-semibold">{data.wife}</b>, {data.wifeBirth} г.р.
          </p>
          <p className="leading-relaxed">
            заключили брак{' '}
            <b className="font-semibold">{data.marriageDate}</b>, о чём составлена
            запись акта о заключении брака № {data.actNumber}.
          </p>
          <p className="leading-relaxed">
            После заключения брака присвоены фамилии:<br />
            мужу — Соколов, жене — <b className="font-semibold">{data.surnameAfter}</b>.
          </p>
        </div>

        <div className="mt-7 pt-4 flex items-end justify-between text-xs" style={{ borderTop: '1px solid #b8975155', color: '#5a4a22' }}>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: '#7a6840' }}>Место регистрации</div>
            <div className="mt-1 max-w-[160px]">{data.place}</div>
          </div>
          <div className="text-right">
            <div className="font-serif italic text-base" style={{ color: '#5a4a22' }}>{data.registrar}</div>
            <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: '#7a6840' }}>
              Руководитель органа ЗАГС
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Registration() {
  const rows = [
    { id: '156', type: 'Брак', name: 'Соколов Д. А. / Орлова Е. С.', date: '16.06.2026', status: 'Зарегистрировано' },
    { id: '157', type: 'Рождение', name: 'Соколова Анна Дмитриевна', date: '15.06.2026', status: 'Зарегистрировано' },
    { id: '158', type: 'Брак', name: 'Лебедев И. П. / Зайцева М. К.', date: '14.06.2026', status: 'На проверке' },
    { id: '159', type: 'Расторжение', name: 'Громов А. С. / Громова Н. В.', date: '12.06.2026', status: 'Зарегистрировано' },
  ];
  return (
    <Card className="bg-card/70 border-border p-6 animate-fade-in">
      <SectionTitle icon="ClipboardList">Журнал актовых записей</SectionTitle>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">№ акта</th>
              <th className="text-left px-4 py-3 font-medium">Тип</th>
              <th className="text-left px-4 py-3 font-medium">Участники</th>
              <th className="text-left px-4 py-3 font-medium">Дата</th>
              <th className="text-left px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">{r.id}</td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      r.status === 'Зарегистрировано'
                        ? 'border-emerald-600/40 text-emerald-400 bg-emerald-600/10'
                        : 'border-primary/40 text-primary bg-primary/10'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Staff() {
  const people = [
    { name: 'Воронцова Мария Игоревна', role: 'Руководитель отдела', acts: 1240 },
    { name: 'Дроздов Павел Сергеевич', role: 'Регистратор', acts: 856 },
    { name: 'Никитина Ольга Львовна', role: 'Регистратор', acts: 612 },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-5 animate-fade-in">
      {people.map((p) => (
        <Card key={p.name} className="bg-card/70 border-border p-6 hover:border-primary/40 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center font-serif text-xl text-primary mb-4">
            {p.name[0]}
          </div>
          <div className="font-medium">{p.name}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{p.role}</div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Оформлено актов</span>
            <span className="font-semibold text-primary">{p.acts}</span>
          </div>
        </Card>
      ))}
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
