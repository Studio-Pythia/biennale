"""Add grid_ref (Il Giornale dell'Arte / Allemandi guide) to each pavilion.

Reference numbers come from the official 2026 paper guide:
- Giardini N: number on the Giardini detail map (1 Spain, 2 Belgium, ... 29 Greece)
- Arsenale N: 1 Corderie, 2 Artiglierie, 3 Sale d'Armi, 4 Tese del Cinquecento, 5 Padiglione Italia, 6 Magazzino delle cisterne
- For off-site: a sequential red number plus a city-grid coordinate (e.g. "42 D2")
- "off the map" for venues not in the printed grid
"""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "pavilions.json"

# Keyed by pavilion id (must match pavilions.json)
GRID = {
    # ---- Giardini ----
    "ES": "Giardini 1",
    "BE": "Giardini 2",
    "NL": "Giardini 3",
    # 4 = Central Pavilion (In Minor Keys) - main exhibition, not a national pavilion
    "FI": "Giardini 5",
    "HU": "Giardini 6",
    "US": "Giardini 7",
    "NORDIC": "Giardini 8",
    "DK": "Giardini 9",
    "QA": "Giardini 10",
    "CH": "Giardini 11",
    "RU": "Giardini 12",
    "JP": "Giardini 13",
    "KR": "Giardini 14",
    "DE": "Giardini 15",
    "CA": "Giardini 16",
    "GB": "Giardini 17",
    "FR": "Giardini 18",
    "CZSK": "Giardini 19",
    "AU": "Giardini 20",
    "UY": "Giardini 21",
    "BR": "Giardini 22",
    "AT": "Giardini 23",
    "RS": "Giardini 24",
    "EG": "Giardini 25",
    # 26 = Venice Pavilion (city of Venice's own pavilion, not a national one)
    "PL": "Giardini 27",
    "RO": "Giardini 28",
    "GR": "Giardini 29",

    # ---- Arsenale ----
    # 1 = Corderie (In Minor Keys main show)
    # 2 = Artiglierie (In Minor Keys + national pavilions)
    "CL": "Arsenale 2",
    "IN": "Arsenale 2",
    "IE": "Arsenale 2",
    "LV": "Arsenale 2",
    "LB": "Arsenale 2",
    "MT": "Arsenale 2",
    "MA": "Arsenale 2",
    "OM": "Arsenale 2",
    "PH": "Arsenale 2",
    "SI": "Arsenale 2",
    "TL": "Arsenale 2",
    # 3 = Sale d'Armi
    "AL": "Arsenale 3",
    "AR": "Arsenale 3",
    "LU": "Arsenale 3",
    "IL": "Arsenale 3",
    "MX": "Arsenale 3",
    "PE": "Arsenale 3",
    "SA": "Arsenale 3",
    "SG": "Arsenale 3",
    "TR": "Arsenale 3",
    "UA": "Arsenale 3",
    "AE": "Arsenale 3",
    # 4 = Tese del Cinquecento
    "UZ": "Arsenale 4",
    # 5 = Padiglione Italia
    "IT": "Arsenale 5",
    # 6 = Magazzino delle cisterne
    "CN": "Arsenale 6",

    # ---- Off-site (sequential number + city grid coordinate) ----
    "AM": "1 G3",          # Tesa 41, Arsenale Militare
    "AZ": "2 G4",          # Castello 2124/A
    "BS": "3 C5",          # San Trovaso, Dorsoduro
    "BA": "4 C4",          # Palazzo Malipiero, San Marco
    "BG": "5 C5",          # Centro Don Orione, Zattere
    "CM": "6 C4",          # Palazzo Canal, Dorsoduro
    "CD": "7 E3",          # Antico Refettorio, Scuola Grande di San Marco
    "HR": "8 F3",          # Palazzo Zorzi, Castello
    "CU": "9 H4",          # Il Giardino Bianco, Castello
    "CY": "10 F4",         # Spiazzi, Castello
    "EC": "11 G5",         # Castello 1636/A
    "SV": "12 D2",         # Cannaregio 3659 (Palazzo Mora ECC)
    "GQ": "13 E1",         # Palazzo Donà dalle Rose, Cannaregio
    "EE": "14 G5",         # Calle San Domenico, Castello
    "ET": "15 F4",         # Palazzo Bollani, Castello
    "GE": "16 B5",         # Palazzo Querini, San Barnaba
    "GD": "17 E2",         # Spazio Berlendis, Cannaregio
    "GT": "18 E2",         # Spazio Berlendis, Cannaregio
    "HT": "19 E2",         # Palazzo Albrizzi-Capello, Cannaregio
    "VA": "20 H4 + 20 B2", # Holy See: Santa Maria Ausiliatrice (Castello) + Carmelite garden (Cannaregio)
    "IS": "21 H4",         # Docks Cantieri Cucchini, San Pietro di Castello
    "ID": "22 C2",         # Scuola Internazionale di Grafica, Cannaregio
    "KZ": "23 G4",         # Museo Storico Navale, Castello
    "KG": "24 E2",         # Convitto Foscarini, Cannaregio
    "XK": "25 F3",         # Santa Maria del Pianto, Castello
    "LT": "26 F3",         # Fucina del Futuro, Castello
    "MD": "27 C2",         # Spazio Veneranda, Cannaregio
    "MN": "28 H4",         # Squero Castello
    "ME": "29 F3",         # Artenova, Castello
    "NR": "30 F4",         # Spazio Castello 3683
    "NZ": "31 F4",         # Istituto Pietà, Castello
    "MK": "32 H4",         # Ex Cappella Buon Pastore, Castello
    "PK": "33 C5",         # Ex Farmacia Solveni, Dorsoduro
    "PA": "34 G3",         # Tesa 42, Castello
    "PT": "35 C4",         # Calle del Traghetto, San Marco
    # 36 = Romania off-site secondary venue (Romanian Institute, Cannaregio 2214) — primary at Giardini 28
    "SM": "37 G4",         # Tana Art Space, Castello
    "SN": "38 F4",         # Palazzo Navagero, Castello
    "SL": "39 B4",         # Liceo Guggenheim, Dorsoduro
    "SO": "40 G5",         # Palazzo Caboto, Castello
    "SY": "41 A5",         # IUAV Cotonificio, Dorsoduro
    "TZ": "42 E2 + 42 D2", # Gervasuti / Antica perleria, Cannaregio
    "UG": "43 F4",         # Palazzo Navagero, Castello
    "VN": "44 E3",         # Ca' Faccanon, San Marco
    "ZW": "45 F4",         # Santa Maria della Pietà, Castello
    # 46 not yet identified in our dataset

    # ---- Off the map ----
    "GN": "off the map",   # Isola di San Servolo
    "VE": "off the map",   # Venezuelan Pavilion is dormant 2026
}


def main():
    pavs = json.loads(DATA.read_text())
    added = 0
    missing = []
    for p in pavs:
        gr = GRID.get(p["id"])
        if gr is not None:
            p["grid_ref"] = gr
            added += 1
        else:
            missing.append(p["id"])
    DATA.write_text(json.dumps(pavs, indent=2, ensure_ascii=False))
    print(f"Added grid_ref to {added} pavilions.")
    if missing:
        print(f"No grid_ref yet for: {', '.join(missing)}")


if __name__ == "__main__":
    main()
