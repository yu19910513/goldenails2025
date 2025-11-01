/**
 * Technician Model
 * -----------------
 * Represents a service technician with profile info, availability data,
 * vacation ranges, and active/inactive status.
 */

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Technician extends Model { }

Technician.init(
  {
    /** Primary key: auto-incremented technician ID */
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    /** Technician's display name (required) */
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    /** Optional description or notes about the technician */
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /** Contact phone number (optional, digits only, 10–15 chars) */
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[0-9]{10,15}$/,
      },
    },

    /**
     * Days of week the technician is unavailable.
     * Stored as comma-separated integers (0=Sunday ... 6=Saturday).
     * Example: "0,6" → unavailable on Sunday and Saturday.
     */
    unavailability: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[0-6](,[0-6])*$/,
      },
    },

    /**
    * Vacation or long-term day-off ranges.
    * Example: [
    *   { start: "2025-09-29", end: "2025-10-16" },
    *   { start: "2025-12-20", end: "2026-01-05" }
    * ]
    */
    vacation_ranges: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArrayOfRanges(value) {
          if (value && !Array.isArray(value)) {
            throw new Error("Vacation ranges must be an array.");
          }
          if (Array.isArray(value)) {
            value.forEach((range) => {
              if (!range.start || !range.end) {
                throw new Error("Each vacation range must include start and end dates.");
              }
            });
          }
        },
      },
    },
     status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default status is 'active'
    }
  },

  {
    sequelize,
    modelName: "Technician",
    tableName: "technicians",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Technician;
