import { Card } from "@/components/ui/Card";
import { SajuForm } from "@/components/saju/SajuForm";

export const metadata = { title: "평생사주 입력 — 사주그림" };

export default function SajuPage() {
  return (
    <Card eyebrow="평생사주" title="태어난 순간을 알려주세요">
      <SajuForm />
    </Card>
  );
}
