const { Appointment, Service, Technician } = require("../models");

const appointmentData = [
  {
    customerId: 1,
    date: "2025-01-15",
    startServiceTime: "10:00:00",
    serviceIds: [1, 2], // Array of service IDs for this appointment
    technicianIds: [1, 2], // Array of technician IDs for this appointment
  },
  {
    customerId: 2,
    date: "2025-01-16",
    startServiceTime: "14:00:00",
    serviceIds: [3], // Array of service IDs for this appointment
    technicianIds: [3], // Array of technician IDs for this appointment
  },
];

const seedAppointments = async () => {
  for (const appointment of appointmentData) {
    // Create the appointment record
    const newAppointment = await Appointment.create({
      customer_id: appointment.customerId,
      date: appointment.date,
      startServiceTime: appointment.startServiceTime,
    });

    // Associate services with the appointment
    if (appointment.serviceIds && appointment.serviceIds.length) {
      const services = await Service.findAll({
        where: { id: appointment.serviceIds },
      });
      await newAppointment.addServices(services);
    }

    // Associate technicians with the appointment
    if (appointment.technicianIds && appointment.technicianIds.length) {
      const technicians = await Technician.findAll({
        where: { id: appointment.technicianIds },
      });
      await newAppointment.addTechnicians(technicians);
    }
  }
};

module.exports = seedAppointments;
