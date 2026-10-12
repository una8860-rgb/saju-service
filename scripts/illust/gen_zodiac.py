"""
12띠 얼굴 일러스트(SVG) 생성기.
스타일 규칙은 docs/design/ILLUSTRATION.md 참고: 얼굴만, 둥근 형태, 갈색 단일 외곽선, 파스텔 단색, 분홍 볼터치.

    python scripts/illust/gen_zodiac.py
    → public/images/zodiac/*.svg, docs/design/preview/zodiac.html
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "public" / "images" / "zodiac"
PREVIEW = ROOT / "docs" / "design" / "preview" / "zodiac.html"

LINE = "#5A4033"   # 외곽선
EYE = "#3A2A22"
BLUSH = "#F7A1A8"
SW = 9             # 외곽선 굵기 (512px 기준)


def ell(cx, cy, rx, ry, fill, stroke=True, rot=0):
    s = f' stroke="{LINE}" stroke-width="{SW}"' if stroke else ""
    t = f' transform="rotate({rot} {cx} {cy})"' if rot else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"{s}{t}/>'


def path(d, fill="none", stroke=True, width=SW, color=LINE):
    s = f' stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"' if stroke else ""
    return f'<path d="{d}" fill="{fill}"{s}/>'


def mirror(d):
    """path의 x좌표를 캔버스 중앙(256) 기준으로 좌우 반전 (M/L/Q/Z, 'x,y' 형식만 지원)."""
    out = []
    for tok in d.split():
        if "," in tok:
            cmd = tok[0] if tok[0].isalpha() else ""
            x, y = tok.lstrip("MLQZ").split(",")
            out.append(f"{cmd}{512 - float(x):g},{y}")
        else:
            out.append(tok)
    return " ".join(out)


def pair(fn, *args, **kw):
    """좌우 대칭 도형 한 쌍. fn(cx, ...)의 cx를 반전."""
    cx, rest = args[0], args[1:]
    rot = kw.pop("rot", 0)
    return fn(cx, *rest, rot=rot, **kw) + fn(512 - cx, *rest, rot=-rot, **kw)


def face(eye_y, eye_dx, blush_y, blush_dx, mouth_y=None, eye_r=12):
    parts = []
    for sx in (-1, 1):
        ex = 256 + sx * eye_dx
        parts.append(f'<circle cx="{ex}" cy="{eye_y}" r="{eye_r}" fill="{EYE}"/>')
        parts.append(f'<circle cx="{ex + 3}" cy="{eye_y - 3}" r="3" fill="#fff"/>')
        parts.append(ell(256 + sx * blush_dx, blush_y, 20, 12, BLUSH, stroke=False))
    if mouth_y is not None:
        m = mouth_y
        parts.append(path(f"M242,{m} Q249,{m + 10} 256,{m} Q263,{m + 10} 270,{m}", width=6))
    return "".join(parts)


def rat():
    g, inner = "#BFC0CB", "#F4C7CD"
    return (pair(ell, 150, 170, 72, 72, g) + pair(ell, 150, 170, 42, 42, inner, stroke=False)
            + ell(256, 295, 160, 140, g)
            + ell(256, 345, 64, 42, "#E4E4EC", stroke=False)
            + path("M180,338 L118,328") + path("M182,356 L122,362")
            + path(mirror("M180,338 L118,328")) + path(mirror("M182,356 L122,362"))
            + face(280, 58, 318, 102, mouth_y=342)
            + ell(256, 322, 15, 11, "#F2899A"))


def ox():
    head, muzzle, horn = "#D7AB80", "#F5DFC8", "#F6E8C8"
    horn_l = "M178,188 Q118,172 122,108 Q160,140 212,160 Z"
    return (path(horn_l, horn) + path(mirror(horn_l), horn)
            + pair(ell, 112, 252, 50, 26, head, rot=-20)
            + ell(256, 290, 146, 135, head)
            + path("M222,162 Q238,132 256,158 Q274,132 290,162 Z", "#A8784E")
            + ell(256, 357, 102, 58, muzzle)
            + ell(222, 355, 10, 14, LINE, stroke=False) + ell(290, 355, 10, 14, LINE, stroke=False)
            + face(272, 56, 300, 108))


def tiger():
    y, w = "#F7C24A", "#FFF6E5"
    stripes = ["M256,160 L256,196", "M218,170 L226,200", "M100,288 L136,294", "M104,324 L138,320"]
    s = "".join(path(d, width=12) for d in stripes) + "".join(path(mirror(d), width=12) for d in stripes[1:])
    return (pair(ell, 150, 172, 54, 54, y) + pair(ell, 150, 174, 28, 28, w, stroke=False)
            + ell(256, 295, 160, 140, y) + s
            + ell(256, 344, 72, 44, w, stroke=False)
            + face(280, 60, 322, 108, mouth_y=344)
            + path("M240,318 Q256,310 272,318 Q262,334 256,334 Q250,334 240,318 Z", "#E8846F"))


def rabbit():
    w, pink = "#FFFFFF", "#F7C6CF"
    return (pair(ell, 205, 135, 38, 98, w, rot=-8) + pair(ell, 205, 142, 18, 70, pink, stroke=False, rot=-8)
            + ell(256, 312, 150, 130, w)
            + face(300, 56, 340, 96, mouth_y=342)
            + ell(256, 328, 11, 8, "#F2899A"))


def dragon():
    g, light, horn, crest = "#A8D88A", "#DDF0CC", "#F7E2A0", "#7CC36A"
    horn_l = "M196,176 Q170,128 168,92 Q196,110 222,166 Z"
    whisker = "M176,352 Q128,366 116,330"
    return (path(horn_l, horn) + path(mirror(horn_l), horn)
            + pair(ell, 106, 276, 42, 22, g, rot=-25)
            + path("M222,168 Q239,118 256,160 Q273,118 290,168 Z", crest)
            + ell(256, 295, 150, 135, g)
            + ell(256, 352, 86, 50, light)
            + ell(232, 348, 7, 9, LINE, stroke=False) + ell(280, 348, 7, 9, LINE, stroke=False)
            + path(whisker, width=6) + path(mirror(whisker), width=6)
            + face(274, 60, 300, 110))


def snake():
    g, spot = "#A9DDB8", "#7BC495"
    return (ell(256, 282, 130, 150, g)
            + ell(256, 172, 24, 14, spot, stroke=False) + ell(214, 194, 14, 10, spot, stroke=False)
            + ell(298, 194, 14, 10, spot, stroke=False)
            + path("M256,428 L256,460 L244,476 M256,460 L268,476", color="#E5566B", width=7)
            + face(292, 50, 332, 86, mouth_y=364))


def horse():
    b, mane, muzzle = "#C8925E", "#6B4A35", "#EDCBA8"
    ear_l = "M196,152 L172,82 L232,130 Z"
    return (path(ear_l, b) + path(mirror(ear_l), b)
            + ell(256, 292, 126, 156, b)
            + path("M204,156 Q222,112 262,124 Q302,120 314,160 Q294,154 284,186 Q270,164 254,180 "
                   "Q240,160 222,176 Q222,162 204,156 Z", mane)
            + ell(256, 378, 92, 58, muzzle)
            + ell(226, 376, 9, 12, LINE, stroke=False) + ell(286, 376, 9, 12, LINE, stroke=False)
            + face(272, 52, 312, 92))


def sheep():
    wool, skin = "#FFF8EC", "#F2D2B4"
    import math
    puffs = "".join(
        f'<circle cx="{256 + 150 * math.cos(a):.1f}" cy="{290 + 150 * math.sin(a):.1f}" r="56" '
        f'fill="{wool}" stroke="{LINE}" stroke-width="{SW}"/>'
        for a in (i * math.pi / 6 for i in range(12)))
    return (puffs + ell(256, 290, 152, 152, wool, stroke=False)
            + pair(ell, 150, 300, 54, 26, skin, rot=20)
            + ell(256, 312, 100, 110, skin)
            + face(306, 42, 344, 66, mouth_y=360))


def monkey():
    b, skin = "#A8754F", "#F3D2B0"
    return (pair(ell, 100, 296, 50, 50, b) + pair(ell, 100, 296, 28, 28, skin, stroke=False)
            + ell(256, 290, 150, 140, b)
            + ell(214, 282, 62, 62, skin, stroke=False) + ell(298, 282, 62, 62, skin, stroke=False)
            + ell(256, 344, 96, 62, skin, stroke=False)
            + path("M240,156 Q250,126 270,150")
            + ell(246, 330, 5, 4, LINE, stroke=False) + ell(266, 330, 5, 4, LINE, stroke=False)
            + face(282, 42, 322, 80, mouth_y=356))


def rooster():
    w, red, beak = "#FFFFFF", "#EF5B5B", "#F6B93B"
    return (ell(222, 152, 28, 32, red) + ell(290, 152, 28, 32, red) + ell(256, 136, 30, 36, red)
            + ell(256, 296, 140, 140, w)
            + ell(256, 374, 16, 22, red)
            + path("M228,322 L256,306 L284,322 L256,346 Z", beak)
            + face(280, 52, 320, 92))


def dog():
    tan, ear, muzzle = "#EBC594", "#9C6B47", "#FFF4E4"
    ear_l = "M136,196 Q88,206 90,300 Q98,348 142,332 Q168,270 164,212 Z"
    return (ell(256, 290, 150, 138, tan)
            + ell(312, 268, 42, 38, "#D9A86C", stroke=False)
            + path(ear_l, ear) + path(mirror(ear_l), ear)
            + ell(256, 346, 72, 48, muzzle)
            + ell(256, 324, 20, 14, EYE, stroke=False)
            + face(270, 56, 318, 104, mouth_y=350))


def pig():
    p, snout = "#F7C3C9", "#F29AA8"
    ear_l = "M150,216 L140,134 L216,170 Z"
    return (path(ear_l, p) + path(mirror(ear_l), p)
            + ell(256, 295, 156, 138, p)
            + ell(256, 336, 50, 35, snout)
            + ell(240, 336, 7, 11, "#B5576A", stroke=False) + ell(272, 336, 7, 11, "#B5576A", stroke=False)
            + face(276, 64, 322, 112, mouth_y=388))


ANIMALS = [  # (파일명, 한글, 지지, 그리는 함수)
    ("rat", "쥐", "子", rat), ("ox", "소", "丑", ox), ("tiger", "호랑이", "寅", tiger),
    ("rabbit", "토끼", "卯", rabbit), ("dragon", "용", "辰", dragon), ("snake", "뱀", "巳", snake),
    ("horse", "말", "午", horse), ("sheep", "양", "未", sheep), ("monkey", "원숭이", "申", monkey),
    ("rooster", "닭", "酉", rooster), ("dog", "개", "戌", dog), ("pig", "돼지", "亥", pig),
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    cards = []
    for slug, ko, ji, fn in ANIMALS:
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="{ko}띠">{fn()}</svg>\n'
        (OUT_DIR / f"{slug}.svg").write_text(svg, encoding="utf-8")
        cards.append(f'<figure><img src="../../../public/images/zodiac/{slug}.svg" alt="{ko}"><figcaption>{ji} {ko}</figcaption></figure>')
    PREVIEW.write_text(f"""<!doctype html><html lang="ko"><meta charset="utf-8"><title>12띠 일러스트 미리보기</title>
<style>
body{{margin:0;background:#2E3A8C;font-family:'Pretendard','Malgun Gothic',sans-serif;color:#fff}}
h1{{text-align:center;font-size:40px;margin:40px 0 8px}}
.grid{{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;padding:32px 48px 48px}}
figure{{margin:0;background:#fff;border-radius:24px;padding:16px 8px 12px;text-align:center}}
img{{width:100%;aspect-ratio:1}}
figcaption{{color:#5A4033;font-weight:700;font-size:18px}}
</style>
<h1>12띠 일러스트</h1><div class="grid">{''.join(cards)}</div></html>
""", encoding="utf-8")
    print(f"{len(ANIMALS)}개 SVG → {OUT_DIR}\n미리보기 → {PREVIEW}")


if __name__ == "__main__":
    main()
