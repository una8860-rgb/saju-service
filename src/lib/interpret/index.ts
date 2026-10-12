/** 분석 결과 → content/ 문장 매핑 */
import ilgan from "@content/ilgan/ilgan.json";
import ohaeng from "@content/ohaeng/ohaeng.json";
import sipsin from "@content/sipsin/sipsin.json";
import strength from "@content/sipsin/strength.json";
import daeun from "@content/daeun/daeun.json";
import seun from "@content/daeun/seun.json";
import themes from "@content/themes/themes.json";
import { STEMS } from "../manseryeok/constants";
import { tenGod, tier, type Analysis, type TenGod } from "../analysis";
import type { Saju } from "../manseryeok/pillars";

export type ThemeKey = "money" | "love" | "career" | "health";
export const THEME_META: Record<ThemeKey, { label: string; icon: string }> = {
  money: { label: "재물운", icon: "money" },
  love: { label: "애정운", icon: "heart" },
  career: { label: "직업운", icon: "briefcase" },
  health: { label: "건강운", icon: "leaf" },
};

export function interpret(saju: Saju, a: Analysis) {
  const daeunGods = saju.daeun.list.map((d) => tenGod(a.dayStem, d.pillar.stem) as TenGod);
  return {
    ilgan: ilgan[STEMS[a.dayStem] as keyof typeof ilgan],
    missing: a.missing.map((e) => ({ element: e, text: ohaeng[e].lack })),
    excess: a.excess.map((e) => ({ element: e, text: ohaeng[e].excess })),
    lucky: { element: a.luckyElement, ...ohaeng[a.luckyElement] },
    strength: strength[a.strength.label],
    dominant: { name: a.dominantTenGod, ...sipsin[a.dominantTenGod] },
    daeun: daeunGods.map((g) => ({ tenGod: g, ...daeun[g] })),
    seun: { tenGod: a.seun.tenGod, ...seun[a.seun.tenGod] },
    themes: (Object.keys(THEME_META) as ThemeKey[]).map((k) => ({
      key: k, ...THEME_META[k], score: a.themes[k], text: themes[k][tier(a.themes[k])],
    })),
  };
}

export type Reading = ReturnType<typeof interpret>;
