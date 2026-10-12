import { Suspense } from "react";
import { ResultView } from "@/components/saju/ResultView";

export const metadata = { title: "사주 풀이 결과 — 사주그림" };

// 정적 export: 계산은 브라우저에서 URL 파라미터로 수행
export default function ResultPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sub">사주를 계산하고 있어요…</p>}>
      <ResultView />
    </Suspense>
  );
}
