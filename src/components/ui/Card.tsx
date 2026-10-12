import { cx } from "@/lib/ui";

/** 점신식 카드: 작은 회색 머리말 + 굵은 제목 */
export function Card({ eyebrow, title, right, children, className }: {
  eyebrow?: string; title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cx("mt-3 rounded-3xl bg-card px-5 py-6", className)}>
      {(eyebrow || title) && (
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            {eyebrow && <p className="text-[13px] text-sub">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-[20px] font-bold leading-snug">{title}</h2>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ children, tone = "yellow" }: { children: React.ReactNode; tone?: "yellow" | "blue" | "gray" }) {
  const t = { yellow: "bg-badge text-ink", blue: "bg-accent-soft text-accent", gray: "bg-page text-sub" }[tone];
  return <span className={cx("inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold", t)}>{children}</span>;
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center rounded-full bg-page px-3 py-1.5 text-[13px] font-semibold", className)}>{children}</span>;
}

export function Notice({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "yellow" }) {
  return (
    <p className={cx("mt-3 rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
      tone === "blue" ? "bg-accent-soft text-[#1b64da]" : "bg-[#fff8db] text-[#8a6d00]")}>
      {children}
    </p>
  );
}

/** 문단 텍스트 */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cx("text-[15px] leading-[1.75] text-[#333d4b]", className)}>{children}</p>;
}
