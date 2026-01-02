import Sequelize from 'sequelize'

const opts = {
    dialectOptions: {
        useUTC: false,
    },
    timezone: '-04:00', //Hora Venezuela
}

export const sequelize = new Sequelize(process.env.DB_CONNECT, opts) //Conexion con supabase o localhost