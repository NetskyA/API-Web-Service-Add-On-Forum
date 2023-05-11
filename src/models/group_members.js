'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group_members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Group_members.init({
    group_id: {
      type:DataTypes.STRING,
      allowNull:false
    },
    user_id: {
      type:DataTypes.STRING,
      allowNull:false
    },
  }, {
    sequelize,
    modelName: 'Group_members',
    tableName: 'group_members',
    timestamps:false
  });
  Group_members.removeAttribute('id')
  return Group_members;
};