'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Threads extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Threads.init({
    thread_id: {
      type:DataTypes.STRING,
      primaryKey:true,
      allowNull:false
    },
    group_id:{
      type:DataTypes.STRING,
      allowNull:false
    },
    user_id: {
      type:DataTypes.STRING,
      allowNull:false
    },
    thread_name: {
      type:DataTypes.STRING,
      allowNull:false
    },
    thread_description:{
      type:DataTypes.TEXT,
      allowNull:false
    },
    created_at: {
      type:DataTypes.STRING,
      allowNull:false
    },
  }, {
    sequelize,
    modelName: 'Threads',
    tableName: 'threads',
    timestamps: false
  });
  return Threads;
};