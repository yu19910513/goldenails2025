const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { groupAppointments, overlap, now, validateContactType, generateHtmlFromTemplate } = require('../utils/helper');

describe('Grouping Functions', () => {
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

describe('validateContactType', () => {
    it('should return "email" for a valid email address', () => {
        const result = validateContactType('test@example.com');
        expect(result).toBe('email');
    });

    it('should return "phone" for a valid phone number', () => {
        const result = validateContactType('+1-800-555-5555');
        expect(result).toBe('phone');
    });

    it('should return "phone" for a phone number without country code', () => {
        const result = validateContactType('555-555-5555');
        expect(result).toBe('phone');
    });

    it('should return "invalid" for a string that is neither an email nor a phone number', () => {
        const result = validateContactType('invalid_input');
        expect(result).toBe('invalid');
    });

    it('should return "invalid" for an email with incorrect format', () => {
        const result = validateContactType('invalid_email.com');
        expect(result).toBe('invalid');
    });

    it('should return "invalid" for a phone number with invalid characters', () => {
        const result = validateContactType('123-ABC-4567');
        expect(result).toBe('invalid');
    });

    it('should return "invalid" for an empty string', () => {
        const result = validateContactType('');
        expect(result).toBe('invalid');
    });
});

describe('generateHtmlFromTemplate', () => {
    jest.mock('fs'); // Mock fs module
    jest.mock('path'); // Mock path module
    jest.mock('handlebars'); // Mock Handlebars module
    const mockData = {
        template: 'appointment/confirmation.handlebars',
        content: { name: 'John Doe', date: '2025-03-01' },
    };

    it('should return populated HTML when template exists and is compiled successfully', () => {
        // Arrange
        const mockTemplate = '<div>Hello {{name}}!</div>';
        const mockCompiledTemplate = jest.fn().mockReturnValue('<div>Hello John Doe!</div>');

        fs.existsSync.mockReturnValue(true); // Simulate that the template file exists
        fs.readFileSync.mockReturnValue(mockTemplate); // Simulate reading the template file
        handlebars.compile.mockReturnValue(mockCompiledTemplate); // Return the compiled template mock

        // Act
        const result = generateHtmlFromTemplate(mockData);

        // Assert
        expect(result).toBe('<div>Hello John Doe!</div>');
        expect(handlebars.compile).toHaveBeenCalledWith(mockTemplate);
        expect(mockCompiledTemplate).toHaveBeenCalledWith(mockData.content);
    });

    it('should return null if template file does not exist', () => {
        // Arrange
        fs.existsSync.mockReturnValue(false); // Simulate that the template file does not exist

        // Act
        const result = generateHtmlFromTemplate(mockData);

        // Assert
        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith('Template file appointment/confirmation.handlebars not found.');
    });

    it('should throw an error if reading the template or compiling fails', () => {
        // Arrange
        fs.existsSync.mockReturnValue(true); // Simulate that the template file exists
        fs.readFileSync.mockImplementation(() => { throw new Error('File read error'); }); // Simulate an error reading the file

        // Act & Assert
        expect(() => generateHtmlFromTemplate(mockData)).toThrow('File read error');
        expect(console.error).toHaveBeenCalledWith("Error generating HTML from template:", 'File read error');
    });

    it('should throw an error if template compilation fails', () => {
        // Arrange
        const mockTemplate = '<div>{{name}}</div>';
        fs.existsSync.mockReturnValue(true); // Simulate that the template file exists
        fs.readFileSync.mockReturnValue(mockTemplate); // Simulate reading the template file
        handlebars.compile.mockImplementation(() => { throw new Error('Compilation error'); }); // Simulate compilation error

        // Act & Assert
        expect(() => generateHtmlFromTemplate(mockData)).toThrow('Compilation error');
        expect(console.error).toHaveBeenCalledWith("Error generating HTML from template:", 'Compilation error');
    });
});
