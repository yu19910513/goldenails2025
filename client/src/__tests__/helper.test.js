/**
 * @fileoverview Jest test suite for helper utility functions.
 * This file contains unit tests for various utility functions used throughout the application,
 * including data formatting, calculations, and validations.
 * @version 1.0.0
 */

import {
    DateTime
} from "luxon";
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
    extractServiceNames,
    formatStartTime,
    formatEndTime,
    formatDate,
    buildNotificationData,
    formatTimeSlot
} from "../utils/helper";


// ----------------------------------------------------------------------------------
// --- PRICING & CALCULATION TESTS ---
// ----------------------------------------------------------------------------------

/**
 * @describe Test suite for the `formatPrice` function.
 * Verifies that prices are formatted correctly based on specific business rules
 * and that invalid inputs are handled gracefully.
 */
describe('formatPrice', () => {
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

    it('should throw an error if the price is not a number', () => {
        expect(() => formatPrice('string')).toThrow('Invalid price value. It must be a number.');
        expect(() => formatPrice(NaN)).toThrow('Invalid price value. It must be a number.');
        expect(() => formatPrice(undefined)).toThrow('Invalid price value. It must be a number.');
    });
});


/**
 * @describe Test suite for the `calculateTotalTime` function.
 * Ensures the function correctly sums the duration of all selected services.
 */
describe("calculateTotalTime", () => {
    it("should calculate total time correctly", () => {
        const selectedServices = {
            1: [{
                id: 1,
                name: "Service 1",
                time: 30
            }, {
                id: 2,
                name: "Service 2",
                time: 45
            }],
            2: [{
                id: 3,
                name: "Service 3",
                time: 60
            }]
        };
        expect(calculateTotalTime(selectedServices)).toBe(135);
    });

    it("should throw error for invalid input (non-object)", () => {
        expect(() => calculateTotalTime(null)).toThrow("Invalid input. `selectedServices` must be an object.");
    });

    it("should throw error for invalid services (non-array)", () => {
        const selectedServices = {
            1: "not-an-array"
        };
        expect(() => calculateTotalTime(selectedServices)).toThrow("Invalid services list for category 1. Expected an array.");
    });
});


/**
 * @describe Test suite for the `calculateTotalAmount` function.
 * Ensures the function correctly sums the price of all selected services.
 */
describe("calculateTotalAmount", () => {
    it("should calculate total amount correctly", () => {
        const selectedServices = {
            1: [{
                id: 1,
                name: "Service 1",
                price: 20
            }, {
                id: 2,
                name: "Service 2",
                price: 30
            }],
            2: [{
                id: 3,
                name: "Service 3",
                price: 50
            }]
        };
        expect(calculateTotalAmount(selectedServices)).toBe(100);
    });

    it("should throw error for invalid input (non-object)", () => {
        expect(() => calculateTotalAmount(null)).toThrow("Invalid input. `selectedServices` must be an object.");
    });

    // test("should throw error for missing price in service", () => {
    // 	 const selectedServices = { 1: [{ id: 1, name: "Service 1"}] };
    // 	 expect(() => calculateTotalAmount(selectedServices)).toThrow("Invalid price value.");
    // });
});

/**
 * @describe Test suite for the `calculateAvailableSlots` function.
 * Verifies that the function correctly identifies available appointment slots
 * based on business hours, existing appointments, and technician availability.
 */
describe("calculateAvailableSlots", () => {
    const businessHours = {
        start: 9,
        end: 17
    };
    const futureDayOnly = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const technician = {
        name: "No Preference",
        unavailability: ""
    };

    it("returns available slots when no appointments exist", () => {
        const appointments = [];
        const selectedServices = {
            "1": [{
                time: 30
            }]
        };
        const slots = calculateAvailableSlots(appointments, selectedServices, futureDayOnly, businessHours, technician);
        expect(slots.length).toBeGreaterThan(0);
    });

    it("returns empty array if technician is unavailable on selected date", () => {
        const appointments = [];
        const selectedServices = {
            "1": [{
                time: 30
            }]
        };
        const slots = calculateAvailableSlots(appointments, selectedServices, "2025-03-01", businessHours, technician);
        expect(slots).toEqual([]);
    });

    it("returns available slots avoiding occupied appointments", () => {
        const appointments = [{
            date: futureDayOnly,
            start_service_time: "10:00",
            Services: [{
                time: 60
            }]
        }, {
            date: futureDayOnly,
            start_service_time: "11:30",
            Services: [{
                time: 60
            }]
        },];
        const selectedServices = {
            "1": [{
                time: 30
            }]
        };;
        const slots = calculateAvailableSlots(appointments, selectedServices, futureDayOnly, businessHours, technician);
        expect(slots.some(slot => slot.getHours() === 10)).toBe(false); // 10 AM is occupied
        expect(slots.some(slot => slot.getHours() === 11 && slot.getMinutes() === 30)).toBe(false); // 11:30 AM is occupied
    });

    it("returns empty array when technician is unavailable on a specific weekday", () => {
        const appointments = [];
        const selectedServices = {
            "1": [{
                time: 30
            }]
        };
        const today = DateTime.local();
        const daysUntilMonday = (8 - today.weekday) % 7 || 7;
        const selectedDate = today.plus({
            days: daysUntilMonday
        }).toISODate(); // "YYYY-MM-DD"
        const unavailableTech = {
            ...technician,
            unavailability: "1"
        }; // Monday
        const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, unavailableTech);
        expect(slots).toEqual([]);
    });

    it("returns slots adjusted for business hours", () => {
        const appointments = [];
        const selectedServices = {
            "1": [{
                time: 30
            }]
        };
        const slots = calculateAvailableSlots(appointments, selectedServices, futureDayOnly, businessHours, technician);
        expect(slots[0].getHours()).toBeGreaterThanOrEqual(9); // Earliest slot should not be before business hours
        expect(slots[slots.length - 1].getHours()).toBeLessThanOrEqual(17); // Latest slot should not exceed business hours
    });

    it("excludes slots within bufferTime from current time when selectedDate is today", () => {
        const appointments = [];
        const selectedServices = {
            "1": [{
                time: 30
            }]
        };

        const now = new Date();
        const selectedDate = now.toISOString().split("T")[0]; // Today
        const currentHours = {
            start: now.getHours() - 1,
            end: now.getHours() + 3
        }; // Surround current time for valid range
        const bufferTime = 2; // 2 hours buffer
        const slots = calculateAvailableSlots(appointments, selectedServices, selectedDate, currentHours, technician, bufferTime);
        const blockedUntil = new Date(now.getTime() + bufferTime * 60 * 60 * 1000);

        // All returned slots must be after the buffer window
        for (const slot of slots) {
            expect(slot.getTime()).toBeGreaterThanOrEqual(blockedUntil.getTime());
        }
    });
});


// ----------------------------------------------------------------------------------
// --- TIME & DATE TESTS ---
// ----------------------------------------------------------------------------------

/**
 * @describe Test suite for time and date related functions.
 * Verifies correct formatting and timezone handling.
 */
describe("Time & Date Functions", () => {
    describe("waTimeString", () => {
        it("should return formatted time string in Pacific Time", () => {
            const mockDate = new Date("2025-01-30T12:34:56Z");
            const formattedTime = waTimeString(mockDate);
            expect(formattedTime).toBe("04:34:56"); // Adjust according to Pacific Time zone
        });
    });

    describe("now function", () => {
        it("should return the current date and time in Pacific Time", () => {
            const pacificNow = DateTime.fromJSDate(now(), {
                zone: "America/Los_Angeles"
            });
            const expectedNow = DateTime.now().setZone("America/Los_Angeles");
            const diffInSeconds = Math.abs(pacificNow.diff(expectedNow, "seconds").seconds);
            expect(diffInSeconds).toBeLessThanOrEqual(1);
        });
    });

    describe('getBusinessHours', () => {
        it('returns Sunday hours for a Sunday date', () => {
            const result = getBusinessHours('2025-05-04'); // This is a Sunday
            expect(result).toEqual({
                start: 11,
                end: 17
            });
        });

        it('returns regular hours for a Monday date', () => {
            const result = getBusinessHours('2025-05-05'); // This is a Monday
            expect(result).toEqual({
                start: 9,
                end: 19
            });
        });

        it('returns regular hours for a Saturday date', () => {
            const result = getBusinessHours('2025-05-03'); // This is a Saturday
            expect(result).toEqual({
                start: 9,
                end: 19
            });
        });

        it('still works if time is included in the ISO string', () => {
            const result = getBusinessHours('2025-05-04T15:00:00'); // Sunday with time
            expect(result).toEqual({
                start: 11,
                end: 17
            });
        });
    });
});


/**
 * @describe Test suite for time and date formatting functions.
 */
describe("Date/Time Formatting", () => {
    beforeAll(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(new Date("2025-09-29T12:00:00Z"));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe("formatTime", () => {
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

    describe("formatTimeSlot", () => {
        it("returns 'N/A' for empty or falsy input", () => {
            expect(formatTimeSlot("")).toBe("N/A");
            expect(formatTimeSlot(null)).toBe("N/A");
            expect(formatTimeSlot(undefined)).toBe("N/A");
        });

        it("formats single-hour strings correctly", () => {
            expect(formatTimeSlot("9")).toMatch(/09:00 AM|9:00 AM/);
            expect(formatTimeSlot("0")).toMatch(/12:00 AM|0:00 AM/);
        });

        it("formats hour:minute strings correctly", () => {
            expect(formatTimeSlot("9:0")).toMatch(/09:00 AM|9:00 AM/);
            expect(formatTimeSlot("9:5")).toMatch(/09:05 AM|9:05 AM/);
            expect(formatTimeSlot("15:30")).toMatch(/03:30 PM|15:30 PM/);
        });

        it("formats full ISO datetime strings correctly", () => {
            expect(formatTimeSlot("2025-09-29T15:30")).toBe("03:30 PM");
            expect(formatTimeSlot("2025-12-01T09:15")).toBe("09:15 AM");
        });

        it("handles invalid time formats by returning 'Invalid Date'", () => {
            const result = formatTimeSlot("abc");
            expect(result).toBe("Invalid Date");
        });
    });


    describe("formatStartTime", () => {
        it("should format a valid slot into time string", () => {
            const slot = new Date("2025-09-29T14:30:00").toISOString();
            expect(formatStartTime(slot)).toMatch(/02:30 PM|14:30/);
        });
        it("should return 'N/A' if slot is null", () => {
            expect(formatStartTime(null)).toBe("N/A");
        });
    });

    describe("formatEndTime", () => {
        it("should add duration and return formatted end time", () => {
            const slot = new Date("2025-09-29T14:30:00").toISOString();
            expect(formatEndTime(slot, 45)).toMatch(/03:15 PM|15:15/);
        });
        it("should return 'N/A' if slot is null", () => {
            expect(formatEndTime(null, 30)).toBe("N/A");
        });
    });

    describe("formatDate", () => {
        const normalize = (str) => str.replace(/\u200E/g, "");

        it("returns 'N/A' for falsy input", () => {
            expect(formatDate("")).toBe("N/A");
            expect(formatDate(null)).toBe("N/A");
            expect(formatDate(undefined)).toBe("N/A");
        });

        it("formats ISO date strings correctly", () => {
            const result = normalize(formatDate("2025-09-29T15:30:00"));
            expect(result).toContain("Monday");
            expect(result).toContain("September");
            expect(result).toContain("2025");
        });

        it("formats plain date strings YYYY-MM-DD correctly", () => {
            const result = normalize(formatDate("2025-09-29"));
            expect(result).toContain("Monday");
            expect(result).toContain("September");
            expect(result).toContain("2025");
        });

        it("formats local midnight times correctly", () => {
            const result = normalize(formatDate("2025-09-29T00:00:00"));
            expect(result).toContain("Monday");
        });

        it("formats times late in day correctly", () => {
            const result = normalize(formatDate("2025-09-29T23:59:59"));
            expect(result).toContain("Monday");
        });

        it("returns 'Invalid Date' for invalid input", () => {
            expect(formatDate("abc")).toBe("Invalid Date");
            expect(formatDate("2025-13-01")).toBe("Invalid Date"); // invalid month
            expect(formatDate("2025-12-32")).toBe("Invalid Date"); // invalid day
        });
    });
});


// ----------------------------------------------------------------------------------
// --- DATA MANIPULATION & FORMATTING TESTS ---
// ----------------------------------------------------------------------------------

/**
 * @describe Test suite for data manipulation and formatting utilities.
 */
describe("Data Manipulation Utilities", () => {
    describe('groupServicesByCategory', () => {
        it('should group services by category_id', () => {
            const input = [{
                id: 1,
                name: 'Mini Facial',
                price: 45,
                time: 34,
                category_id: 4
            }, {
                id: 2,
                name: 'Deep Cleanse',
                price: 60,
                time: 50,
                category_id: 4
            }, {
                id: 3,
                name: 'Basic Pedicure',
                price: 30,
                time: 40,
                category_id: 2
            },];

            const expected = {
                4: [{
                    id: 1,
                    name: 'Mini Facial',
                    price: 45,
                    time: 34,
                    category_id: 4
                }, {
                    id: 2,
                    name: 'Deep Cleanse',
                    price: 60,
                    time: 50,
                    category_id: 4
                },],
                2: [{
                    id: 3,
                    name: 'Basic Pedicure',
                    price: 30,
                    time: 40,
                    category_id: 2
                },],
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
            const input = {
                a: ""
            };
            const result = replaceEmptyStringsWithNull(input);
            expect(result).not.toBe(input); // should be a new object
            expect(input.a).toBe("");
        });
    });

    describe("extractServiceNames", () => {
        it("should extract all service names from a nested object", () => {
            const services = {
                nails: [{
                    name: "Manicure"
                }, {
                    name: "Pedicure"
                }],
                hair: [{
                    name: "Cut"
                }],
            };
            expect(extractServiceNames(services)).toEqual(["Manicure", "Pedicure", "Cut"]);
        });
        it("should return an empty array for an empty object", () => {
            expect(extractServiceNames({})).toEqual([]);
        });
    });

    describe("buildNotificationData", () => {
        it("should correctly structure the notification payload", () => {
            const appointmentDetails = {
                customerInfo: {
                    name: "Alice",
                    phone: "1234567890",
                    email: "alice@example.com",
                },
                technician: {
                    name: "Bob",
                },
            };
            const payload = buildNotificationData(
                appointmentDetails,
                "true",
                "Monday, September 29, 2025",
                "02:30 PM",
                "03:15 PM", ["Manicure", "Pedicure"]
            );

            expect(payload).toMatchObject({
                recipient_name: "Alice",
                recipient_phone: "1234567890",
                recipient_email_address: "alice@example.com",
                appointment_date: "Monday, September 29, 2025",
                appointment_start_time: "02:30 PM",
                appointment_end_time: "03:15 PM",
                appointment_services: "Manicure, Pedicure",
                appointment_technician: "Bob",
            });
        });
    });
});


// ----------------------------------------------------------------------------------
// --- VALIDATION & SANITIZATION TESTS ---
// ----------------------------------------------------------------------------------

/**
 * @describe Test suite for validation and sanitization functions.
 */
describe("Validation & Sanitization", () => {
    describe('areCommonValuesEqual', () => {
        it('returns true when all common keys have equal trimmed values', () => {
            const control = {
                name: ' Alice ',
                phone: '123',
                email: 'a@test.com'
            };
            const test = {
                name: 'Alice',
                phone: '123',
                email: 'a@test.com',
                extra: 'ignore'
            };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });

        it('returns false when any common key has a different value', () => {
            const control = {
                name: 'Alice',
                phone: '123'
            };
            const test = {
                name: 'Bob',
                phone: '123'
            };
            expect(areCommonValuesEqual(control, test)).toBe(false);
        });

        it('returns false when either object is null', () => {
            expect(areCommonValuesEqual(null, {
                name: 'Alice'
            })).toBe(false);
            expect(areCommonValuesEqual({
                name: 'Alice'
            }, null)).toBe(false);
        });

        it('returns false when either object is empty', () => {
            expect(areCommonValuesEqual({}, {
                name: 'Alice'
            })).toBe(false);
            expect(areCommonValuesEqual({
                name: 'Alice'
            }, {})).toBe(false);
        });

        it('ignores non-common keys', () => {
            const control = {
                name: 'Alice'
            };
            const test = {
                name: 'Alice',
                age: 30
            };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });

        it('handles non-string values correctly', () => {
            const control = {
                active: true,
                count: 5
            };
            const test = {
                active: true,
                count: 5
            };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });

        it('trims string values before comparing', () => {
            const control = {
                email: ' user@example.com '
            };
            const test = {
                email: 'user@example.com'
            };
            expect(areCommonValuesEqual(control, test)).toBe(true);
        });
    });

    describe('sanitizeObjectInput', () => {
        it('should trim and convert name to uppercase', () => {
            const input = {
                name: '  John Doe  '
            };
            const result = sanitizeObjectInput(input);
            expect(result.name).toBe('JOHN DOE');
        });

        it('should trim and convert email to lowercase', () => {
            const input = {
                email: '  ExAMPLE@EMAIL.COM  '
            };
            const result = sanitizeObjectInput(input);
            expect(result.email).toBe('example@email.com');
        });

        it('should trim other string fields', () => {
            const input = {
                phone: '  123-456-7890  '
            };
            const result = sanitizeObjectInput(input);
            expect(result.phone).toBe('123-456-7890');
        });

        it('should leave non-string fields unchanged', () => {
            const input = {
                age: 30,
                isActive: true
            };
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
            const input = {
                name: null,
                email: undefined,
                phone: '  555-1234  '
            };
            const result = sanitizeObjectInput(input);
            expect(result).toEqual({
                name: null,
                email: undefined,
                phone: '555-1234'
            });
        });
    });

    describe('isTokenValid', () => {
        const createToken = (exp) => `h.${btoa(JSON.stringify({ exp }))}.s`;

        it('returns false for null, undefined, or non-string tokens', () => {
            expect(isTokenValid(null)).toBe(false);
            expect(isTokenValid(undefined)).toBe(false);
            expect(isTokenValid(123)).toBe(false);
            expect(isTokenValid({})).toBe(false);
        });

        it('returns false for malformed tokens (does not have 3 parts)', () => {
            expect(isTokenValid('abc.def')).toBe(false);
            expect(isTokenValid('abc.def.ghi.jkl')).toBe(false);
        });

        it('returns false for tokens with invalid base64 or JSON payload', () => {
            const invalidPayloadToken = 'aaa.invalid-base64.signature';
            expect(isTokenValid(invalidPayloadToken)).toBe(false);
        });

        it('returns false if payload does not contain exp or exp is not a number', () => {
            const noExpPayload = btoa(JSON.stringify({
                foo: "bar"
            }));
            const invalidExpPayload = btoa(JSON.stringify({
                exp: "not-a-number"
            }));
            expect(isTokenValid(`h.${noExpPayload}.s`)).toBe(false);
            expect(isTokenValid(`h.${invalidExpPayload}.s`)).toBe(false);
        });

        it('returns false if token is expired', () => {
            const expiredTimestamp = Math.floor(Date.now() / 1000) - 1000;
            expect(isTokenValid(createToken(expiredTimestamp))).toBe(false);
        });

        it('returns true if token is valid and not expired', () => {
            const futureTimestamp = Math.floor(Date.now() / 1000) + 1000;
            expect(isTokenValid(createToken(futureTimestamp))).toBe(true);
        });
    });
});


// ----------------------------------------------------------------------------------
// --- COMPLEX LOGIC / ALGORITHM TESTS ---
// ----------------------------------------------------------------------------------

/**
 * @describe Test suite for the `distributeItems` function.
 * This function implements a greedy algorithm to distribute a list of items
 * (services) into a specified number of groups (technicians) while balancing
 * the total time and avoiding placing duplicate service IDs in the same group.
 */
describe("distributeItems", () => {
    it("should distribute items evenly into the specified number of groups", () => {
        const items = [{
            id: "A",
            time: 40
        }, {
            id: "B",
            time: 20
        }, {
            id: "C",
            time: 10
        },];
        const groups = distributeItems(items, 3);
        expect(groups).toHaveLength(3);
        expect(groups.flat()).toHaveLength(items.length);
    });

    it("should not place duplicate IDs in the same group", () => {
        const items = [{
            id: "A",
            time: 30
        }, {
            id: "A",
            time: 30
        }, {
            id: "B",
            time: 15
        },];
        const groups = distributeItems(items, 2);
        for (const group of groups) {
            const ids = group.map(i => i.id);
            const uniqueIds = new Set(ids);
            expect(ids.length).toBe(uniqueIds.size);
        }
    });

    it("should balance the total time across groups as evenly as possible", () => {
        const items = [{
            id: "X",
            time: 50
        }, {
            id: "Y",
            time: 30
        }, {
            id: "Z",
            time: 20
        }, {
            id: "W",
            time: 10
        },];
        const groups = distributeItems(items, 2);
        const totals = groups.map(g => g.reduce((sum, i) => sum + i.time, 0));
        const spread = Math.max(...totals) - Math.min(...totals);
        expect(spread).toBeLessThanOrEqual(30);
    });

    it("should handle case with group size = items.length (each item in its own group)", () => {
        const items = [{
            id: "A",
            time: 5
        }, {
            id: "B",
            time: 10
        }, {
            id: "C",
            time: 15
        },];
        const groups = distributeItems(items, 3);
        expect(groups).toHaveLength(3);
        groups.forEach(g => expect(g).toHaveLength(1));
    });

    it("should handle case with only one group", () => {
        const items = [{
            id: "A",
            time: 5
        }, {
            id: "B",
            time: 10
        },];
        const groups = distributeItems(items, 1);
        expect(groups).toHaveLength(1);
        const receivedIds = groups[0].map(i => i.id).sort();
        const expectedIds = items.map(i => i.id).sort();
        expect(receivedIds).toEqual(expectedIds);
    });

    it("should auto-increase group size if duplicate item count exceeds requested size", () => {
        const items = [{
            id: "A",
            time: 5
        }, {
            id: "A",
            time: 5
        }, {
            id: "A",
            time: 5
        },];
        const requestedSize = 2; // requested smaller than max duplicates
        const groups = distributeItems(items, requestedSize);
        expect(groups).toHaveLength(3); // The function should auto-increase size to 3
    });

    it("should handle empty input gracefully", () => {
        const groups = distributeItems([], 3);
        expect(groups).toEqual([
            [],
            [],
            []
        ]);
    });
});

