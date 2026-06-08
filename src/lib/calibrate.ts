export const CARD_WIDTH_INCHES = 3.37;
export const CARD_HEIGHT_INCHES = 2.125;
export const CARD_ASPECT_RATIO = CARD_HEIGHT_INCHES / CARD_WIDTH_INCHES;

export function calculatePpi(cardWidthPx: number): number {
  return cardWidthPx / CARD_WIDTH_INCHES;
}

export function calculateCardHeight(cardWidthPx: number): number {
  return Math.round(cardWidthPx * CARD_ASPECT_RATIO);
}

export function calculateScreenDiagonal(screenWidthPx: number, screenHeightPx: number, ppi: number): number {
  const diagPx = Math.sqrt(screenWidthPx * screenWidthPx + screenHeightPx * screenHeightPx);
  return diagPx / ppi;
}

export function calculateDistance(
  firstPoint: { x: number; y: number },
  secondPoint: { x: number; y: number },
  ppi: number
): { inches: number } {
  const dx = secondPoint.x - firstPoint.x;
  const dy = secondPoint.y - firstPoint.y;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  const inches = pixelDistance / ppi;
  return { inches };
}

export function calculateScaledDistance(inches: number, scaleFeetPerInch: number): number {
  return inches * scaleFeetPerInch;
}

export function estimateDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android') && ua.includes('mobile')) return 'Android Mobile';
  if (ua.includes('android')) return 'Android Tablet';
  if (ua.includes('macintosh')) return 'macOS Desktop';
  if (ua.includes('windows')) return 'Windows Desktop';
  return 'Desktop';
}

export function estimatePpiFromDevice(deviceType: string): number {
  if (deviceType.includes('iPhone')) return 160;
  if (deviceType.includes('Android Mobile')) return 150;
  if (deviceType.includes('iPad')) return 132;
  return 96;
}
