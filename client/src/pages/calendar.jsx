import React, { useState, useEffect } from "react";
import moment from "moment";
import AppointmentService from "../services/appointmentService";
import { calculateTotalTimePerAppointment } from "../common/utils";
import "./calendar.css"; // Import the scoped CSS file

const Calendar = () => {
  const [groupedAppointments, setGroupedAppointments] = useState([]);
  const [date, setDate] = useState(moment()); // Current date

  useEffect(() => {
    const fetchGroupedAppointments = async () => {
      try {
        // Format the date as "YYYY-MM-DD" to match the expected API input
        const formattedDate = date.format("YYYY-MM-DD");
        const res = await AppointmentService.getTechnicianGroupedAppointments(
          formattedDate
        );
        const data = res.data;
        console.log("Grouped Appointments:", data);

        setGroupedAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchGroupedAppointments();
  }, [date]);

  const goToNextDay = () => setDate(date.clone().add(1, "day"));
  const goToPreviousDay = () => setDate(date.clone().subtract(1, "day"));

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 19; i++) {
      slots.push(
        date.clone().hour(i).minute(0).second(0).millisecond(0) // Use the selected date
      );
    }
    return slots;
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <button onClick={goToPreviousDay}>Previous</button>
        <h2>{date.format("MMMM Do YYYY")}</h2>
        <button onClick={goToNextDay}>Next</button>
      </div>

      <div className="admin-calendar">
        {groupedAppointments.map((tech) => (
          <div key={tech.id} className="admin-technician-calendar">
            <h3>{tech.name}</h3>
            <div className="admin-time-slots">
              {generateTimeSlots().map((slot, index) => (
                <div key={index} className="admin-time-slot">
                  <div className="admin-time">{slot.format("h:mm A")}</div>
                  <div className="admin-appointments">
                    {tech.appointments
                      .filter((appointment) => {
                        const appointmentStart = moment(
                          `${appointment.date}T${appointment.start_service_time}`
                        );
                        const appointmentEnd = appointmentStart
                          .clone()
                          .add(
                            calculateTotalTimePerAppointment(
                              appointment.Services || []
                            ),
                            "minutes"
                          );
                        return (
                          slot.isSameOrAfter(appointmentStart) &&
                          slot.isBefore(appointmentEnd)
                        );
                      })
                      .map((appointment) => {
                        const totalTime = calculateTotalTimePerAppointment(
                          appointment.Services || []
                        );

                        return (
                          <div
                            key={appointment.id}
                            className="admin-appointment"
                            style={{
                              height: `${totalTime}px`,
                            }}
                          >
                            <span>{appointment.Customer.name}</span>

                            <span>
                              {moment(
                                `${appointment.date}T${appointment.start_service_time}`
                              ).format("h:mm A")}{" "}
                              -{" "}
                              {moment(
                                `${appointment.date}T${appointment.start_service_time}`
                              )
                                .add(totalTime, "minutes")
                                .format("h:mm A")}
                            </span>

                            <span>{totalTime} mins</span>

                            <span>
                              Services:{" "}
                              {appointment.Services.map(
                                (service) => service.name
                              ).join(", ")}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
