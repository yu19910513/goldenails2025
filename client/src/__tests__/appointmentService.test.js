import AppointmentService from "../services/appointmentService";
import http from "../common/NodeCommon";

jest.mock("../common/NodeCommon"); // Mock HTTP requests

describe("AppointmentService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByTechId", () => {
    it("should fetch upcoming appointments for a given technician ID", async () => {
      const mockResponse = { data: [{ id: 1, technician_id: 123, date: "2025-02-01" }] };
      http.get.mockResolvedValue(mockResponse);

      const response = await AppointmentService.findByTechId(123);
      expect(http.get).toHaveBeenCalledWith("/appointments/upcoming?tech_id=123");
      expect(response).toEqual(mockResponse);
    });

    it("should handle errors when fetching upcoming appointments", async () => {
      http.get.mockRejectedValue(new Error("Network Error"));

      await expect(AppointmentService.findByTechId(123)).rejects.toThrow("Network Error");
    });
  });

  describe("create", () => {
    it("should create a new appointment successfully", async () => {
      const appointmentData = {
        date: "2025-02-01",
        customer_id: 101,
        services: [{ service_id: 1, duration: 30 }],
        technician_id: 123,
      };
      const mockResponse = { data: { id: 1, ...appointmentData } };
      http.post.mockResolvedValue(mockResponse);

      const response = await AppointmentService.create(appointmentData);
      expect(http.post).toHaveBeenCalledWith("/appointments", appointmentData);
      expect(response).toEqual(mockResponse);
    });

    it("should handle errors when creating an appointment", async () => {
      http.post.mockRejectedValue(new Error("Failed to create appointment"));

      await expect(AppointmentService.create({})).rejects.toThrow("Failed to create appointment");
    });
  });

  describe("customer_history", () => {
    it("should fetch appointment history for a given customer ID", async () => {
      const mockResponse = { data: [{ id: 1, customer_id: 101, date: "2025-01-15" }] };
      http.get.mockResolvedValue(mockResponse);

      const response = await AppointmentService.customer_history(101);
      expect(http.get).toHaveBeenCalledWith("/appointments/customer_history?customer_id=101");
      expect(response).toEqual(mockResponse);
    });

    it("should handle errors when fetching customer history", async () => {
      http.get.mockRejectedValue(new Error("Error fetching customer history"));

      await expect(AppointmentService.customer_history(101)).rejects.toThrow("Error fetching customer history");
    });
  });

  describe("soft_delete", () => {
    it("should soft delete an appointment by updating its note to 'deleted'", async () => {
      const mockResponse = { data: { success: true } };
      http.put.mockResolvedValue(mockResponse);

      const response = await AppointmentService.soft_delete(5);
      expect(http.put).toHaveBeenCalledWith("/appointments/update_note", { id: 5, note: "deleted" });
      expect(response).toEqual(mockResponse);
    });

    it("should handle errors when soft deleting an appointment", async () => {
      http.put.mockRejectedValue(new Error("Failed to delete appointment"));

      await expect(AppointmentService.soft_delete(5)).rejects.toThrow("Failed to delete appointment");
    });
  });
});
