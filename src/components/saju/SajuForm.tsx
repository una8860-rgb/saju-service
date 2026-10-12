"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CITIES, DEFAULT_CITY_ID, SIDO_LIST, cityLabel, findCity, lngCorrectionOf, searchCities } from "@/lib/manseryeok/locations";
import type { CalendarType, Gender } from "@/lib/manseryeok/pillars";
import { toQuery } from "@/lib/query";
import { cx } from "@/lib/ui";

const THIS_YEAR = new Date().getFullYear();
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export function SajuForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [calendar, setCalendar] = useState<CalendarType>("solar");
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState<number | "">("");
  const [minute, setMinute] = useState(0);
  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);
  const [sido, setSido] = useState(findCity(DEFAULT_CITY_ID).sido);
  const [yajasi, setYajasi] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const cityHits = useMemo(() => searchCities(cityQuery), [cityQuery]);
  const city = findCity(cityId);
  const pickCity = (id: string) => { const c = findCity(id); setSido(c.sido); setCityId(c.id); setCityQuery(""); };

  const maxDay = calendar === "solar" ? new Date(year, month, 0).getDate() : 30;
  const cities = useMemo(() => CITIES.filter((c) => c.sido === sido), [sido]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = toQuery({
      name: name.trim() || undefined, gender, calendar, year, month, day: Math.min(day, maxDay),
      time: hour === "" ? null : { hour, minute }, cityId, yajasi,
    });
    router.push(`/saju/result/?${q}`);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="이름">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="이름 또는 닉네임 (선택)"
          className="h-12 w-full rounded-xl bg-page px-4 text-[16px] outline-none focus:ring-2 focus:ring-accent" />
      </Field>

      <Field label="성별">
        <Segmented value={gender} onChange={setGender} options={[["female", "여성"], ["male", "남성"]]} />
      </Field>

      <Field label="생년월일">
        <Segmented value={calendar} onChange={setCalendar} options={[["solar", "양력"], ["lunar", "음력"], ["leap", "음력 윤달"]]} />
        <div className="mt-2 grid grid-cols-[1.3fr_1fr_1fr] gap-2">
          <Select value={year} onChange={(v) => setYear(+v)} options={range(1930, THIS_YEAR).reverse().map((y) => [y, `${y}년`])} />
          <Select value={month} onChange={(v) => setMonth(+v)} options={range(1, 12).map((m) => [m, `${m}월`])} />
          <Select value={Math.min(day, maxDay)} onChange={(v) => setDay(+v)} options={range(1, maxDay).map((d) => [d, `${d}일`])} />
        </div>
      </Field>

      <Field label="태어난 시각" hint="출생증명서·산모수첩의 시계 시각 그대로 입력하세요. 보정은 자동으로 해요.">
        <div className="grid grid-cols-2 gap-2">
          <Select value={hour} onChange={(v) => setHour(v === "" ? "" : +v)}
            options={[["", "시각 모름"], ...range(0, 23).map((h) => [h, `${h}시`] as [number, string])]} />
          <Select value={minute} onChange={(v) => setMinute(+v)} disabled={hour === ""}
            options={range(0, 59).map((m) => [m, `${m}분`])} />
        </div>
      </Field>

      <Field label="태어난 곳" hint="전국 시·군 단위로 경도에 맞춰 시각을 보정해요.">
        <input value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} placeholder="지역 검색 (예: 나주, 익산)"
          className="mb-2 h-12 w-full rounded-xl bg-page px-4 text-[16px] outline-none focus:ring-2 focus:ring-accent" />
        {cityQuery && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {cityHits.length ? cityHits.map((c) => (
              <button key={c.id} type="button" onClick={() => pickCity(c.id)}
                className="rounded-full bg-accent-soft px-3 py-1.5 text-[14px] font-semibold text-accent">
                {cityLabel(c)}
              </button>
            )) : <span className="text-[13px] text-sub">검색 결과가 없어요. 아래에서 시/도를 골라 주세요.</span>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Select value={sido} onChange={(v) => { setSido(v); setCityId(CITIES.find((c) => c.sido === v)!.id); }}
            options={SIDO_LIST.map((s) => [s, s])} />
          <Select value={cityId} onChange={setCityId} options={cities.map((c) => [c.id, c.name])} />
        </div>
        <p className="mt-1.5 text-[13px] font-semibold text-accent">
          {cityLabel(city)} · 동경 {city.lng.toFixed(2)}° · 시각 {lngCorrectionOf(city)}분 보정
        </p>
      </Field>

      <details className="rounded-xl bg-page px-4 py-3 text-[14px]">
        <summary className="cursor-pointer font-semibold text-sub">고급 설정</summary>
        <label className="mt-3 flex items-start gap-2">
          <input type="checkbox" checked={yajasi} onChange={(e) => setYajasi(e.target.checked)} className="mt-1" />
          <span>
            <b>야자시 적용</b>
            <span className="block text-[13px] text-sub">밤 11시~자정 출생 시 일주를 당일로 유지해요. (기본: 자시부터 다음 날)</span>
          </span>
        </label>
      </details>

      <button type="submit" className="h-14 w-full rounded-2xl bg-accent text-[17px] font-bold text-white active:scale-[0.99]">
        사주 풀이 보기
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[14px] font-bold">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[12px] leading-relaxed text-sub">{hint}</p>}
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: [T, string][];
}) {
  return (
    <div className="flex rounded-xl bg-page p-1">
      {options.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={cx("h-10 flex-1 rounded-lg text-[15px] font-semibold transition",
            value === v ? "bg-white text-ink shadow-sm" : "text-sub")}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Select({ value, onChange, options, disabled }: {
  value: string | number; onChange: (v: string) => void; options: [string | number, string][]; disabled?: boolean;
}) {
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full appearance-none rounded-xl bg-page px-4 text-[16px] outline-none focus:ring-2 focus:ring-accent disabled:opacity-40">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
