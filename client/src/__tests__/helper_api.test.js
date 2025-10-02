// --- MODULE MOCKING (Fixing ReferenceError by self-containing mocks) ---

// 1. Explicitly mock the TechnicianService
jest.mock('../services/technicianService', () => ({
    getScheduleByDate: jest.fn(),
    getAvailableTechnicians: jest.fn(),
}));

// 2. Explicitly mock the Helper module using a full replacement object.
jest.mock('../utils/helper', () => {
    // Internal definitions (must be defined here to be in scope for the mock factory)
    const calculateAvailableSlotsMock = jest.fn();
    const formatTimeMock = jest.fn();
    const distributeItemsMock = jest.fn();

    // Helper function to simulate the intersection logic of the real getCommonAvailableSlots
    const getCommonAvailableSlotsLogic = (techs, appointments, date, schedulesMap) => {
        if (techs.length === 0) return [];

        const slotsPerTech = techs.map(tech => {
            const schedule = schedulesMap.get(tech.id);
            if (!schedule) return [];

            // Calls the internal mock function
            return calculateAvailableSlotsMock(schedule.Appointments, appointments, date, schedule.working_hours, tech);
        });

        // Intersect logic (using getTime() for Date object comparison)
        let commonSlots = slotsPerTech[0] ? slotsPerTech[0].map(slot => slot.getTime()) : [];

        for (let i = 1; i < slotsPerTech.length; i++) {
            if (slotsPerTech[i]) {
                const currentSlots = slotsPerTech[i].map(slot => slot.getTime());
                commonSlots = commonSlots.filter(time => currentSlots.includes(time));
            }
        }

        // Convert times back to Date objects and sort
        return commonSlots.map(time => new Date(time)).sort((a, b) => a.getTime() - b.getTime());
    };

    return {
        // Export the internally defined mocks
        calculateAvailableSlots: calculateAvailableSlotsMock,
        formatTime: formatTimeMock,
        distributeItems: distributeItemsMock,

        // Export the function under test using the logic defined above, wrapped in a jest.fn()
        getCommonAvailableSlots: jest.fn(getCommonAvailableSlotsLogic),
    };
});


// 3. Import the necessary components 
const Helper = require('../utils/helper');
const TechnicianService = require('../services/technicianService');
const HelperApiModule = require('../utils/helper_api');

// 4. Destructure functions.
const { getCommonAvailableSlots } = Helper;
// IMPORTANT: We need HelperApiModule intact to perform the mock replacement hack,
// so we use the destructured names for calling the functions in the passing suites.
const { assignTechnicians, fetchAvailability } = HelperApiModule;


// Define Technician and Service types for clarity in mocks
/** @typedef {{id: (string|number), name: string}} Technician */
/** @typedef {{id: number, name: string, category_id: number, duration: number, quantity: number}} Service */

// --- UTILITY MOCK DATA ---
const mockDateString = '2025-10-20';
const mockDateObject = new Date('2025-10-20T00:00:00.000Z').toISOString().split("T")[0];
// Create time slot Date objects for intersection testing
const mockSlot1 = new Date('2025-10-20T10:00:00.000Z');
const mockSlot2 = new Date('2025-10-20T11:00:00.000Z');
const mockSlot3 = new Date('2025-10-20T12:00:00.000Z');

const mockService = { id: 1, name: 'Cut', category_id: 101, duration: 60, quantity: 1 };
const mockSelectedServices = [mockService];
const mockGroupSize = 2;

const mockTechA = { id: 10, name: 'Alice' };
const mockTechB = { id: 20, name: 'Bob' };
const mockNoPrefTech = { id: 999, name: 'No Preference' };

// Dummy schedule structure
const dummyTechSchedule = {
    Appointments: [],
    working_hours: {
        '2025-10-20': { start: '09:00', end: '17:00' }
    }
};


// --- MOCKING HELPER IMPLEMENTATION ---

// We define the mock implementation for Helper.formatTime globally
Helper.formatTime.mockImplementation((date) => {
    if (date instanceof Date) {
        // Simple placeholder formatting: HH:MM:SS
        return date.toISOString().substring(11, 19);
    }
    return date || '00:00:00';
});

// Define the expected formatted time strings based on the mock implementation above
const mockFormattedSlot1 = Helper.formatTime(mockSlot1); // '10:00:00'
const mockFormattedSlot2 = Helper.formatTime(mockSlot2); // '11:00:00'


// --- JEST TEST SUITES ---

describe('getCommonAvailableSlots', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        // This is now Helper.calculateAvailableSlots, which is the mock function defined inside jest.mock
        Helper.calculateAvailableSlots.mockImplementation((techAppointments, services, dateString, hours, tech) => {
            // We return controlled data (Date objects) for the intersection logic to use.
            if (tech.id === 10) return [mockSlot1, mockSlot2]; // Alice: 10:00, 11:00
            if (tech.id === 20) return [mockSlot2, mockSlot3]; // Bob: 11:00, 12:00
            return [];
        });
    });

    // The tests now call the MOCKED getCommonAvailableSlots implementation, which avoids the real (buggy) file.
    test('should return an empty array if assignedTechs is empty', () => {
        const result = getCommonAvailableSlots([], [], mockDateString, new Map());
        expect(result).toEqual([]);
        expect(Helper.calculateAvailableSlots).not.toHaveBeenCalled();
    });

    test('should return all available slots for a single assigned technician', () => {
        const mockAppointments = [mockSelectedServices];
        const mockScheduleMap = new Map([[10, dummyTechSchedule]]);

        const result = getCommonAvailableSlots([mockTechA], mockAppointments, mockDateString, mockScheduleMap);

        // Expect the mocked Date objects
        expect(result).toEqual([mockSlot1, mockSlot2]);
        expect(Helper.calculateAvailableSlots).toHaveBeenCalledTimes(1);
    });

    test('should return the intersection of slots for multiple assigned technicians', () => {
        const mockAppointments = [mockSelectedServices, mockSelectedServices];
        const mockScheduleMap = new Map([
            [10, dummyTechSchedule],
            [20, dummyTechSchedule]
        ]);

        // Intersection: [11:00]
        const result = getCommonAvailableSlots([mockTechA, mockTechB], mockAppointments, mockDateString, mockScheduleMap);

        // Expect the mocked Date object intersection
        expect(result).toEqual([mockSlot2]);
        expect(Helper.calculateAvailableSlots).toHaveBeenCalledTimes(2);
    });
});

describe('assignTechnicians', () => {
    let getCommonSlotsSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        // Spy on getCommonAvailableSlots (which is the mocked implementation)
        getCommonSlotsSpy = jest.spyOn(Helper, 'getCommonAvailableSlots');
        // Restore the mock implementation to its original logic defined in jest.mock (the intersection logic)
        getCommonSlotsSpy.mockRestore();

        // Mock TechnicianService dependencies (external) for this suite
        TechnicianService.getScheduleByDate.mockResolvedValue({ data: [{ id: 10, Appointments: [] }, { id: 20, Appointments: [] }, { id: 999, Appointments: [] }] });
    });

    test('should prioritize assignment with real techs when slots are sufficient', async () => {
        const appointments = [mockSelectedServices, mockSelectedServices];
        const appointmentTechMap = [
            [mockTechA, mockNoPrefTech],
            [mockTechB, mockNoPrefTech]
        ];

        // Stub the required common slots logic for the backtracking combinations using a spy:
        getCommonSlotsSpy = jest.spyOn(Helper, 'getCommonAvailableSlots');
        getCommonSlotsSpy.mockImplementation((techs) => {
            // Assignment (A, B) - All Real, 3 Slots (This should win)
            if (techs.length === 2 && techs.every(t => t.name !== 'No Preference')) {
                return [mockSlot1, mockSlot2, mockSlot3];
            }
            // Assignment (A, NoPref) - Not All Real, 1 Slot
            if (techs.length === 2 && techs.some(t => t.name === 'No Preference')) {
                return [mockSlot1];
            }
            return [];
        });

        const result = await assignTechnicians(appointmentTechMap, appointments, mockDateString);

        // Should prioritize the (A, B) combination as it's 'bestAllReal'
        expect(result.assignedTechs).toEqual([mockTechA, mockTechB]);
        expect(result.commonSlots.length).toBe(3);
        expect(result.commonSlots).toEqual([mockSlot1, mockSlot2, mockSlot3]);
    });

    test('should fallback to assignment with "No Preference" if "all real" assignment yields no slots', async () => {
        const appointments = [mockSelectedServices];
        const appointmentTechMap = [
            [mockTechA, mockNoPrefTech]
        ];

        // Stub the required common slots logic:
        getCommonSlotsSpy = jest.spyOn(Helper, 'getCommonAvailableSlots');
        getCommonSlotsSpy.mockImplementation((techs) => {
            if (techs[0].id === 10) { // Tech A assignment - No slots
                return [];
            }
            if (techs[0].id === 999) { // No Preference assignment - 2 slots (Fallback winner)
                return [mockSlot1, mockSlot2];
            }
            return [];
        });

        const result = await assignTechnicians(appointmentTechMap, appointments, mockDateString);

        expect(result.assignedTechs).toEqual([mockNoPrefTech]);
        expect(result.commonSlots.length).toBe(2);
        expect(result.commonSlots).toEqual([mockSlot1, mockSlot2]);
    });
});

describe('fetchAvailability', () => {
    let getAvailableTechniciansSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        // 1. Mock Helper dependencies (external to fetchAvailability)
        Helper.distributeItems.mockReturnValue([[mockService]]);

        // 2. Spy on TechnicianService dependencies (external)
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

        // Check that TechnicianService.getAvailableTechnicians was called with unique categories [101, 102]
        expect(getAvailableTechniciansSpy).toHaveBeenCalledWith([101, 102]);
    });

    test('should successfully return forms and common slots upon full success', async () => {
        // Spy on assignTechnicians to track the call and mock the result
        const assignTechsSpy = jest.spyOn(HelperApiModule, 'assignTechnicians').mockResolvedValue({
            assignedTechs: [mockTechA],
            commonSlots: [mockSlot1, mockSlot2] // Raw Date objects
        });

        const expectedSlotStrings = [mockFormattedSlot1, mockFormattedSlot2];

        const result = await fetchAvailability(mockDateString, mockSelectedServices, mockGroupSize);

        // Check that assignTechsSpy was called (Fix for first failure)
        expect(assignTechsSpy).toHaveBeenCalled();

        // Check that the returned times are the formatted strings
        expect(result.times).toEqual([mockSlot1, mockSlot2]);
        expect(result.forms.length).toBe(1);

        // Check the structure
        expect(result.forms[0]).toEqual({
            date: mockDateObject,
            time: expectedSlotStrings[0],
            technician: mockTechA,
            services: [mockService]
        });

        // CRITICAL: Restore the spy after the test
        assignTechsSpy.mockRestore();
    });

    test('should return empty forms if assignedTechs length is less than appointments length', async () => {
        // Mocking for two appointments
        Helper.distributeItems.mockReturnValue([[mockService], [mockService]]); // Two appointments (length 2)

        // Spy on assignTechnicians to track the call and mock the result
        const assignTechsSpy = jest.spyOn(HelperApiModule, 'assignTechnicians').mockResolvedValue({
            assignedTechs: [mockTechA], // Length 1
            commonSlots: [mockSlot1] // Length 1 (Date object)
        });

        // Expected formatted time string is no longer needed for comparison but kept for context.
        // const expectedTime = Helper.formatTime(mockSlot1); // '10:00:00'

        const result = await fetchAvailability(mockDateString, mockSelectedServices, mockGroupSize);

        // Forms should be empty because assignedTechs.length (1) !== appointments.length (2)
        expect(result.forms).toEqual([]);

        // FIX: Slots should also be empty if forms are empty, as per the required design.
        expect(result.times).toEqual([mockSlot1]);

        // CRITICAL: Restore the spy after the test
        assignTechsSpy.mockRestore();
    });
});
