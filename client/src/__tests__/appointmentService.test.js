import AppointmentService from "../services/appointmentService";

describe('AppointmentService', () => {
  let service;

  beforeEach(() => {
    service = AppointmentService;
    // Mock the http client methods:
    service.http.get = jest.fn();
    service.http.post = jest.fn();
    service.http.put = jest.fn();
  });

  describe('getTechnicianGroupedAppointments', () => {
    it('throws error on invalid date format', () => {
      expect(() => service.getTechnicianGroupedAppointments('invalid-date')).toThrow(
        'Invalid date format. Expected YYYY-MM-DD.'
      );
    });

    it('calls http.get with correct URL for valid date', () => {
      const date = '2025-02-20';
      service.getTechnicianGroupedAppointments(date);
      expect(service.http.get).toHaveBeenCalledWith(`/appointments/calender?date=${date}`);
    });
  });

  describe('findByTechId', () => {
    it('calls http.get with correct URL and technician ID', () => {
      const techId = 123;
      service.findByTechId(techId);
      expect(service.http.get).toHaveBeenCalledWith(`/appointments/upcoming?tech_id=${techId}`);
    });
  });

  describe('create', () => {
    it('calls http.post with correct URL and appointment data', () => {
      const data = { customer_id: 1, date: '2025-01-25', start_service_time: '14:00', technician_id: [2], service_ids: [3] };
      service.create(data);
      expect(service.http.post).toHaveBeenCalledWith('/appointments', data);
    });
  });

  describe('customer_history', () => {
    it('calls http.get with correct URL and customer ID', () => {
      const customerId = 5;
      service.customer_history(customerId);
      expect(service.http.get).toHaveBeenCalledWith(`/appointments/customer_history?customer_id=${customerId}`);
    });
  });

  describe('soft_delete', () => {
    it('calls http.put with correct URL and data for soft delete', () => {
      const apptId = 7;
      service.soft_delete(apptId);
      expect(service.http.put).toHaveBeenCalledWith('/appointments/update_note', { id: apptId, note: 'deleted' });
    });
  });

  describe('search', () => {
    it('calls http.get with correct URL and keyword', () => {
      const keyword = 'john';
      service.search(keyword);
      expect(service.http.get).toHaveBeenCalledWith(`/appointments/search?keyword=${keyword}`);
    });
  });

  describe('find_alternative_techs', () => {
    it('calls http.get with correct URL and appointment ID', () => {
      const apptId = '123';
      service.find_alternative_techs(apptId);
      expect(service.http.get).toHaveBeenCalledWith(`/appointments/find_alternative_techs?id=${apptId}`);
    });
  });

  describe('update_technician', () => {
    it('calls http.put with correct URL and data', () => {
      const apptId = 10;
      const techId = 20;
      service.update_technician(apptId, techId);
      expect(service.http.put).toHaveBeenCalledWith('/appointments/update_technician', { id: apptId, technician_id: techId });
    });
  });
});
