/**
 * Initializes and exports a Sequelize instance for database connection.
 * 
 * - Loads environment variables from a `.env` file.
 * - Connects using `DATABASE_URL` if provided (e.g., for production environments).
 * - Otherwise, falls back to local MySQL connection settings.
 * 
 * @module sequelize
 * 
 * @requires dotenv
 * @requires sequelize
 * 
 * @returns {Sequelize} Configured Sequelize instance
 */
require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    pool: { max: 500, min: 0, idle: 10000, acquire: 100 * 1000 },
  })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    dialectOptions: {
      decimalNumbers: true,
    },
  });

module.exports = sequelize;
