/**
 * Initializes and exports a Sequelize instance for database connection.
 * 
 * - Loads environment variables from a `.env` file.
 * - Connects using `DATABASE_URL` if provided (e.g., Supabase production).
 * - Otherwise, falls back to local MySQL connection settings.
 * 
 * @module sequelize
 */

require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.DATABASE_URL) {
  // Production / Supabase PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Supabase requires this
      },
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 100000,
      idle: 10000,
    },
    logging: false, // set true to debug SQL queries
  });
} else {
  // Local MySQL fallback
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PW,
    {
      host: "localhost",
      dialect: "mysql",
      port: 3306,
      dialectOptions: {
        decimalNumbers: true,
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 100000,
        idle: 10000,
      },
      logging: false,
    }
  );
}

module.exports = sequelize;
