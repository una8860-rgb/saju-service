/**
 * 사주 4기둥 계산. 규칙은 docs/manseryeok/SPEC.md 참고.
 *
 * - 연주·월주: 출생 "순간"과 절입 "순간"을 비교 (lunar-javascript는 베이징시 기준이므로 UTC+8로 변환해 넣는다)
 * - 일주·시주: 출생지 지방평균시(LMT) 기준. 자시(LMT 23:00~)부터 다음 날 일주 (야자시 옵션 시 일주 유지)
 */
import { Solar } from "lunar-javascript";
import KoreanLunarCalendar from "korean-lunar-calendar";
import { BRANCHES, STEMS, ganzhiIndex, isYangStem } from "./constants";
import { fieldsAt, isDst, lmtOffsetMinutes, seoulOffsetMinutes, seoulWallToUtc } from "./timeCorrection";
import { findCity, lngCorrectionOf, type City } from "./locations";

const MIN = 60_000;
const BEIJING_OFFSET = 8 * 60;

export type CalendarType = "solar" | "lunar" | "leap";
export type Gender = "male" | "female";

export interface SajuInput {
  name?: string;
  gender: Gender;
  calendar: CalendarType;   // 양력 / 음력 평달 / 음력 윤달
  year: number; month: number; day: number;
  /** null이면 시각 모름 */
  time: { hour: number; minute: number } | null;
  cityId?: string;
  /** 야자시 적용 (기본 false: 자시부터 다음 날 일주) */
  yajasi?: boolean;
}

export interface Pillar { stem: number; branch: number }

export interface Daeun { order: number; startAge: number; startYear: number; pillar: Pillar }

export interface Saju {
  input: SajuInput;
  city: City;
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; leap: boolean };
  correction: {
    /** 해당 시점 한국 표준시 오프셋(분), 예: 540 = UTC+9 */
    tzOffset: number;
    dst: boolean;
    /** 출생지 경도 보정(분), 예: 서울 -32 */
    lngCorrection: number;
    /** 시계 시각 → 지방평균시 총 보정(분) */
    total: number;
    /** 보정된 지방평균시 HH:MM */
    lmt: string | null;
  } | null;
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null };
  /** 자시라서 일주가 다음 날로 넘어갔는지 */
  jasiNextDay: boolean;
  /** 시주 경계 ±15분 이내면 인접 시주 */
  boundary: { altHour: Pillar; minutesFromEdge: number } | null;
  /** 출생일이 절입일인데 시각을 모르는 경우 */
  jeolipDayUnknownTime: boolean;
  daeun: { forward: boolean; startAge: number; list: Daeun[] };
}

export const parseGanzhi = (gz: string): Pillar => ({
  stem: STEMS.indexOf(gz[0] as (typeof STEMS)[number]),
  branch: BRANCHES.indexOf(gz[1] as (typeof BRANCHES)[number]),
});

const pad = (n: number) => String(n).padStart(2, "0");

function toSolar(input: SajuInput) {
  const klc = new KoreanLunarCalendar();
  if (input.calendar === "solar") {
    if (!klc.setSolarDate(input.year, input.month, input.day)) throw new Error("지원하지 않는 양력 날짜입니다.");
    const l = klc.getLunarCalendar();
    return { solar: { year: input.year, month: input.month, day: input.day },
             lunar: { year: l.year, month: l.month, day: l.day, leap: !!l.intercalation } };
  }
  const leap = input.calendar === "leap";
  if (!klc.setLunarDate(input.year, input.month, input.day, leap))
    throw new Error(leap ? "해당 연월에 윤달이 없거나 잘못된 날짜입니다." : "잘못된 음력 날짜입니다.");
  const s = klc.getSolarCalendar();
  return { solar: { year: s.year, month: s.month, day: s.day },
           lunar: { year: input.year, month: input.month, day: input.day, leap } };
}

/** UTC 순간의 연주·월주 (절입 시각 기준) */
function yearMonthAt(utcMs: number) {
  const b = fieldsAt(utcMs, BEIJING_OFFSET);
  const lunar = Solar.fromYmdHms(b.year, b.month, b.day, b.hour, b.minute, b.second).getLunar();
  return { year: parseGanzhi(lunar.getYearInGanZhiExact()), month: parseGanzhi(lunar.getMonthInGanZhiExact()), lunar };
}

function dayPillarOf(y: number, m: number, d: number): Pillar {
  return parseGanzhi(Solar.fromYmd(y, m, d).getLunar().getDayInGanZhi());
}

function addDays(y: number, m: number, d: number, n: number) {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

/** 시두법: 일간과 시지로 시간 */
export function hourPillar(dayStem: number, hourBranch: number): Pillar {
  return { stem: ((dayStem % 5) * 2 + hourBranch) % 10, branch: hourBranch };
}

/** 지방평균시 분(0~1439) → 시지 인덱스 (자시 23:00~01:00) */
export const hourBranchOf = (lmtMinutes: number) => Math.floor(((lmtMinutes + 60) % 1440) / 120);

/** 지방평균시 날짜·분으로 일주와 시주를 정한다 (자시 정책 포함) */
function resolveDayHour(y: number, m: number, d: number, lmtMin: number, yajasi: boolean) {
  const today = dayPillarOf(y, m, d);
  const branch = hourBranchOf(lmtMin);
  if (lmtMin < 23 * 60) return { day: today, hour: hourPillar(today.stem, branch), jasiNextDay: false };

  const n = addDays(y, m, d, 1);
  const next = dayPillarOf(n.year, n.month, n.day);
  return yajasi
    ? { day: today, hour: hourPillar(next.stem, branch), jasiNextDay: false } // 야자시: 일주 유지, 시주는 다음 날 자시
    : { day: next, hour: hourPillar(next.stem, branch), jasiNextDay: true };   // 기본: 자시부터 다음 날
}

/** 베이징시 Solar → UTC ms */
const solarToUtc = (s: Solar) =>
  Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute(), s.getSecond()) - BEIJING_OFFSET * MIN;

export function computeSaju(input: SajuInput): Saju {
  const city = findCity(input.cityId);
  const { solar, lunar } = toSolar(input);
  const timeKnown = input.time !== null;
  const { hour, minute } = input.time ?? { hour: 12, minute: 0 };

  const utc = seoulWallToUtc(solar.year, solar.month, solar.day, hour, minute);
  const { year, month, lunar: bjLunar } = yearMonthAt(utc);

  // 절입일인데 시각을 모르면 월주(·연주)가 확정되지 않음
  let jeolipDayUnknownTime = false;
  if (!timeKnown) {
    const start = yearMonthAt(seoulWallToUtc(solar.year, solar.month, solar.day, 0, 0));
    const end = yearMonthAt(seoulWallToUtc(solar.year, solar.month, solar.day, 23, 59));
    jeolipDayUnknownTime = start.month.stem !== end.month.stem || start.month.branch !== end.month.branch;
  }

  let day: Pillar;
  let hourP: Pillar | null = null;
  let jasiNextDay = false;
  let boundary: Saju["boundary"] = null;
  let correction: Saju["correction"] = null;

  if (timeKnown) {
    const lng = lmtOffsetMinutes(city.lng);
    const lmt = fieldsAt(utc, lng);
    const lmtMin = lmt.hour * 60 + lmt.minute;
    const tzOffset = seoulOffsetMinutes(utc);
    correction = {
      tzOffset,
      dst: isDst(utc),
      lngCorrection: lngCorrectionOf(city),
      total: Math.round(lng - tzOffset),
      lmt: `${pad(lmt.hour)}:${pad(lmt.minute)}`,
    };

    const resolved = resolveDayHour(lmt.year, lmt.month, lmt.day, lmtMin, !!input.yajasi);
    day = resolved.day;
    hourP = resolved.hour;
    jasiNextDay = resolved.jasiNextDay;

    // 시주 경계(홀수 정시) ±15분 이내면 인접 시주도 계산 (날짜가 바뀌는 경우 포함)
    const sinceStart = (lmtMin + 60) % 120;          // 현재 시지 시작 후 경과 분
    const fromEdge = Math.min(sinceStart, 120 - sinceStart);
    if (fromEdge <= 15) {
      const altMin = sinceStart <= 15 ? lmtMin - (sinceStart + 1) : lmtMin + (120 - sinceStart);
      const shift = altMin < 0 ? -1 : altMin >= 1440 ? 1 : 0;
      const ad = addDays(lmt.year, lmt.month, lmt.day, shift);
      const alt = resolveDayHour(ad.year, ad.month, ad.day, (altMin + 1440) % 1440, !!input.yajasi);
      boundary = { altHour: alt.hour, minutesFromEdge: fromEdge };
    }
  } else {
    day = dayPillarOf(solar.year, solar.month, solar.day);
  }

  // 대운: 양년생 남자·음년생 여자는 순행
  const forward = isYangStem(year.stem) === (input.gender === "male");
  const jie = forward ? bjLunar.getNextJie(false) : bjLunar.getPrevJie(false);
  const diffDays = Math.abs(solarToUtc(jie.getSolar()) - utc) / 86_400_000;
  const startAge = Math.max(1, Math.round(diffDays / 3));
  const monthIdx = ganzhiIndex(month.stem, month.branch);
  const list: Daeun[] = Array.from({ length: 10 }, (_, i) => {
    const idx = (monthIdx + (forward ? i + 1 : -(i + 1)) + 600) % 60;
    const age = startAge + i * 10;
    return { order: i + 1, startAge: age, startYear: solar.year + age, pillar: { stem: idx % 10, branch: idx % 12 } };
  });

  return {
    input, city, solarDate: solar, lunarDate: lunar, correction,
    pillars: { year, month, day, hour: hourP },
    jasiNextDay, boundary, jeolipDayUnknownTime,
    daeun: { forward, startAge, list },
  };
}

/** 특정 연도의 세운 간지 (입춘 이후 시점 기준) */
export function yearPillarOf(year: number): Pillar {
  return parseGanzhi(Solar.fromYmd(year, 6, 1).getLunar().getYearInGanZhiExact());
}

const JIE_KO: Record<string, string> = {
  立春: "입춘", 惊蛰: "경칩", 驚蟄: "경칩", 清明: "청명", 立夏: "입하", 芒种: "망종", 芒種: "망종",
  小暑: "소서", 立秋: "입추", 白露: "백로", 寒露: "한로", 立冬: "입동", 大雪: "대설", 小寒: "소한",
};

/** 만세력 조회용: 주어진 순간 직전·직후 절입 (한국 시각 문자열) */
export function surroundingJie(utcMs: number) {
  const { lunar } = yearMonthAt(utcMs);
  const fmt = (j: ReturnType<typeof lunar.getNextJie>) => {
    const u = solarToUtc(j.getSolar());
    const k = fieldsAt(u, seoulOffsetMinutes(u));
    return { name: JIE_KO[j.getName()] ?? j.getName(),
             at: `${k.year}.${pad(k.month)}.${pad(k.day)} ${pad(k.hour)}:${pad(k.minute)}` };
  };
  return { prev: fmt(lunar.getPrevJie(false)), next: fmt(lunar.getNextJie(false)) };
}
