const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Service extends Model { }

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
    description: {
      type: DataTypes.TEXT,  
      allowNull: true,        
    },
    deprecated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
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
