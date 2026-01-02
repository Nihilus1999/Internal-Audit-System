'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [processes] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM processes WHERE slug IN ('process-1', 'process-2', 'process-3')`
    )

    const [risks] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM risks WHERE slug IN ('risk-1', 'risk-2', 'risk-3', 'risk-4', 'risk-5', 'risk-6', 'risk-7', 'risk-8')`
    )
    
    const processMap = {}
    for (const p of processes) {
      processMap[p.slug] = p.id
    }
    const records = risks.map((risk) => {
      let processId = null
      if (['risk-1', 'risk-2', 'risk-3'].includes(risk.slug)) {
        processId = processMap['process-1']
      } else if (['risk-4', 'risk-5', 'risk-6'].includes(risk.slug)) {
        processId = processMap['process-2']
      } else if (['risk-7', 'risk-8'].includes(risk.slug)) {
        processId = processMap['process-3']
      }
      return {
        id_risk: risk.id,
        id_process: processId,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })
    //Insertar en tabla intermedia
    return queryInterface.bulkInsert('affected_processes', records)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('affected_processes', null, {})
  }
}
