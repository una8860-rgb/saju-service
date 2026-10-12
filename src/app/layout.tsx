import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "사주그림 — 정확한 만세력, 그림으로 읽는 사주",
  description: "출생지 경도와 절입 시각까지 반영한 만세력으로 사주 원국, 오행, 대운을 그림과 차트로 풀어 드려요.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f2f4f6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
