import { asset, cx } from "@/lib/ui";

/** 12띠 얼굴 일러스트 (public/images/zodiac/*.svg, scripts/illust/gen_zodiac.py로 생성) */
export function ZodiacAvatar({ slug, size = 72, ring = false, className }: {
  slug: string; size?: number; ring?: boolean; className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(`/images/zodiac/${slug}.svg`)}
      alt=""
      width={size}
      height={size}
      className={cx(ring && "rounded-full bg-white p-1 ring-2 ring-white shadow-sm", className)}
    />
  );
}
