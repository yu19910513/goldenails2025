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
