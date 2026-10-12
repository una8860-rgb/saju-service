export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const STEMS_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const BRANCHES_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;

export type Element = "木" | "火" | "土" | "金" | "水";
export const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];
export const ELEMENTS_KO: Record<Element, string> = { 木: "목", 火: "화", 土: "토", 金: "금", 水: "수" };

export const STEM_ELEMENT: Element[] = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
export const BRANCH_ELEMENT: Element[] = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];

/** 천간 음양: 짝수 인덱스(甲丙戊庚壬)가 양 */
export const isYangStem = (stemIdx: number) => stemIdx % 2 === 0;

/** 지장간 (여기·중기·정기 순, 마지막이 정기) — 천간 인덱스 */
export const HIDDEN_STEMS: number[][] = [
  [8, 9],        // 子: 壬 癸
  [9, 7, 5],     // 丑: 癸 辛 己
  [4, 2, 0],     // 寅: 戊 丙 甲
  [0, 1],        // 卯: 甲 乙
  [1, 9, 4],     // 辰: 乙 癸 戊
  [4, 6, 2],     // 巳: 戊 庚 丙
  [2, 5, 3],     // 午: 丙 己 丁
  [3, 1, 5],     // 未: 丁 乙 己
  [4, 8, 6],     // 申: 戊 壬 庚
  [6, 7],        // 酉: 庚 辛
  [7, 3, 4],     // 戌: 辛 丁 戊
  [4, 0, 8],     // 亥: 戊 甲 壬
];

/** 지지별 띠 (일러스트 파일명, 한글) */
export const ZODIAC = [
  { slug: "rat", ko: "쥐" }, { slug: "ox", ko: "소" }, { slug: "tiger", ko: "호랑이" },
  { slug: "rabbit", ko: "토끼" }, { slug: "dragon", ko: "용" }, { slug: "snake", ko: "뱀" },
  { slug: "horse", ko: "말" }, { slug: "sheep", ko: "양" }, { slug: "monkey", ko: "원숭이" },
  { slug: "rooster", ko: "닭" }, { slug: "dog", ko: "개" }, { slug: "pig", ko: "돼지" },
] as const;

/** 시간대 이름 (자시~해시) */
export const HOUR_NAMES = BRANCHES_KO.map((b) => `${b}시`);

/** 60갑자 인덱스 (甲子=0) */
export const ganzhiIndex = (stemIdx: number, branchIdx: number) => {
  for (let i = 0; i < 60; i++) if (i % 10 === stemIdx && i % 12 === branchIdx) return i;
  throw new Error(`잘못된 간지 조합: ${stemIdx}, ${branchIdx}`);
};
