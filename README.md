# 사주그림 (saju-service)

출생지 경도·절입 시각까지 반영한 만세력으로 사주 원국, 오행, 대운을 그림과 차트로 풀어 주는 서비스.

- **사이트**: https://una8860-rgb.github.io/saju-service/
- 기획: [docs/PLAN.md](docs/PLAN.md) · 만세력 계산 규칙: [docs/manseryeok/SPEC.md](docs/manseryeok/SPEC.md) · 일러스트 가이드: [docs/design/ILLUSTRATION.md](docs/design/ILLUSTRATION.md)

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 만세력·분석 테스트 (vitest)
npm run build   # 정적 사이트 → out/
npm run illust  # 12띠 SVG 다시 생성 (python)
```

`main`에 push하면 GitHub Actions가 테스트 → 빌드 → GitHub Pages 배포를 자동으로 한다 (`.github/workflows/deploy.yml`).

## 구조

정적 호스팅(GitHub Pages)이라 서버가 없다. 입력값은 URL 파라미터로 넘기고, 계산은 모두 브라우저에서 한다.

```
saju-service/
├─ docs/                         기획·설계 문서
│  ├─ PLAN.md                    서비스 계획서
│  ├─ manseryeok/SPEC.md         만세력 계산 규칙 & 검증 계획
│  └─ design/
│     ├─ ILLUSTRATION.md         일러스트 스타일 가이드
│     ├─ preview/zodiac.html     12띠 일러스트 미리보기
│     └─ reference/              레퍼런스 캡처 (로컬 전용, git 제외)
│
├─ public/images/zodiac/         12띠 얼굴 SVG
│
├─ src/
│  ├─ app/                       페이지 (Next.js App Router, 정적 export)
│  │  ├─ page.tsx                홈
│  │  ├─ saju/                   사주 입력 폼
│  │  │  └─ result/              평생사주 결과 (카드 10종)
│  │  └─ manseryeok/             만세력 조회
│  │
│  ├─ components/
│  │  ├─ layout/                 AppShell (PC 좌측 패널 + 중앙 앱 컬럼)
│  │  ├─ ui/                     Card, Badge, Chip, Notice, Icon, ScoreBar
│  │  ├─ saju/                   SajuForm, ResultView, SajuTable, GanjiChip, ManseryeokView
│  │  ├─ charts/                 OhaengRadar, OhaengBars, FortuneCurve (직접 그린 SVG)
│  │  └─ illust/                 ZodiacAvatar
│  │
│  ├─ lib/
│  │  ├─ manseryeok/             ① 계산: 음양력 변환, 시간 보정, 절기, 4주, 대운
│  │  ├─ analysis/               ② 분석: 십신, 12운성, 오행, 신강약, 합충, 지수
│  │  ├─ interpret/              ③ 풀이: 분석 결과 → content 문장
│  │  └─ query.ts                입력값 ↔ URL 파라미터
│  │
│  ├─ styles/globals.css         디자인 토큰 (오행 색, 카드, 남색)
│  └─ types/                     외부 라이브러리 타입 선언
│
├─ content/                      풀이 문장 (코드와 분리)
│  ├─ ilgan/                     일간 10종
│  ├─ ohaeng/                    오행 과다·부족·개운법
│  ├─ sipsin/                    십신 10종, 신강/중화/신약
│  ├─ daeun/                     대운·세운 십신별 흐름
│  └─ themes/                    재물·애정·직업·건강 구간별 문장
│
├─ data/locations/               출생지 경도 (시간 보정용)
├─ tests/                        manseryeok(경계 케이스), analysis
└─ scripts/illust/               일러스트 생성 스크립트
```

## 데이터 흐름

```
입력 폼 ─▶ URL ─▶ lib/manseryeok ─▶ lib/analysis ─▶ lib/interpret ─▶ 결과 카드
                  (lunar-javascript,                      ▲
                   korean-lunar-calendar,            content/*
                   Intl Asia/Seoul 시간대 이력)
```
