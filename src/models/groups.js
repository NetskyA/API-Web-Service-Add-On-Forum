'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Groups.init({
    group_id: {
      type:DataTypes.STRING,
      primaryKey:true,
      allowNull:false
    },
    developer_id: {
      type:DataTypes.STRING,
      allowNull:false
    },
    user_id: {
      type:DataTypes.STRING,
      allowNull:false
    },
    group_name: {
      type:DataTypes.STRING,
      allowNull:false
    },
    group_description: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    profile_picture: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    created_at: {
      type:DataTypes.STRING,
      allowNull:false
    },
  }, {
    sequelize,
    modelName: 'Groups',
    tableName: 'groups',
    timestamps:false
  });
  return Groups;
};