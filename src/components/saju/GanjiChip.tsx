import { BRANCHES_KO, BRANCH_ELEMENT, STEMS_KO, STEM_ELEMENT, STEMS, BRANCHES } from "@/lib/manseryeok/constants";
import { ELEMENT_STYLE, cx } from "@/lib/ui";

/** 간지 한 글자 칩 — 오행 색 배경 + 한자 + 한글 독음 */
export function GanjiChip({ kind, idx, size = "md", dim = false }: {
  kind: "stem" | "branch"; idx: number; size?: "sm" | "md" | "lg"; dim?: boolean;
}) {
  const el = kind === "stem" ? STEM_ELEMENT[idx] : BRANCH_ELEMENT[idx];
  const char = kind === "stem" ? STEMS[idx] : BRANCHES[idx];
  const ko = kind === "stem" ? STEMS_KO[idx] : BRANCHES_KO[idx];
  const st = ELEMENT_STYLE[el];
  const dims = { sm: "h-11 w-11 text-[20px]", md: "h-[60px] w-[60px] text-[28px]", lg: "h-20 w-20 text-[38px]" }[size];
  return (
    <span className={cx("relative inline-flex flex-col items-center justify-center rounded-2xl font-bold text-white", st.bg, dims, dim && "opacity-40")}
      title={`${char}(${ko}) · ${el}`}>
      <span className="leading-none">{char}</span>
      {size !== "sm" && <span className="mt-1 text-[11px] font-semibold leading-none opacity-90">{ko}·{el}</span>}
    </span>
  );
}

/** 기둥 한 쌍 (천간 위, 지지 아래) */
export function PillarPair({ stem, branch, size = "sm" }: { stem: number; branch: number; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex flex-col gap-1">
      <GanjiChip kind="stem" idx={stem} size={size} />
      <GanjiChip kind="branch" idx={branch} size={size} />
    </span>
  );
}
