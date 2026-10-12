"use client";

import { useEffect, useMemo, useState } from "react";
import { analyze } from "@/lib/analysis";
import { HOUR_NAMES } from "@/lib/manseryeok/constants";
import { CITIES, DEFAULT_CITY_ID, SIDO_LIST } from "@/lib/manseryeok/locations";
import { computeSaju, surroundingJie } from "@/lib/manseryeok/pillars";
import { seoulWallToUtc } from "@/lib/manseryeok/timeCorrection";
import { Card, Notice } from "../ui/Card";
import { SajuTable } from "./SajuTable";

const pad = (n: number) => String(n).padStart(2, "0");

export function ManseryeokView() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);

  // 정적 빌드 시각이 아닌 방문 시각으로 초기화
  useEffect(() => {
    const now = new Date();
    setDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  }, []);

  const result = useMemo(() => {
    const [y, m, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    if (!y || !m || !d || Number.isNaN(h) || Number.isNaN(mi)) return null;
    try {
      const saju = computeSaju({ gender: "male", calendar: "solar", year: y, month: m, day: d, time: { hour: h, minute: mi }, cityId });
      return { saju, analysis: analyze(saju), jie: surroundingJie(seoulWallToUtc(y, m, d, h, mi)) };
    } catch {
      return null;
    }
  }, [date, time, cityId]);

  const input = "h-12 w-full rounded-xl bg-page px-3 text-[16px] outline-none focus:ring-2 focus:ring-accent";

  return (
    <>
      <Card eyebrow="만세력" title="날짜별 간지 조회">
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} min="1930-01-01" max="2050-12-31" onChange={(e) => setDate(e.target.value)} className={input} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={input} />
        </div>
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className={`${input} mt-2`}>
          {SIDO_LIST.map((s) => (
            <optgroup key={s} label={s}>
              {CITIES.filter((c) => c.sido === s).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </Card>

      {!date ? null : result ? (
        <>
          <Card eyebrow={`양력 ${date} ${time}`} title={`음력 ${result.saju.lunarDate.year}.${result.saju.lunarDate.month}.${result.saju.lunarDate.day}${result.saju.lunarDate.leap ? " (윤달)" : ""}`}>
            <SajuTable analysis={result.analysis} hourUnknown={false} />
            <dl className="mt-5 grid grid-cols-2 gap-2 text-[13px]">
              <Row k="표준시" v={`UTC+${result.saju.correction!.tzOffset / 60}${result.saju.correction!.dst ? " (서머타임)" : ""}`} />
              <Row k="경도 보정" v={`${result.saju.correction!.lngCorrection}분`} />
              <Row k="지방평균시" v={result.saju.correction!.lmt!} />
              <Row k="시진" v={HOUR_NAMES[result.saju.pillars.hour!.branch]} />
              <Row k={`직전 절기 · ${result.jie.prev.name}`} v={result.jie.prev.at} />
              <Row k={`다음 절기 · ${result.jie.next.name}`} v={result.jie.next.at} />
            </dl>
          </Card>
          {result.saju.jasiNextDay && <Notice>자시(보정 후 23시 이후)라 일주를 다음 날로 표시했어요.</Notice>}
        </>
      ) : (
        <Notice tone="yellow">1930~2050년 사이의 올바른 날짜와 시각을 입력해 주세요.</Notice>
      )}
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-page px-3 py-2.5">
      <dt className="text-[12px] text-sub">{k}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{v}</dd>
    </div>
  );
}
