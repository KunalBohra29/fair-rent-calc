import { describe, it, expect } from 'vitest';
import { calculateSplits, type Room } from './split';

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: '1',
    name: 'Test Room',
    size: 100,
    hasBath: false,
    hasBalcony: false,
    hasCloset: false,
    hasWindow: false,
    ...overrides,
  };
}

describe('calculateSplits', () => {
  it('splits rent equally among same-size rooms with no amenities', () => {
    const rooms = [
      makeRoom({ id: '1', name: 'A', size: 100 }),
      makeRoom({ id: '2', name: 'B', size: 100 }),
    ];
    const result = calculateSplits({
      totalRent: 2000,
      weightBathPct: 15,
      weightBalconyPct: 5,
      weightClosetPct: 5,
      weightWindowPct: 3,
      rooms,
    });

    expect(result.roomShares).toHaveLength(2);
    expect(result.roomShares[0].totalShare).toBeCloseTo(1000, 0);
    expect(result.roomShares[1].totalShare).toBeCloseTo(1000, 0);
    expect(result.totalPremiumsSum).toBe(0);
  });

  it('allocates amenity premiums correctly', () => {
    const rooms = [
      makeRoom({ id: '1', name: 'Master', size: 150, hasBath: true, hasBalcony: true }),
      makeRoom({ id: '2', name: 'Second', size: 100 }),
    ];
    const result = calculateSplits({
      totalRent: 2000,
      weightBathPct: 10,
      weightBalconyPct: 5,
      weightClosetPct: 0,
      weightWindowPct: 0,
      rooms,
    });

    expect(result.totalPremiumsSum).toBeCloseTo(300, 0);
    expect(result.roomShares[0].premiumShare).toBeCloseTo(300, 0);
    expect(result.roomShares[1].premiumShare).toBe(0);
  });

  it('handles single room', () => {
    const rooms = [makeRoom({ id: '1', name: 'Solo', size: 200 })];
    const result = calculateSplits({
      totalRent: 1500,
      weightBathPct: 0,
      weightBalconyPct: 0,
      weightClosetPct: 0,
      weightWindowPct: 0,
      rooms,
    });

    expect(result.roomShares).toHaveLength(1);
    expect(result.roomShares[0].totalShare).toBeCloseTo(1500, 0);
  });

  it('handles empty rooms array', () => {
    const result = calculateSplits({
      totalRent: 3000,
      weightBathPct: 15,
      weightBalconyPct: 5,
      weightClosetPct: 5,
      weightWindowPct: 3,
      rooms: [],
    });

    expect(result.roomShares).toHaveLength(0);
    expect(result.baseRentRemainder).toBe(3000);
  });

  it('splits by room size proportionally', () => {
    const rooms = [
      makeRoom({ id: '1', name: 'Big', size: 300 }),
      makeRoom({ id: '2', name: 'Small', size: 100 }),
    ];
    const result = calculateSplits({
      totalRent: 2000,
      weightBathPct: 0,
      weightBalconyPct: 0,
      weightClosetPct: 0,
      weightWindowPct: 0,
      rooms,
    });

    expect(result.roomShares[0].totalShare).toBeCloseTo(1500, 0);
    expect(result.roomShares[1].totalShare).toBeCloseTo(500, 0);
  });

  it('ensures total split equals total rent', () => {
    const rooms = [
      makeRoom({ id: '1', name: 'A', size: 120, hasBath: true }),
      makeRoom({ id: '2', name: 'B', size: 100, hasBalcony: true }),
      makeRoom({ id: '3', name: 'C', size: 80, hasCloset: true, hasWindow: true }),
    ];
    const totalRent = 3000;
    const result = calculateSplits({
      totalRent,
      weightBathPct: 15,
      weightBalconyPct: 5,
      weightClosetPct: 5,
      weightWindowPct: 3,
      rooms,
    });

    const sum = result.roomShares.reduce((s, r) => s + r.totalShare, 0);
    expect(sum).toBeCloseTo(totalRent, 0);
  });

  it('handles zero rent', () => {
    const rooms = [
      makeRoom({ id: '1', name: 'A', size: 100 }),
      makeRoom({ id: '2', name: 'B', size: 100 }),
    ];
    const result = calculateSplits({
      totalRent: 0,
      weightBathPct: 15,
      weightBalconyPct: 5,
      weightClosetPct: 5,
      weightWindowPct: 3,
      rooms,
    });

    expect(result.roomShares[0].totalShare).toBe(0);
    expect(result.roomShares[1].totalShare).toBe(0);
  });
});
