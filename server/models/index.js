const Technician = require("./Technician");
const Service = require("./Service");
const Category = require("./Category");
const Appointment = require("./Appointment");
const Customer = require("./Customer");

// Technician - Service
Technician.belongsToMany(Service, { through: "TechnicianService" });
Service.belongsToMany(Technician, { through: "TechnicianService" });

// Service - Category
Service.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Service, { foreignKey: "categoryId" });

// Appointment - Service
Appointment.belongsToMany(Service, { through: "AppointmentService" });
Service.belongsToMany(Appointment, { through: "AppointmentService" });

// Appointment - Technician
Appointment.belongsToMany(Technician, { through: "AppointmentTechnician" });
Technician.belongsToMany(Appointment, { through: "AppointmentTechnician" });

// Customer - Appointment
Customer.hasMany(Appointment, { foreignKey: "customerId" });
Appointment.belongsTo(Customer, { foreignKey: "customerId" });
