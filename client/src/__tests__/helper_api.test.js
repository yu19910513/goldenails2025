// --- MOCK DEPENDENCIES ---

// Mocking external service and helper functions used across the API methods
const TechnicianService = {
    getAvailableTechnicians: jest.fn(),
    getScheduleByDate: jest.fn(),
};
const distributeItems = jest.fn();
const calculateAvailableSlots = jest.fn();
const groupServicesByCategory = jest.fn();
const getBusinessHours = jest.fn();

// Mock the formatTime function for consistent string output in tests
const formatTime = jest.fn((date) => {
    if (date instanceof Date) {
        // Simple placeholder formatting: HH:MM:SS
        return date.toTimeString().split(' ')[0];
    }
    return date || '00:00:00';
});


// Define Technician and Service types for clarity in mocks
/** @typedef {{id: (string|number), name: string}} Technician */
/** @typedef {{id: number, name: string, category_id: number, duration: number, quantity: number}} Service */

// --- UTILITY MOCK DATA ---
const mockDate = new Date('2025-10-20T00:00:00.000Z');
// Create time slot Date objects for intersection testing
const mockSlot1 = new Date('2025-10-20T10:00:00.000Z');
const mockSlot2 = new Date('2025-10-20T11:00:00.000Z');
const mockSlot3 = new Date('2025-10-20T12:00:00.000Z');

const mockService = { id: 1, name: 'Cut', category_id: 101, duration: 60, quantity: 1 };
const mockSelectedServices = [mockService];
const mockGroupSize = 2;

const mockTechA = { id: 10, name: 'Alice' };
const mockTechB = { id: 20, name: 'Bob' };
const mockTechC = { id: 30, name: 'Charlie' };
const mockNoPrefTech = { id: 999, name: 'No Preference' };


// --- FUNCTIONS UNDER TEST (Replicated for testing scope) ---
// Note: Functions are now defined as Impl functions and wrapped in jest.fn() to make them mockable/restorable.

/**
 * Calculates the intersection of available time slots across all assigned technicians.
 * Core Logic.
 */
var _getCommonAvailableSlotsImpl = (assignedTechs, appointments, customerDate, allTechnicianSchedules) => {
    let commonSlots = null;

    for (let i = 0; i < assignedTechs.length; i++) {
        const tech = assignedTechs[i];
        if (!tech) continue;

        const appt = appointments[i];
        const techAppointments = allTechnicianSchedules.get(tech.id) || [];

        // calculateAvailableSlots is mocked
        const slots = calculateAvailableSlots(
            techAppointments,
            groupServicesByCategory(appt),
            customerDate,
            getBusinessHours(customerDate),
            tech
        );

        if (commonSlots === null) {
            commonSlots = new Set(slots.map(s => s.getTime()));
        } else {
            const currentSlots = new Set(slots.map(s => s.getTime()));
            commonSlots.forEach(slotTime => {
                if (!currentSlots.has(slotTime)) {
                    commonSlots.delete(slotTime);
                }
            });
        }
    }

    // The returned array consists of Date objects
    return commonSlots ? Array.from(commonSlots).map(time => new Date(time)) : [];
};

/**
 * Executes a backtracking search to assign unique, compatible technicians...
 * Core Logic.
 */
var _assignTechniciansImpl = async (appointmentTechMap, appointments, date) => {
    let bestAllReal = null;
    let bestAny = { assignedTechs: [], commonSlots: [] };

    // TechnicianService is mocked
    const allSchedulesResponse = await TechnicianService.getScheduleByDate(date);
    const schedulesMap = new Map(
        allSchedulesResponse.data.map(tech => [tech.id, tech.Appointments || []])
    );

    const backtrack = async (idx, current, usedTechs) => {
        if (idx === appointmentTechMap.length) {
            // getCommonAvailableSlots is called
            const slots = getCommonAvailableSlots(current, appointments, date, schedulesMap);
            const usesNoPreference = current.some(t => t.name === "No Preference");
            if (slots.length > 0) {
                // formatTime is mocked
                const slotStrings = slots.map(s => formatTime(s));

                if (!usesNoPreference) {
                    // Prioritize assignments with no "No Preference" tech
                    if (!bestAllReal || slotStrings.length > bestAllReal.commonSlots.length) {
                        bestAllReal = { assignedTechs: [...current], commonSlots: slotStrings };
                    }
                }

                // Keep track of the best overall assignment (including "No Preference")
                if (slotStrings.length > bestAny.commonSlots.length) {
                    bestAny = { assignedTechs: [...current], commonSlots: slotStrings };
                }
            }
            return;
        }

        const techOptions = appointmentTechMap[idx] || [];

        // Try real technicians first
        for (const tech of techOptions.filter(t => t && t.name !== "No Preference")) {
            if (usedTechs.has(tech.name)) continue;
            usedTechs.add(tech.name);
            current.push(tech);
            await backtrack(idx + 1, current, usedTechs);
            current.pop();
            usedTechs.delete(tech.name);
        }

        // Try "No Preference" last (if available)
        for (const tech of techOptions.filter(t => t && t.name === "No Preference")) {
            if (usedTechs.has(tech.name)) continue;
            usedTechs.add(tech.name);
            current.push(tech);
            await backtrack(idx + 1, current, usedTechs);
            current.pop();
            usedTechs.delete(tech.name);
        }
    };

    await backtrack(0, [], new Set());

    // Return the best "All Real" assignment, otherwise return the best overall assignment
    if (bestAllReal) return bestAllReal;
    if (bestAny.assignedTechs.length) return bestAny;

    return { assignedTechs: [], commonSlots: [] };
};


/**
 * Calculates the booking availability and technician assignments for a group of services...
 * Core Logic.
 */
var _fetchAvailabilityImpl = async (date, selectedServices, groupSize) => {
    // Early exit if essential parameters are missing
    if (!date || selectedServices.length === 0) return { forms: [], times: [] };

    // 1. Flatten the services based on quantity (creating a pool of individual service items)
    const servicePool = selectedServices.flatMap(s => Array(s.quantity).fill(s));

    // 2. Distribute service items into concurrent appointments (groups) based on groupSize
    let appointments = distributeItems(servicePool, groupSize).filter(a => a.length > 0);
    if (appointments.length === 0) return { forms: [], times: [] };

    // 3. For each concurrent appointment, find the required categories and fetch suitable available technicians
    const appointmentTechMap = await Promise.all(
        appointments.map(async (appt) => {
            // Get unique category IDs required for this specific concurrent appointment
            const categoryIds = [...new Set(appt.map(s => s.category_id))];
            // TechnicianService is mocked
            const res = await TechnicianService.getAvailableTechnicians(categoryIds);
            return Array.isArray(res.data) ? res.data : [];
        })
    );

    // 4. Assign specific technicians to each appointment and find overlapping time slots
    // assignTechnicians is called
    const { assignedTechs, commonSlots } = await assignTechnicians(
        appointmentTechMap,
        appointments,
        date
    );

    // 5. Construct the final booking forms if all appointments successfully received a technician assignment
    const forms = assignedTechs.length === appointments.length
        ? appointments.map((appt, idx) => ({
            date,
            // formatTime is mocked
            time: commonSlots?.[0] ? formatTime(commonSlots[0]) : "",
            technician: { id: assignedTechs[idx].id, name: assignedTechs[idx].name },
            services: appt
        }))
        : [];

    console.log("Appointments (services grouped):", appointments);
    console.log("Assigned Technicians:", assignedTechs);

    // Return the structured forms (if assigned) and the common time slots
    return { forms, times: commonSlots || [] };
};

// Functions exposed for testing (now defined as jest.fn() wrappers around the implementations)
var getCommonAvailableSlots = jest.fn(_getCommonAvailableSlotsImpl);
var assignTechnicians = jest.fn(_assignTechniciansImpl);
var fetchAvailability = jest.fn(_fetchAvailabilityImpl);


// --- JEST TEST SUITES ---

describe('getCommonAvailableSlots', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure the function under test executes its actual logic by default
        getCommonAvailableSlots.mockImplementation(_getCommonAvailableSlotsImpl);
    });

    // Mock calculateAvailableSlots to return distinct slots for Tech A and Tech B
    calculateAvailableSlots.mockImplementation((techAppointments, services, date, hours, tech) => {
        if (tech.id === 10) return [mockSlot1, mockSlot2]; // Alice: 10:00, 11:00
        if (tech.id === 20) return [mockSlot2, mockSlot3]; // Bob: 11:00, 12:00
        if (tech.id === 30) return [mockSlot3];            // Charlie: 12:00
        return [];
    });

    test('should return an empty array if assignedTechs is empty', () => {
        const result = getCommonAvailableSlots([], [], mockDate, new Map());
        expect(result).toEqual([]);
        expect(calculateAvailableSlots).not.toHaveBeenCalled();
    });

    test('should return all available slots for a single assigned technician', () => {
        const mockAppointments = [mockSelectedServices];
        const mockScheduleMap = new Map([[10, []]]);
        const result = getCommonAvailableSlots([mockTechA], mockAppointments, mockDate, mockScheduleMap);

        // Alice slots: [10:00, 11:00]
        expect(result).toEqual([mockSlot1, mockSlot2]);
        expect(calculateAvailableSlots).toHaveBeenCalledTimes(1);
    });

    test('should return the intersection of slots for multiple assigned technicians', () => {
        const mockAppointments = [mockSelectedServices, mockSelectedServices];
        const mockScheduleMap = new Map([[10, []], [20, []]]);

        // Alice slots: [10:00, 11:00]
        // Bob slots:   [11:00, 12:00]
        const result = getCommonAvailableSlots([mockTechA, mockTechB], mockAppointments, mockDate, mockScheduleMap);

        // Intersection: [11:00]
        expect(result).toEqual([mockSlot2]);
        expect(calculateAvailableSlots).toHaveBeenCalledTimes(2);
    });

    test('should return an empty array if there are no common slots across three technicians', () => {
        const mockAppointments = [mockSelectedServices, mockSelectedServices, mockSelectedServices];
        const mockScheduleMap = new Map([[10, []], [20, []], [30, []]]);

        // Alice:   [10:00, 11:00]
        // Bob:     [11:00, 12:00]
        // Charlie: [12:00]
        const result = getCommonAvailableSlots([mockTechA, mockTechB, mockTechC], mockAppointments, mockDate, mockScheduleMap);

        // Intersection: None
        expect(result).toEqual([]);
        expect(calculateAvailableSlots).toHaveBeenCalledTimes(3);
    });
});

describe('assignTechnicians', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure the function under test executes its actual logic by default
        assignTechnicians.mockImplementation(_assignTechniciansImpl);
        getCommonAvailableSlots.mockImplementation(_getCommonAvailableSlotsImpl); // Reset dependency
        // Setup mock schedule map to be empty for simplicity in this suite
        TechnicianService.getScheduleByDate.mockResolvedValue({ data: [{ id: 10, Appointments: [] }, { id: 20, Appointments: [] }, { id: 999, Appointments: [] }] });
    });

    afterEach(() => {
        // Use mockRestore() to clean up any temporary implementation overrides in the tests below
        getCommonAvailableSlots.mockRestore();
    });

    test('should return the "bestAllReal" assignment when available and slots are maximal', async () => {
        const appointments = [mockSelectedServices, mockSelectedServices];
        const appointmentTechMap = [
            [mockTechA, mockNoPrefTech],
            [mockTechB, mockNoPrefTech]
        ];

        // Mock the underlying slot logic for the backtracking combinations using mockImplementation:
        getCommonAvailableSlots.mockImplementation((techs) => {
            // Assignment (A, B) - All Real, 3 Slots
            if (techs.length === 2 && techs.every(t => t.name !== 'No Preference')) {
                return [mockSlot1, mockSlot2, mockSlot3];
            }
            // Assignment (A, NoPref) - Not All Real, 1 Slot
            if (techs.length === 2 && techs.some(t => t.name === 'No Preference')) {
                return [mockSlot1];
            }
            return [];
        });

        const result = await assignTechnicians(appointmentTechMap, appointments, mockDate);

        // Should prioritize the (A, B) combination
        expect(result.assignedTechs).toEqual([mockTechA, mockTechB]);
        expect(result.commonSlots.length).toBe(3);
        expect(result.commonSlots).toEqual([formatTime(mockSlot1), formatTime(mockSlot2), formatTime(mockSlot3)]);
    });

    test('should fallback to assignment with "No Preference" if no "all real" assignment is found', async () => {
        const appointments = [mockSelectedServices]; // One appointment
        const appointmentTechMap = [
            [mockTechA, mockNoPrefTech] // Can use either A or NoPref
        ];

        // Mock the underlying slot logic for the backtracking combinations:
        getCommonAvailableSlots.mockImplementation((techs) => {
            if (techs[0].id === 10) { // Tech A assignment - No slots
                return [];
            }
            if (techs[0].id === 999) { // No Preference assignment - 2 slots
                return [mockSlot1, mockSlot2];
            }
            return [];
        });

        const result = await assignTechnicians(appointmentTechMap, appointments, mockDate);

        // Should fallback to No Preference since Tech A returned no slots
        expect(result.assignedTechs).toEqual([mockNoPrefTech]);
        expect(result.commonSlots.length).toBe(2);
        expect(result.commonSlots).toEqual([formatTime(mockSlot1), formatTime(mockSlot2)]);
    });

    test('should return empty result if no assignment yields slots', async () => {
        const appointments = [mockSelectedServices, mockSelectedServices];
        const appointmentTechMap = [
            [mockTechA],
            [mockTechB]
        ];

        // Mock getCommonAvailableSlots to always return an empty array
        getCommonAvailableSlots.mockImplementation(() => []);

        const result = await assignTechnicians(appointmentTechMap, appointments, mockDate);

        expect(result.assignedTechs).toEqual([]);
        expect(result.commonSlots).toEqual([]);
    });
});

describe('fetchAvailability', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure the function under test executes its actual logic by default
        fetchAvailability.mockImplementation(_fetchAvailabilityImpl);

        // Base mocks for successful flow
        distributeItems.mockReturnValue([[mockService]]);
        TechnicianService.getAvailableTechnicians.mockResolvedValue({ data: [mockTechA] });

        // assignTechnicians is now a mock function, so mockResolvedValue works
        assignTechnicians.mockResolvedValue({
            assignedTechs: [mockTechA],
            commonSlots: [formatTime(mockSlot1), formatTime(mockSlot2)]
        });
    });

    test('should return early if date is missing or selectedServices is empty', async () => {
        // Missing date
        const resultMissingDate = await fetchAvailability(null, mockSelectedServices, mockGroupSize);
        expect(resultMissingDate).toEqual({ forms: [], times: [] });

        // Empty services
        const resultEmptyServices = await fetchAvailability(mockDate, [], mockGroupSize);
        expect(resultEmptyServices).toEqual({ forms: [], times: [] });

        expect(distributeItems).not.toHaveBeenCalled();
    });

    test('should return early if distributeItems yields no valid appointments', async () => {
        distributeItems.mockReturnValue([]);
        const result = await fetchAvailability(mockDate, mockSelectedServices, mockGroupSize);
        expect(result).toEqual({ forms: [], times: [] });
        expect(TechnicianService.getAvailableTechnicians).not.toHaveBeenCalled();
    });

    test('should extract unique category IDs correctly and call API', async () => {
        const mockServiceA = { id: 1, category_id: 101, duration: 30, quantity: 1 };
        const mockServiceB = { id: 2, category_id: 102, duration: 30, quantity: 1 };
        const mockServiceC = { id: 3, category_id: 101, duration: 30, quantity: 1 }; // Duplicate category

        const mockMultiServices = [mockServiceA, mockServiceB, mockServiceC];

        // One appointment containing all three services
        distributeItems.mockReturnValue([[mockServiceA, mockServiceB, mockServiceC]]);

        await fetchAvailability(mockDate, mockMultiServices, 1);

        // Check that TechnicianService.getAvailableTechnicians was called with unique categories [101, 102]
        expect(TechnicianService.getAvailableTechnicians).toHaveBeenCalledWith([101, 102]);
    });

    test('should successfully return forms and common slots upon full success', async () => {
        const expectedSlotStrings = [formatTime(mockSlot1), formatTime(mockSlot2)];
        const result = await fetchAvailability(mockDate, mockSelectedServices, mockGroupSize);

        expect(assignTechnicians).toHaveBeenCalled();

        // Check AvailabilityResult structure
        expect(result.times).toEqual(expectedSlotStrings);
        expect(result.forms.length).toBe(1);

        // Check BookingForm structure
        expect(result.forms[0]).toEqual({
            date: mockDate,
            // Should use the first common slot time
            time: expectedSlotStrings[0],
            technician: mockTechA,
            services: [mockService]
        });
    });

    test('should return empty forms if assignedTechs length is less than appointments length', async () => {
        // Mocking for two appointments, but assignTechnicians only assigns one tech
        distributeItems.mockReturnValue([[mockService], [mockService]]); // Two appointments (length 2)
        assignTechnicians.mockResolvedValue({
            assignedTechs: [mockTechA], // Only one tech assigned (length 1)
            commonSlots: [formatTime(mockSlot1)]
        });

        const result = await fetchAvailability(mockDate, mockSelectedServices, mockGroupSize);

        // Forms should be empty because 1 !== 2
        expect(result.forms).toEqual([]);

        // Slots should still be returned, as they represent the best time found
        expect(result.times).toEqual([formatTime(mockSlot1)]);
    });
});
