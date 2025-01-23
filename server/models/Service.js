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
    add_on: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Set default value to false
    },    
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Service",
    tableName: 'services',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Service;
