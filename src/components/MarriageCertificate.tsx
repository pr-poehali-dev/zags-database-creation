export interface CertData {
  series: string;
  number: string;
  husband: string;
  husbandBirth: string;
  husbandSurnameAfter: string;
  wife: string;
  wifeBirth: string;
  wifeSurnameAfter: string;
  marriageDate: string;
  actNumber: string;
  issueDate: string;
  place: string;
  registrar: string;
}

function Line({ value, caption }: { value?: string; caption: string }) {
  return (
    <div className="mb-2">
      <div
        className="min-h-[22px] border-b text-center font-medium text-[15px] leading-tight pb-0.5"
        style={{ borderColor: '#c98a98' }}
      >
        {value || '\u00A0'}
      </div>
      <div className="text-center text-[9px] italic mt-0.5" style={{ color: '#9a6b76' }}>
        {caption}
      </div>
    </div>
  );
}

export default function MarriageCertificate({ data }: { data: CertData }) {
  return (
    <div
      className="print-area relative mx-auto w-full max-w-[600px] aspect-[600/820] overflow-hidden select-none"
      style={{
        background:
          'repeating-linear-gradient(45deg, #fbe9ee 0px, #fbe9ee 6px, #f9e0e7 6px, #f9e0e7 12px)',
        boxShadow: '0 20px 60px rgba(0,0,0,.4)',
      }}
    >
      {/* ornamental border */}
      <div
        className="absolute inset-2 border-[3px] rounded-sm pointer-events-none"
        style={{ borderColor: '#cf94a2', borderStyle: 'double' }}
      />
      <div
        className="absolute inset-[14px] border pointer-events-none"
        style={{ borderColor: '#dcaeb9' }}
      />

      {/* watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: 'rotate(-30deg)' }}
      >
        <div
          className="font-serif font-bold whitespace-nowrap"
          style={{ color: '#d99', opacity: 0.25, fontSize: '46px', letterSpacing: '4px' }}
        >
          РОССИЙСКАЯ ФЕДЕРАЦИЯ
        </div>
      </div>

      {/* content */}
      <div className="relative px-8 pt-6 pb-5 h-full flex flex-col" style={{ color: '#6b2433' }}>
        {/* coat of arms */}
        <div className="flex justify-center mb-1">
          <div
            className="h-12 w-10 flex items-center justify-center text-2xl"
            style={{ color: '#8a3a48' }}
          >
            🦅
          </div>
        </div>

        <h1
          className="font-serif text-center font-bold leading-tight tracking-wide"
          style={{ color: '#7a2a38', fontSize: '26px' }}
        >
          СВИДЕТЕЛЬСТВО
          <div style={{ fontSize: '22px' }}>О ЗАКЛЮЧЕНИИ БРАКА</div>
        </h1>

        <div className="mt-4 flex-1 flex flex-col justify-between text-[13px]">
          <div>
            <Line value={data.husband} caption="фамилия, имя, отчество" />
            <div className="grid grid-cols-2 gap-3">
              <Line value={data.husbandBirth} caption="дата рождения" />
              <Line caption="место рождения" />
            </div>

            <div className="text-center font-serif text-lg my-1" style={{ color: '#7a2a38' }}>
              и
            </div>

            <Line value={data.wife} caption="фамилия, имя, отчество" />
            <div className="grid grid-cols-2 gap-3">
              <Line value={data.wifeBirth} caption="дата рождения" />
              <Line caption="место рождения" />
            </div>

            <div className="flex items-end gap-3 mt-2">
              <span className="font-medium whitespace-nowrap">заключили брак</span>
              <div className="flex-1">
                <Line value={data.marriageDate} caption="число, месяц, год (цифрами и прописью)" />
              </div>
            </div>

            <div className="mt-2 text-[12px] leading-relaxed">
              <div className="flex items-end gap-2">
                <span>о чём составлена запись акта о заключении брака №</span>
                <span
                  className="inline-block min-w-[60px] border-b text-center font-semibold pb-0.5"
                  style={{ borderColor: '#c98a98' }}
                >
                  {data.actNumber || '\u00A0'}
                </span>
              </div>
              <div className="mt-1">После заключения брака присвоены фамилии:</div>
              <div className="flex items-end gap-2 mt-1">
                <span className="w-12">мужу</span>
                <span className="flex-1 border-b text-center font-semibold pb-0.5" style={{ borderColor: '#c98a98' }}>
                  {data.husbandSurnameAfter || '\u00A0'}
                </span>
              </div>
              <div className="flex items-end gap-2 mt-1">
                <span className="w-12">жене</span>
                <span className="flex-1 border-b text-center font-semibold pb-0.5" style={{ borderColor: '#c98a98' }}>
                  {data.wifeSurnameAfter || '\u00A0'}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-[11px]">Место государственной регистрации</div>
              <Line value={data.place} caption="наименование органа записи актов гражданского состояния" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-end gap-2 text-[12px]">
              <span>Дата выдачи</span>
              <span
                className="inline-block min-w-[120px] border-b text-center font-semibold pb-0.5"
                style={{ borderColor: '#c98a98' }}
              >
                {data.issueDate || '\u00A0'}
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div className="text-[10px] italic" style={{ color: '#9a6b76' }}>
                <div
                  className="h-12 w-12 rounded-full border-2 flex items-center justify-center text-[8px] text-center leading-none mb-1"
                  style={{ borderColor: '#7a8ac0', color: '#7a8ac0' }}
                >
                  М.П.
                </div>
              </div>
              <div className="text-right">
                <div className="border-b font-serif italic text-[15px] pb-0.5 min-w-[150px]" style={{ borderColor: '#c98a98' }}>
                  {data.registrar || '\u00A0'}
                </div>
                <div className="text-[9px] italic mt-0.5" style={{ color: '#9a6b76' }}>
                  Руководитель органа записи актов гражданского состояния
                </div>
              </div>
            </div>

            <div className="text-center font-bold mt-3 tracking-widest" style={{ color: '#c0392b', fontSize: '14px' }}>
              {data.series} № {data.number}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}