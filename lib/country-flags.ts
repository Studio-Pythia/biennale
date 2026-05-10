// Convert ISO 3166-1 alpha-2 country code to flag emoji
// Works by converting each letter to its regional indicator symbol
export function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  
  const code = countryCode.toUpperCase();
  
  // Special cases that need mapping
  const specialCases: Record<string, string> = {
    // Holy See / Vatican
    "VA": "\u{1F1FB}\u{1F1E6}",
    // Kosovo (not officially in Unicode, use XK)
    "XK": "\u{1F1FD}\u{1F1F0}",
    // Taiwan
    "TW": "\u{1F1F9}\u{1F1FC}",
  };
  
  if (specialCases[code]) {
    return specialCases[code];
  }
  
  // Convert to regional indicator symbols
  // A = 0x1F1E6, B = 0x1F1E7, etc.
  const firstChar = code.charCodeAt(0) - 65 + 0x1F1E6;
  const secondChar = code.charCodeAt(1) - 65 + 0x1F1E6;
  
  return String.fromCodePoint(firstChar) + String.fromCodePoint(secondChar);
}

// Get flag emoji with fallback to country code
export function getFlagEmoji(countryCode: string): string {
  const flag = countryCodeToFlag(countryCode);
  // Some systems may not render all flags, but emoji flags are widely supported
  return flag || countryCode;
}

// Check if a country code has a valid flag emoji
// Note: Most modern systems support all ISO country flag emojis
export function hasValidFlag(countryCode: string): boolean {
  if (!countryCode || countryCode.length !== 2) return false;
  const code = countryCode.toUpperCase();
  // Check if it's a valid A-Z range
  return /^[A-Z]{2}$/.test(code);
}
