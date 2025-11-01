const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Customer extends Model { }

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
      unique: true, // Ensures phone is unique
      validate: {
        is: /^[0-9]{10,15}$/, // Ensures phone number is between 10-15 digits
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // Email is optional
      unique: true, // Ensures email is unique if provided
      validate: {
        isEmail: true, // Validates proper email format
      },
    },
    passcode: {
      type: DataTypes.STRING(6), // Ensures it stores a 6-digit passcode
      allowNull: true,
    },
    optInSms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'optInSms',
    },
    admin_privilege: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true, // Enables createdAt and updatedAt timestamps
    underscored: true, // Converts camelCase to snake_case in DB column names
  }
);

module.exports = Customer;
