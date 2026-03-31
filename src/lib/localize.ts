/**
 * Parses a potentially JSON-encoded multilingual string and returns the value for the given locale.
 * If the string is a valid JSON object with locale keys (e.g. {"tr": "...", "en": "..."}),
 * it returns the value for the requested locale, falling back to 'tr', then first available.
 * If not valid JSON, returns the original string as-is.
 */
export function getLocalizedText(text: string | undefined, locale: string): string {
  if (!text) return '';
  
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed[locale] || parsed['tr'] || parsed['en'] || Object.values(parsed)[0] as string || text;
    }
    return text;
  } catch {
    return text;
  }
}
