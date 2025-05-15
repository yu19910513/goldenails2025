import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculateTotalTime } from "../../utils/helper";
import "./AppointmentConfirmation.css"; // Import the CSS file
import NotificationService from "../../services/notificationService";
import MiscellaneousService from "../../services/miscellaneousService";

const AppointmentConfirmation = ({ appointmentDetails }) => {
    const navigate = useNavigate();
    const optInSMS = localStorage.getItem("smsOptIn");
    // Extract service names
    const serviceNames = Object.values(appointmentDetails.services).flatMap((category) =>
        category.map((service) => service.name)
    );

    // Calculate total duration in minutes
    const duration = calculateTotalTime(appointmentDetails.services);

    // Format the start time
    const formattedSlot = appointmentDetails.slot
        ? new Date(appointmentDetails.slot).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : "N/A";

    // Calculate and format the end time
    const endTime = appointmentDetails.slot
        ? new Date(
            new Date(appointmentDetails.slot).getTime() + duration * 60000
        ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : "N/A";

    // Format the slot to a readable date string
    const formattedDate = appointmentDetails.slot
        ? new Date(appointmentDetails.slot).toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "N/A";

    /**
 * Sends an appointment confirmation notification via SMS and email.
 * 
 * This function gathers appointment details and sends a notification using `NotificationService.notify()`.
 * If required data is missing, an error is logged and the function exits early.
 * 
 * @async
 * @function sendAppointmentNotification
 * @throws {Error} Logs an error if the notification fails to send.
 */
    const sendAppointmentNotification = async () => {
        try {
            if (!appointmentDetails?.customerInfo || !appointmentDetails?.technician) {
                console.error("Missing appointment or technician details.");
                return;
            }

            const { name, phone, email } = appointmentDetails.customerInfo;
            const { name: technicianName } = appointmentDetails.technician;

            const messageData = {
                recipient_name: name,
                recipient_phone: phone,
                recipient_email_address: email,
                recipient_email_subject: "Appointment Confirmation",
                recipient_optInSMS: optInSMS,
                action: "confirm",
                appointment_date: formattedDate,
                appointment_start_time: formattedSlot,
                appointment_end_time: endTime,
                appointment_services: serviceNames.join(", "),
                appointment_technician: technicianName,
                owner_email_subject: "New Appointment",
            };

            await NotificationService.notify(messageData);
            console.log("SMS sent successfully");
        } catch (error) {
            console.error("Failed to send SMS:", error);
        }
    };


    useEffect(() => {
        const fetchPermission = async () => {
            try {
                const permissionResponse = await MiscellaneousService.find("smsFeature");
                console.log(permissionResponse.data.context);
                if (permissionResponse.data && permissionResponse.data.context == "on") {
                    sendAppointmentNotification();
                }

            } catch (error) {
                console.error("Error fetching permission data:", error);
            }
        };
        fetchPermission();
    }, []);


    return (
        <div className="appointment-confirmation-container">
            <h2 className="title">Appointment Confirmed</h2>
            <p className="thank-you">We appreciate your booking and look forward to welcoming you.</p>
            <p className="details">
                Please find your appointment details below. We kindly ask that you arrive 5 minutes early and check in at the following address:
            </p>
            <address className="address">3610 Grandview St, Gig Harbor, WA 98335</address>
            <p className="instructions">
                To review or manage your appointment details, please use the 'Appointment History' section in the top navigation bar. Simply enter your phone number and name to access your records.
                Should there be any changes to your appointment, we will notify you via phone or text and update your online appointment record accordingly.
                If you need to cancel or modify your appointment, you may use the 'Appointment History' to do so or contact us at <strong>253-851-7563</strong>.
            </p>
            <div className="appointment-details">
                <p><strong>Customer:</strong> {appointmentDetails.customerInfo.name}</p>
                <p><strong>Services:</strong></p>
                <ul className="service-list">
                    {serviceNames.map((name, index) => (
                        <li key={index}>{name}</li>
                    ))}
                </ul>
                <p><strong>Technician:</strong> {appointmentDetails.technician.name}</p>
                <p><strong>Date:</strong> {formattedDate}</p>
                <p><strong>Time:</strong> {formattedSlot} - {endTime}</p>
            </div>
            <button
                className="home-button"
                onClick={() => {
                    localStorage.clear();
                    navigate("/")
                }}
            >
            </button>
        </div>
    );
};

export default AppointmentConfirmation;