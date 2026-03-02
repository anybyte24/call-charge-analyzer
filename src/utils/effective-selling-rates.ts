/**
 * Calcola le tariffe di vendita effettive.
 * Regola: se il costo ALFA > prezzo NYBYTE, il prezzo di vendita = ALFA * 1.5
 * Altrimenti resta il prezzo NYBYTE.
 */
import { ALFA_INTERNATIONAL_TARIFFS, ALFA_NATIONAL_TARIFFS } from '@/data/alfa-operator-tariffs';
import { NYBYTE_INTERNATIONAL_TARIFFS, NYBYTE_NATIONAL_TARIFFS } from '@/data/nybyte-tariffs';

export interface EffectiveRate {
  country: string;
  landline: number;
  mobile: number;
  alfaLandline: number;
  alfaMobile: number;
  nybyteLandline: number;
  nybyteMobile: number;
  landlineAdjusted: boolean;
  mobileAdjusted: boolean;
}

function computeEffective(alfaCost: number, nybytePrice: number): { rate: number; adjusted: boolean } {
  if (alfaCost > nybytePrice) {
    return { rate: parseFloat((alfaCost * 1.5).toFixed(4)), adjusted: true };
  }
  return { rate: nybytePrice, adjusted: false };
}

/** All international effective selling rates */
export const EFFECTIVE_INTERNATIONAL_RATES: EffectiveRate[] = ALFA_INTERNATIONAL_TARIFFS.map(alfa => {
  const nybyte = NYBYTE_INTERNATIONAL_TARIFFS.find(n => n.country === alfa.country);
  const nybLandline = nybyte?.landline ?? 0;
  const nybMobile = nybyte?.mobile ?? 0;

  const landlineEff = computeEffective(alfa.landline, nybLandline);
  const mobileEff = computeEffective(alfa.mobile, nybMobile);

  return {
    country: alfa.country,
    landline: landlineEff.rate,
    mobile: mobileEff.rate,
    alfaLandline: alfa.landline,
    alfaMobile: alfa.mobile,
    nybyteLandline: nybLandline,
    nybyteMobile: nybMobile,
    landlineAdjusted: landlineEff.adjusted,
    mobileAdjusted: mobileEff.adjusted,
  };
});

/** Effective national selling rates (NYBYTE is always higher than ALFA for national) */
export const EFFECTIVE_NATIONAL_RATES = {
  mobile: computeEffective(ALFA_NATIONAL_TARIFFS.mobile, NYBYTE_NATIONAL_TARIFFS.mobile).rate,
  landline: computeEffective(ALFA_NATIONAL_TARIFFS.landline, NYBYTE_NATIONAL_TARIFFS.landline).rate,
};

/**
 * Get effective selling rate for a country (by name match).
 * Returns { landline, mobile } or null if not found.
 */
export function getEffectiveRateForCountry(country: string): { landline: number; mobile: number } | null {
  const norm = country.toUpperCase().trim();
  const found = EFFECTIVE_INTERNATIONAL_RATES.find(r => r.country === norm);
  return found ? { landline: found.landline, mobile: found.mobile } : null;
}

/**
 * Convert effective rates to a flat map for use in international_costs JSONB or lookups.
 */
export function effectiveRatesToFlatMap(): Record<string, number> {
  const map: Record<string, number> = {};
  EFFECTIVE_INTERNATIONAL_RATES.forEach(r => {
    map[r.country] = r.landline;
    map[`${r.country} MOB`] = r.mobile;
  });
  return map;
}
