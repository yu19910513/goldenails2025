import { calculateTotalTime } from "../../common/utils";

const AppointmentConfirmation = ({ appointmentDetails, onBack }) => {
    console.log(appointmentDetails);

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

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Appointment Confirmed</h2>
            <p><strong>Customer:</strong> {appointmentDetails.customerInfo.name}</p>
            <p><strong>Services:</strong>
                <ul className="list-disc pl-6">
                    {serviceNames.map((name, index) => (
                        <li key={index} className="mb-2">
                            {name}
                        </li>
                    ))}
                </ul></p>
            <p><strong>Technician:</strong> {appointmentDetails.technician.name}</p>
            <p><strong>Date:</strong> {formattedDate}</p>
            <p>
                <strong>Time:</strong> {formattedSlot} - {endTime}
            </p>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={onBack}
            >
                Back
            </button>
        </div>
    );
};

export default AppointmentConfirmation;
