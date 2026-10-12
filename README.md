# 사주그림 (saju-service)

정확한 만세력 위에, 그림으로 한눈에 읽히는 사주풀이 서비스.

**👉 사이트: https://una8860-rgb.github.io/saju-service/**

## 주요 기능

- **평생사주** — 생년월일·태어난 시각·출생지를 넣으면 결과 카드 10종으로 풀이
  - 프로필(띠 캐릭터, 시각 보정 내역) · 사주 원국표(십신·12운성·지장간·합충) · 오행 레이더 차트
  - 일간 성격 · 신강/신약과 두드러진 십신 · 대운 흐름 곡선 · 올해 운세
  - 재물·애정·직업·건강 지수 · 적성과 연애 스타일 · 개운법(행운의 색·방향·숫자 등)
- **만세력** — 날짜·시각·지역별 간지, 보정 시각, 직전·다음 절기 시각 조회
- **출생지** — 전국 17개 시도 · 167개 시·군, 지역 검색 지원 (예: "나주" → 전남 나주시)
- **결과 공유** — 입력값이 URL에 담겨 결과 링크를 그대로 공유

## 만세력 계산 원칙

| 항목 | 방식 |
|---|---|
| 연주 · 월주 | 1월 1일이 아닌 **입춘·절입 시각** 기준 |
| 시간 보정 | 출생지 경도(서울 −32분, 나주 −33분 등) + 서머타임(1948–51, 1955–60, 1987–88) + 1954–61년 표준시(UTC+8:30) |
| 자시 | 국내 대부분 만세력처럼 자시(보정 후 23시)부터 다음 날 일주. 야자시는 고급 설정 |
| 시각 모름 | 시주 없이 6글자로 풀이 |
| 음력 | 한국천문연구원 기준 한국 음력, 윤달 지원 |
| 대운 | 양년생 남·음년생 여 순행, 절입까지 일수 ÷ 3 |

상세 규칙: [docs/manseryeok/SPEC.md](docs/manseryeok/SPEC.md)

## 문서

| 문서 | 내용 |
|---|---|
| [docs/worklog/2026-10-12.md](docs/worklog/2026-10-12.md) | **작업 일지** — 진행 순서, 결정사항, 검증, 다음 할 일 |
| [docs/PLAN.md](docs/PLAN.md) | 서비스 계획서 |
| [docs/manseryeok/SPEC.md](docs/manseryeok/SPEC.md) | 만세력 계산 규칙 · 검증 계획 |
| [docs/design/ILLUSTRATION.md](docs/design/ILLUSTRATION.md) | 일러스트 스타일 가이드 |

## 실행

```bash
npm install
npm run dev     # 개발 서버 http://localhost:3000
npm test        # 테스트 37개 (vitest)
npm run build   # 정적 사이트 → out/
npm run illust  # 12띠 SVG 다시 생성 (python)
```

## 배포

`main`에 push하면 GitHub Actions가 **테스트 → 정적 빌드 → GitHub Pages 배포**를 자동으로 한다 ([deploy.yml](.github/workflows/deploy.yml)).
수동 재배포: `gh workflow run deploy.yml --ref main`

## 구조

서버 없이 정적 호스팅된다. 입력값은 URL 파라미터로 넘기고, 계산은 모두 브라우저에서 한다.

```
saju-service/
├─ docs/                         기획·설계 문서, 작업 일지
├─ public/images/zodiac/         12띠 얼굴 SVG
├─ src/
│  ├─ app/                       페이지: 홈, saju(입력), saju/result(결과), manseryeok
│  ├─ components/
│  │  ├─ layout/                 AppShell (PC 좌측 패널 + 중앙 앱 컬럼)
│  │  ├─ ui/                     Card, Badge, Chip, Notice, Icon, ScoreBar
│  │  ├─ saju/                   SajuForm, ResultView, SajuTable, GanjiChip, ManseryeokView
│  │  ├─ charts/                 OhaengRadar, OhaengBars, FortuneCurve (SVG)
│  │  └─ illust/                 ZodiacAvatar
│  ├─ lib/
│  │  ├─ manseryeok/             ① 계산: 음양력, 시간 보정, 절기, 4주, 대운, 출생지
│  │  ├─ analysis/               ② 분석: 십신, 12운성, 오행, 신강약, 합충, 지수
│  │  ├─ interpret/              ③ 풀이: 분석 결과 → content 문장
│  │  └─ query.ts                입력값 ↔ URL
│  ├─ styles/globals.css         디자인 토큰 (오행 색, 카드, 남색)
│  └─ types/
├─ content/                      풀이 문장 (일간·오행·십신·신강약·대운·세운·테마)
├─ data/locations/               167개 시·군 경도
├─ tests/                        manseryeok, analysis
└─ scripts/                      illust(12띠 생성), data(출생지 경도 생성)
```

```
입력 폼 ─▶ URL ─▶ lib/manseryeok ─▶ lib/analysis ─▶ lib/interpret ─▶ 결과 카드
                                                         ▲
                                                    content/*
```

## 데이터 · 라이브러리 출처

- 절기·간지 계산: [lunar-javascript](https://github.com/6tail/lunar-javascript)
- 한국 음력 변환: [korean-lunar-calendar](https://www.npmjs.com/package/korean-lunar-calendar)
- 출생지 경도: 통계청 2018 행정구역 경계 ([southkorea-maps](https://github.com/southkorea/southkorea-maps))의 면적 중심점
- 일러스트·풀이 문장: 이 프로젝트에서 새로 제작

> 풀이는 전통 명리 이론을 바탕으로 한 참고용 콘텐츠입니다. 분야별 지수와 운세 점수는 이론을 단순화한 참고값입니다.
