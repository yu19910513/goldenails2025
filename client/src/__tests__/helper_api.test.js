// __tests__/helper_api.test.js
import AppointmentService from "../services/appointmentService";
import TechnicianService from "../services/technicianService";
import * as Helper from "../utils/helper";
import { getCommonAvailableSlots, fetchAvailability } from "../utils/helper_api";
import { DateTime } from "luxon";

// Mock API & utils
jest.mock("../services/appointmentService");
jest.mock("../services/technicianService");
jest.mock("../utils/helper");

describe("getCommonAvailableSlots", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns empty array if all techs are null", async () => {
        const result = await getCommonAvailableSlots([null, null], [], "2025-09-25");
        expect(result).toEqual([]);
    });

    it("intersects slots correctly for multiple techs", async () => {
        const tech1 = { id: 1, name: "Tech A" };
        const tech2 = { id: 2, name: "Tech B" };
        const appointments = [[{ id: "svc1", category_id: 1 }], [{ id: "svc2", category_id: 2 }]];

        const slot1 = DateTime.fromISO("2025-09-25T10:00:00").toJSDate();
        const slot2 = DateTime.fromISO("2025-09-25T11:00:00").toJSDate();
        const slot3 = DateTime.fromISO("2025-09-25T12:00:00").toJSDate();

        AppointmentService.findByTechId.mockImplementation((techId) => {
            if (techId === 1) return Promise.resolve({ data: [{ start: slot1 }, { start: slot2 }] });
            return Promise.resolve({ data: [{ start: slot2 }, { start: slot3 }] });
        });

        Helper.calculateAvailableSlots.mockImplementation((techAppointments) =>
            techAppointments.map((a) => a.start)
        );
        Helper.groupServicesByCategory.mockImplementation((appt) => appt);
        Helper.getBusinessHours.mockReturnValue({ start: "08:00", end: "18:00" });

        const result = await getCommonAvailableSlots([tech1, tech2], appointments, "2025-09-25");
        expect(result).toEqual([slot2]);
    });

    it("returns empty array if no common slots", async () => {
        const tech1 = { id: 1, name: "Tech A" };
        const tech2 = { id: 2, name: "Tech B" };
        const appointments = [[{ id: "svc1", category_id: 1 }], [{ id: "svc2", category_id: 2 }]];

        AppointmentService.findByTechId.mockResolvedValue({ data: [] });

        Helper.calculateAvailableSlots.mockImplementation((_, __, ___, ____, tech) => {
            if (tech.id === 1) return [DateTime.fromISO("2025-09-25T10:00:00").toJSDate()];
            if (tech.id === 2) return [DateTime.fromISO("2025-09-25T11:00:00").toJSDate()];
            return [];
        });
        Helper.groupServicesByCategory.mockImplementation((appt) => appt);
        Helper.getBusinessHours.mockReturnValue({ start: "08:00", end: "18:00" });

        const result = await getCommonAvailableSlots([tech1, tech2], appointments, "2025-09-25");
        expect(result).toEqual([]);
    });
});

describe("fetchAvailability", () => {
    const date = "2025-09-28";
    const selectedServices = [{ id: 1, name: "Haircut", category_id: 10, quantity: 2 }];
    const groupSize = 2;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns empty forms and times if date or services are missing", async () => {
        expect(await fetchAvailability("", selectedServices, groupSize, jest.fn())).toEqual({
            forms: [],
            times: [],
        });
        expect(await fetchAvailability(date, [], groupSize, jest.fn())).toEqual({
            forms: [],
            times: [],
        });
    });

    it("generates forms with assigned technicians and common slots", async () => {
        const appointmentsMock = [[selectedServices[0]]];
        Helper.distributeItems.mockReturnValue(appointmentsMock);

        const techMock = [{ id: 101, name: "Alice" }];
        TechnicianService.getAvailableTechnicians.mockResolvedValue({ data: techMock });

        // Mock assignTechnicians to return { assignedTechs, commonSlots }
        const commonSlotsMock = [new Date("2025-09-28T10:00:00")];
        Helper.assignTechnicians.mockResolvedValue({
            assignedTechs: techMock,
            commonSlots: commonSlotsMock
        });

        Helper.formatTime.mockImplementation((d) => d.toISOString());

        const getSlotsMock = jest.fn(); // still passed to fetchAvailability but ignored by our assignTechs mock

        const result = await fetchAvailability(date, selectedServices, groupSize, getSlotsMock);

        expect(Helper.distributeItems).toHaveBeenCalledWith(
            [selectedServices[0], selectedServices[0]],
            groupSize
        );
        expect(TechnicianService.getAvailableTechnicians).toHaveBeenCalledWith([10]);
        expect(Helper.assignTechnicians).toHaveBeenCalledWith(
            expect.any(Array),
            getSlotsMock,
            appointmentsMock,
            date
        );

        expect(result.forms[0]).toEqual({
            date,
            time: commonSlotsMock[0].toISOString(),
            technician: { id: 101, name: "Alice" },
            services: appointmentsMock[0],
        });
        expect(result.times).toEqual(commonSlotsMock);
    });

    it("handles no appointments after distributing services", async () => {
        Helper.distributeItems.mockReturnValue([]);
        const getSlotsMock = jest.fn();
        const result = await fetchAvailability(date, selectedServices, groupSize, getSlotsMock);
        expect(result).toEqual({ forms: [], times: [] });
    });
});
