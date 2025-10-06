import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    extractServiceNames,
    formatStartTime,
    formatEndTime,
    formatDate,
    buildNotificationData,
    calculateTotalTime
} from "../../utils/helper";
import NotificationService from "../../services/notificationService";
import MiscellaneousService from "../../services/miscellaneousService";
import "./AppointmentConfirmation.css";

const AppointmentConfirmation = ({ appointmentDetails }) => {
    const navigate = useNavigate();
    const optInSMS = localStorage.getItem("smsOptIn") !== 'false';

    const serviceNames = extractServiceNames(appointmentDetails.services);
    const duration = calculateTotalTime(appointmentDetails.services);
    const formattedSlot = formatStartTime(appointmentDetails.slot);
    const endTime = formatEndTime(appointmentDetails.slot, duration);
    const formattedDate = formatDate(appointmentDetails.slot);

    const sendAppointmentNotification = async () => {
        try {
            if (!appointmentDetails?.customerInfo || !appointmentDetails?.technician) {
                console.error("Missing appointment or technician details.");
                return;
            }

            const messageData = buildNotificationData(
                appointmentDetails,
                optInSMS,
                formattedDate,
                formattedSlot,
                endTime,
                serviceNames
            );

            await NotificationService.notify(messageData);
            console.log("Notification sent successfully");
        } catch (error) {
            console.error("Failed to send notification:", error);
        }
    };

    useEffect(() => {
        const fetchPermission = async () => {
            try {
                const permissionResponse = await MiscellaneousService.find("smsFeature");
                if (permissionResponse.data?.context === "on") {
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
            <p className="thank-you">
                We appreciate your booking and look forward to welcoming you.
            </p>
            <p className="details">
                Please find your appointment details below. We kindly ask that you
                arrive 5 minutes early and check in at the following address:
            </p>
            <address className="address">3610 Grandview St, Gig Harbor, WA 98335</address>
            <p className="instructions">
                To review or manage your appointment details, please use the 'Appointment
                History' section in the top navigation bar. Simply enter your phone number
                and name to access your records. Should there be any changes to your
                appointment, we will notify you via phone or text and update your online
                appointment record accordingly. If you need to cancel or modify your
                appointment, you may use the 'My Visits' to do so or contact us
                at <strong>253-851-7563</strong>.
            </p>
            <div className="appointment-details">
                <p>
                    <strong>Customer:</strong> {appointmentDetails.customerInfo.name}
                </p>
                <p>
                    <strong>Services:</strong>
                </p>
                <ul className="service-list">
                    {serviceNames.map((name, index) => (
                        <li key={index}>{name}</li>
                    ))}
                </ul>
                <p>
                    <strong>Technician:</strong> {appointmentDetails.technician.name}
                </p>
                <p>
                    <strong>Date:</strong> {formattedDate}
                </p>
                <p>
                    <strong>Time:</strong> {formattedSlot} - {endTime}
                </p>
            </div>
            <button
                className="home-button"
                onClick={() => {
                    localStorage.clear();
                    navigate("/");
                }}
            >
            </button>
        </div>
    );
};

export default AppointmentConfirmation;