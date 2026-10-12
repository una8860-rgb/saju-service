import { ELEMENTS, ELEMENTS_KO, type Element } from "@/lib/manseryeok/constants";
import { ELEMENT_STYLE } from "@/lib/ui";

/** 오행 오각형 레이더 (상생 순서: 木→火→土→金→水) */
export function OhaengRadar({ count, total }: { count: Record<Element, number>; total: number }) {
  const size = 240, c = size / 2, r = 82;
  const max = Math.max(3, ...Object.values(count));
  const pt = (i: number, k: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [c + Math.cos(a) * r * k, c + Math.sin(a) * r * k] as const;
  };
  const poly = (k: (i: number) => number) => ELEMENTS.map((_, i) => pt(i, k(i)).join(",")).join(" ");
  const shape = poly((i) => Math.max(0.06, count[ELEMENTS[i]] / max));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[260px]" role="img"
      aria-label={ELEMENTS.map((e) => `${e} ${count[e]}개`).join(", ")}>
      {[1, 0.66, 0.33].map((k) => <polygon key={k} points={poly(() => k)} fill="none" stroke="#e5e8eb" strokeWidth={1} />)}
      {ELEMENTS.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#e5e8eb" />; })}
      <polygon points={shape} fill="rgba(49,130,246,0.18)" stroke="#3182f6" strokeWidth={2.5} strokeLinejoin="round" />
      {ELEMENTS.map((e, i) => {
        const [x, y] = pt(i, Math.max(0.06, count[e] / max));
        const [lx, ly] = pt(i, 1.32);
        return (
          <g key={e}>
            <circle cx={x} cy={y} r={4.5} fill="#3182f6" stroke="#fff" strokeWidth={2} />
            <circle cx={lx} cy={ly} r={17} fill={ELEMENT_STYLE[e].fill} />
            <text x={lx} y={ly + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill="#fff">{e}</text>
          </g>
        );
      })}
      <text x={c} y={c + 5} textAnchor="middle" fontSize={12} fill="#8b95a1">{total}글자</text>
    </svg>
  );
}

/** 오행 개수 막대 */
export function OhaengBars({ count, total }: { count: Record<Element, number>; total: number }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {ELEMENTS.map((e) => {
        const st = ELEMENT_STYLE[e];
        const pct = (count[e] / total) * 100;
        return (
          <li key={e} className="flex items-center gap-3 text-[14px]">
            <span className={`w-14 font-bold ${st.text}`}>{e} {ELEMENTS_KO[e]}</span>
            <span className={`h-3 flex-1 overflow-hidden rounded-full ${st.soft}`}>
              <span className={`block h-full rounded-full ${st.bg}`} style={{ width: `${Math.max(pct, count[e] ? 6 : 0)}%` }} />
            </span>
            <span className="w-10 text-right font-semibold tabular-nums">{count[e]}개</span>
          </li>
        );
      })}
    </ul>
  );
}
