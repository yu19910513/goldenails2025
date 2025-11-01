const Technician = require("./Technician");
const Service = require("./Service");
const Appointment = require("./Appointment");
const Customer = require("./Customer");
const Category = require('./Category');
const Miscellaneous = require('./Miscellaneous');

// Technician - Category
Technician.belongsToMany(Category, { through: "techniciancategory" });
Category.belongsToMany(Technician, { through: "techniciancategory" });

// Service - Category
Service.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Service, { foreignKey: "category_id" });

// Appointment - Service
Appointment.belongsToMany(Service, { through: "appointmentservice" });
Service.belongsToMany(Appointment, { through: "appointmentservice" });

// Appointment - Technician
Appointment.belongsToMany(Technician, { through: "appointmenttechnician" });
Technician.belongsToMany(Appointment, { through: "appointmenttechnician" });

// Customer - Appointment
Customer.hasMany(Appointment, { foreignKey: "customer_id" });
Appointment.belongsTo(Customer, { foreignKey: "customer_id" });

module.exports = {
    Category,
    Service,
    Technician,
    Appointment,
    Customer,
    Miscellaneous
  };