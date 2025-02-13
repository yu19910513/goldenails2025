import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculateTotalTime } from "../../common/utils";
import "./AppointmentConfirmation.css"; // Import the CSS file
import MiscellaneousService from "../../services/miscellaneousService";

const AppointmentConfirmation = ({ appointmentDetails }) => {
    const navigate = useNavigate();
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


    const messageEngine = (isOptInSMS) => {
        let customerNumber = isOptInSMS ? appointmentDetails.customerInfo.phone : "";
        const messageData = {
            customer_number: customerNumber,
            customer_message: `Dear ${appointmentDetails.customerInfo.name}, your appointment at Golden Nails Gig Harbor for ${serviceNames.join(
                ", "
            )} on ${formattedDate} at ${formattedSlot} is confirmed. Thank you!`,
            owner_message: `Appointment confirmed for ${appointmentDetails.customerInfo.name} (${appointmentDetails.customerInfo.phone}) on ${formattedDate}, from ${formattedSlot} to ${endTime}. Technician: ${appointmentDetails.technician.name}. Services: ${serviceNames.join(
                ", ")} `,
        };

        console.log(messageData);
        
        
        MiscellaneousService.notifyCustomer(messageData)
            .then(() => console.log("SMS sent successfully"))
            .catch((error) => console.error("Failed to send SMS:", error));

    }

    useEffect(() => {
        const optInSMS = localStorage.getItem("smsOptIn");
        const fetchPermission = async () => {
            try {
                const permissionResponse = await MiscellaneousService.find("smsFeature");
                console.log(permissionResponse.data.context);
                if (permissionResponse.data && permissionResponse.data.context == "on") {
                    messageEngine(optInSMS);
                }

            } catch (error) {
                console.error("Error fetching permission data:", error);
            }
        };

        fetchPermission();
        localStorage.clear();
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