import type { GanttFeature, GanttStatus } from '@/components/ui/shadcn-io/gantt';
import type { Booking, Hotel } from '@/convex/types';

export const bookingStatuses: GanttStatus[] = [
  { id: 'confirmed', name: 'Confirmed', color: '#10B981' },
  { id: 'checked_in', name: 'Checked In', color: '#3B82F6' },
  { id: 'pending', name: 'Pending', color: '#F59E0B' },
  { id: 'other', name: 'Other', color: '#6B7280' },
];

export function getBookingStatus(status: string): GanttStatus {
  const found = bookingStatuses.find(s => s.id === status);
  return found ?? bookingStatuses[3];
}

/** Hotel feature for Gantt: one bar per hotel spanning min(checkIn) to max(checkOut) */
export interface HotelFeature extends GanttFeature {
  hotel: Hotel;
  bookings: Booking[];
}

export function buildHotelFeatures(
  hotels: Hotel[],
  bookings: Booking[]
): HotelFeature[] {
  if (hotels.length === 0 || bookings.length === 0) return [];

  const activeBookings = bookings.filter(b => !b.cancelledAt);

  const hotelIdsWithBookings = new Set(activeBookings.map(b => b.hotelId));
  const hotelMap = new Map(hotels.map(h => [h._id, h]));
  const bookingsByHotel = new Map<string, Booking[]>();

  for (const b of activeBookings) {
    const list = bookingsByHotel.get(b.hotelId) ?? [];
    list.push(b);
    bookingsByHotel.set(b.hotelId, list);
  }

  const result: HotelFeature[] = [];

  for (const hotelId of hotelIdsWithBookings) {
    const hotel = hotelMap.get(hotelId);
    const hotelBookings = bookingsByHotel.get(hotelId) ?? [];
    if (!hotel || hotelBookings.length === 0) continue;

    const minStart = Math.min(...hotelBookings.map(b => b.checkInDate));
    const maxEnd = Math.max(...hotelBookings.map(b => b.checkOutDate));
    const dominantStatus = hotelBookings[0]?.status ?? 'pending';

    result.push({
      id: hotel._id,
      name: hotel.name,
      startAt: new Date(minStart),
      endAt: new Date(maxEnd),
      status: getBookingStatus(dominantStatus),
      hotel,
      bookings: hotelBookings.sort((a, b) => a.checkInDate - b.checkInDate),
    });
  }

  return result.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
