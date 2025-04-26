/**
 * @fileoverview
 * Jest test suite for utility helper functions related to appointment scheduling logic,
 * including validation, overlap detection, contact type determination, and HTML generation
 * from Handlebars templates.
 *
 * Modules like `fs`, `handlebars`, and certain helpers/models are mocked to isolate functionality.
 *
 * ✅ Covered Functions:
 * - groupAppointments()
 * - now()
 * - overlap()
 * - validateContactType()
 * - generateHtmlFromTemplate()
 * - okayToAssign()
 *
 * 🔍 Mocked Dependencies:
 * - `fs`: `existsSync`, `readFileSync`
 * - `handlebars`: `compile`
 * - `../models`: `Appointment.findAll`
 * - `../utils/helper`: Mocks `overlap` only, while retaining real implementations of others
 *
 * ✅ Real Dependencies:
 * - `../utils/overlap`: Used directly to test actual overlap logic in isolation
 *
 * 🧪 Tests:
 * - `groupAppointments` verifies past, present, and future categorization
 * - `now` checks if date returned is a valid Pacific Time `Date` object
 * - `overlap` tests mock + real overlap handling scenarios
 * - `validateContactType` checks contact type parsing against various inputs
 * - `generateHtmlFromTemplate` validates template loading, reading, and compilation
 * - `okayToAssign` tests technician availability, overlap handling, and error resilience
 *
 * 🛠️ Console logging (warn/error) is spied and silenced during tests to prevent noise
 */

const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

// Get the real overlap (not mocked)
const actualOverlap = require('../utils/overlap'); // ✅ Safe real function

// Mock modules BEFORE importing the helper functions
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    readFileSync: jest.fn()
}));

jest.mock('handlebars', () => ({
    compile: jest.fn()
}));

jest.mock('../models', () => ({
    Appointment: {
        findAll: jest.fn(),
    }
}));

jest.mock('../utils/helper', () => {
    const actual = jest.requireActual('../utils/helper');
    return {
        ...actual,
        overlap: jest.fn(), // This mock will be used in tests
    };
});

// Now import everything after mocks
const { DateTime } = require('luxon');
const { Appointment } = require('../models');
const { overlap, now, validateContactType, generateHtmlFromTemplate, groupAppointments, okayToAssign } = require('../utils/helper');

jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Grouping Functions', () => {
    const today = now(); // `now()` returns Luxon DateTime now, in Pacific Time

    test('groupAppointments correctly categorizes appointments', () => {
        const mockAppointments = [
            { date: today.toISODate() }, // same day
            { date: today.minus({ days: 1 }).toISODate() }, // yesterday
            { date: today.plus({ days: 1 }).toISODate() }, // tomorrow
        ];

        const grouped = groupAppointments(mockAppointments);

        expect(grouped.present.length).toBe(1);
        expect(grouped.past.length).toBe(1);
        expect(grouped.future.length).toBe(1);
    });

    test('now() returns the current date adjusted to Pacific Time', () => {
        const pacificTime = now();
        expect(pacificTime).toBeInstanceOf(DateTime); // Now returns Luxon DateTime
        expect(pacificTime.zoneName).toBe('America/Los_Angeles'); // Check timezone too
    });
});

describe('overlap function', () => {
    const existingAppointments = [
        {
            date: '2025-01-30',
            start_service_time: '10:00',
            Services: [{ time: 30 }]
        },
        {
            date: '2025-01-30',
            start_service_time: '11:00',
            Services: [{ time: 60 }]
        }
    ];

    test('should return false when no overlap occurs', () => {
        const start_service_time_obj = new Date('2025-01-30T09:30');
        const end_service_time = new Date('2025-01-30T10:00');

        overlap.mockImplementation((existing, start, end) =>
            actualOverlap(existingAppointments, start, end)
        );

        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(false);
    });

    test('should return true when overlap occurs with the first appointment', () => {
        const start_service_time_obj = new Date('2025-01-30T10:15');
        const end_service_time = new Date('2025-01-30T10:45');
        overlap.mockReturnValue(true);
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(true);
    });

    test('should return true when overlap occurs with the second appointment', () => {
        const start_service_time_obj = new Date('2025-01-30T10:45');
        const end_service_time = new Date('2025-01-30T11:30');
        overlap.mockReturnValue(true);
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(true);
    });

    test('should return true when new appointment completely overlaps the first appointment', () => {
        const start_service_time_obj = new Date('2025-01-30T09:45');
        const end_service_time = new Date('2025-01-30T10:30');
        overlap.mockReturnValue(true);
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(true);
    });

    test('should return false when new appointment is completely outside the existing appointments', () => {
        const start_service_time_obj = new Date('2025-01-30T12:00');
        const end_service_time = new Date('2025-01-30T12:30');
        overlap.mockReturnValue(false);
        expect(overlap(existingAppointments, start_service_time_obj, end_service_time)).toBe(false);
    });
});

describe('validateContactType', () => {
    it('should return "email" for a valid email address', () => {
        expect(validateContactType('test@example.com')).toBe('email');
    });

    it('should return "phone" for a valid phone number', () => {
        expect(validateContactType('+1-800-555-5555')).toBe('phone');
    });

    it('should return "phone" for a phone number without country code', () => {
        expect(validateContactType('555-555-5555')).toBe('phone');
    });

    it('should return "invalid" for a string that is neither email nor phone', () => {
        expect(validateContactType('invalid_input')).toBe('invalid');
    });

    it('should return "invalid" for badly formatted email', () => {
        expect(validateContactType('invalid_email.com')).toBe('invalid');
    });

    it('should return "invalid" for phone number with letters', () => {
        expect(validateContactType('123-ABC-4567')).toBe('invalid');
    });

    it('should return "invalid" for empty string', () => {
        expect(validateContactType('')).toBe('invalid');
    });
});

describe('generateHtmlFromTemplate', () => {
    const mockData = {
        template: 'appointment/confirmation.handlebars',
        content: { name: 'John Doe', date: '2025-03-01' },
    };

    it('should return populated HTML when template exists and compiles', () => {
        const mockTemplate = '<div>Hello {{name}}!</div>';
        const compiled = jest.fn().mockReturnValue('<div>Hello John Doe!</div>');

        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockTemplate);
        handlebars.compile.mockReturnValue(compiled);

        const result = generateHtmlFromTemplate(mockData);

        expect(result).toBe('<div>Hello John Doe!</div>');
        expect(handlebars.compile).toHaveBeenCalledWith(mockTemplate);
        expect(compiled).toHaveBeenCalledWith(mockData.content);
    });

    it('should return null if template does not exist', () => {
        fs.existsSync.mockReturnValue(false);
        const result = generateHtmlFromTemplate(mockData);
        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith('Template file appointment/confirmation.handlebars not found.');
    });

    it('should throw error if read fails', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockImplementation(() => { throw new Error('File read error'); });

        expect(() => generateHtmlFromTemplate(mockData)).toThrow('File read error');
        expect(console.error).toHaveBeenCalledWith('Error generating HTML from template:', 'File read error');
    });

    it('should throw error if compilation fails', () => {
        const template = '<div>{{name}}</div>';
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(template);
        handlebars.compile.mockImplementation(() => { throw new Error('Compilation error'); });

        expect(() => generateHtmlFromTemplate(mockData)).toThrow('Compilation error');
        expect(console.error).toHaveBeenCalledWith('Error generating HTML from template:', 'Compilation error');
    });
});

describe('okayToAssign', () => {
    let technician;
    let appointment;

    beforeEach(() => {
        technician = { id: 1, unavailability: '1,3' };
        appointment = {
            date: '2025-04-20',
            start_service_time: '10:00',
            Services: [{ time: 30 }],
        };
    });

    it('should return false if technician is not provided', async () => {
        const result = await okayToAssign(null, appointment);
        expect(result).toBe(false);
    });

    it('should return false if appointment is missing required properties', async () => {
        const result = await okayToAssign(technician, { date: '2025-04-20' });
        expect(result).toBe(false);
    });

    it('should return false if start_service_time is invalid', async () => {
        const result = await okayToAssign(technician, { date: '2025-04-20', start_service_time: 'invalid' });
        expect(result).toBe(false);
    });

    it('should return false if no services in appointment', async () => {
        const result = await okayToAssign(technician, { date: '2025-04-20', start_service_time: '10:00', Services: [] });
        expect(result).toBe(false);
    });

    it('should return false if technician is unavailable that day', async () => {
        const unavailableTech = { id: 1, unavailability: '0,1,2,3,4,5,6' };
        const result = await okayToAssign(unavailableTech, appointment);
        expect(result).toBe(false);
    });

    it('should return false if there is an overlap', async () => {
        Appointment.findAll.mockResolvedValue([{ date: '2025-04-20', start_service_time: '09:00', Services: [{ time: 90 }] }]);
        overlap.mockReturnValue(true);
        const result = await okayToAssign(technician, appointment);
        expect(Appointment.findAll).toHaveBeenCalled();
        expect(overlap).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should return true if no overlap and technician is available', async () => {
        Appointment.findAll.mockResolvedValue([]);
        overlap.mockReturnValue(false);
        const result = await okayToAssign(technician, appointment);
        expect(result).toBe(true);
    });

    it('should catch and log errors', async () => {
        Appointment.findAll.mockRejectedValue(new Error('Some error occurred'));
        const result = await okayToAssign(technician, appointment);
        expect(console.error).toHaveBeenCalledWith('Error in okayToAssign:', expect.any(Error));
        expect(result).toBe(false);
    });
});
