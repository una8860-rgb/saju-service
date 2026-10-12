"""kostat 2018 시군구 경계 → 시·군 단위 경도/위도(면적가중 중심점) 계산."""
import json, sys, re
sys.stdout.reconfigure(encoding="utf-8")
src, old_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
feats = json.load(open(src, encoding="utf-8"))["features"]
old = json.load(open(old_path, encoding="utf-8"))
old_by_id = {c["id"]: c for c in old["cities"]}

SIDO = {"11": "서울", "21": "부산", "22": "대구", "23": "인천", "24": "광주", "25": "대전", "26": "울산", "29": "세종",
        "31": "경기", "32": "강원", "33": "충북", "34": "충남", "35": "전북", "36": "전남", "37": "경북", "38": "경남", "39": "제주"}
METRO = {"11": ("seoul", "서울특별시"), "21": ("busan", "부산광역시"), "22": ("daegu", "대구광역시"), "23": ("incheon", "인천광역시"),
         "24": ("gwangju", "광주광역시"), "25": ("daejeon", "대전광역시"), "26": ("ulsan", "울산광역시"), "29": ("sejong", "세종특별자치시")}

def rings(geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    return [p[0] for p in polys]  # 외곽선만

def area_centroid(rs):
    A = cx = cy = 0.0
    for r in rs:
        for (x0, y0), (x1, y1) in zip(r, r[1:] + r[:1]):
            c = x0 * y1 - x1 * y0
            A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c
    A /= 2
    return cx / (6 * A), cy / (6 * A)

groups = {}  # key -> {sido, name, eng, rings}
for f in feats:
    p = f["properties"]; code = p["code"]; pre = code[:2]; name = p["name"]; eng = p["name_eng"]
    if pre in METRO and int(code[2:]) < 310:   # 광역시 자치구는 하나로 (시청 좌표 사용)
        continue
    sido = SIDO[pre]
    if name == "군위군": sido = "대구"          # 2023.7 경북 → 대구 편입
    m = re.match(r"^(.+?시)(.+구)$", name)       # 수원시장안구 → 수원시
    if m and pre not in METRO:
        name = m.group(1); eng = re.sub(r"\s+.*$", "", eng)
    eng = re.sub(r"-si.*$", "", eng)
    key = (sido, name)
    g = groups.setdefault(key, {"sido": sido, "name": name, "eng": eng, "rings": [], "code": code})
    g["rings"] += rings(f["geometry"])

cities = []
for pre, (cid, nm) in METRO.items():           # 광역시·특별시 본청 (기존 좌표 유지)
    o = old_by_id[cid]
    cities.append({"id": cid, "sido": SIDO[pre], "name": nm, "lng": o["lng"], "lat": o["lat"], "_code": pre + "000"})

used = {c["id"] for c in cities}
for (sido, name), g in groups.items():
    lng, lat = area_centroid(g["rings"])
    OVERRIDE = {"수원시": "suwon", "성남시": "seongnam", "안양시": "anyang", "안산시": "ansan", "고양시": "goyang",
                "용인시": "yongin", "청주시": "cheongju", "천안시": "cheonan", "전주시": "jeonju", "포항시": "pohang", "창원시": "changwon",
                # 원본 name_eng 오류(철원군=Gongju) 및 하이픈 누락 보정
                "철원군": "cheorwon-gun", "화성시": "hwaseong", "양주시": "yangju", "포천시": "pocheon",
                "계룡시": "gyeryong", "당진시": "dangjin", "증평군": "jeungpyeong-gun"}
    base = OVERRIDE.get(name) or g["eng"].lower().replace(" ", "-").replace("'", "")
    cid = base
    if cid in used:
        cid = f"{base}-{ {'경기':'gg','강원':'gw','경남':'gn','경북':'gb','충북':'cb','충남':'cn','전북':'jb','전남':'jn'}.get(sido,'x') }".replace(" ", "")
    used.add(cid)
    cities.append({"id": cid, "sido": sido, "name": name, "lng": round(lng, 3), "lat": round(lat, 3), "_code": g["code"]})

# 기존 도시 id 호환 확인 + 좌표 차이
print("legacy check:")
for oid, o in old_by_id.items():
    c = next((c for c in cities if c["id"] == oid), None)
    print(f"  {oid:10} {'OK ' if c else 'MISSING'} {o['name']}", f"old {o['lng']} new {c['lng']} diff {c['lng']-o['lng']:+.3f}" if c else "")

order = list(SIDO.values())
cities.sort(key=lambda c: (order.index(c["sido"]), c["_code"] if c["sido"] != "대구" or c["name"] != "군위군" else "22999"))
for c in cities: del c["_code"]
print("total", len(cities))
from collections import Counter
print(Counter(c["sido"] for c in cities))
print("lng range", min(c["lng"] for c in cities), max(c["lng"] for c in cities))
json.dump({"_comment": "출생지 경도 보정용. 보정(분) = (경도 - 135) × 4. 시·군: 통계청 2018 행정구역 경계의 면적 중심점, 광역시·특별시: 시청 좌표. 2023 군위군 대구 편입 반영.",
           "standardMeridian": 135, "default": "seoul", "cities": cities},
          open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
