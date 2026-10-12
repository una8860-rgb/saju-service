import { cx } from "@/lib/ui";

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const color = score >= 70 ? "bg-accent" : score >= 50 ? "bg-[#64a8ff]" : "bg-faint";
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-page">
        <span className={cx("block h-full rounded-full", color)} style={{ width: `${score}%` }} />
      </span>
      <span className="w-9 text-right text-[15px] font-bold tabular-nums">{score}</span>
    </div>
  );
}
