/** 대운 흐름 곡선: 10년 단위 점수, 현재 대운 강조 */
export function FortuneCurve({ scores, labels, current }: { scores: number[]; labels: string[]; current: number | null }) {
  const w = 440, h = 150, padX = 22, top = 18, bottom = 30;
  const x = (i: number) => padX + (i * (w - padX * 2)) / (scores.length - 1);
  const y = (v: number) => top + ((100 - v) / 80) * (h - top - bottom);   // 20~100 범위
  const pts = scores.map((v, i) => [x(i), y(Math.max(20, v))] as const);

  // 부드러운 곡선 (Catmull-Rom → Bezier)
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  const area = `${d} L${pts[pts.length - 1][0]},${h - bottom} L${pts[0][0]},${h - bottom} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="대운 흐름 그래프">
      <defs>
        <linearGradient id="fc" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3182f6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#3182f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={padX} x2={w - padX} y1={y(55)} y2={y(55)} stroke="#e5e8eb" strokeDasharray="4 4" />
      <path d={area} fill="url(#fc)" />
      <path d={d} fill="none" stroke="#3182f6" strokeWidth={3} strokeLinecap="round" />
      {pts.map(([px, py], i) => (
        <g key={i}>
          {i === current && <circle cx={px} cy={py} r={11} fill="#3182f6" opacity={0.18} />}
          <circle cx={px} cy={py} r={i === current ? 6 : 4} fill={i === current ? "#3182f6" : "#fff"} stroke="#3182f6" strokeWidth={2} />
          <text x={px} y={h - 10} textAnchor="middle" fontSize={11} fill={i === current ? "#3182f6" : "#8b95a1"} fontWeight={i === current ? 700 : 400}>
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}
