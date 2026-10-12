import Link from "next/link";
import { Badge, Card } from "@/components/ui/Card";
import { IconBubble } from "@/components/ui/Icon";
import { ZodiacAvatar } from "@/components/illust/ZodiacAvatar";
import { ZODIAC, BRANCHES } from "@/lib/manseryeok/constants";
import { yearPillarOf } from "@/lib/manseryeok/pillars";

const MENU = [
  { href: "/saju/", icon: "scroll", title: "평생사주", desc: "원국·오행·대운까지 한 번에" },
  { href: "/manseryeok/", icon: "calendar", title: "만세력", desc: "날짜별 간지와 절입 시각 조회" },
  { href: null, icon: "sparkle", title: "오늘의 운세", desc: "일진으로 보는 하루" },
  { href: null, icon: "heart", title: "궁합", desc: "두 사람의 오행 조화" },
];

export default function Home() {
  const thisYear = new Date().getFullYear();
  const yearBranch = yearPillarOf(thisYear).branch;

  return (
    <>
      {/* 히어로: Canva 레퍼런스의 남색 배경 + 12띠 원형 배치 */}
      <section className="relative mt-2 overflow-hidden rounded-3xl bg-navy px-6 pb-8 pt-6 text-white">
        <div className="relative mx-auto aspect-square w-full max-w-[340px]">
          {ZODIAC.map((z, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / 12;
            return (
              <span key={z.slug} className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + Math.cos(a) * 42}%`, top: `${50 + Math.sin(a) * 42}%` }}>
                <ZodiacAvatar slug={z.slug} size={i === yearBranch ? 66 : 54} />
              </span>
            );
          })}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[13px] font-semibold text-white/70">태어난 순간을 그림으로</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight">내 사주<br />한눈에 보기</h1>
            <Link href="/saju/" className="mt-4 rounded-full bg-[#b98a5e] px-5 py-2 text-[14px] font-bold text-white shadow">
              무료 사주풀이 →
            </Link>
          </div>
        </div>
        <p className="text-center text-[12px] text-white/60">
          올해는 {BRANCHES[yearBranch]} {ZODIAC[yearBranch].ko}띠의 해예요
        </p>
      </section>

      <Card eyebrow="정통 명리" title="무엇이 궁금하세요?">
        <ul className="-my-1">
          {MENU.map((m) => {
            const row = (
              <span className="flex items-center gap-4 py-3">
                <IconBubble name={m.icon} />
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 text-[16px] font-bold">
                    {m.title} {!m.href && <Badge tone="gray">준비중</Badge>}
                  </span>
                  <span className="text-[13px] text-sub">{m.desc}</span>
                </span>
                {m.href && <span className="text-faint">›</span>}
              </span>
            );
            return <li key={m.title}>{m.href ? <Link href={m.href}>{row}</Link> : <span className="opacity-60">{row}</span>}</li>;
          })}
        </ul>
      </Card>

      <Card eyebrow="타고난 띠" title="12띠 친구들">
        <ul className="grid grid-cols-4 gap-y-4 text-center">
          {ZODIAC.map((z, i) => (
            <li key={z.slug} className="flex flex-col items-center gap-1">
              <ZodiacAvatar slug={z.slug} size={56} />
              <span className="text-[13px] font-semibold">{BRANCHES[i]} {z.ko}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card eyebrow="왜 정확한가요?" title="만세력 계산 원칙">
        <ul className="space-y-3 text-[14px] leading-relaxed text-[#4e5968]">
          <li><b className="text-ink">연·월 기둥</b> — 1월 1일이 아닌 입춘·절입 시각으로 나눠요.</li>
          <li><b className="text-ink">시 기둥</b> — 출생지 경도(서울 −32분)와 서머타임, 옛 표준시까지 보정해요.</li>
          <li><b className="text-ink">자시</b> — 국내 대부분 만세력처럼 자시부터 다음 날로 봐요. 야자시 옵션도 있어요.</li>
          <li><b className="text-ink">음력</b> — 한국천문연구원 기준 한국 음력으로 변환해요.</li>
        </ul>
      </Card>
    </>
  );
}
