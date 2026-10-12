/**
 * 사주 분석: 십신, 12운성, 오행 분포, 신강/신약, 합충, 테마 지수.
 * 테마 지수와 대운 점수는 전통 이론을 단순화한 "참고 지수"다.
 */
import {
  BRANCHES, BRANCH_ELEMENT, ELEMENTS, HIDDEN_STEMS, STEMS, STEM_ELEMENT, isYangStem, type Element,
} from "../manseryeok/constants";
import { yearPillarOf, type Pillar, type Saju } from "../manseryeok/pillars";

export const TEN_GODS = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"] as const;
export type TenGod = (typeof TEN_GODS)[number];
export type Group = "비겁" | "식상" | "재성" | "관성" | "인성";
export const GROUPS: Group[] = ["비겁", "식상", "재성", "관성", "인성"];
export const groupOf = (g: TenGod): Group => GROUPS[Math.floor(TEN_GODS.indexOf(g) / 2)];

const elIdx = (e: Element) => ELEMENTS.indexOf(e);

/** 일간 기준 대상 천간의 십신 */
export function tenGod(dayStem: number, target: number): TenGod {
  // 0: 같은 오행, 1: 내가 생, 2: 내가 극, 3: 나를 극, 4: 나를 생
  const rel = (elIdx(STEM_ELEMENT[target]) - elIdx(STEM_ELEMENT[dayStem]) + 5) % 5;
  const same = isYangStem(dayStem) === isYangStem(target);
  return TEN_GODS[rel * 2 + (same ? 0 : 1)];
}

/** 지지의 십신은 정기(지장간 마지막) 기준 */
export const mainStemOf = (branch: number) => HIDDEN_STEMS[branch][HIDDEN_STEMS[branch].length - 1];
export const branchTenGod = (dayStem: number, branch: number) => tenGod(dayStem, mainStemOf(branch));

const STAGES = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"];
const STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]; // 천간별 장생 지지 (甲亥 乙午 丙寅 丁酉 戊寅 己酉 庚巳 辛子 壬申 癸卯)
export function twelveStage(dayStem: number, branch: number) {
  const start = STAGE_START[dayStem];
  const i = isYangStem(dayStem) ? (branch - start + 12) % 12 : (start - branch + 12) % 12;
  return STAGES[i];
}

/** 그룹 → 일간 기준 오행 */
export function elementOfGroup(dayStem: number, g: Group): Element {
  return ELEMENTS[(elIdx(STEM_ELEMENT[dayStem]) + GROUPS.indexOf(g)) % 5];
}

export type Position = "year" | "month" | "day" | "hour";
export const POSITIONS: Position[] = ["hour", "day", "month", "year"]; // 원국표는 시·일·월·연 순
export const POSITION_KO: Record<Position, string> = { year: "연", month: "월", day: "일", hour: "시" };

export interface Cell {
  position: Position;
  stem: { idx: number; char: string; element: Element; tenGod: TenGod | "일간" };
  branch: { idx: number; char: string; element: Element; tenGod: TenGod; hidden: string[]; stage: string };
}

export interface Analysis {
  dayStem: number;
  cells: Cell[];
  elementCount: Record<Element, number>;
  totalChars: number;
  missing: Element[];
  excess: Element[];
  groupCount: Record<Group, number>;
  dominantTenGod: TenGod;
  strength: { label: "신강" | "중화" | "신약"; ratio: number };
  helpfulGroups: Group[];
  luckyElement: Element;
  relations: string[];
  themes: Record<"money" | "love" | "career" | "health", number>;
  daeunScores: number[];
  currentDaeun: number | null;
  seun: { year: number; pillar: Pillar; tenGod: TenGod; score: number };
}

const WEIGHT: Record<string, number> = {
  "year-stem": 1, "year-branch": 1, "month-stem": 1, "month-branch": 3,
  "day-branch": 1.5, "hour-stem": 1, "hour-branch": 1,
};

const CHUNG = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
const YUKHAP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const STEM_HAP = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]];
const DOHWA = [0, 3, 6, 9]; // 子卯午酉

const clamp = (v: number, lo = 30, hi = 95) => Math.round(Math.min(hi, Math.max(lo, v)));
const pairIn = (list: number[][], a: number, b: number) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export function analyze(saju: Saju, today = new Date()): Analysis {
  const ds = saju.pillars.day.stem;
  const cells: Cell[] = [];
  for (const pos of POSITIONS) {
    const p = saju.pillars[pos];
    if (!p) continue;
    cells.push({
      position: pos,
      stem: { idx: p.stem, char: STEMS[p.stem], element: STEM_ELEMENT[p.stem], tenGod: pos === "day" ? "일간" : tenGod(ds, p.stem) },
      branch: {
        idx: p.branch, char: BRANCHES[p.branch], element: BRANCH_ELEMENT[p.branch],
        tenGod: branchTenGod(ds, p.branch),
        hidden: HIDDEN_STEMS[p.branch].map((s) => STEMS[s]),
        stage: twelveStage(ds, p.branch),
      },
    });
  }

  // 오행 개수 (천간·지지 글자 수 기준)
  const elementCount = Object.fromEntries(ELEMENTS.map((e) => [e, 0])) as Record<Element, number>;
  for (const c of cells) { elementCount[c.stem.element]++; elementCount[c.branch.element]++; }
  const totalChars = cells.length * 2;
  const missing = ELEMENTS.filter((e) => elementCount[e] === 0);
  const excess = ELEMENTS.filter((e) => elementCount[e] >= Math.max(3, Math.ceil(totalChars * 0.375)));

  // 십신 그룹 분포 (일간 제외) + 신강/신약
  const groupCount = Object.fromEntries(GROUPS.map((g) => [g, 0])) as Record<Group, number>;
  const godCount = new Map<TenGod, number>();
  let support = 0, total = 0;
  for (const c of cells) {
    const items: [string, TenGod | "일간"][] = [[`${c.position}-stem`, c.stem.tenGod], [`${c.position}-branch`, c.branch.tenGod]];
    for (const [key, god] of items) {
      if (god === "일간") continue;
      const g = groupOf(god);
      groupCount[g]++;
      godCount.set(god, (godCount.get(god) ?? 0) + 1);
      const w = WEIGHT[key];
      total += w;
      if (g === "비겁" || g === "인성") support += w;
    }
  }
  const ratio = support / total;
  const strength = { label: ratio >= 0.5 ? "신강" : ratio <= 0.35 ? "신약" : "중화", ratio } as Analysis["strength"];
  const dominantTenGod = [...godCount.entries()].sort((a, b) => b[1] - a[1] || TEN_GODS.indexOf(a[0]) - TEN_GODS.indexOf(b[0]))[0][0];

  // 도움이 되는 기운(억부): 신약 → 인성·비겁, 신강 → 식상·재성·관성, 중화 → 가장 부족한 오행
  const helpfulGroups: Group[] =
    strength.label === "신약" ? ["인성", "비겁"] :
    strength.label === "신강" ? ["식상", "재성", "관성"] :
    [GROUPS.slice().sort((a, b) => elementCount[elementOfGroup(ds, a)] - elementCount[elementOfGroup(ds, b)])[0]];
  const luckyElement = helpfulGroups
    .map((g) => elementOfGroup(ds, g))
    .sort((a, b) => elementCount[a] - elementCount[b])[0];

  // 합·충
  const relations: string[] = [];
  for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
    const a = cells[i], b = cells[j];
    const where = `${POSITION_KO[a.position]}·${POSITION_KO[b.position]}`;
    if (pairIn(STEM_HAP, a.stem.idx, b.stem.idx)) relations.push(`${where} ${a.stem.char}${b.stem.char}합`);
    if (pairIn(YUKHAP, a.branch.idx, b.branch.idx)) relations.push(`${where} ${a.branch.char}${b.branch.char}합`);
    if (pairIn(CHUNG, a.branch.idx, b.branch.idx)) relations.push(`${where} ${a.branch.char}${b.branch.char}충`);
  }

  // 테마 지수
  const n = (g: Group, cap: number) => Math.min(groupCount[g], cap);
  const isMale = saju.input.gender === "male";
  const loveGroup: Group = isMale ? "재성" : "관성";
  const dohwa = Math.min(2, cells.filter((c) => DOHWA.includes(c.branch.idx)).length);
  const ideal = totalChars / 5;
  const deviation = ELEMENTS.reduce((s, e) => s + Math.abs(elementCount[e] - ideal), 0);
  const themes = {
    money: clamp(50 + n("재성", 3) * 10 + n("식상", 2) * 5 + (groupCount["재성"] === 0 ? -10 : 0)
      + (strength.label === "신강" && groupCount["재성"] > 0 ? 10 : 0) + (strength.label === "신약" && groupCount["재성"] >= 3 ? -10 : 0)),
    love: clamp(50 + n(loveGroup, 3) * 10 + dohwa * 5 + (groupCount[loveGroup] === 0 ? -10 : 0)),
    career: clamp(50 + n("관성", 3) * 9 + n("인성", 2) * 6 + (groupCount["관성"] === 0 ? -8 : 0) + (strength.label === "중화" ? 5 : 0)),
    health: clamp(95 - deviation * 6 - missing.length * 5, 35),
  };

  // 대운·세운 점수: 도움 되는 기운이면 상승
  const scorePillar = (p: Pillar) => clamp(
    55 + (helpfulGroups.includes(groupOf(tenGod(ds, p.stem))) ? 18 : -10)
       + (helpfulGroups.includes(groupOf(branchTenGod(ds, p.branch))) ? 12 : -8), 20, 95);
  const daeunScores = saju.daeun.list.map((d) => scorePillar(d.pillar));
  const age = today.getFullYear() - saju.solarDate.year;
  const cur = saju.daeun.list.findLastIndex((d) => d.startAge <= age);
  const seunYear = today.getFullYear();
  const seunPillar = yearPillarOf(seunYear);

  return {
    dayStem: ds, cells, elementCount, totalChars, missing, excess, groupCount, dominantTenGod,
    strength, helpfulGroups, luckyElement, relations, themes, daeunScores,
    currentDaeun: cur >= 0 ? cur : null,
    seun: { year: seunYear, pillar: seunPillar, tenGod: tenGod(ds, seunPillar.stem), score: scorePillar(seunPillar) },
  };
}

export const tier = (score: number) => (score >= 70 ? "high" : score >= 50 ? "mid" : "low");
