const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Technician extends Model { }

Technician.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Name is required
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Description is optional
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[0-9]{10,15}$/, // Ensures phone number is between 10-15 digits
      },
    },
    unavailability: {
      type: DataTypes.STRING, // Use STRING for compatibility
      allowNull: true,
      validate: {
        is: /^[0-6](,[0-6])*$/, // Validates comma-separated integers from 0 to 6
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
    tableName: 'technicians',
    timestamps: true, // Enables createdAt and updatedAt timestamps
    underscored: true, // Converts camelCase to snake_case in DB column names
  }
);

module.exports = Technician;
