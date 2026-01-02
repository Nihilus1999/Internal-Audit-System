require('dotenv').config()

module.exports = {
  development: {
    url: process.env.DB_CONNECT,
    dialect: 'postgres',
    dialectOptions: {
      useUTC: false,
    },
    timezone: '-04:00',
  },
  production: {
    url: process.env.DB_CONNECT,
    dialect: 'postgres',
    dialectOptions: {
      useUTC: false,
    },
    timezone: '-04:00',
  }
};
