import { describe, expect, it } from "vitest";
import { computeSaju, type SajuInput } from "@/lib/manseryeok/pillars";
import { BRANCHES, STEMS } from "@/lib/manseryeok/constants";

const gz = (p: { stem: number; branch: number } | null) => (p ? STEMS[p.stem] + BRANCHES[p.branch] : null);

const saju = (date: string, time: string | null, extra: Partial<SajuInput> = {}) => {
  const [year, month, day] = date.split("-").map(Number);
  const t = time ? { hour: Number(time.slice(0, 2)), minute: Number(time.slice(3)) } : null;
  return computeSaju({ gender: "male", calendar: "solar", year, month, day, time: t, cityId: "seoul", ...extra });
};

describe("연주·월주: 절입 시각 기준", () => {
  // 2024 입춘 = 2024-02-04 17:27 KST (한국천문연구원)
  it("입춘 직전은 전년도 연주", () => {
    const s = saju("2024-02-04", "17:20");
    expect(gz(s.pillars.year)).toBe("癸卯");
    expect(gz(s.pillars.month)).toBe("乙丑");
  });
  it("입춘 직후는 새 연주", () => {
    const s = saju("2024-02-04", "17:35");
    expect(gz(s.pillars.year)).toBe("甲辰");
    expect(gz(s.pillars.month)).toBe("丙寅");
  });
  // 2024 경칩 = 2024-03-05 11:22 KST
  it("경칩 전후로 월주가 바뀐다", () => {
    expect(gz(saju("2024-03-05", "11:20").pillars.month)).toBe("丙寅");
    expect(gz(saju("2024-03-05", "11:25").pillars.month)).toBe("丁卯");
  });
  it("시각을 모르는데 절입일이면 표시", () => {
    expect(saju("2024-02-04", null).jeolipDayUnknownTime).toBe(true);
    expect(saju("2024-02-05", null).jeolipDayUnknownTime).toBe(false);
  });
});

describe("일주", () => {
  it("2000-01-01은 戊午일", () => {
    expect(gz(saju("2000-01-01", "12:00").pillars.day)).toBe("戊午");
  });
  it("1990-05-15는 庚辰일", () => {
    expect(gz(saju("1990-05-15", "12:00").pillars.day)).toBe("庚辰");
  });
});

describe("자시 처리", () => {
  it("기본값: 보정 후 23시 이후면 다음 날 일주", () => {
    const s = saju("1990-05-15", "23:40"); // 서울 보정 -32분 → 23:07
    expect(s.correction?.lmt).toBe("23:07");
    expect(s.jasiNextDay).toBe(true);
    expect(gz(s.pillars.day)).toBe("辛巳");
    expect(gz(s.pillars.hour)).toBe("戊子");
  });
  it("야자시 옵션: 일주 유지, 시주는 다음 날 자시", () => {
    const s = saju("1990-05-15", "23:40", { yajasi: true });
    expect(gz(s.pillars.day)).toBe("庚辰");
    expect(gz(s.pillars.hour)).toBe("戊子");
  });
  it("보정 후 23시 전이면 당일 해시", () => {
    const s = saju("1990-05-15", "23:20"); // → 22:47
    expect(gz(s.pillars.day)).toBe("庚辰");
    expect(gz(s.pillars.hour)).toBe("丁亥");
  });
  it("자시 경계 근처면 인접 시주(전날 해시)를 함께 제공", () => {
    const s = saju("1990-05-15", "23:40");
    expect(s.boundary?.minutesFromEdge).toBe(7);
    expect(gz(s.boundary!.altHour)).toBe("丁亥");
  });
});

describe("시간 보정", () => {
  it("1988 서머타임: 12:00 → 巳시", () => {
    const s = saju("1988-07-01", "12:00");
    expect(s.correction?.dst).toBe(true);
    expect(BRANCHES[s.pillars.hour!.branch]).toBe("巳");
  });
  it("서머타임 아닌 날 12:00 → 午시", () => {
    const s = saju("1988-12-01", "12:00");
    expect(s.correction?.dst).toBe(false);
    expect(BRANCHES[s.pillars.hour!.branch]).toBe("午");
  });
  it("1960 표준시 UTC+8:30 + 서머타임", () => {
    const s = saju("1960-07-01", "12:00");
    expect(s.correction?.tzOffset).toBe(570);
    expect(BRANCHES[s.pillars.hour!.branch]).toBe("巳");
  });
  it("같은 시각이라도 출생지에 따라 시주가 갈린다", () => {
    expect(BRANCHES[saju("2024-06-01", "07:28", { cityId: "seoul" }).pillars.hour!.branch]).toBe("卯");
    expect(BRANCHES[saju("2024-06-01", "07:28", { cityId: "busan" }).pillars.hour!.branch]).toBe("辰");
  });
  it("시각 모름이면 시주 없음", () => {
    const s = saju("1990-05-15", null);
    expect(s.pillars.hour).toBeNull();
    expect(s.correction).toBeNull();
  });
});

describe("음력 입력", () => {
  it("음력 2024-01-01 = 양력 2024-02-10", () => {
    expect(saju("2024-01-01", "12:00", { calendar: "lunar" }).solarDate).toEqual({ year: 2024, month: 2, day: 10 });
  });
  it("윤2월 2023-02-10 = 양력 2023-03-31", () => {
    expect(saju("2023-02-10", "12:00", { calendar: "leap" }).solarDate).toEqual({ year: 2023, month: 3, day: 31 });
  });
  it("윤달이 없는 달을 윤달로 입력하면 오류", () => {
    expect(() => saju("2024-02-10", "12:00", { calendar: "leap" })).toThrow();
  });
});

describe("대운", () => {
  it("양년(庚) 남자는 순행, 월주 다음 간지부터", () => {
    const s = saju("1990-05-15", "12:00");
    expect(s.daeun.forward).toBe(true);
    expect(gz(s.daeun.list[0].pillar)).toBe("壬午");
    expect(s.daeun.startAge).toBe(7); // 망종(6/6)까지 약 22일 ÷ 3
  });
  it("양년 여자는 역행", () => {
    const s = saju("1990-05-15", "12:00", { gender: "female" });
    expect(s.daeun.forward).toBe(false);
    expect(gz(s.daeun.list[0].pillar)).toBe("庚辰");
    expect(s.daeun.startAge).toBe(3); // 입하(5/6)부터 약 9.5일 ÷ 3
  });
});
