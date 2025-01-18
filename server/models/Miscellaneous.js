const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Miscellaneous extends Model {}

Miscellaneous.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: true, // Name is required
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: true, // Name is required
    },
  },
  {
    sequelize,
    modelName: "Miscellaneous",
    tableName: 'miscellaneouses',
    timestamps: true, // Enables createdAt and updatedAt timestamps
    underscored: true, // Converts camelCase to snake_case in DB column names
  }
);

module.exports = Miscellaneous;
