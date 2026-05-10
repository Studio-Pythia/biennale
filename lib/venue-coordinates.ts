/**
 * Venice Biennale 2026 - Official Venue Coordinate Mapping
 * 
 * Based on official Biennale maps:
 * - Giardini: 29 numbered pavilion positions
 * - Arsenale: 6 building zones (Corderie, Artiglierie, Sale d'Armi, Tese del Cinquecento, Padiglione Italia, Magazzino delle cisterne)
 * - Off-site: Grid references (e.g., "42 E2", "35 C4")
 * 
 * Coordinate system: Normalized to a 1600x900 canvas with Venice geography
 */

// Giardini pavilion positions (numbered 1-29 from the official map)
// Coordinates are relative to giardini-detail-map.png image
// The image shows pavilions 1-29 arranged in the gardens with yellow building footprints
export const GIARDINI_POSITIONS: Record<number, { x: number; y: number; label: string; countryCode: string }> = {
  1:  { x: 255, y: 410, label: "Spain", countryCode: "ES" },
  2:  { x: 220, y: 330, label: "Belgium", countryCode: "BE" },
  3:  { x: 260, y: 270, label: "Netherlands", countryCode: "NL" },
  4:  { x: 380, y: 215, label: "Central Pavilion", countryCode: "" }, // Main exhibition
  5:  { x: 450, y: 200, label: "Finland", countryCode: "FI" },
  6:  { x: 530, y: 180, label: "Hungary", countryCode: "HU" },
  7:  { x: 530, y: 330, label: "United States", countryCode: "US" },
  8:  { x: 460, y: 370, label: "Nordic Countries", countryCode: "NO" }, // Norway+Sweden+Finland shared
  9:  { x: 410, y: 420, label: "Denmark", countryCode: "DK" },
  10: { x: 440, y: 320, label: "Qatar", countryCode: "QA" },
  11: { x: 350, y: 480, label: "Switzerland", countryCode: "CH" },
  12: { x: 420, y: 490, label: "Russia", countryCode: "RU" },
  13: { x: 530, y: 500, label: "Japan", countryCode: "JP" },
  14: { x: 600, y: 500, label: "Korea", countryCode: "KR" },
  15: { x: 680, y: 480, label: "Germany", countryCode: "DE" },
  16: { x: 780, y: 490, label: "Canada", countryCode: "CA" },
  17: { x: 820, y: 410, label: "Great Britain", countryCode: "GB" },
  18: { x: 720, y: 380, label: "France", countryCode: "FR" },
  19: { x: 680, y: 380, label: "Czech & Slovak Rep.", countryCode: "CZ" },
  20: { x: 720, y: 330, label: "Australia", countryCode: "AU" },
  21: { x: 680, y: 290, label: "Uruguay", countryCode: "UY" },
  22: { x: 620, y: 230, label: "Brazil", countryCode: "BR" },
  23: { x: 540, y: 120, label: "Austria", countryCode: "AT" },
  24: { x: 600, y: 100, label: "Serbia", countryCode: "RS" },
  25: { x: 680, y: 130, label: "Egypt", countryCode: "EG" },
  26: { x: 720, y: 180, label: "Venice Pavilion", countryCode: "" },
  27: { x: 750, y: 210, label: "Poland", countryCode: "PL" },
  28: { x: 800, y: 180, label: "Romania", countryCode: "RO" },
  29: { x: 820, y: 240, label: "Greece", countryCode: "GR" },
};

// Get Giardini position number for a country code
export function getGiardiniPosition(countryCode: string): number | null {
  for (const [pos, data] of Object.entries(GIARDINI_POSITIONS)) {
    if (data.countryCode === countryCode) {
      return parseInt(pos);
    }
  }
  return null;
}

// Arsenale building zones (numbered 1-6 from the official map)
// Coordinates are relative to the arsenale-detail-map.png image (1024x890 approx)
export const ARSENALE_ZONES: Record<number, { x: number; y: number; label: string; countryCodes: string[] }> = {
  1: { 
    x: 340, y: 430, 
    label: "Corderie", 
    countryCodes: [] // Central Exhibition "In Minor Keys" - no individual pavilions
  },
  2: { 
    x: 420, y: 360, 
    label: "Artiglierie",
    countryCodes: [
      "CL", "IN", "IE", "LV", "LB", "MT", 
      "PH", "MA", "OM", "SI", "TL"
    ]
  },
  3: { 
    x: 450, y: 320, 
    label: "Sale d'Armi",
    countryCodes: [
      "AL", "AR", "LU", "IL", "MX", 
      "PE", "SA", "SG", "TR", "UA", "AE"
    ]
  },
  4: { 
    x: 520, y: 190, 
    label: "Tese del Cinquecento",
    countryCodes: ["UZ"]
  },
  5: { 
    x: 560, y: 200, 
    label: "Padiglione Italia",
    countryCodes: ["IT"]
  },
  6: { 
    x: 600, y: 160, 
    label: "Magazzino delle cisterne",
    countryCodes: ["CN"]
  },
};

// Get Arsenale zone number for a country code
export function getArsenaleZone(countryCode: string): number | null {
  for (const [zone, data] of Object.entries(ARSENALE_ZONES)) {
    if (data.countryCodes.includes(countryCode)) {
      return parseInt(zone);
    }
  }
  return null;
}

// Grid reference to coordinate mapping for off-site venues
// Based on the full Venice city map grid (columns 1-6, rows A-H)
export const GRID_TO_COORDS: Record<string, { x: number; y: number }> = {
  // San Marco area
  "27": { x: 500, y: 400 }, // San Marco center
  "28": { x: 520, y: 380 },
  "44": { x: 480, y: 420 },
  "45": { x: 460, y: 440 },
  
  // Dorsoduro area
  "33 C5": { x: 380, y: 520 },
  "35 C4": { x: 360, y: 480 },
  "36 D2": { x: 340, y: 440 },
  "39 B4": { x: 320, y: 500 },
  
  // Castello area
  "42 E2": { x: 600, y: 360 },
  "42 D2": { x: 580, y: 380 },
  "43 F4": { x: 640, y: 420 },
  "45 F4": { x: 660, y: 440 },
  
  // Cannaregio area
  "13 E1": { x: 540, y: 280 },
  "19 E2": { x: 560, y: 300 },
  "20 H4": { x: 580, y: 320 },
  
  // San Polo area
  "5 C5": { x: 400, y: 360 },
  "6 C4": { x: 420, y: 340 },
  "7 E3": { x: 440, y: 320 },
  
  // Giudecca
  "23 G4": { x: 700, y: 560 },
  
  // Off the map (San Servolo, etc.)
  "off the map": { x: 200, y: 700 },
};

// Country code to grid reference mapping (from the official guide)
export const COUNTRY_GRID_REFS: Record<string, string> = {
  // Giardini pavilions
  "AU": "Giardini 20",
  "AT": "Giardini 23", 
  "BE": "Giardini 2",
  "BR": "Giardini 22",
  "CA": "Giardini 16",
  "CZ": "Giardini 19", // Czech & Slovak Rep
  "DK": "Giardini 9",
  "EG": "Giardini 25",
  "FI": "Giardini 5", // Finland (AALTO Pavilion)
  "FR": "Giardini 18",
  "DE": "Giardini 15",
  "GB": "Giardini 17",
  "GR": "Giardini 29",
  "HU": "Giardini 6",
  "JP": "Giardini 13",
  "KR": "Giardini 14",
  "NL": "Giardini 3",
  "NO": "Giardini 8", // Nordic Countries
  "PL": "Giardini 27",
  "QA": "Giardini 10",
  "RO": "Giardini 28",
  "RU": "Giardini 12",
  "RS": "Giardini 24", // Serbia
  "ES": "Giardini 1",
  "CH": "Giardini 11",
  "US": "Giardini 7",
  "UY": "Giardini 21",
  "VE_PAV": "Giardini 26", // Venice Pavilion
  
  // Arsenale - Artiglierie (Zone 2)
  "CL": "Arsenale 2", // Chile
  "IN": "Arsenale 2", // India  
  "IE": "Arsenale 2", // Ireland
  "LV": "Arsenale 2", // Latvia
  "LB": "Arsenale 2", // Lebanon
  "MT": "Arsenale 2", // Malta
  "PH": "Arsenale 2", // Philippines
  "MA": "Arsenale 2", // Morocco
  "OM": "Arsenale 2", // Oman
  "SI": "Arsenale 2", // Slovenia
  "TL": "Arsenale 2", // Timor Leste
  "AM": "Arsenale Militare 1 G3", // Armenia
  "BS": "Dorsoduro 947 3 C5", // Bahamas
  "KG": "24 E2", // Kyrgyz Republic
  "LT": "26 F3", // Lithuania  
  "ME": "29 F3", // Montenegro
  "MK": "32 H4", // North Macedonia
  "PK": "33 C5", // Pakistan
  
  // Arsenale - Sale d'Armi (Zone 3)
  "AL": "Arsenale 3", // Albania
  "AR": "Arsenale 3", // Argentina
  "LU": "Arsenale 3", // Luxembourg
  "IL": "Arsenale 3", // Israel
  "MX": "Arsenale 3", // Mexico
  "PE": "Arsenale 3", // Peru
  "SA": "Arsenale 3", // Saudi Arabia
  "SG": "Arsenale 3", // Singapore
  "TR": "Arsenale 3", // Turkey
  "UA": "Riva Ca' di Dio + Arsenale, Sale d'armi 46 G4 + Arsenale 3", // Ukraine
  "AE": "Arsenale 3", // UAE
  "SY": "41 A5", // Syria
  "XK": "25 F3", // Kosovo
  
  // Arsenale - Tese del Cinquecento (Zone 4)
  "UZ": "Arsenale 4", // Uzbekistan
  
  // Arsenale - Padiglione Italia (Zone 5)
  "IT": "Arsenale 5", // Italy
  
  // Arsenale - Magazzino delle cisterne (Zone 6)
  "CN": "Arsenale 6", // China
  
  // Off-site venues (scattered across Venice)
  "AZ": "2 G4", // Azerbaijan
  "BA": "4 C4", // Bosnia-Herzegovina
  "BG": "5 C5", // Bulgaria
  "CM": "6 C4", // Cameroon
  "HR": "8 F3", // Croatia
  "CU": "9 H4", // Cuba
  "CY": "10 F4", // Cyprus
  "EC": "11 G5", // Ecuador
  "SV": "12 D2", // El Salvador
  "GQ": "13 E1", // Equatorial Guinea
  "EE": "14 G5", // Estonia
  "ET": "15 F4", // Ethiopia
  "GE": "16 B5", // Georgia
  "GD": "17 E2", // Grenada
  "GT": "18 E2", // Guatemala
  "GN": "off the map", // Guinea (Isola di San Servolo)
  "HT": "19 E2", // Haiti
  "VA": "20 H4 + 20 B2", // Holy See
  "IS": "21 H4", // Iceland
  "ID": "22 C2", // Indonesia
  "KZ": "23 G4", // Kazakhstan
  "MD": "27 C2", // Moldova
  "MN": "28 H4", // Mongolia
  "NR": "30 F4", // Nauru
  "NZ": "31 F4", // New Zealand
  "PA": "34 G3", // Panama
  "PT": "35 C4", // Portugal
  "SM": "37 G4", // San Marino
  "SN": "38 F4", // Senegal
  "SL": "39 B4", // Sierra Leone
  "SO": "40 G5", // Somalia
  "TZ": "42 E2 + 42 D2", // Tanzania
  "UG": "43 F4", // Uganda
  "VN": "44 E3", // Vietnam
  "ZW": "45 F4", // Zimbabwe
};

// Map image dimensions (from Main map.png)
const MAP_WIDTH = 1566;
const MAP_HEIGHT = 890;

// Grid coordinates on the map image
// Columns A-H start at x=62, each column ~187px wide
// Rows 1-6 start at y=30, each row ~143px tall
const GRID = {
  colStart: 62,
  colWidth: 187,
  rowStart: 30,
  rowHeight: 143,
};

// Convert grid column letter and row number to map coordinates
function gridToMapCoords(col: string, row: number): { x: number; y: number } {
  const colIndex = col.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  return {
    x: GRID.colStart + colIndex * GRID.colWidth + GRID.colWidth / 2,
    y: GRID.rowStart + (row - 1) * GRID.rowHeight + GRID.rowHeight / 2,
  };
}

// Parse grid reference to get coordinates
// Format examples: "Giardini 20", "Arsenale 3", "4 C4", "42 E2 + 42 D2"
export function parseGridRef(gridRef: string): { x: number; y: number } | null {
  if (!gridRef) return null;
  
  // Check for Giardini position (e.g., "Giardini 20")
  const giardiniMatch = gridRef.match(/Giardini (\d+)/i);
  if (giardiniMatch) {
    const position = parseInt(giardiniMatch[1]);
    return GIARDINI_POSITIONS[position] || null;
  }
  
  // Check for Arsenale zone (e.g., "Arsenale 3" or "Arsenale, Sale d'Armi")
  const arsenaleMatch = gridRef.match(/Arsenale\s*(\d)/i);
  if (arsenaleMatch) {
    const zone = parseInt(arsenaleMatch[1]);
    return ARSENALE_ZONES[zone] || null;
  }
  
  // Check for Arsenale Militare (special case for Armenia)
  if (gridRef.toLowerCase().includes("arsenale militare")) {
    // Position near Arsenale area on the main map (G3 area)
    return gridToMapCoords("G", 3);
  }
  
  // Off the map (San Servolo island, etc.) - position bottom left
  if (gridRef.toLowerCase().includes("off the map") || gridRef.toLowerCase().includes("san servolo")) {
    return { x: 150, y: MAP_HEIGHT - 100 };
  }
  
  // Check for grid reference (e.g., "4 C4", "42 E2", "20 H4")
  // Format is: NUMBER LETTER+NUMBER where LETTER is column (A-H), second NUMBER is row (1-6)
  const gridMatch = gridRef.match(/(\d+)\s+([A-H])(\d)/i);
  if (gridMatch) {
    const [, , col, row] = gridMatch;
    return gridToMapCoords(col, parseInt(row));
  }
  
  // If nothing matched, try to extract just a grid code without the entry number
  const simpleGridMatch = gridRef.match(/([A-H])(\d)/i);
  if (simpleGridMatch) {
    const [, col, row] = simpleGridMatch;
    return gridToMapCoords(col, parseInt(row));
  }
  
  return null;
}

// Get venue type from grid reference
export function getVenueType(gridRef: string): "giardini" | "arsenale" | "offsite" {
  if (!gridRef) return "offsite";
  if (gridRef.toLowerCase().includes("giardini")) return "giardini";
  if (gridRef.toLowerCase().includes("arsenale")) return "arsenale";
  return "offsite";
}
