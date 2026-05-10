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
export const GIARDINI_POSITIONS: Record<number, { x: number; y: number; label: string }> = {
  1: { x: 920, y: 520, label: "Spain" },
  2: { x: 950, y: 480, label: "Belgium" },
  3: { x: 980, y: 440, label: "Netherlands" },
  4: { x: 1020, y: 400, label: "Central Pavilion" },
  5: { x: 1060, y: 380, label: "Finland" },
  6: { x: 1100, y: 360, label: "Hungary" },
  7: { x: 1080, y: 480, label: "United States" },
  8: { x: 1100, y: 520, label: "Nordic Countries" },
  9: { x: 1060, y: 540, label: "Denmark" },
  10: { x: 1040, y: 500, label: "Qatar" },
  11: { x: 1000, y: 560, label: "Switzerland" },
  12: { x: 1020, y: 580, label: "Russia" },
  13: { x: 1060, y: 600, label: "Japan" },
  14: { x: 1100, y: 620, label: "Korea" },
  15: { x: 1140, y: 600, label: "Germany" },
  16: { x: 1180, y: 620, label: "Canada" },
  17: { x: 1220, y: 580, label: "Great Britain" },
  18: { x: 1200, y: 520, label: "France" },
  19: { x: 1180, y: 500, label: "Czech & Slovak Rep." },
  20: { x: 1220, y: 480, label: "Australia" },
  21: { x: 1200, y: 440, label: "Uruguay" },
  22: { x: 1180, y: 420, label: "Brazil" },
  23: { x: 1140, y: 380, label: "Austria" },
  24: { x: 1160, y: 340, label: "Serbia" },
  25: { x: 1200, y: 360, label: "Egypt" },
  26: { x: 1240, y: 380, label: "Venice Pavilion" },
  27: { x: 1240, y: 420, label: "Poland" },
  28: { x: 1280, y: 400, label: "Romania" },
  29: { x: 1280, y: 360, label: "Greece" },
};

// Arsenale building zones (numbered 1-6 from the official map)
export const ARSENALE_ZONES: Record<number, { x: number; y: number; label: string; countries: string[] }> = {
  1: { 
    x: 780, y: 620, 
    label: "Corderie", 
    countries: ["In Minor Keys (Central Exhibition)"] 
  },
  2: { 
    x: 820, y: 580, 
    label: "Artiglierie",
    countries: [
      "Chile", "India", "Ireland", "Latvia", "Lebanon", "Malta", 
      "Philippines", "Morocco", "Oman", "Slovenia", "Timor Leste",
      "Armenia", "Bahamas", "Kyrgyz Republic", "Lithuania", "Montenegro",
      "North Macedonia", "Pakistan", "Saudi Arabia", "Turkey", "Ukraine"
    ]
  },
  3: { 
    x: 860, y: 540, 
    label: "Sale d'Armi",
    countries: [
      "Albania", "Argentina", "Luxembourg", "Israel", "Mexico", 
      "Peru", "Saudi Arabia", "Singapore", "Turkey", "Ukraine", 
      "UAE", "Syria", "Kosovo"
    ]
  },
  4: { 
    x: 900, y: 500, 
    label: "Tese del Cinquecento",
    countries: ["Uzbekistan"] 
  },
  5: { 
    x: 940, y: 460, 
    label: "Padiglione Italia",
    countries: ["Italy"] 
  },
  6: { 
    x: 980, y: 420, 
    label: "Magazzino delle cisterne",
    countries: ["China"] 
  },
};

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

// Parse grid reference to get coordinates
export function parseGridRef(gridRef: string): { x: number; y: number } | null {
  if (!gridRef) return null;
  
  // Check for Giardini position
  const giardiniMatch = gridRef.match(/Giardini (\d+)/);
  if (giardiniMatch) {
    const position = parseInt(giardiniMatch[1]);
    return GIARDINI_POSITIONS[position] || null;
  }
  
  // Check for Arsenale zone
  const arsenaleMatch = gridRef.match(/Arsenale (\d)/);
  if (arsenaleMatch) {
    const zone = parseInt(arsenaleMatch[1]);
    return ARSENALE_ZONES[zone] || null;
  }
  
  // Check for grid reference
  const gridMatch = gridRef.match(/(\d+)\s*([A-H])(\d)/);
  if (gridMatch) {
    const [, num, row, col] = gridMatch;
    // Convert grid to approximate coordinates
    const colNum = parseInt(col);
    const rowNum = row.charCodeAt(0) - 'A'.charCodeAt(0);
    return {
      x: 200 + colNum * 180,
      y: 200 + rowNum * 80,
    };
  }
  
  // Off the map
  if (gridRef.toLowerCase().includes("off the map") || gridRef.toLowerCase().includes("san servolo")) {
    return { x: 200, y: 700 };
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
