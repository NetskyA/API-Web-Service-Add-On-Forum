'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Developers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Developers.init({
    developer_id:{
      type:DataTypes.STRING,
      primaryKey:true,
      allowNull:false
    },
    username: {
      type:DataTypes.STRING,
      allowNull:false
    },
    email: {
      type:DataTypes.STRING,
      allowNull:false
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false
    },
    phone: {
      type:DataTypes.STRING,
      allowNull:false
    },
    saldo: {
      TYPE:DataTypes.INTEGER,
      defaultValue:0,
      allowNull:false
    },
    api_hit: {
      TYPE:DataTypes.INTEGER,
      defaultValue:0,
    },
    api_key: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    status:  {
      TYPE:DataTypes.INTEGER,
      defaultValue:0
    },
  }, {
    sequelize,
    modelName: 'Developers',
    tableName: 'developers'
  });
  return Developers;
};