import React, { useState, useEffect } from "react";
import moment from "moment";
import AppointmentService from "../services/appointmentService";
import { calculateTotalTimePerAppointment } from "../common/utils";
// import "./admin.css";

const Admin = () => {
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
    for (let i = 8; i <= 17; i++) {
      slots.push(moment().hour(i).minute(0).second(0).millisecond(0));
    }
    console.log(slots);
    
    return slots;
  };

  return (
    <div className="admin-page">
      <div className="header">
        <button onClick={goToPreviousDay}>Previous</button>
        <h2>{date.format("MMMM Do YYYY")}</h2>
        <button onClick={goToNextDay}>Next</button>
      </div>

      <div className="calendar">
        {groupedAppointments.map((tech) => (
            
          <div key={tech.id} className="technician-calendar">
            <h3>{tech.name}</h3>
            <div className="time-slots">
              {generateTimeSlots().map((slot, index) => (
                <div key={index} className="time-slot">
                  <div className="time">{slot.format("h:mm A")}</div>
                  <div className="appointments">
                    {
                    tech.appointments
                    // .filter((appointment) => {
                    //   const appointmentStart = moment(`${appointment.date}T${appointment.start_service_time}`);
                    //   const appointmentEnd = appointmentStart.clone().add(calculateTotalTimePerAppointment(appointment.Services || []), "minutes");
                    //   return slot.isSameOrAfter(appointmentStart) && slot.isBefore(appointmentEnd);
                    // })
                    .map((appointment) => {
                      const totalTime = calculateTotalTimePerAppointment(appointment.Services || []);
                      console.log("Total time for appointment:", totalTime);
                      
                      return (
                        <div
                          key={appointment.id}
                          className="appointment"
                          style={{
                            height: `${totalTime}px`,
                            backgroundColor: "green",
                            border: "1px solid #ccc",
                            margin: "2px 0",
                            padding: "4px",
                            color: "white",
                          }}
                        >
                          <span>{appointment.customer_id}</span>
                          <br />
                          <span>
                            {moment(`${appointment.date}T${appointment.start_service_time}`).format("h:mm A")} - 
                            {moment(`${appointment.date}T${appointment.start_service_time}`).add(totalTime, "minutes").format("h:mm A")}
                          </span>
                          <br />
                          <span>{totalTime} mins</span>
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

export default Admin;
