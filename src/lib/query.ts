import type { CalendarType, Gender, SajuInput } from "./manseryeok/pillars";

/**
 * 결과 페이지 URL 파라미터 ↔ 입력값 (정적 호스팅이라 서버 없이 URL로 전달)
 * n=이름 g=m|f c=s|l|y(윤달) d=YYYY-MM-DD t=HH:MM(없으면 모름) loc=도시id yj=1(야자시)
 */
export function toQuery(i: SajuInput): string {
  const p = new URLSearchParams();
  if (i.name) p.set("n", i.name);
  p.set("g", i.gender === "male" ? "m" : "f");
  p.set("c", { solar: "s", lunar: "l", leap: "y" }[i.calendar]);
  p.set("d", `${i.year}-${String(i.month).padStart(2, "0")}-${String(i.day).padStart(2, "0")}`);
  if (i.time) p.set("t", `${String(i.time.hour).padStart(2, "0")}:${String(i.time.minute).padStart(2, "0")}`);
  if (i.cityId) p.set("loc", i.cityId);
  if (i.yajasi) p.set("yj", "1");
  return p.toString();
}

export function fromQuery(p: URLSearchParams): SajuInput | null {
  const d = p.get("d")?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!d) return null;
  const t = p.get("t")?.match(/^(\d{1,2}):(\d{2})$/);
  const cal: Record<string, CalendarType> = { s: "solar", l: "lunar", y: "leap" };
  return {
    name: p.get("n")?.slice(0, 20) || undefined,
    gender: (p.get("g") === "f" ? "female" : "male") as Gender,
    calendar: cal[p.get("c") ?? "s"] ?? "solar",
    year: +d[1], month: +d[2], day: +d[3],
    time: t ? { hour: +t[1], minute: +t[2] } : null,
    cityId: p.get("loc") ?? undefined,
    yajasi: p.get("yj") === "1",
  };
}
