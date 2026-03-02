/**
 * Mapping from Italian country names (used in number-categorizer descriptions)
 * to English UPPERCASE names (used in ALFA/NYBYTE tariff tables).
 * 
 * This is the single source of truth for ITA↔ENG country name resolution.
 * Used by ClientPricingSummary to look up effective selling rates.
 */

const ITA_TO_ENG: Record<string, string> = {
  // European countries with Italian names
  'albania': 'ALBANIA',
  'algeria': 'ALGERIA',
  'andorra': 'ANDORRA',
  'angola': 'ANGOLA',
  'arabia saudita': 'SAUDI ARABIA',
  'argentina': 'ARGENTINA',
  'armenia': 'ARMENIA',
  'australia': 'AUSTRALIA',
  'austria': 'AUSTRIA',
  'azerbaijan': 'AZERBAIJAN',
  'bahrain': 'BAHRAIN',
  'bangladesh': 'BANGLADESH',
  'belarus': 'BELARUS',
  'belgio': 'BELGIUM',
  'bolivia': 'BOLIVIA',
  'bosnia': 'BOSNIA',
  'botswana': 'BOTSWANA',
  'brasile': 'BRAZIL',
  'brunei': 'BRUNEI',
  'bulgaria': 'BULGARIA',
  'canada/stati uniti': 'CANADA',
  'canada': 'CANADA',
  'cile': 'CHILE',
  'cina': 'CHINA',
  'colombia': 'COLOMBIA',
  'corea del sud': 'SOUTH KOREA',
  'costa rica': 'COSTA RICA',
  'croazia': 'CROATIA',
  'danimarca': 'DENMARK',
  'ecuador': 'ECUADOR',
  'egitto': 'EGYPT',
  'emirati arabi uniti': 'UAE',
  'emirati arabi': 'UAE',
  'estonia': 'ESTONIA',
  'filippine': 'PHILIPPINES',
  'finlandia': 'FINLAND',
  'francia': 'FRANCE',
  'georgia': 'GEORGIA',
  'germania': 'GERMANY',
  'giappone': 'JAPAN',
  'giordania': 'JORDAN',
  'grecia': 'GREECE',
  'hong kong': 'HONG KONG',
  'india': 'INDIA',
  'indonesia': 'INDONESIA',
  'iran': 'IRAN',
  'iraq': 'IRAQ',
  'irlanda': 'IRELAND',
  'islanda': 'ICELAND',
  'israele': 'ISRAEL',
  'kazakhstan': 'KAZAKHSTAN',
  'kazakhstan/russia': 'KAZAKHSTAN',
  'kenya': 'KENYA',
  'kuwait': 'KUWAIT',
  'lettonia': 'LATVIA',
  'libano': 'LEBANON',
  'lituania': 'LITHUANIA',
  'lussemburgo': 'LUXEMBOURG',
  'macedonia': 'MACEDONIA',
  'malesia': 'MALAYSIA',
  'malta': 'MALTA',
  'marocco': 'MOROCCO',
  'messico': 'MEXICO',
  'moldavia': 'MOLDOVA',
  'monaco': 'MONACO',
  'montenegro': 'MONTENEGRO',
  'nigeria': 'NIGERIA',
  'norvegia': 'NORWAY',
  'nuova zelanda': 'NEW ZEALAND',
  'paesi bassi': 'NETHERLANDS',
  'pakistan': 'PAKISTAN',
  'panama': 'PANAMA',
  'peru': 'PERU',
  'polonia': 'POLAND',
  'portogallo': 'PORTUGAL',
  'qatar': 'QATAR',
  'regno unito': 'UK',
  'repubblica ceca': 'CZECH REP',
  'romania': 'ROMANIA',
  'russia': 'RUSSIA',
  'serbia': 'SERBIA',
  'singapore': 'SINGAPORE',
  'slovacchia': 'SLOVAKIA',
  'slovenia': 'SLOVENIA',
  'spagna': 'SPAIN',
  'sri lanka': 'SRI LANKA',
  'sud africa': 'SOUTH AFRICA',
  'svezia': 'SWEDEN',
  'svizzera': 'SWITZERLAND',
  'taiwan': 'TAIWAN',
  'thailandia': 'THAILAND',
  'tunisia': 'TUNISIA',
  'turchia': 'TURKEY',
  'ucraina': 'UKRAINE',
  'ungheria': 'HUNGARY',
  'uruguay': 'URUGUAY',
  'venezuela': 'VENEZUELA',
  'vietnam': 'VIETNAM',
  // English names that match directly (for categories that already use English)
  'afghanistan': 'AFGHANISTAN',
  'brazil': 'BRAZIL',
  'china': 'CHINA',
  'france': 'FRANCE',
  'germany': 'GERMANY',
  'japan': 'JAPAN',
  'spain': 'SPAIN',
  'uk': 'UK',
  'united states': 'UNITED STATES',
};

/**
 * Resolve an Italian category description to the English ALFA/NYBYTE country name.
 * Strips suffixes like "Mobile", "Fisso", city names (e.g., "Fisso - Parigi").
 * Returns { countryEng, isMobile } or null if not international.
 */
export function resolveCountryFromCategory(categoryDescription: string): { countryEng: string; isMobile: boolean } | null {
  const lower = categoryDescription.toLowerCase().trim();
  
  // Determine if mobile
  const isMobile = lower.includes('mobile');
  
  // Strip suffixes: "Mobile", "Fisso", "Fisso - CityName", "Mobile Speciale"
  const countryIta = lower
    .replace(/\s*(mobile|fisso|mob)\s*(-\s*\w+(\s+\w+)*)?(\s*speciale)?$/i, '')
    .trim();
  
  if (!countryIta) return null;
  
  const countryEng = ITA_TO_ENG[countryIta];
  if (countryEng) {
    return { countryEng, isMobile };
  }
  
  // Try uppercase match (already English)
  const upper = countryIta.toUpperCase();
  // Check if it exists directly in ALFA tariffs by checking the map values
  const allEngNames = new Set(Object.values(ITA_TO_ENG));
  if (allEngNames.has(upper)) {
    return { countryEng: upper, isMobile };
  }
  
  return null;
}
