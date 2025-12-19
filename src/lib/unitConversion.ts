import { DistanceUnit } from '@/types';

// Conversion constants
const KM_TO_MILES = 0.621371;
const MILES_TO_KM = 1.60934;

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * KM_TO_MILES;
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return miles * MILES_TO_KM;
}

/**
 * Format distance for display based on unit preference
 * Always stores in km internally, converts for display
 */
export function formatDistance(km: number, unit: DistanceUnit, decimals: number = 1): string {
  if (unit === 'miles') {
    const miles = kmToMiles(km);
    return `${miles.toFixed(decimals)} mi`;
  }
  return `${km.toFixed(decimals)} km`;
}

/**
 * Format distance value only (no unit suffix)
 */
export function formatDistanceValue(km: number, unit: DistanceUnit, decimals: number = 1): number {
  if (unit === 'miles') {
    return Number(kmToMiles(km).toFixed(decimals));
  }
  return Number(km.toFixed(decimals));
}

/**
 * Convert display value back to km for storage
 */
export function displayValueToKm(value: number, unit: DistanceUnit): number {
  if (unit === 'miles') {
    return milesToKm(value);
  }
  return value;
}

/**
 * Get the unit suffix
 */
export function getUnitSuffix(unit: DistanceUnit): string {
  return unit === 'miles' ? 'mi' : 'km';
}

/**
 * Get the step increment for distance input based on unit
 */
export function getDistanceStep(unit: DistanceUnit): number {
  return unit === 'miles' ? 0.1 : 0.1;
}

/**
 * Format a target distance message
 */
export function formatTargetDistance(targetKm: number, unit: DistanceUnit): string {
  if (unit === 'miles') {
    const miles = kmToMiles(targetKm);
    return `${miles.toFixed(1)} miles`;
  }
  return `${targetKm.toFixed(1)} km`;
}
