'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Posts.init({
    post_id: {
      type:DataTypes.STRING,
      primaryKey:true,
      allowNull:false
    },
    thread_id:{
      type:DataTypes.STRING,
      allowNull:false
    },
    user_id: {
      type:DataTypes.STRING,
      allowNull:false
    },
    post_name: {
      type:DataTypes.STRING,
      allowNull:false
    },
    post_description: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    post_image: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    views:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    likes:{
      type:DataTypes.JSON,
      allowNull:true
    },
    dislikes:{
      type:DataTypes.JSON,
      allowNull:true
    },
    created_at: {
      type:DataTypes.STRING,
      allowNull:false
    },
  }, {
    sequelize,
    modelName: 'Posts',
    tableName: 'posts',
    timestamps:false
  });
  return Posts;
};