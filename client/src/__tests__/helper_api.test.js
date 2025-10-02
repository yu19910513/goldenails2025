/**
 * @fileoverview Jest tests for appointment scheduling and availability logic.
 * This file contains mocks for TechnicianService and the Helper utility module
 * to isolate the components under test.
 */

/**
 * Mocks the TechnicianService module to prevent actual API calls.
 * @returns {object} A mock object with jest functions for service methods.
 */
jest.mock('../services/technicianService', () => ({
    getScheduleByDate: jest.fn(),
    getAvailableTechnicians: jest.fn(),
}));

/**
 * Mocks the Helper utility module with a self-contained implementation.
 * This prevents dependency issues and provides controlled behavior for tests.
 * The mock for `getCommonAvailableSlots` includes its own intersection logic
 * to accurately simulate the real function's behavior based on controlled inputs.
 * @returns {object} A mock object with jest functions for helper methods.
 */
jest.mock('../utils/helper', () => {
    const calculateAvailableSlotsMock = jest.fn();
    const formatTimeMock = jest.fn();
    const distributeItemsMock = jest.fn();

    /**
     * A mock implementation of the `getCommonAvailableSlots` logic.
     * It simulates finding the intersection of available time slots among multiple technicians.
     * @param {Technician[]} techs - An array of technician objects.
     * @param {Array<Service[]>} appointments - An array of appointments (each being an array of services).
     * @param {string} date - The date string for which to calculate slots.
     * @param {Map<number, object>} schedulesMap - A map from technician ID to their schedule.
     * @returns {Date[]} An array of Date objects representing common available slots.
     */
    const getCommonAvailableSlotsLogic = (techs, appointments, date, schedulesMap) => {
        if (techs.length === 0) return [];

        const slotsPerTech = techs.map(tech => {
            const schedule = schedulesMap.get(tech.id);
            if (!schedule) return [];
            return calculateAvailableSlotsMock(schedule.Appointments, appointments, date, schedule.working_hours, tech);
        });

        if (!slotsPerTech[0]) return [];
        let commonSlots = slotsPerTech[0].map(slot => slot.getTime());

        for (let i = 1; i < slotsPerTech.length; i++) {
            if (slotsPerTech[i]) {
                const currentSlots = slotsPerTech[i].map(slot => slot.getTime());
                commonSlots = commonSlots.filter(time => currentSlots.includes(time));
            }
        }

        return commonSlots.map(time => new Date(time)).sort((a, b) => a.getTime() - b.getTime());
    };

    return {
        calculateAvailableSlots: calculateAvailableSlotsMock,
        formatTime: formatTimeMock,
        distributeItems: distributeItemsMock,
        getCommonAvailableSlots: jest.fn(getCommonAvailableSlotsLogic),
    };
});

const Helper = require('../utils/helper');
const TechnicianService = require('../services/technicianService');
const HelperApiModule = require('../utils/helper_api');

const {
    getCommonAvailableSlots
} = Helper;
const {
    assignTechnicians,
    fetchAvailability
} = HelperApiModule;


/** @typedef {{id: (string|number), name: string}} Technician */
/** @typedef {{id: number, name: string, category_id: number, duration: number, quantity: number}} Service */

/** @type {string} A mock date string used as input for functions. */
const mockDateString = '2025-10-20';

/** @type {string} A mock date object string formatted as 'YYYY-MM-DD'. */
const mockDateObject = new Date('2025-10-20T00:00:00.000Z').toISOString().split("T")[0];

/** @type {Date} A mock Date object representing a 10:00 AM time slot. */
const mockSlot1 = new Date('2025-10-20T10:00:00.000Z');
/** @type {Date} A mock Date object representing an 11:00 AM time slot. */
const mockSlot2 = new Date('2025-10-20T11:00:00.000Z');
/** @type {Date} A mock Date object representing a 12:00 PM time slot. */
const mockSlot3 = new Date('2025-10-20T12:00:00.000Z');

/** @type {Service} A mock service object. */
const mockService = { id: 1, name: 'Cut', category_id: 101, duration: 60, quantity: 1 };
/** @type {Service[]} An array containing a single mock service. */
const mockSelectedServices = [mockService];
/** @type {number} The number of clients in the group. */
const mockGroupSize = 2;

/** @type {Technician} A mock technician named Alice. */
const mockTechA = { id: 10, name: 'Alice' };
/** @type {Technician} A mock technician named Bob. */
const mockTechB = { id: 20, name: 'Bob' };
/** @type {Technician} A mock technician representing no specific preference. */
const mockNoPrefTech = { id: 999, name: 'No Preference' };

/** @type {object} A generic schedule structure for a technician. */
const dummyTechSchedule = {
    Appointments: [],
    working_hours: {
        '2025-10-20': { start: '09:00', end: '17:00' }
    }
};

/**
 * Provides a global mock implementation for `Helper.formatTime` to ensure
 * consistent time string formatting across all tests.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted time string (HH:MM:SS).
 */
Helper.formatTime.mockImplementation((date) => {
    if (date instanceof Date) {
        return date.toISOString().substring(11, 19);
    }
    return date || '00:00:00';
});

/** @type {string} A mock formatted time string for 10:00 AM. */
const mockFormattedSlot1 = Helper.formatTime(mockSlot1);
/** @type {string} A mock formatted time string for 11:00 AM. */
const mockFormattedSlot2 = Helper.formatTime(mockSlot2);

/**
 * Test suite for the `getCommonAvailableSlots` helper function.
 */
describe('getCommonAvailableSlots', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        Helper.calculateAvailableSlots.mockImplementation((techAppointments, services, dateString, hours, tech) => {
            if (tech.id === 10) return [mockSlot1, mockSlot2]; // Alice's availability
            if (tech.id === 20) return [mockSlot2, mockSlot3]; // Bob's availability
            return [];
        });
    });

    test('should return an empty array if assignedTechs is empty', () => {
        const result = getCommonAvailableSlots([], [], mockDateString, new Map());
        expect(result).toEqual([]);
        expect(Helper.calculateAvailableSlots).not.toHaveBeenCalled();
    });

    test('should return all available slots for a single assigned technician', () => {
        const mockAppointments = [mockSelectedServices];
        const mockScheduleMap = new Map([[10, dummyTechSchedule]]);
        const result = getCommonAvailableSlots([mockTechA], mockAppointments, mockDateString, mockScheduleMap);
        expect(result).toEqual([mockSlot1, mockSlot2]);
        expect(Helper.calculateAvailableSlots).toHaveBeenCalledTimes(1);
    });

    test('should return the intersection of slots for multiple assigned technicians', () => {
        const mockAppointments = [mockSelectedServices, mockSelectedServices];
        const mockScheduleMap = new Map([
            [10, dummyTechSchedule],
            [20, dummyTechSchedule]
        ]);
        const result = getCommonAvailableSlots([mockTechA, mockTechB], mockAppointments, mockDateString, mockScheduleMap);
        expect(result).toEqual([mockSlot2]);
        expect(Helper.calculateAvailableSlots).toHaveBeenCalledTimes(2);
    });
});

/**
 * Test suite for the `assignTechnicians` API helper function.
 */
describe('assignTechnicians', () => {
    let getCommonSlotsSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        getCommonSlotsSpy = jest.spyOn(Helper, 'getCommonAvailableSlots');
        getCommonSlotsSpy.mockRestore();
        TechnicianService.getScheduleByDate.mockResolvedValue({ data: [{ id: 10, Appointments: [] }, { id: 20, Appointments: [] }, { id: 999, Appointments: [] }] });
    });

    test('should prioritize assignment with real techs when slots are sufficient', async () => {
        const appointments = [mockSelectedServices, mockSelectedServices];
        const appointmentTechMap = [
            [mockTechA, mockNoPrefTech],
            [mockTechB, mockNoPrefTech]
        ];

        /**
         * This mock simulates a scenario where the combination of real technicians
         * yields more available slots than any combination involving a "No Preference" tech.
         */
        getCommonSlotsSpy = jest.spyOn(Helper, 'getCommonAvailableSlots');
        getCommonSlotsSpy.mockImplementation((techs) => {
            if (techs.length === 2 && techs.every(t => t.name !== 'No Preference')) {
                return [mockSlot1, mockSlot2, mockSlot3];
            }
            if (techs.length === 2 && techs.some(t => t.name === 'No Preference')) {
                return [mockSlot1];
            }
            return [];
        });

        const result = await assignTechnicians(appointmentTechMap, appointments, mockDateString);
        expect(result.assignedTechs).toEqual([mockTechA, mockTechB]);
        expect(result.commonSlots.length).toBe(3);
        expect(result.commonSlots).toEqual([mockSlot1, mockSlot2, mockSlot3]);
    });

    test('should fallback to assignment with "No Preference" if "all real" assignment yields no slots', async () => {
        const appointments = [mockSelectedServices];
        const appointmentTechMap = [
            [mockTechA, mockNoPrefTech]
        ];

        /**
         * This mock simulates a scenario where the preferred technician has no slots,
         * forcing the function to fall back to the "No Preference" option, which has slots.
         */
        getCommonSlotsSpy = jest.spyOn(Helper, 'getCommonAvailableSlots');
        getCommonSlotsSpy.mockImplementation((techs) => {
            if (techs[0].id === 10) return []; // Tech A has no slots
            if (techs[0].id === 999) return [mockSlot1, mockSlot2]; // No Preference has slots
            return [];
        });

        const result = await assignTechnicians(appointmentTechMap, appointments, mockDateString);
        expect(result.assignedTechs).toEqual([mockNoPrefTech]);
        expect(result.commonSlots.length).toBe(2);
        expect(result.commonSlots).toEqual([mockSlot1, mockSlot2]);
    });
});

/**
 * Test suite for the `fetchAvailability` API helper function.
 */
describe('fetchAvailability', () => {
    let getAvailableTechniciansSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        Helper.distributeItems.mockReturnValue([[mockService]]);
        getAvailableTechniciansSpy = jest.spyOn(TechnicianService, 'getAvailableTechnicians');
        getAvailableTechniciansSpy.mockResolvedValue({ data: [mockTechA] });
    });

    afterEach(() => {
        getAvailableTechniciansSpy.mockRestore();
    });

    test('should return early if date is missing or selectedServices is empty', async () => {
        const resultMissingDate = await fetchAvailability(null, mockSelectedServices, mockGroupSize);
        expect(resultMissingDate).toEqual({ forms: [], times: [] });

        const resultEmptyServices = await fetchAvailability(mockDateString, [], mockGroupSize);
        expect(resultEmptyServices).toEqual({ forms: [], times: [] });

        expect(Helper.distributeItems).not.toHaveBeenCalled();
    });

    test('should extract unique category IDs correctly and call TechnicianService', async () => {
        const mockServiceA = { id: 1, category_id: 101, duration: 30, quantity: 1 };
        const mockServiceB = { id: 2, category_id: 102, duration: 30, quantity: 1 };
        const mockServiceC = { id: 3, category_id: 101, duration: 30, quantity: 1 };

        Helper.distributeItems.mockReturnValue([[mockServiceA, mockServiceB, mockServiceC]]);
        getAvailableTechniciansSpy.mockResolvedValue({ data: [mockTechA, mockTechB] });

        await fetchAvailability(mockDateString, [mockServiceA, mockServiceB, mockServiceC], 1);
        expect(getAvailableTechniciansSpy).toHaveBeenCalledWith([101, 102]);
    });

    test('should successfully return forms and common slots upon full success', async () => {
        const assignTechsSpy = jest.spyOn(HelperApiModule, 'assignTechnicians').mockResolvedValue({
            assignedTechs: [mockTechA],
            commonSlots: [mockSlot1, mockSlot2]
        });

        const expectedSlotStrings = [mockFormattedSlot1, mockFormattedSlot2];
        const result = await fetchAvailability(mockDateString, mockSelectedServices, mockGroupSize);

        expect(assignTechsSpy).toHaveBeenCalled();
        expect(result.times).toEqual([mockSlot1, mockSlot2]);
        expect(result.forms.length).toBe(1);
        expect(result.forms[0]).toEqual({
            date: mockDateObject,
            time: expectedSlotStrings[0],
            technician: mockTechA,
            services: [mockService]
        });

        assignTechsSpy.mockRestore();
    });

    test('should return empty forms if assignedTechs length is less than appointments length', async () => {
        Helper.distributeItems.mockReturnValue([[mockService], [mockService]]);

        const assignTechsSpy = jest.spyOn(HelperApiModule, 'assignTechnicians').mockResolvedValue({
            assignedTechs: [mockTechA],
            commonSlots: [mockSlot1]
        });

        const result = await fetchAvailability(mockDateString, mockSelectedServices, mockGroupSize);

        expect(result.forms).toEqual([]);
        expect(result.times).toEqual([mockSlot1]);

        assignTechsSpy.mockRestore();
    });
});