export interface Room {
  id: string;
  name: string;
  size: number;
  hasBath: boolean;
  hasBalcony: boolean;
  hasCloset: boolean;
  hasWindow: boolean;
}

export interface RoomShare {
  id: string;
  name: string;
  size: number;
  sizePercent: number;
  baseShare: number;
  premiumShare: number;
  totalShare: number;
}

export interface SplitParams {
  totalRent: number;
  weightBathPct: number;
  weightBalconyPct: number;
  weightClosetPct: number;
  weightWindowPct: number;
  rooms: Room[];
}

export interface SplitResult {
  roomShares: RoomShare[];
  baseRentRemainder: number;
  totalPremiumsSum: number;
}

export function calculateSplits(params: SplitParams): SplitResult {
  const { totalRent, weightBathPct, weightBalconyPct, weightClosetPct, weightWindowPct, rooms } = params;

  const weightBath = (weightBathPct / 100) * totalRent;
  const weightBalcony = (weightBalconyPct / 100) * totalRent;
  const weightCloset = (weightClosetPct / 100) * totalRent;
  const weightWindow = (weightWindowPct / 100) * totalRent;

  let totalPremiumsSum = 0;
  const roomPremiums = rooms.map(room => {
    let premium = 0;
    if (room.hasBath) premium += weightBath;
    if (room.hasBalcony) premium += weightBalcony;
    if (room.hasCloset) premium += weightCloset;
    if (room.hasWindow) premium += weightWindow;
    totalPremiumsSum += premium;
    return premium;
  });

  const baseRentRemainder = Math.max(0, totalRent - totalPremiumsSum);
  const totalSize = rooms.reduce((sum, room) => sum + room.size, 0);

  let calculatedSplitsSum = 0;
  const roomShares: RoomShare[] = rooms.map((room, idx) => {
    const sizeRatio = totalSize > 0 ? room.size / totalSize : 0;
    const baseShare = baseRentRemainder * sizeRatio;
    const premiumShare = roomPremiums[idx];
    const totalShare = baseShare + premiumShare;
    calculatedSplitsSum += totalShare;

    return {
      id: room.id,
      name: room.name,
      size: room.size,
      sizePercent: sizeRatio * 100,
      baseShare,
      premiumShare,
      totalShare,
    };
  });

  const diff = totalRent - calculatedSplitsSum;
  if (Math.abs(diff) > 0.001 && roomShares.length > 0) {
    roomShares[0].totalShare += diff;
    roomShares[0].baseShare += diff;
  }

  return { roomShares, baseRentRemainder, totalPremiumsSum };
}
