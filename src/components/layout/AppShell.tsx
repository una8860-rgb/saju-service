import Link from "next/link";
import { ZodiacAvatar } from "../illust/ZodiacAvatar";

/** PC: 좌측 브랜드 패널 + 중앙 모바일 폭 앱 컬럼 / 모바일: 앱 컬럼만 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex lg:justify-center lg:gap-16">
      <aside className="hidden lg:flex lg:w-[380px] lg:flex-col lg:justify-center lg:sticky lg:top-0 lg:h-screen">
        <div className="flex -space-x-3 mb-8">
          {["tiger", "rabbit", "dragon", "horse"].map((s) => <ZodiacAvatar key={s} slug={s} size={64} ring />)}
        </div>
        <p className="text-sub text-lg">태어난 순간을 그림으로 읽어요</p>
        <h1 className="mt-3 text-[40px] leading-tight font-extrabold">
          정확한 만세력,<br /><span className="text-accent">한눈에 사주풀이</span>
        </h1>
        <ul className="mt-10 space-y-4 text-[17px]">
          <li>🧭 <b>출생지 경도</b>까지 보정한 시주</li>
          <li>📅 <b>절입 시각</b> 기준 연주·월주</li>
          <li>🎨 오행·대운을 <b>그림과 차트</b>로</li>
        </ul>
      </aside>

      <div className="mx-auto w-full max-w-[480px] min-h-screen bg-page lg:mx-0 lg:shadow-[0_0_40px_rgba(0,0,0,0.06)]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-page/90 px-5 backdrop-blur">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            사주<span className="text-accent">그림</span>
          </Link>
          <nav className="flex gap-4 text-[15px] font-semibold text-sub">
            <Link href="/saju/" className="hover:text-ink">사주</Link>
            <Link href="/manseryeok/" className="hover:text-ink">만세력</Link>
          </nav>
        </header>
        <main className="px-4 pb-16">{children}</main>
        <footer className="px-5 pb-10 text-xs leading-relaxed text-faint">
          풀이는 전통 명리 이론을 바탕으로 한 참고용 콘텐츠예요. 중요한 결정은 스스로의 판단으로 내려 주세요.
        </footer>
      </div>
    </div>
  );
}
