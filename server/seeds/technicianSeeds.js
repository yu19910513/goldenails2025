const { Technician } = require("../models");

const technicianData = [
  { name: "Alex Johnson" },
  { name: "Emma Wilson" },
  { name: "Michael Brown" },
];

const seedTechnicians = async () => {
  await Technician.bulkCreate(technicianData);
};

module.exports = seedTechnicians;
