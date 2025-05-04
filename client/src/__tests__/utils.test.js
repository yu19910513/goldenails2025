import { formatPrice, calculateTotalTime, calculateTotalAmount, calculateAvailableSlots, waTimeString, now } from "../common/utils";

describe("Utility Functions", () => {

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
            const technician = { name: "Tracy", unavailability: "" };

            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots.length).toBeGreaterThan(0);
        });

        test("returns empty array if technician is unavailable on selected date", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };
            const selectedDate = "2025-03-01";
            const technician = { name: "Lisa", unavailability: "" };

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
            const technician = { name: "Tracy", unavailability: "" };

            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots.some(slot => slot.getHours() === 10)).toBe(false); // 10 AM is occupied
            expect(slots.some(slot => slot.getHours() === 11 && slot.getMinutes() === 30)).toBe(false); // 11:30 AM is occupied
            expect(slots.some(slot => slot.getHours() === 12 && slot.getMinutes() === 0)).toBe(false); // 11:30 AM is occupied
        });

        test("returns empty array when technician is unavailable on a specific weekday", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };
            const localDate = new Date();
            const localDateAdjusted = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000); // Adjust to local time
            const selectedDate = new Date(localDateAdjusted.setDate(localDateAdjusted.getDate() + ((1 - localDateAdjusted.getDay() + 7) % 7 || 7))).toISOString().split("T")[0]; // Next Monday in local time
            const technician = { name: "Lisa", unavailability: "1" }; // Monday is unavailable (1-based index)
            const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
            expect(slots).toEqual([]);
        });

        test("returns slots adjusted for business hours", () => {
            const appointments = [];
            const selectedServices = { "1": [{ time: 30 }] };
            const selectedDate = futureDayOnly;
            const technician = { name: "Tracy", unavailability: "" };

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
            const technician = { name: "Tracy", unavailability: "" };
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
            const pacificNow = now();
            const utcNow = new Date();

            const pstOffset = utcNow.getTimezoneOffset() / 60 + 8; // Adjust UTC to PST/PDT
            utcNow.setHours(utcNow.getHours() - pstOffset);

            expect(pacificNow.getFullYear()).toBe(utcNow.getFullYear());
            expect(pacificNow.getMonth()).toBe(utcNow.getMonth());
            expect(pacificNow.getDate()).toBe(utcNow.getDate());
            expect(pacificNow.getHours()).toBe(utcNow.getHours());
        });
    });

});

