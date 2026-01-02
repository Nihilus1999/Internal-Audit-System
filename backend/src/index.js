import './config.js'
import app from './app.js'
import {sequelize}  from './database/database.js'
// Importa todos los modelos y sus asociaciones
import './models/associations.js'

async function main() {
   try {
      const port = process.env.PORT || 3000
      await sequelize.sync({alter: false})
      console.log('Connection has been established successfully.')
      app.listen(port)
      console.log(`Server running on port: ${port}`)
   } catch (error) {
      console.error('Unable to connect to the database:', error)
   }
}

await main()