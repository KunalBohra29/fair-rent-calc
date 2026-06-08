export const TIER_COEFFICIENTS: Record<string, number> = {
  prime: 3.50,
  mid: 2.50,
  budget: 1.50,
};

export interface AffordabilityResult {
  safeRent: number;
  stretchedRent: number;
  riskRent: number;
  essentials: number;
  wants: number;
  savings: number;
}

export function calculateAffordability(income: number): AffordabilityResult {
  return {
    safeRent: income * 0.30,
    stretchedRent: income * 0.40,
    riskRent: income * 0.50,
    essentials: income * 0.50,
    wants: income * 0.30,
    savings: income * 0.20,
  };
}

export interface ListingParams {
  listingPrice: number;
  listingSize: number;
  tier: string;
  parking: boolean;
  laundry: boolean;
  gym: boolean;
  utilities: boolean;
}

export interface ValuationResult {
  fairRent: number;
  fairRentBase: number;
  amenitySurcharge: number;
  listedSqft: number;
  fairSqft: number;
  variancePercent: number;
  valuationLabel: string;
  valuationClass: 'link' | 'error' | 'warning';
  varianceLabel: string;
  varianceClass: 'link' | 'error' | 'body';
  affordabilityStatus: 'affordable' | 'stretched' | 'high-burden';
}

export function evaluateListing(
  params: ListingParams,
  affordability: AffordabilityResult
): ValuationResult {
  const { listingPrice, listingSize, tier, parking, laundry, gym, utilities } = params;

  let amenitySurcharge = 0;
  if (parking) amenitySurcharge += 150;
  if (laundry) amenitySurcharge += 100;
  if (gym) amenitySurcharge += 75;
  if (utilities) amenitySurcharge += 150;

  const coef = TIER_COEFFICIENTS[tier] || 2.50;
  const fairRentBase = listingSize * coef;
  const fairRent = fairRentBase + amenitySurcharge;

  const listedSqft = listingSize > 0 ? listingPrice / listingSize : 0;
  const fairSqft = listingSize > 0 ? fairRent / listingSize : 0;

  const variancePercent = fairRent > 0
    ? ((listingPrice - fairRent) / fairRent) * 100
    : 0;

  let valuationLabel: string;
  let valuationClass: 'link' | 'error' | 'warning';
  if (variancePercent < -10) {
    valuationLabel = 'Underpriced (Great Deal)';
    valuationClass = 'link';
  } else if (variancePercent > 10) {
    valuationLabel = 'Overpriced (High Premium)';
    valuationClass = 'error';
  } else {
    valuationLabel = 'Fair Market Value';
    valuationClass = 'warning';
  }

  let varianceLabel: string;
  let varianceClass: 'link' | 'error' | 'body';
  if (variancePercent < 0) {
    varianceLabel = `${Math.abs(variancePercent).toFixed(1)}% Under Market`;
    varianceClass = 'link';
  } else if (variancePercent > 0) {
    varianceLabel = `${variancePercent.toFixed(1)}% Over Market`;
    varianceClass = 'error';
  } else {
    varianceLabel = '0% (Exact Match)';
    varianceClass = 'body';
  }

  let affordabilityStatus: 'affordable' | 'stretched' | 'high-burden';
  if (listingPrice <= affordability.safeRent) {
    affordabilityStatus = 'affordable';
  } else if (listingPrice <= affordability.stretchedRent) {
    affordabilityStatus = 'stretched';
  } else {
    affordabilityStatus = 'high-burden';
  }

  return {
    fairRent,
    fairRentBase,
    amenitySurcharge,
    listedSqft,
    fairSqft,
    variancePercent,
    valuationLabel,
    valuationClass,
    varianceLabel,
    varianceClass,
    affordabilityStatus,
  };
}
