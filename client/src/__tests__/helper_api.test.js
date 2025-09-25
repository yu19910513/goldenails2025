import { getCommonAvailableSlots } from "../utils/helper_api";
import AppointmentService from "../services/appointmentService";
import { calculateAvailableSlots, groupServicesByCategory, getBusinessHours } from "../utils/helper";
import { DateTime } from "luxon";

// Mock API & utils
jest.mock("../services/appointmentService");
jest.mock("../utils/helper");

describe("getCommonAvailableSlots", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return empty array if all techs are null", async () => {
        const result = await getCommonAvailableSlots([null, null], [], "2025-09-25");
        expect(result).toEqual([]);
    });

    it("should intersect slots correctly for multiple techs", async () => {
        const tech1 = { id: 1, name: "Tech A" };
        const tech2 = { id: 2, name: "Tech B" };
        const appointments = [
            [{ id: "svc1", category_id: 1 }],
            [{ id: "svc2", category_id: 2 }]
        ];

        const slot1 = DateTime.fromISO("2025-09-25T10:00:00").toJSDate();
        const slot2 = DateTime.fromISO("2025-09-25T11:00:00").toJSDate();
        const slot3 = DateTime.fromISO("2025-09-25T12:00:00").toJSDate();

        // Mock findByTechId
        AppointmentService.findByTechId.mockImplementation((techId) => {
            if (techId === 1) {
                return Promise.resolve({ data: [{ start: slot1 }, { start: slot2 }] });
            } else {
                return Promise.resolve({ data: [{ start: slot2 }, { start: slot3 }] });
            }
        });

        // Mock utilities
        calculateAvailableSlots.mockImplementation((techAppointments) => {
            return techAppointments.map(a => a.start);
        });
        groupServicesByCategory.mockImplementation(appt => appt);
        getBusinessHours.mockReturnValue({ start: "08:00", end: "18:00" });

        const result = await getCommonAvailableSlots([tech1, tech2], appointments, "2025-09-25");
        expect(result).toEqual([slot2]); // only slot2 is common
    });

    it("should return empty array if no common slots", async () => {
        const tech1 = { id: 1, name: "Tech A" };
        const tech2 = { id: 2, name: "Tech B" };
        const appointments = [
            [{ id: "svc1", category_id: 1 }],
            [{ id: "svc2", category_id: 2 }]
        ];

        // Mock findByTechId (we just need it to return some appointments, could be empty too)
        AppointmentService.findByTechId.mockImplementation((techId) => {
            return Promise.resolve({ data: [] }); // no pre-existing appointments
        });

        // Mock calculateAvailableSlots to return different slots for each tech
        calculateAvailableSlots.mockImplementation((techAppointments, groupedServices, date, businessHours, tech) => {
            if (tech.id === 1) {
                return [DateTime.fromISO("2025-09-25T10:00:00").toJSDate()];
            } else if (tech.id === 2) {
                return [DateTime.fromISO("2025-09-25T11:00:00").toJSDate()];
            }
            return [];
        });

        groupServicesByCategory.mockImplementation(appt => appt);
        getBusinessHours.mockReturnValue({ start: "08:00", end: "18:00" });

        const result = await getCommonAvailableSlots([tech1, tech2], appointments, "2025-09-25");

        expect(result).toEqual([]); // correctly no overlapping slots
    });
});
