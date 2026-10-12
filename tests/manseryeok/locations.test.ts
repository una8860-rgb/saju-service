import { describe, expect, it } from "vitest";
import { CITIES, SIDO_LIST, findCity, lngCorrectionOf, searchCities } from "@/lib/manseryeok/locations";
import { computeSaju } from "@/lib/manseryeok/pillars";

describe("출생지 데이터", () => {
  it("전국 17개 시도, 167개 시·군", () => {
    expect(SIDO_LIST).toHaveLength(17);
    expect(CITIES).toHaveLength(167);
  });
  it("id 중복 없음, 경도는 한국 범위", () => {
    expect(new Set(CITIES.map((c) => c.id)).size).toBe(CITIES.length);
    for (const c of CITIES) {
      expect(c.lng).toBeGreaterThan(124.5);
      expect(c.lng).toBeLessThan(131);
    }
  });
  it("기존 공유 링크의 지역 id가 그대로 동작", () => {
    const legacy = ["seoul", "incheon", "suwon", "chuncheon", "wonju", "gangneung", "cheongju", "cheonan", "daejeon",
      "sejong", "jeonju", "gwangju", "mokpo", "yeosu", "daegu", "andong", "pohang", "ulsan", "busan", "changwon",
      "jinju", "jeju", "seogwipo"];
    for (const id of legacy) expect(findCity(id).id).toBe(id);
  });
  it("군위군은 대구 소속 (2023 편입)", () => {
    expect(CITIES.find((c) => c.name === "군위군")?.sido).toBe("대구");
  });
});

describe("지역 검색", () => {
  it("나주·익산을 찾는다", () => {
    expect(searchCities("나주")[0].name).toBe("나주시");
    expect(searchCities("익산시")[0].name).toBe("익산시");
    expect(searchCities("전남 나주")[0].name).toBe("나주시");
  });
  it("같은 이름(고성군)은 두 곳 모두", () => {
    expect(searchCities("고성").map((c) => c.sido).sort()).toEqual(["강원", "경남"]);
  });
});

describe("지역별 보정", () => {
  it("나주 −33분, 울릉 −17분", () => {
    expect(lngCorrectionOf(findCity("naju"))).toBe(-33);
    expect(lngCorrectionOf(findCity("ulleung-gun"))).toBe(-17);
  });
  it("같은 시각이라도 울릉도와 서울의 시주가 갈린다", () => {
    const at = (cityId: string) => computeSaju({ gender: "male", calendar: "solar", year: 2000, month: 3, day: 10, time: { hour: 9, minute: 20 }, cityId });
    expect(at("seoul").correction?.lmt).toBe("08:47");       // 9:20 − 32.1분 → 辰시
    expect(at("ulleung-gun").correction?.lmt).toBe("09:03"); // 9:20 − 16.5분 → 巳시
    expect(at("seoul").pillars.hour!.branch).toBe(4);
    expect(at("ulleung-gun").pillars.hour!.branch).toBe(5);
  });
});
