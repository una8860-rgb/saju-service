import data from "@data/locations/kr-cities.json";

export interface City { id: string; sido: string; name: string; lng: number; lat: number }

export const CITIES: City[] = data.cities;
export const DEFAULT_CITY_ID = data.default;
export const STANDARD_MERIDIAN = data.standardMeridian;

export const findCity = (id: string | null | undefined): City =>
  CITIES.find((c) => c.id === id) ?? CITIES.find((c) => c.id === DEFAULT_CITY_ID)!;

/** 시/도 목록 (입력 폼 1단계) */
export const SIDO_LIST = [...new Set(CITIES.map((c) => c.sido))];
