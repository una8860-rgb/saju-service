import type { Element } from "./manseryeok/constants";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${BASE_PATH}${path}`;

/** 오행별 Tailwind 클래스 (정적 문자열이어야 Tailwind가 수집한다) */
export const ELEMENT_STYLE: Record<Element, { text: string; bg: string; soft: string; fill: string; name: string }> = {
  木: { text: "text-wood", bg: "bg-wood", soft: "bg-wood-soft", fill: "#3fa66b", name: "나무" },
  火: { text: "text-fire", bg: "bg-fire", soft: "bg-fire-soft", fill: "#ef5b5b", name: "불" },
  土: { text: "text-earth", bg: "bg-earth", soft: "bg-earth-soft", fill: "#d99a1e", name: "흙" },
  金: { text: "text-metal", bg: "bg-metal", soft: "bg-metal-soft", fill: "#7d8799", name: "쇠" },
  水: { text: "text-water", bg: "bg-water", soft: "bg-water-soft", fill: "#2f4a8a", name: "물" },
};

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
