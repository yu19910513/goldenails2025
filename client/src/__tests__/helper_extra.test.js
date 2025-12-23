import { DateTime } from 'luxon';
import {
  getCommonAvailableSlots,
  calculateAvailableSlots,
  getBusinessHours,
  isTokenValid,
  formatEndTime,
  groupServicesByCategory,
} from '../utils/helper';

describe('Additional Helper Tests', () => {
  describe('isTokenValid', () => {
    it('returns false for invalid structures', () => {
      expect(isTokenValid(null)).toBe(false);
      expect(isTokenValid('not.a.jwt')).toBe(false);
      expect(isTokenValid('a.b')).toBe(false);
    });

    it('returns false for bad base64 or missing exp', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payloadNoExp = Buffer.from(JSON.stringify({ sub: '123' })).toString('base64url');
      const jwtNoExp = `${header}.${payloadNoExp}.sig`;
      expect(isTokenValid(jwtNoExp)).toBe(false);
    });

    it('distinguishes expired vs future exp', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const past = Math.floor(Date.now() / 1000) - 60;
      const future = Math.floor(Date.now() / 1000) + 60;
      const payloadPast = Buffer.from(JSON.stringify({ exp: past })).toString('base64url');
      const payloadFuture = Buffer.from(JSON.stringify({ exp: future })).toString('base64url');
      expect(isTokenValid(`${header}.${payloadPast}.sig`)).toBe(false);
      expect(isTokenValid(`${header}.${payloadFuture}.sig`)).toBe(true);
    });
  });

  describe('formatEndTime', () => {
    it('formats end time correctly for valid inputs', () => {
      const start = new Date('2025-12-01T09:00:00Z');
      const result = formatEndTime(start, 90);
      expect(result).toMatch(/10:30|02:30/); // timezone-agnostic check
    });

    it('returns "N/A" for falsy slot', () => {
      expect(formatEndTime(null, 30)).toBe('N/A');
    });
  });

  describe('calculateAvailableSlots edge cases', () => {
    const technician = { name: 'Tech', unavailability: '' };
    const selectedDate = '2025-12-29';

    it('does not include slots whose service duration exceeds business end', () => {
      const businessHours = { start: 9, end: 17 };
      const appointments = [];
      const selectedServices = { '1': [{ time: 120 }] }; // 2 hours
      const slots = calculateAvailableSlots(
        appointments,
        selectedServices,
        selectedDate,
        businessHours,
        technician
      );
      const lateSlot = new Date(`${selectedDate}T16:00:00`);
      expect(slots.find(s => s.getTime() === lateSlot.getTime())).toBeUndefined();
    });

    it('handles unavailability with whitespace and invalid tokens', () => {
      const businessHours = { start: 9, end: 17 };
      const appointments = [];
      const messyTech = { ...technician, unavailability: ' 1,  x, 8,  3 ' };
      // Monday 2025-12-29
      const slots = calculateAvailableSlots(
        appointments,
        { '1': [{ time: 30 }] },
        selectedDate,
        businessHours,
        messyTech
      );
      expect(slots).toEqual([]);
    });

    it('returns no slots when buffer pushes past end of day', () => {
      jest.useFakeTimers('modern');
      try {
        // Freeze time to a morning on the same selectedDate
        jest.setSystemTime(new Date(`${selectedDate}T08:00:00`));
        const businessHours = { start: 9, end: 17 };
        const appointments = [];
        const selectedServices = { '1': [{ time: 30 }] };

        // Buffer of 10 hours from 08:00 -> 18:00, beyond end(17:00)
        const slots = calculateAvailableSlots(
          appointments,
          selectedServices,
          selectedDate,
          businessHours,
          technician,
          10
        );
        expect(slots).toEqual([]);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('getCommonAvailableSlots', () => {
    it('intersects slots across technicians and respects schedules', () => {
      const customerDate = '2025-12-29'; // Monday
      const assignedTechs = [{ id: 10, name: 'Alice', unavailability: '' }, { id: 20, name: 'Bob', unavailability: '' }];
      const apptAlice = [{ id: 1, category_id: 101, time: 30 }];
      const apptBob = [{ id: 2, category_id: 101, time: 30 }];
      const appointments = [apptAlice, apptBob];

      // Alice has an appt 10:00-10:30; Bob has 10:30-11:00; 10:00 and 10:30 should be removed from common
      const schedules = new Map();
      schedules.set(10, [{ date: customerDate, start_service_time: '10:00', Services: [{ time: 30 }] }]);
      schedules.set(20, [{ date: customerDate, start_service_time: '10:30', Services: [{ time: 30 }] }]);

      const slots = getCommonAvailableSlots(
        assignedTechs,
        appointments,
        customerDate,
        schedules,
        0
      );

      const first = new Date(`${customerDate}T10:00:00`);
      const half = new Date(`${customerDate}T10:30:00`);
      const times = new Set(slots.map(s => s.getTime()));
      expect(times.has(first.getTime())).toBe(false);
      expect(times.has(half.getTime())).toBe(false);
      expect(slots.length).toBeGreaterThan(0);
    });
  });
});
