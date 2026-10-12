"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { analyze, GROUPS } from "@/lib/analysis";
import { interpret } from "@/lib/interpret";
import { BRANCHES, ELEMENTS_KO, HOUR_NAMES, STEMS, STEMS_KO, ZODIAC, BRANCHES_KO } from "@/lib/manseryeok/constants";
import { computeSaju } from "@/lib/manseryeok/pillars";
import { cityLabel } from "@/lib/manseryeok/locations";
import { fromQuery } from "@/lib/query";
import { ELEMENT_STYLE, cx } from "@/lib/ui";
import { Badge, Card, Chip, Notice, Prose } from "../ui/Card";
import { Icon, IconBubble } from "../ui/Icon";
import { ScoreBar } from "../ui/ScoreBar";
import { ZodiacAvatar } from "../illust/ZodiacAvatar";
import { GanjiChip, PillarPair } from "./GanjiChip";
import { SajuTable } from "./SajuTable";
import { OhaengBars, OhaengRadar } from "../charts/OhaengChart";
import { FortuneCurve } from "../charts/FortuneCurve";

const CAL_KO = { solar: "양력", lunar: "음력", leap: "음력(윤달)" } as const;
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export function ResultView() {
  const params = useSearchParams();
  const result = useMemo(() => {
    const input = fromQuery(new URLSearchParams(params.toString()));
    if (!input) return { error: "입력값이 없어요. 생년월일을 다시 입력해 주세요." } as const;
    try {
      const saju = computeSaju(input);
      const analysis = analyze(saju);
      return { saju, analysis, reading: interpret(saju, analysis) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "계산 중 문제가 생겼어요." } as const;
    }
  }, [params]);

  if ("error" in result) {
    return (
      <Card title="풀이를 만들 수 없어요">
        <Prose>{result.error}</Prose>
        <Link href="/saju/" className="mt-5 block rounded-2xl bg-accent py-4 text-center font-bold text-white">다시 입력하기</Link>
      </Card>
    );
  }

  const { saju, analysis: a, reading: r } = result;
  const { input, pillars } = saju;
  const zodiac = ZODIAC[pillars.year.branch];
  const timeText = input.time ? `${input.time.hour}시 ${String(input.time.minute).padStart(2, "0")}분` : "시각 모름";
  const dayStemEl = a.cells.find((c) => c.position === "day")!.stem.element;

  return (
    <>
      {/* 1. 프로필 */}
      <section className="mt-2 overflow-hidden rounded-3xl bg-navy px-5 pb-6 pt-7 text-white">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-white p-1.5"><ZodiacAvatar slug={zodiac.slug} size={76} /></span>
          <div className="min-w-0">
            <p className="text-[13px] text-white/70">{BRANCHES[pillars.year.branch]} {zodiac.ko}띠 · {input.gender === "male" ? "남성" : "여성"}</p>
            <h1 className="mt-0.5 truncate text-[24px] font-extrabold">{input.name ? `${input.name}님의 사주` : "나의 사주"}</h1>
            <p className="mt-1 text-[13px] text-white/80">
              {CAL_KO[input.calendar]} {input.year}.{input.month}.{input.day} · {timeText}
            </p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-2 text-[12px]">
          <Info k="양력" v={`${saju.solarDate.year}.${saju.solarDate.month}.${saju.solarDate.day}`} />
          <Info k="음력" v={`${saju.lunarDate.year}.${saju.lunarDate.month}.${saju.lunarDate.day}${saju.lunarDate.leap ? " (윤)" : ""}`} />
          <Info k="출생지" v={`${cityLabel(saju.city)}${saju.correction ? ` · 경도 ${signed(saju.correction.lngCorrection)}분` : ""}`} />
          <Info k="보정 시각" v={saju.correction
            ? `${saju.correction.lmt} ${HOUR_NAMES[pillars.hour!.branch]}${saju.correction.dst ? " · 서머타임" : ""}`
            : "—"} />
        </dl>
      </section>

      {saju.jasiNextDay && <Notice>보정 시각이 밤 11시 이후라 <b>다음 날 일주</b>로 계산했어요. (야자시를 쓰려면 고급 설정에서 켜세요)</Notice>}
      {saju.boundary && (
        <Notice tone="yellow">
          보정 시각이 시주 경계에서 {saju.boundary.minutesFromEdge}분 거리예요. 기록된 시각이 조금 다르면
          시주가 <b>{STEMS[saju.boundary.altHour.stem]}{BRANCHES[saju.boundary.altHour.branch]}({HOUR_NAMES[saju.boundary.altHour.branch]})</b>일 수 있어요.
        </Notice>
      )}
      {!input.time && <Notice tone="yellow">태어난 시각을 몰라 <b>시주 없이 6글자</b>로 풀이했어요.</Notice>}
      {saju.jeolipDayUnknownTime && <Notice tone="yellow">태어난 날이 절기가 바뀌는 날이라, 시각에 따라 월주가 달라질 수 있어요.</Notice>}

      {/* 2. 원국 */}
      <Card eyebrow="사주 원국" title={pillars.hour ? "타고난 여덟 글자" : "타고난 여섯 글자"}
        right={<Badge tone="blue">{saju.correction ? `총 ${signed(saju.correction.total)}분 보정` : "6글자"}</Badge>}>
        <SajuTable analysis={a} hourUnknown={!pillars.hour} />
        {a.relations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {a.relations.map((x) => <Chip key={x}>{x}</Chip>)}
          </div>
        )}
      </Card>

      {/* 3. 오행 */}
      <Card eyebrow="오행 분포" title="나를 이루는 다섯 기운">
        <OhaengRadar count={a.elementCount} total={a.totalChars} />
        <OhaengBars count={a.elementCount} total={a.totalChars} />
        <div className="mt-5 space-y-3">
          {r.excess.map((x) => <ElementNote key={x.element} el={x.element} label="많아요" text={x.text} />)}
          {r.missing.map((x) => <ElementNote key={x.element} el={x.element} label="없어요" text={x.text} />)}
          {r.excess.length + r.missing.length === 0 && <Prose>다섯 기운이 고르게 퍼져 있어 균형이 좋은 편이에요.</Prose>}
        </div>
      </Card>

      {/* 4. 일간 */}
      <Card eyebrow="나의 일간" title={r.ilgan.headline}>
        <div className="flex items-center gap-4">
          <GanjiChip kind="stem" idx={a.dayStem} size="lg" />
          <div>
            <p className="text-[18px] font-bold">{STEMS[a.dayStem]} {r.ilgan.reading}</p>
            <p className="text-[14px] text-sub">{r.ilgan.symbol}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.ilgan.keywords.map((k) => <Chip key={k} className={cx(ELEMENT_STYLE[dayStemEl].soft, ELEMENT_STYLE[dayStemEl].text)}>#{k}</Chip>)}
            </div>
          </div>
        </div>
        <Prose className="mt-5">{r.ilgan.personality}</Prose>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <ListBox title="강점" items={r.ilgan.strengths} tone="blue" />
          <ListBox title="보완할 점" items={r.ilgan.weaknesses} tone="gray" />
        </div>
      </Card>

      {/* 5. 신강/신약 + 십신 */}
      <Card eyebrow={`에너지와 성향 · ${a.strength.label}`} title={r.strength.label}>
        <div className="relative h-3 rounded-full bg-gradient-to-r from-[#c9dcff] via-[#e5e8eb] to-[#ffd8b0]">
          <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-accent shadow"
            style={{ left: `${Math.min(95, Math.max(5, a.strength.ratio * 100))}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[12px] text-sub"><span>신약</span><span>중화</span><span>신강</span></div>
        <Prose className="mt-4">{r.strength.summary}</Prose>
        <Prose className="mt-2 text-sub">{r.strength.advice}</Prose>

        <div className="mt-6 rounded-2xl bg-page p-4">
          <p className="text-[13px] text-sub">가장 두드러진 기운</p>
          <p className="mt-1 text-[17px] font-bold">{r.dominant.name} <span className="text-[14px] font-medium text-sub">· {r.dominant.keywords.join(" · ")}</span></p>
          <Prose className="mt-2">{r.dominant.strong}</Prose>
        </div>
        <ul className="mt-4 grid grid-cols-5 gap-1 text-center">
          {GROUPS.map((g) => (
            <li key={g}>
              <div className="mx-auto flex h-20 w-8 items-end overflow-hidden rounded-lg bg-page">
                <div className="w-full rounded-lg bg-accent" style={{ height: `${(a.groupCount[g] / Math.max(1, a.totalChars - 1)) * 100}%` }} />
              </div>
              <p className="mt-1 text-[12px] font-semibold">{g}</p>
              <p className="text-[11px] text-sub">{a.groupCount[g]}개</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* 6. 대운 */}
      <DaeunCard saju={saju} scores={a.daeunScores} current={a.currentDaeun} texts={r.daeun} />

      {/* 7. 세운 */}
      <Card eyebrow={`${a.seun.year}년 운세`} title={r.seun.title}
        right={<span className="flex gap-1"><GanjiChip kind="stem" idx={a.seun.pillar.stem} size="sm" /><GanjiChip kind="branch" idx={a.seun.pillar.branch} size="sm" /></span>}>
        <p className="mb-3 text-[13px] text-sub">
          올해 {STEMS[a.seun.pillar.stem]}{BRANCHES[a.seun.pillar.branch]}({STEMS_KO[a.seun.pillar.stem]}{BRANCHES_KO[a.seun.pillar.branch]})년은 나에게 <b className="text-ink">{r.seun.tenGod}</b>의 해
        </p>
        <p className="mb-1 text-[12px] text-sub">나에게 도움이 되는 정도</p>
        <ScoreBar score={a.seun.score} />
        <Prose className="mt-4">{r.seun.text}</Prose>
        <Notice>💡 {r.seun.tip}</Notice>
      </Card>

      {/* 8. 테마 */}
      <Card eyebrow="분야별 지수" title="재물 · 애정 · 직업 · 건강">
        <ul className="space-y-6">
          {r.themes.map((t) => (
            <li key={t.key}>
              <div className="flex items-center gap-3">
                <IconBubble name={t.icon} size={40} />
                <span className="w-14 text-[16px] font-bold">{t.label}</span>
                <ScoreBar score={t.score} className="flex-1" />
              </div>
              <Prose className="mt-2 pl-[52px] text-[14px]">{t.text}</Prose>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[12px] text-faint">지수는 원국의 십신·오행 분포로 계산한 참고값이에요.</p>
      </Card>

      {/* 9. 일과 사랑 */}
      <Card eyebrow="일과 사랑" title="나에게 맞는 길">
        <div className="flex gap-3"><IconBubble name="briefcase" size={40} /><div><p className="font-bold">적성</p><Prose className="mt-1">{r.ilgan.career}</Prose></div></div>
        <div className="mt-5 flex gap-3"><IconBubble name="heart" size={40} /><div><p className="font-bold">연애 스타일</p><Prose className="mt-1">{r.ilgan.love}</Prose></div></div>
      </Card>

      {/* 10. 개운법 */}
      <LuckyCard lucky={r.lucky} advice={r.ilgan.advice} />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href="/saju/" className="rounded-2xl bg-white py-4 text-center font-bold">다시 입력</Link>
        <CopyLink />
      </div>
    </>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <dt className="text-white/60">{k}</dt>
      <dd className="mt-0.5 font-semibold">{v}</dd>
    </div>
  );
}

function ElementNote({ el, label, text }: { el: keyof typeof ELEMENTS_KO; label: string; text: string }) {
  const st = ELEMENT_STYLE[el];
  return (
    <div className={cx("rounded-2xl p-4", st.soft)}>
      <p className={cx("text-[14px] font-bold", st.text)}>{el}({ELEMENTS_KO[el]}) 기운이 {label}</p>
      <Prose className="mt-1 text-[14px]">{text}</Prose>
    </div>
  );
}

function ListBox({ title, items, tone }: { title: string; items: string[]; tone: "blue" | "gray" }) {
  return (
    <div className={cx("rounded-2xl p-4", tone === "blue" ? "bg-accent-soft" : "bg-page")}>
      <p className={cx("mb-2 text-[13px] font-bold", tone === "blue" ? "text-accent" : "text-sub")}>{title}</p>
      <ul className="space-y-1.5 text-[13px] leading-snug">{items.map((x) => <li key={x}>· {x}</li>)}</ul>
    </div>
  );
}

function DaeunCard({ saju, scores, current, texts }: {
  saju: ReturnType<typeof computeSaju>; scores: number[]; current: number | null;
  texts: { tenGod: string; title: string; text: string }[];
}) {
  const [sel, setSel] = useState(current ?? 0);
  const list = saju.daeun.list;
  const d = list[sel];
  return (
    <Card eyebrow={`대운 · ${saju.daeun.forward ? "순행" : "역행"} · 대운수 ${saju.daeun.startAge}`} title="10년마다 바뀌는 큰 흐름">
      <FortuneCurve scores={scores} labels={list.map((x) => `${x.startAge}`)} current={current} />
      <p className="mt-1 text-center text-[12px] text-sub">곡선이 높을수록 나를 돕는 기운이 들어오는 10년이에요</p>
      <div className="scroll-x -mx-5 mt-2 flex gap-2 px-5 pb-1">
        {list.map((x, i) => (
          <button key={x.order} type="button" onClick={() => setSel(i)}
            className={cx("flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition",
              i === sel ? "bg-accent-soft ring-2 ring-accent" : "bg-page")}>
            <span className={cx("text-[12px] font-bold", i === current ? "text-accent" : "text-sub")}>
              {x.startAge}세{i === current ? " · 지금" : ""}
            </span>
            <PillarPair stem={x.pillar.stem} branch={x.pillar.branch} />
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-page p-4">
        <p className="text-[13px] text-sub">만 {d.startAge}세~{d.startAge + 9}세 ({d.startYear}~{d.startYear + 9}) · {texts[sel].tenGod} 대운</p>
        <p className="mt-1 text-[17px] font-bold">{texts[sel].title}</p>
        <Prose className="mt-2 text-[14px]">{texts[sel].text}</Prose>
      </div>
    </Card>
  );
}

function LuckyCard({ lucky, advice }: { lucky: ReturnType<typeof interpret>["lucky"]; advice: string }) {
  const st = ELEMENT_STYLE[lucky.element];
  const items: [string, string, string][] = [
    ["palette", "행운의 색", lucky.luck.colors.join(", ")],
    ["compass", "행운의 방향", lucky.luck.direction],
    ["hash", "행운의 숫자", lucky.luck.numbers.join(", ")],
    ["gift", "행운의 물건", lucky.luck.items.join(", ")],
    ["bowl", "추천 음식", lucky.luck.foods.join(", ")],
    ["run", "추천 활동", lucky.luck.activities.join(", ")],
  ];
  return (
    <Card eyebrow="개운법" title={<>나를 돕는 기운은 <span className={st.text}>{lucky.element}({lucky.reading})</span></>}>
      <Prose>{lucky.trait}</Prose>
      <ul className="mt-5 grid grid-cols-3 gap-2">
        {items.map(([icon, k, v]) => (
          <li key={k} className="flex flex-col items-center rounded-2xl bg-page px-2 py-4 text-center">
            <Icon name={icon} size={28} />
            <span className="mt-2 text-[12px] text-sub">{k}</span>
            <span className="mt-0.5 text-[13px] font-bold leading-snug">{v}</span>
          </li>
        ))}
      </ul>
      <Notice>💬 {advice}</Notice>
    </Card>
  );
}

function CopyLink() {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="rounded-2xl bg-accent py-4 font-bold text-white"
      onClick={() => navigator.clipboard?.writeText(location.href).then(() => setDone(true))}>
      {done ? "링크 복사됨 ✓" : "결과 링크 복사"}
    </button>
  );
}
