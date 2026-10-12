# saju-service

만세력 기반 사주풀이 서비스. 기획 내용은 [docs/PLAN.md](docs/PLAN.md), 만세력 계산 규칙은 [docs/manseryeok/SPEC.md](docs/manseryeok/SPEC.md)에 있다.

- 12띠 일러스트 미리보기: [docs/design/preview/zodiac.html](https://una8860-rgb.github.io/saju-service/docs/design/preview/zodiac.html)

## 폴더 구조

```
saju-service/
├─ docs/                         기획·설계 문서
│  ├─ PLAN.md                    서비스 계획서
│  ├─ manseryeok/SPEC.md         만세력 계산 규칙 & 검증 계획
│  └─ design/
│     ├─ ILLUSTRATION.md         일러스트 스타일 가이드
│     ├─ reference/              레퍼런스 캡처 (로컬 전용, git 제외)
│     └─ wireframes/             화면 와이어프레임
│
├─ public/                       정적 리소스 (그림 요소)
│  ├─ images/
│  │  ├─ zodiac/                 12띠 캐릭터
│  │  ├─ ohaeng/                 오행(木火土金水) 아이콘
│  │  ├─ ilju/                   일간 10종 → 60일주 캐릭터
│  │  ├─ icons/menu/             홈 메뉴 라인 아이콘
│  │  ├─ icons/fortune/          재물·애정·건강·직업 테마 아이콘
│  │  ├─ banners/                홈 배너
│  │  └─ share/                  공유 카드 배경
│  └─ fonts/
│
├─ src/
│  ├─ app/                       페이지 (Next.js App Router)
│  │  ├─ saju/                   사주 입력 폼
│  │  │  └─ result/              평생사주 결과 (카드 10종)
│  │  ├─ manseryeok/             만세력 조회
│  │  ├─ today/                  오늘의 운세 (2차)
│  │  ├─ gunghap/                궁합 (2차)
│  │  └─ api/saju/               사주 계산 API
│  │
│  ├─ components/
│  │  ├─ layout/                 AppShell(PC 좌측 패널 + 중앙 앱 컬럼), Header, BottomNav
│  │  ├─ ui/                     Card, SectionHeader, Badge, IconGrid, ListRow, ScoreGauge
│  │  ├─ saju/                   SajuTable, GanjiChip, IljuCard, DaeunTimeline
│  │  ├─ charts/                 OhaengRadar, FortuneCurve, StrengthBars, MonthHeatmap
│  │  └─ illust/                 ZodiacAvatar 등 일러스트 래퍼
│  │
│  ├─ lib/
│  │  ├─ manseryeok/             ① 계산: 음양력 변환, 시간 보정, 절기, 4주, 대운
│  │  ├─ analysis/               ② 분석: 오행 점수, 십신, 신강약, 합충, 신살
│  │  └─ interpret/              ③ 풀이: 분석 결과 → content 문장 조합
│  │
│  ├─ styles/                    tokens.css (오행 색, 카드, 타이포)
│  └─ types/                     Saju, Pillar, Analysis 타입
│
├─ content/                      풀이 문장 DB (코드와 분리, 비개발자 편집)
│  ├─ ilgan/                     일간 10종 기본 성향
│  ├─ ilju/                      60일주 상세
│  ├─ sipsin/                    십신 과다·부족·부재
│  ├─ ohaeng/                    오행 과다·부족
│  ├─ daeun/                     대운 흐름
│  ├─ sinsal/                    신살
│  └─ themes/                    재물·애정·건강·직업
│
├─ data/
│  ├─ solar-terms/               절기 절입 시각 테이블 (1900–2100, KASI 기준)
│  ├─ locations/                 출생지 경도 (시간 보정용)
│  └─ fixtures/                  만세력 검증용 정답 데이터
│
├─ tests/
│  ├─ manseryeok/                절기·자시·서머타임·윤달 경계 테스트
│  ├─ analysis/
│  └─ interpret/
│
└─ scripts/                      절기 테이블 생성, 콘텐츠 누락 검사 등
```

## 데이터 흐름

```
입력 폼 (app/saju) ─▶ api/saju ─▶ lib/manseryeok ─▶ lib/analysis ─▶ lib/interpret ─▶ 결과 카드 (app/saju/result)
                                                                        ▲
                                                                   content/*
```
