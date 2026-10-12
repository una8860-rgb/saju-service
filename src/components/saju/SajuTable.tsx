import type { Analysis } from "@/lib/analysis";
import { POSITION_KO } from "@/lib/analysis";
import { GanjiChip } from "./GanjiChip";

/** 사주 원국표: 시·일·월·연 4기둥 + 십신·12운성·지장간 */
export function SajuTable({ analysis, hourUnknown }: { analysis: Analysis; hourUnknown: boolean }) {
  const cols = hourUnknown ? [null, ...analysis.cells] : analysis.cells;
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {cols.map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span className="text-[13px] font-semibold text-sub">
            {c ? `${POSITION_KO[c.position]}주` : "시주"}
          </span>
          {c ? (
            <>
              <Label strong={c.position === "day"}>{c.stem.tenGod}</Label>
              <GanjiChip kind="stem" idx={c.stem.idx} />
              <GanjiChip kind="branch" idx={c.branch.idx} />
              <Label>{c.branch.tenGod}</Label>
              <span className="text-[12px] text-sub">{c.branch.stage}</span>
              <span className="text-[11px] tracking-wider text-faint">{c.branch.hidden.join("")}</span>
            </>
          ) : (
            <>
              <Label>&nbsp;</Label>
              <Empty /><Empty />
              <span className="text-[12px] text-faint">시각 모름</span>
            </>
          )}
        </div>
      ))}
      <div className="col-span-4 mt-2 flex justify-between border-t border-line pt-3 text-[11px] text-faint">
        <span>위: 십신 · 아래: 십신 / 12운성 / 지장간</span>
        <span>일간 = 나</span>
      </div>
    </div>
  );
}

function Label({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return <span className={strong ? "rounded-full bg-ink px-2 text-[12px] font-bold text-white" : "text-[12px] font-semibold text-[#4e5968]"}>{children}</span>;
}

function Empty() {
  return <span className="h-[60px] w-[60px] rounded-2xl border-2 border-dashed border-line" />;
}
