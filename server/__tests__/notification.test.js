// Importing necessary modules
const notification = require('../utils/notification'); // Adjust the path
const { sendSMS, sendEmailNotification } = notification;
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Mocking external dependencies
jest.mock('twilio');
jest.mock('nodemailer');
jest.mock('../utils/helper', () => ({
    generateHtmlFromTemplate: jest.fn(() => '<div>Mock HTML</div>')
}));

// Test Suite
describe('Notification Functions', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test contamination
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    // Test for sendSMS function
    describe('sendSMS', () => {
        it('should send an SMS message successfully', async () => {
            // Mock Twilio client
            const mockCreate = jest.fn().mockResolvedValue({ sid: 'mockSid' });
            twilio.mockImplementation(() => ({ messages: { create: mockCreate } }));

            const recipientPhoneNumber = '+15551234567';
            const message = 'Test Message';

            const result = await sendSMS(recipientPhoneNumber, message);

            expect(result).toEqual({ sid: 'mockSid' });
            expect(mockCreate).toHaveBeenCalledWith({
                body: message,
                from: `+1${process.env.TWILIO_NUMBER}`,
                to: recipientPhoneNumber,
            });
        });

        it('should normalize recipient number by prepending +1 when missing +', async () => {
            const mockCreate = jest.fn().mockResolvedValue({ sid: 'mockSid2' });
            twilio.mockImplementation(() => ({ messages: { create: mockCreate } }));

            const recipientPhoneNumber = '5551234567'; // no leading +
            const message = 'Hello';

            const result = await sendSMS(recipientPhoneNumber, message);

            expect(result).toEqual({ sid: 'mockSid2' });
            expect(mockCreate).toHaveBeenCalledWith({
                body: message,
                from: `+1${process.env.TWILIO_NUMBER}`,
                to: `+1${recipientPhoneNumber}`,
            });
        });

        it('should return an error object if SMS fails', async () => {
            const mockCreate = jest.fn().mockRejectedValue(new Error('Twilio error'));
            twilio.mockImplementation(() => ({ messages: { create: mockCreate } }));

            const recipientPhoneNumber = '+15551234567';
            const message = 'Test Message';

            const result = await sendSMS(recipientPhoneNumber, message);

            expect(result).toEqual({
                success: false,
                error: 'Twilio error'
            });
        });
    });

    // Test for sendEmail function
    describe('sendEmail', () => {
        it('should send an email successfully', async () => {
            // Mock nodemailer transporter
            const mockSendMail = jest.fn().mockResolvedValue({ response: 'Email sent' });
            nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

            const email_object = {
                address: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test Text',
                html: '<h1>Test HTML</h1>',
            };

            await notification.sendEmail(email_object);

            expect(mockSendMail).toHaveBeenCalledWith({
                from: process.env.BUSINESS_EMAIL,
                to: email_object.address,
                subject: email_object.subject,
                text: email_object.text,
                html: email_object.html,
            });
        });

        it('should return an error object if email fails to send', async () => {
            const mockSendMail = jest.fn().mockRejectedValue(new Error('Nodemailer error'));
            nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

            const email_object = {
                address: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test Text',
                html: '<h1>Test HTML</h1>',
            };

            const result = await notification.sendEmail(email_object);

            expect(result).toEqual({
                success: false,
                error: 'Nodemailer error'
            });
        });
    });

    // Test for sendEmailNotification function
    describe('sendEmailNotification', () => {
        it('should send an email notification with valid recipients', async () => {
            const email_object = {
                address: ['test@example.com'],
                subject: 'Appointment Reminder',
                text: 'Appointment Details',
                html: '<h1>Appointment Details</h1>',
            };

            const mockSendEmail = jest.fn().mockResolvedValue(undefined);
            jest.spyOn(notification.emailApi, 'sendEmail').mockImplementation(mockSendEmail);

            const data_object = { appointmentDate: '2025-03-01', patientName: 'John Doe' };
            const role = 'user';

            await sendEmailNotification(email_object.address, email_object.subject, role, data_object);

            expect(mockSendEmail).toHaveBeenCalledWith({
                address: email_object.address,
                subject: email_object.subject,
                text: expect.any(String), // The appointment message text
                html: expect.any(String), // The generated HTML from template
            });
        });

        it('should log a warning if no valid email is provided', () => {
            const logSpy = jest.spyOn(console, 'warn').mockImplementation();
            sendEmailNotification([], 'Appointment Reminder', 'admin', {});
            expect(logSpy).toHaveBeenCalledWith('No valid email provided for admin. Skipping email.');
        });
    });

});
