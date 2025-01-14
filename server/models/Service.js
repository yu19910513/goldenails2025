const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Service extends Model {}

Service.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Category",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Service",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Service;
