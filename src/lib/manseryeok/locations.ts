import data from "@data/locations/kr-cities.json";

export interface City { id: string; sido: string; name: string; lng: number; lat: number }

export const CITIES: City[] = data.cities;
export const DEFAULT_CITY_ID = data.default;
export const STANDARD_MERIDIAN = data.standardMeridian;

export const findCity = (id: string | null | undefined): City =>
  CITIES.find((c) => c.id === id) ?? CITIES.find((c) => c.id === DEFAULT_CITY_ID)!;

/** 시/도 목록 (입력 폼 1단계) */
export const SIDO_LIST = [...new Set(CITIES.map((c) => c.sido))];

/** "시도 시군" 표시명 (광역시 본청은 이름만) */
export const cityLabel = (c: City) => (c.name.startsWith(c.sido) ? c.name : `${c.sido} ${c.name}`);

/** 시계 시각 → 지방평균시 경도 보정(분) */
export const lngCorrectionOf = (c: City) => Math.round((c.lng - STANDARD_MERIDIAN) * 4);

/** 지역 검색: "나주", "전남 나주", "익산시" 모두 매칭 (공백 단위 토큰이 모두 포함되면 일치) */
export function searchCities(query: string, limit = 8): City[] {
  const tokens = query.replace(/[시군]$/u, "").trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const hits = CITIES.filter((c) => tokens.every((t) => `${c.sido} ${c.name}`.includes(t)));
  // 이름이 검색어로 시작하는 곳을 먼저
  return hits.sort((a, b) => Number(!a.name.startsWith(tokens.at(-1)!)) - Number(!b.name.startsWith(tokens.at(-1)!))).slice(0, limit);
}
