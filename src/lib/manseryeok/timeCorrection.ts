/**
 * 시간 보정.
 * 시계 시각(한국) → UTC 순간: IANA "Asia/Seoul" 이력을 사용해 서머타임(1948–51, 1955–60, 1987–88)과
 * 1954–61년 동경 127.5° 표준시(UTC+8:30)를 자동 반영한다.
 * UTC 순간 → 지방평균시(LMT): 출생지 경도 × 4분.
 */

const TZ = "Asia/Seoul";
const MIN = 60_000;

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, hourCycle: "h23",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
});

/** 주어진 UTC 순간에 서울 시계가 UTC보다 몇 분 앞서는지 */
export function seoulOffsetMinutes(utcMs: number): number {
  const parts = fmt.formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const wall = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return (wall - Math.floor(utcMs / MIN) * MIN) / MIN;
}

/** 서울 시계 시각 → UTC 밀리초 */
export function seoulWallToUtc(y: number, m: number, d: number, h: number, mi: number): number {
  const naive = Date.UTC(y, m - 1, d, h, mi);
  let utc = naive - seoulOffsetMinutes(naive) * MIN;
  const off2 = seoulOffsetMinutes(utc);
  if (naive - off2 * MIN !== utc) utc = naive - off2 * MIN;
  return utc;
}

/** 그 해 1월 기준 표준시 오프셋보다 크면 서머타임 */
export function isDst(utcMs: number): boolean {
  const year = new Date(utcMs + 9 * 60 * MIN).getUTCFullYear();
  return seoulOffsetMinutes(utcMs) > seoulOffsetMinutes(Date.UTC(year, 0, 15));
}

export interface ClockFields { year: number; month: number; day: number; hour: number; minute: number; second: number }

/** UTC 밀리초를 특정 오프셋(분)의 시계 값으로 */
export function fieldsAt(utcMs: number, offsetMinutes: number): ClockFields {
  const d = new Date(utcMs + offsetMinutes * MIN);
  return {
    year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
    hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds(),
  };
}

/** 지방평균시 오프셋(분) = 경도 × 4 */
export const lmtOffsetMinutes = (lng: number) => lng * 4;
