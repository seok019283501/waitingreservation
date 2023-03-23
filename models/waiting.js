'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class waiting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  waiting.init({
    pk: {
      allowNull: false,
      primaryKey: true,
      autoIncrement:true,
      type: DataTypes.INTEGER
    },
    resnum: DataTypes.INTEGER,
    id: DataTypes.STRING,
    waitingnum: DataTypes.INTEGER,
    tf: DataTypes.BOOLEAN,
    people: DataTypes.INTEGER,
    date: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'waiting',
  });
  return waiting;
};