'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sefemployed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  sefemployed.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    birth: DataTypes.DATE,
    phonnum: DataTypes.STRING,
    email: DataTypes.STRING,
    admission: DataTypes.STRING,
    resnum: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'sefemployed',
  });
  return sefemployed;
};