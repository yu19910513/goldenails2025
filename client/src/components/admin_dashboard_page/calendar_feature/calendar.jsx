import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import AppointmentService from "../../../services/appointmentService";
import { calculateTotalTimePerAppointment } from "../../../utils/helper";
import AppointmentBookingLayout from "../create_appt_feature/AppointmentBookingLayout";
import "./calendar.css";

const Calendar = () => {
  const [groupedAppointments, setGroupedAppointments] = useState([]);
  const [date, setDate] = useState(moment());
  const [showModal, setShowModal] = useState(false);

  // --- Constants for Calendar ---
  // This is your "pixel per minute" ratio. 1px = 1 minute.
  // This means a 60-minute slot will be 60px tall.
  const PIXELS_PER_MINUTE = 1;
  const CALENDAR_START_HOUR = 8; // 8:00 AM
  const CALENDAR_END_HOUR = 19; // 7:00 PM (slots up to 19:00)

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

  // This function now just generates the visual grid, not containers
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = CALENDAR_START_HOUR; i <= CALENDAR_END_HOUR; i++) {
      slots.push(date.clone().hour(i).minute(0).second(0).millisecond(0));
    }
    return slots;
  };

  return (
    <div className="calendar-admin-page-container">
      <div className="calendar-admin-header">
        <button onClick={goToPreviousDay}>Previous</button>

        <div className="calendar-datepicker-wrapper">
          <DatePicker
            selected={date.toDate()}
            onChange={(newDate) => setDate(moment(newDate))}
            dateFormat="MMMM d, yyyy"
            className="calendar-custom-datepicker"
          />
        </div>

        <button onClick={goToNextDay}>Next</button>
      </div>

      <button
        onClick={() => setShowModal(!showModal)}
        className={`calendar-add-appt-button ${showModal ? "open" : ""}`}
      >
        {showModal ? "x" : "+"}
      </button>

      <div className="calendar-admin-calendar">
        {groupedAppointments.map((tech) => (
          <div key={tech.id} className="calendar-admin-technician-calendar">
            <h3>{tech.name}</h3>

            {/* This new wrapper needs position: relative 
              to contain the absolutely positioned appointments 
            */}
            <div className="calendar-admin-slots-wrapper">

              {/* 1. THE BACKGROUND GRID */}
              <div className="calendar-admin-time-slots-grid">
                {generateTimeSlots().map((slot, index) => (
                  <div key={index} className="calendar-admin-time-slot">
                    <div className="calendar-admin-time">{slot.format("h:00 A")}</div>
                    {/* This div is the visual row, its height must match our ratio */}
                    <div
                      className="calendar-admin-time-slot-row"
                      style={{ height: `${60 * PIXELS_PER_MINUTE}px` }}
                    ></div>
                  </div>
                ))}
              </div>

              {/* 2. THE APPOINTMENTS OVERLAY */}
              <div className="calendar-admin-appointments-overlay">
                {tech.appointments.map((appointment) => {
                  const totalTime = calculateTotalTimePerAppointment(
                    appointment.Services || []
                  );
                  const appointmentStart = moment(
                    `${appointment.date}T${appointment.start_service_time}`
                  );

                  // Get the calendar's start time for today (e.g., 8:00 AM)
                  const calendarStart = date.clone().hour(CALENDAR_START_HOUR).minute(0);

                  // Calculate minutes from the start of the calendar
                  const minutesFromStart = appointmentStart.diff(calendarStart, "minutes");

                  // Convert minutes to pixels for top and height
                  const topOffset = minutesFromStart * PIXELS_PER_MINUTE;
                  const height = totalTime * PIXELS_PER_MINUTE;

                  return (
                    <div
                      key={appointment.id}
                      className="calendar-admin-appointment"
                      style={{
                        top: `${topOffset}px`,
                        height: `${height}px`,
                      }}
                    >
                      <span>{appointment.Customer.name}</span>
                      <span>
                        {appointmentStart.format("h:mm A")} -{" "}
                        {appointmentStart
                          .clone()
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
          </div>
        ))}
      </div>

      {showModal && (
        <div className="calendar-modal-overlay" onClick={handleNewApptClose}>
          <div
            className="calendar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <AppointmentBookingLayout onClose={handleNewApptClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;