const { groupAppointments, overlap, now } = require('../utils/helper');
const dotenv = require('dotenv');
dotenv.config();



describe('Utility Functions', () => {
    const today = now();
    test('groupAppointments correctly categorizes appointments', () => {
        const mockAppointments = [
            { date: today.toISOString().split('T')[0] }, // Today
            { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0] },
            { date: new Date(today.getTime() + 86400000).toISOString().split('T')[0] },
        ];
        const grouped = groupAppointments(mockAppointments);
        expect(grouped.present.length).toBe(1);
        expect(grouped.past.length).toBe(1);
        expect(grouped.future.length).toBe(1);
    });

    test('now() returns the current date adjusted to Pacific Time', () => {
        const pacificTime = now();
        expect(pacificTime).toBeInstanceOf(Date);
    });
});

describe('overlap function', () => {
    const existingAppointments = [
        {
            date: '2025-01-30',
            start_service_time: '10:00',
            Services: [{ time: 30 }] // Service duration is 30 minutes
        },
        {
            date: '2025-01-30',
            start_service_time: '11:00',
            Services: [{ time: 60 }] // Service duration is 60 minutes
        }
    ];


    test('should return false when no overlap occurs', () => {
        const start_service_time_obj = new Date('2025-01-30T09:30');
        const end_service_time = new Date('2025-01-30T10:00');
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(false);
    });

    test('should return true when overlap occurs with the first appointment', () => {
        const start_service_time_obj = new Date('2025-01-30T10:15');
        const end_service_time = new Date('2025-01-30T10:45');
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(true);
    });

    test('should return true when overlap occurs with the second appointment', () => {
        const start_service_time_obj = new Date('2025-01-30T10:45');
        const end_service_time = new Date('2025-01-30T11:30');
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(true);
    });

    test('should return true when new appointment completely overlaps the first appointment', () => {
        const start_service_time_obj = new Date('2025-01-30T09:45');
        const end_service_time = new Date('2025-01-30T10:30');
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(true);
    });

    test('should return false when new appointment is completely outside the existing appointments', () => {
        const start_service_time_obj = new Date('2025-01-30T12:00');
        const end_service_time = new Date('2025-01-30T12:30');
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(false);
    });
});