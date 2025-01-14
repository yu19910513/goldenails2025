const { Customer } = require("../models");

const customerData = [
  { name: "John Doe", phone: "1234567890", email: "johndoe@example.com" },
  { name: "Jane Smith", phone: "0987654321", email: "janesmith@example.com" },
  { name: "Alice Johnson", phone: "5555555555", email: null },
];

const seedCustomers = async () => {
  await Customer.bulkCreate(customerData);
};

module.exports = seedCustomers;
