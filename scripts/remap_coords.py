"""Remap pavilion coords from the old three-zone scheme to a unified Venice viewBox (1320x660)."""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "pavilions.json"


def remap(p):
    v = p.get("venue")
    if not p.get("coords"):
        return p["coords"]
    cx, cy = p["coords"]["x"], p["coords"]["y"]

    if v == "Giardini":
        # Old 1000x700 → Giardini pentagon ~ x[1170,1310], y[410,560]
        nx = 1170 + (cx / 1000.0) * 140
        ny = 410 + (cy / 700.0) * 150
    elif v == "Arsenale":
        # Old 1200x500 → Arsenale wedge ~ x[960,1100], y[280,380]
        nx = 960 + (cx / 1200.0) * 140
        ny = 280 + (cy / 500.0) * 100
    elif v == "off-site":
        # Bin by x into the same regions used in the old layout
        if cx < 300:  # Cannaregio (top-left of main island)
            nx = 130 + (cx / 290.0) * 280
            ny = 130 + (cy / 300.0) * 70
        elif cx < 540:  # San Marco / San Polo (centre)
            nx = 540 + ((cx - 310) / 220.0) * 180
            ny = 260 + (cy / 300.0) * 60
        elif cx < 780:  # Castello off-site (east, between Piazza San Marco and Arsenale)
            nx = 760 + ((cx - 550) / 230.0) * 200
            ny = 320 + (cy / 300.0) * 110
        elif cx < 1040:  # Dorsoduro / San Polo (south-west)
            nx = 200 + ((cx - 810) / 230.0) * 320
            ny = 360 + (cy / 300.0) * 80
        else:  # Mestre (top-right inset)
            nx = 1240 + ((cx - 1050) / 120.0) * 70
            ny = 200 + (cy / 300.0) * 60
    else:
        return p["coords"]

    return {"x": round(nx, 1), "y": round(ny, 1)}


def main():
    pavs = json.loads(DATA.read_text())
    for p in pavs:
        if p.get("coords"):
            p["coords"] = remap(p)
    DATA.write_text(json.dumps(pavs, indent=2, ensure_ascii=False))
    print(f"Remapped {sum(1 for p in pavs if p.get('coords'))} pavilions to unified Venice coords (viewBox 1320x660).")


if __name__ == "__main__":
    main()
