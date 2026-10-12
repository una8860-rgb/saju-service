import { describe, expect, it } from "vitest";
import { analyze, tenGod, twelveStage, branchTenGod } from "@/lib/analysis";
import { computeSaju } from "@/lib/manseryeok/pillars";

describe("십신", () => {
  it("甲 일간 기준", () => {
    expect(tenGod(0, 0)).toBe("비견");
    expect(tenGod(0, 1)).toBe("겁재");
    expect(tenGod(0, 2)).toBe("식신");
    expect(tenGod(0, 3)).toBe("상관");
    expect(tenGod(0, 4)).toBe("편재");
    expect(tenGod(0, 5)).toBe("정재");
    expect(tenGod(0, 6)).toBe("편관");
    expect(tenGod(0, 7)).toBe("정관");
    expect(tenGod(0, 8)).toBe("편인");
    expect(tenGod(0, 9)).toBe("정인");
  });
  it("지지는 정기 기준 (子=癸, 午=丁)", () => {
    expect(branchTenGod(0, 0)).toBe("정인");
    expect(branchTenGod(0, 6)).toBe("상관");
  });
});

describe("12운성", () => {
  it("甲은 亥에서 장생, 卯에서 제왕", () => {
    expect(twelveStage(0, 11)).toBe("장생");
    expect(twelveStage(0, 3)).toBe("제왕");
  });
  it("乙은 午에서 장생, 寅에서 제왕 (역행)", () => {
    expect(twelveStage(1, 6)).toBe("장생");
    expect(twelveStage(1, 2)).toBe("제왕");
  });
});

describe("analyze", () => {
  const s = computeSaju({ gender: "male", calendar: "solar", year: 1990, month: 5, day: 15, time: { hour: 12, minute: 0 }, cityId: "seoul" });
  const a = analyze(s, new Date(2026, 9, 12));

  it("8글자 오행 합계", () => {
    expect(a.totalChars).toBe(8);
    expect(Object.values(a.elementCount).reduce((x, y) => x + y, 0)).toBe(8);
  });
  it("원국표는 시·일·월·연 순서, 일간 표시", () => {
    expect(a.cells.map((c) => c.position)).toEqual(["hour", "day", "month", "year"]);
    expect(a.cells[1].stem.tenGod).toBe("일간");
  });
  it("2026년 세운은 丙午", () => {
    expect(a.seun.pillar).toEqual({ stem: 2, branch: 6 });
  });
  it("점수는 30~95 범위", () => {
    for (const v of Object.values(a.themes)) expect(v).toBeGreaterThanOrEqual(30);
    for (const v of Object.values(a.themes)) expect(v).toBeLessThanOrEqual(95);
  });
  it("시각 모름이면 6글자", () => {
    const s2 = computeSaju({ gender: "female", calendar: "solar", year: 1990, month: 5, day: 15, time: null });
    expect(analyze(s2).totalChars).toBe(6);
  });
});
