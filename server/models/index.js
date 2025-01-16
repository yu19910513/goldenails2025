const Technician = require("./Technician");
const Service = require("./Service");
const Appointment = require("./Appointment");
const Customer = require("./Customer");
const Category = require('./Category');

// Technician - Category
Technician.belongsToMany(Category, { through: "TechnicianCategory" });
Category.belongsToMany(Technician, { through: "TechnicianCategory" });

// Service - Category
Service.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Service, { foreignKey: "category_id" });

// Appointment - Service
Appointment.belongsToMany(Service, { through: "AppointmentService" });
Service.belongsToMany(Appointment, { through: "AppointmentService" });

// Appointment - Technician
Appointment.belongsToMany(Technician, { through: "AppointmentTechnician" });
Technician.belongsToMany(Appointment, { through: "AppointmentTechnician" });

// Customer - Appointment
Customer.hasMany(Appointment, { foreignKey: "customer_id" });
Appointment.belongsTo(Customer, { foreignKey: "customer_id" });

module.exports = {
    Category,
    Service,
    Technician,
    Appointment,
    Customer
  };