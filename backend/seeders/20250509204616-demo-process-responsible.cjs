'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [processes] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM processes WHERE slug IN ('process-1', 'process-2', 'process-3')`
    )

    const [users] = await queryInterface.sequelize.query(
      `SELECT id, username FROM users WHERE username IN ('aasencio11', 'jelasmar24')`
    )
    
    const usersMap = {}
    for (const u of users) {
      usersMap[u.username] = u.id
    }
    const records = processes.map((process) => {
      let userId = null
      if (['process-1', 'process-2'].includes(process.slug)) {
        userId = usersMap['aasencio11']
      } else if (['process-3'].includes(process.slug)) {
        userId = usersMap['jelasmar24']
      }
      return {
        id_process: process.id,
        id_user: userId,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })
    //Insertar en tabla intermedia
    return queryInterface.bulkInsert('process_responsibles', records)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('process_responsibles', null, {})
  }
}
