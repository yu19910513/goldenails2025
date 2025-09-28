import { DateTime } from "luxon";
import {
    formatPrice,
    calculateTotalTime,
    calculateTotalAmount,
    calculateAvailableSlots,
    waTimeString,
    now,
    groupServicesByCategory,
    formatTime,
    replaceEmptyStringsWithNull,
    areCommonValuesEqual,
    getBusinessHours,
    sanitizeObjectInput,
    isTokenValid,
    distributeItems,
    assignTechnicians
} from "../utils/helper";

describe("Helper Functions", () => {

    // Testing formatPrice function
    describe('formatPrice', () => {
        // Test for valid inputs
        it('should format prices ending in 1, 6, or 9 as "$price-1+"', () => {
            expect(formatPrice(156)).toBe('$155+');
            expect(formatPrice(161)).toBe('$160+');
            expect(formatPrice(169)).toBe('$168+');
        });

        it('should format prices over 1000 as "$low - high"', () => {
            expect(formatPrice(1020)).toBe('$10 - 20');
            expect(formatPrice(1999)).toBe('$19 - 99');
        });

        it('should return the price as "$price" when no special condition applies', () => {
            expect(formatPrice(50)).toBe('$50');
            expect(formatPrice(100)).toBe('$100');
            expect(formatPrice(0)).toBe('$0');
        });

        // Test for invalid input
        it('should throw an error if the price is not a number', () => {
            expect(() => formatPrice('string')).toThrow('Invalid price value. It must be a number.');
            expect(() => formatPrice(NaN)).toThrow('Invalid price value. It must be a number.');
            expect(() => formatPrice(undefined)).toThrow('Invalid price value. It must be a number.');
        });
    });

    // Testing calculateTotalTime function
    describe("calculateTotalTime", () => {
        test("should calculate total time correctly", () => {
            const selectedServices = {
                1: [{ id: 1, name: "Service 1", time: 30 }, { id: 2, name: "Service 2", time: 45 }],
                2: [{ id: 3, name: "Service 3", time: 60 }]
            };
            expect(calculateTotalTime(selectedServices)).toBe(135);
        });

        test("should throw error for invalid input (non-object)", () => {
            expect(() => calculateTotalTime(null)).toThrow("Invalid input. `selectedServices` must be an object.");
        });

        test("should throw error for invalid services (non-array)", () => {
            const selectedServices = { 1: "not-an-array" };
            expect(() => calculateTotalTime(selectedServices)).toThrow("Invalid services list for category 1. Expected an array.");
        });
    });

    // Testing calculateTotalAmount function
    describe("calculateTotalAmount", () => {
        test("should calculate total amount correctly", () => {
            const selectedServices = {
                1: [{ id: 1, name: "Service 1", price: 20 }, { id: 2, name: "Service 2", price: 30 }],
                2: [{ id: 3, name: "Service 3", price: 50 }]
            };
            expect(calculateTotalAmount(selectedServices)).toBe(100);
        });

        test("should throw error for invalid input (non-object)", () => {
            expect(() => calculateTotalAmount(null)).toThrow("Invalid input. `selectedServices` must be an object.");
        });

        // test("should throw error for missing price in service", () => {
        //     const selectedServices = { 1: [{ id: 1, name: "Service 1"}] };
        //     expect(() => calculateTotalAmount(selectedServices)).toThrow("Invalid price value.");
        // });
    });

    // Testing calculateAvailableSlots function
    describe("calculateAvailableSlots", () => {
        const businessHours = { start: 9, end: 17 };
        const futureDayOnly = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        test("returns available slots when no appointments exist", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };
            const selectedDate = futureDayOnly;
            const technician = { name: "No Preference", unavailability: "" };
            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots.length).toBeGreaterThan(0);
        });

        test("returns empty array if technician is unavailable on selected date", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };
            const selectedDate = "2025-03-01"; //need to revisit this test
            const technician = { name: "No Preference", unavailability: "" };
            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots).toEqual([]);
        });

        test("returns available slots avoiding occupied appointments", () => {
            const appointments = [
                { date: futureDayOnly, start_service_time: "10:00", Services: [{ time: 60 }] },
                { date: futureDayOnly, start_service_time: "11:30", Services: [{ time: 60 }] }
            ];
            const selectedServices = { "1": [{ time: 30 }] };;
            const selectedDate = futureDayOnly;
            const technician = { name: "No Preference", unavailability: "" };
            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots.some(slot => slot.getHours() === 10)).toBe(false); // 10 AM is occupied
            expect(slots.some(slot => slot.getHours() === 11 && slot.getMinutes() === 30)).toBe(false); // 11:30 AM is occupied
            expect(slots.some(slot => slot.getHours() === 12 && slot.getMinutes() === 0)).toBe(false); // 11:30 AM is occupied
        });

        test("returns empty array when technician is unavailable on a specific weekday", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };

            // Get next Monday (weekday = 1 in Luxon; Sunday = 7)
            const today = DateTime.local();
            const daysUntilMonday = (8 - today.weekday) % 7 || 7;
            const selectedDate = today.plus({ days: daysUntilMonday }).toISODate(); // "YYYY-MM-DD"
            const technician = { name: "No Preference", unavailability: "1" }; // Monday
            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots).toEqual([]);
        });

        test("returns slots adjusted for business hours", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };
            const selectedDate = futureDayOnly;
            const technician = { name: "No Preference", unavailability: "" };
            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots[0].getHours()).toBeGreaterThanOrEqual(9); // Earliest slot should not be before business hours
            expect(slots[slots.length - 1].getHours()).toBeLessThanOrEqual(17); // Latest slot should not exceed business hours
        });

        test("excludes slots within bufferTime from current time when selectedDate is today", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };

            const now = new Date();
            const selectedDate = now.toISOString().split("T")[0]; // Today
            const businessHours = { start: now.getHours() - 1, end: now.getHours() + 3 }; // Surround current time for valid range
            const technician = { name: "No Preference", unavailability: "" };
            const bufferTime = 2; // 2 hours buffer
            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician, bufferTime);
            const blockedUntil = new Date(now.getTime() + bufferTime * 60 * 60 * 1000);

            // All returned slots must be after the buffer window
            for (const slot of slots) {
                expect(slot.getTime()).toBeGreaterThanOrEqual(blockedUntil.getTime());
            }
        });

    });

    // Testing waTimeString function
    describe("waTimeString", () => {
        test("should return formatted time string in Pacific Time", () => {
            const mockDate = new Date("2025-01-30T12:34:56Z");
            const formattedTime = waTimeString(mockDate);
            expect(formattedTime).toBe("04:34:56"); // Adjust according to Pacific Time zone
        });
    });

    describe("now function", () => {
        test("should return the current date and time in Pacific Time", () => {
            const pacificNow = DateTime.fromJSDate(now(), { zone: "America/Los_Angeles" });
            const expectedNow = DateTime.now().setZone("America/Los_Angeles");

            // Allow for small delays in execution (e.g., within 1 second)
            const diffInSeconds = Math.abs(pacificNow.diff(expectedNow, "seconds").seconds);

            expect(diffInSeconds).toBeLessThanOrEqual(1);
        });
    });

    describe('groupServicesByCategory', () => {
        it('should group services by category_id', () => {
            const input = [
                { id: 1, name: 'Mini Facial', price: 45, time: 34, category_id: 4 },
                { id: 2, name: 'Deep Cleanse', price: 60, time: 50, category_id: 4 },
                { id: 3, name: 'Basic Pedicure', price: 30, time: 40, category_id: 2 },
            ];

            const expected = {
                4: [
                    { id: 1, name: 'Mini Facial', price: 45, time: 34, category_id: 4 },
                    { id: 2, name: 'Deep Cleanse', price: 60, time: 50, category_id: 4 },
                ],
                2: [
                    { id: 3, name: 'Basic Pedicure', price: 30, time: 40, category_id: 2 },
                ],
            };

            expect(groupServicesByCategory(input)).toEqual(expected);
        });

        it('should return an empty object for an empty array', () => {
            expect(groupServicesByCategory([])).toEqual({});
        });

        it('should throw an error if input is not an array', () => {
            expect(() => groupServicesByCategory(null)).toThrow(
                'Input must be an array of service objects.'
            );
            expect(() => groupServicesByCategory({})).toThrow(
                'Input must be an array of service objects.'
            );
            expect(() => groupServicesByCategory('not an array')).toThrow(
                'Input must be an array of service objects.'
            );
        });
    });

    describe('formatTime', () => {
        it('formats single-digit hours and minutes with leading zeros', () => {
            const date = new Date('2025-01-25T09:05:00');
            expect(formatTime(date)).toBe('09:05');
        });

        it('formats double-digit hours and minutes correctly', () => {
            const date = new Date('2025-01-25T13:45:00');
            expect(formatTime(date)).toBe('13:45');
        });

        it('returns "00:00" for midnight', () => {
            const date = new Date('2025-01-25T00:00:00');
            expect(formatTime(date)).toBe('00:00');
        });

        it('returns "23:59" for end of day', () => {
            const date = new Date('2025-01-25T23:59:00');
            expect(formatTime(date)).toBe('23:59');
        });
    });

    describe('replaceEmptyStringsWithNull', () => {
        it('replaces all empty strings with null', () => {
            const input = {
                phone: "",
                name: "Alice",
                email: "",
                age: 30,
                active: false
            };

            const expected = {
                phone: null,
                name: "Alice",
                email: null,
                age: 30,
                active: false
            };

            expect(replaceEmptyStringsWithNull(input)).toEqual(expected);
        });

        it('returns an empty object when input is empty', () => {
            expect(replaceEmptyStringsWithNull({})).toEqual({});
        });

        it('does not modify non-empty values', () => {
            const input = {
                key1: "value",
                key2: 123,
                key3: true
            };

            expect(replaceEmptyStringsWithNull(input)).toEqual(input);
        });

        it('does not modify the original object', () => {
            const input = { a: "" };
            const result = replaceEmptyStringsWithNull(input);
            expect(result).not.toBe(input); // should be a new object
            expect(input.a).toBe("");
        });
    });

    describe('areCommonValuesEqual', () => {
        it('returns true when all common keys have equal trimmed values', () => {
            const control = { name: ' Alice ', phone: '123', email: 'a@test.com' };
            const test = { name: 'Alice', phone: '123', email: 'a@test.com', extra: 'ignore' };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });

        it('returns false when any common key has a different value', () => {
            const control = { name: 'Alice', phone: '123' };
            const test = { name: 'Bob', phone: '123' };
            expect(areCommonValuesEqual(control, test)).toBe(false);
        });

        it('returns false when either object is null', () => {
            expect(areCommonValuesEqual(null, { name: 'Alice' })).toBe(false);
            expect(areCommonValuesEqual({ name: 'Alice' }, null)).toBe(false);
        });

        it('returns false when either object is empty', () => {
            expect(areCommonValuesEqual({}, { name: 'Alice' })).toBe(false);
            expect(areCommonValuesEqual({ name: 'Alice' }, {})).toBe(false);
        });

        it('ignores non-common keys', () => {
            const control = { name: 'Alice' };
            const test = { name: 'Alice', age: 30 };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });

        it('handles non-string values correctly', () => {
            const control = { active: true, count: 5 };
            const test = { active: true, count: 5 };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });

        it('trims string values before comparing', () => {
            const control = { email: ' user@example.com ' };
            const test = { email: 'user@example.com' };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });
    });

    describe('getBusinessHours', () => {
        test('returns Sunday hours for a Sunday date', () => {
            const result = getBusinessHours('2025-05-04'); // This is a Sunday
            expect(result).toEqual({ start: 11, end: 17 });
        });

        test('returns regular hours for a Monday date', () => {
            const result = getBusinessHours('2025-05-05'); // This is a Monday
            expect(result).toEqual({ start: 9, end: 19 });
        });

        test('returns regular hours for a Saturday date', () => {
            const result = getBusinessHours('2025-05-03'); // This is a Saturday
            expect(result).toEqual({ start: 9, end: 19 });
        });

        test('still works if time is included in the ISO string', () => {
            const result = getBusinessHours('2025-05-04T15:00:00'); // Sunday with time
            expect(result).toEqual({ start: 11, end: 17 });
        });
    });

    describe('sanitizeObjectInput', () => {

        it('should trim and convert name to uppercase', () => {
            const input = { name: '  John Doe  ' };
            const result = sanitizeObjectInput(input);
            expect(result.name).toBe('JOHN DOE');
        });

        it('should trim and convert email to lowercase', () => {
            const input = { email: '  ExAMPLE@EMAIL.COM  ' };
            const result = sanitizeObjectInput(input);
            expect(result.email).toBe('example@email.com');
        });

        it('should trim other string fields', () => {
            const input = { phone: '  123-456-7890  ' };
            const result = sanitizeObjectInput(input);
            expect(result.phone).toBe('123-456-7890');
        });

        it('should leave non-string fields unchanged', () => {
            const input = { age: 30, isActive: true };
            const result = sanitizeObjectInput(input);
            expect(result.age).toBe(30);
            expect(result.isActive).toBe(true);
        });

        it('should handle empty object', () => {
            const input = {};
            const result = sanitizeObjectInput(input);
            expect(result).toEqual({});
        });

        it('should handle mixed object with different types of values', () => {
            const input = {
                name: '  Alice  ',
                email: '  ALICE@EXAMPLE.COM  ',
                phone: '  987-654-3210  ',
                age: 25,
                isActive: false
            };
            const result = sanitizeObjectInput(input);
            expect(result).toEqual({
                name: 'ALICE',
                email: 'alice@example.com',
                phone: '987-654-3210',
                age: 25,
                isActive: false
            });
        });

        it('should handle null or undefined values in object fields', () => {
            const input = { name: null, email: undefined, phone: '  555-1234  ' };
            const result = sanitizeObjectInput(input);
            expect(result).toEqual({
                name: null,
                email: undefined,
                phone: '555-1234'
            });
        });
    });


    function createTokenWithExp(exp) {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({ exp }));
        const signature = "signature"; // dummy
        return `${header}.${payload}.${signature}`;
    }

    describe('isTokenValid', () => {
        it('returns false if token is null or undefined', () => {
            expect(isTokenValid(null)).toBe(false);
            expect(isTokenValid(undefined)).toBe(false);
        });

        it('returns false if token is not a string', () => {
            expect(isTokenValid(123)).toBe(false);
            expect(isTokenValid({})).toBe(false);
        });

        it('returns false if token does not have 3 parts separated by dots', () => {
            expect(isTokenValid('abc.def')).toBe(false);
            expect(isTokenValid('abc.def.ghi.jkl')).toBe(false);
        });

        it('returns false if payload is not valid base64 or JSON', () => {
            const invalidPayloadToken = 'aaa.invalid-base64.signature';
            expect(isTokenValid(invalidPayloadToken)).toBe(false);
        });

        it('returns false if payload does not contain exp or exp is not a number', () => {
            const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
            const noExpPayload = btoa(JSON.stringify({ foo: "bar" }));
            const invalidExpPayload = btoa(JSON.stringify({ exp: "not-a-number" }));

            expect(isTokenValid(`${header}.${noExpPayload}.sig`)).toBe(false);
            expect(isTokenValid(`${header}.${invalidExpPayload}.sig`)).toBe(false);
        });

        it('returns false if token is expired', () => {
            const expiredTimestamp = Math.floor(Date.now() / 1000) - 1000;
            const token = createTokenWithExp(expiredTimestamp);
            expect(isTokenValid(token)).toBe(false);
        });

        it('returns true if token is valid and not expired', () => {
            const futureTimestamp = Math.floor(Date.now() / 1000) + 1000;
            const token = createTokenWithExp(futureTimestamp);
            expect(isTokenValid(token)).toBe(true);
        });
    });


    describe("distributeItems", () => {
        it("should distribute items into given number of groups", () => {
            const items = [
                { id: "A", time: 40 },
                { id: "A", time: 40 },
                { id: "B", time: 20 },
                { id: "C", time: 10 },
                { id: "E", time: 5 },
                { id: "F", time: 1 },
                { id: "F", time: 1 },
            ];

            const groups = distributeItems(items, 3);

            expect(groups).toHaveLength(3);
            expect(groups.flat()).toHaveLength(items.length);
        });

        it("should not put duplicate IDs in the same group", () => {
            const items = [
                { id: "A", time: 30 },
                { id: "A", time: 30 },
                { id: "B", time: 15 },
                { id: "C", time: 10 },
            ];

            const groups = distributeItems(items, 2);

            for (const group of groups) {
                const ids = group.map(i => i.id);
                const uniqueIds = new Set(ids);
                expect(ids.length).toBe(uniqueIds.size);
            }
        });

        it("should balance total times across groups", () => {
            const items = [
                { id: "X", time: 50 },
                { id: "Y", time: 30 },
                { id: "Z", time: 20 },
                { id: "W", time: 10 },
            ];

            const groups = distributeItems(items, 2);

            const totals = groups.map(g => g.reduce((sum, i) => sum + i.time, 0));
            const spread = Math.max(...totals) - Math.min(...totals);

            expect(spread).toBeLessThanOrEqual(30); // should be reasonably balanced
        });

        it("should handle case with group size = items.length (each item in its own group)", () => {
            const items = [
                { id: "A", time: 5 },
                { id: "B", time: 10 },
                { id: "C", time: 15 },
            ];

            const groups = distributeItems(items, 3);

            expect(groups).toHaveLength(3);
            groups.forEach(g => expect(g).toHaveLength(1));
        });

        it("should handle case with only one group", () => {
            const items = [
                { id: "A", time: 5 },
                { id: "B", time: 10 },
            ];

            const groups = distributeItems(items, 1);

            expect(groups).toHaveLength(1);

            const receivedIds = groups[0].map(i => i.id).sort();
            const expectedIds = items.map(i => i.id).sort();

            expect(receivedIds).toEqual(expectedIds);
        });

        it("should auto-increase group size if duplicate count exceeds requested size", () => {
            const items = [
                { id: "A", time: 5 },
                { id: "A", time: 5 },
                { id: "A", time: 5 },
            ];
            const requestedSize = 2; // requested smaller than max duplicates
            const groups = distributeItems(items, requestedSize);

            // The function should auto-increase size to 3
            expect(groups).toHaveLength(3);

            // Each group should contain exactly one 'A'
            groups.forEach(group => {
                const aCount = group.filter(item => item.id === "A").length;
                expect(aCount).toBeLessThanOrEqual(1);
            });

            // All items must be included
            const flatItems = groups.flat();
            expect(flatItems).toHaveLength(items.length);
            expect(flatItems.filter(i => i.id === "A")).toHaveLength(3);
        });

        it("should handle empty input", () => {
            const groups = distributeItems([], 3);
            expect(groups).toEqual([[], [], []]);
        });
    });

    describe("assignTechnicians", () => {
        it("should assign available techs without conflicts", () => {
            const appointmentTechMap = [
                [{ id: 1, name: "Tech A" }, { id: 2, name: "No Preference" }],
                [{ id: 3, name: "Tech B" }, { id: 4, name: "No Preference" }]
            ];

            const assigned = assignTechnicians(appointmentTechMap);

            expect(assigned).toEqual([
                { id: 1, name: "Tech A" },
                { id: 3, name: "Tech B" }
            ]);
        });

        it("should fallback to 'No Preference' if all other techs used", () => {
            const appointmentTechMap = [
                [{ id: 1, name: "Tech A" }, { id: 2, name: "No Preference" }],
                [{ id: 1, name: "Tech A" }, { id: 2, name: "No Preference" }]
            ];

            const assigned = assignTechnicians(appointmentTechMap);

            expect(assigned).toEqual([
                { id: 1, name: "Tech A" },     // first assignment takes Tech A
                { id: 2, name: "No Preference" } // second assignment falls back
            ]);
        });

        it("should assign null if no techs available", () => {
            const appointmentTechMap = [
                [],
                [{ id: 2, name: "No Preference" }]
            ];

            const assigned = assignTechnicians(appointmentTechMap);

            expect(assigned).toEqual([
                null,
                { id: 2, name: "No Preference" }
            ]);
        });

        it("should not assign the same non-'No Preference' tech twice", () => {
            const appointmentTechMap = [
                [{ id: 1, name: "Tech A" }, { id: 2, name: "No Preference" }],
                [{ id: 1, name: "Tech A" }, { id: 3, name: "Tech B" }]
            ];

            const assigned = assignTechnicians(appointmentTechMap);

            expect(assigned).toEqual([
                { id: 1, name: "Tech A" },
                { id: 3, name: "Tech B" } // avoids assigning Tech A again
            ]);
        });
    });


});

