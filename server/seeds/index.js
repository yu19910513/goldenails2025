const sequelize = require("../config/connection");
const seedCustomers = require("./customerSeeds");
const seedServices = require("./serviceSeeds");
const seedTechnicians = require("./technicianSeeds");
const seedCategories = require("./categorySeeds");
const seedAppointments = require("./appointmentSeeds");

const seedAll = async () => {
  await sequelize.sync({ force: true }); // Drops and recreates tables

  console.log("Database synced!");

  await seedCategories();
  console.log("Categories seeded!");

  await seedServices();
  console.log("Services seeded!");

  await seedTechnicians();
  console.log("Technicians seeded!");

  await seedCustomers();
  console.log("Customers seeded!");

  await seedAppointments();
  console.log("Appointments seeded!");

  process.exit(0);
};

seedAll();
