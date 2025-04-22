import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import AppointmentService from "../../../services/appointmentService";
import { calculateTotalTimePerAppointment } from "../../../common/utils";
import AppointmentBookingLayout from "../create_appt_feature/AppointmentBookingLayout";
import "./calendar.css";

const Calendar = () => {
  const [groupedAppointments, setGroupedAppointments] = useState([]);
  const [date, setDate] = useState(moment());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    refreshAppointments();
  }, [date]);

  const refreshAppointments = async () => {
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const res = await AppointmentService.getTechnicianGroupedAppointments(formattedDate);
      setGroupedAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleNewApptClose = () => {
    setShowModal(false);
    refreshAppointments();
  };

  const goToNextDay = () => setDate(date.clone().add(1, "day"));
  const goToPreviousDay = () => setDate(date.clone().subtract(1, "day"));

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 19; i++) {
      slots.push(date.clone().hour(i).minute(0).second(0).millisecond(0));
    }
    return slots;
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <button onClick={goToPreviousDay}>Previous</button>

        <div className="datepicker-wrapper">
          <DatePicker
            selected={date.toDate()}
            onChange={(newDate) => setDate(moment(newDate))}
            dateFormat="MMMM d, yyyy"
            className="custom-datepicker"
          />
        </div>

        <button onClick={goToNextDay}>Next</button>
      </div>

      <button
        onClick={() => setShowModal(!showModal)}
        className={`add-appt-button ${showModal ? "open" : ""}`}
      >
        {showModal ? "x" : "+"}
      </button>


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
                            calculateTotalTimePerAppointment(appointment.Services || []),
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
                              {moment(`${appointment.date}T${appointment.start_service_time}`).format("h:mm A")} -{" "}
                              {moment(`${appointment.date}T${appointment.start_service_time}`)
                                .add(totalTime, "minutes")
                                .format("h:mm A")}
                            </span>

                            <span>{totalTime} mins</span>

                            <span>
                              Services:{" "}
                              {appointment.Services.map((service) => service.name).join(", ")}
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
      {showModal && (
        <div className="modal-overlay" onClick={handleNewApptClose}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevents click from bubbling to overlay
          >
            <AppointmentBookingLayout onClose={handleNewApptClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
