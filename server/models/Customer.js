const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Customer extends Model {}

Customer.init(
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
    phone: {
      type: DataTypes.STRING,
      allowNull: false, // Phone number is required
      validate: {
        is: /^[0-9]{10,15}$/, // Ensures phone number is between 10-15 digits
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // Email is optional
      validate: {
        isEmail: true, // Validates proper email format
      },
    },
  },
  {
    sequelize,
    modelName: "Customer",
    timestamps: true, // Enables createdAt and updatedAt timestamps
    underscored: true, // Converts camelCase to snake_case in DB column names
  }
);

module.exports = Customer;
