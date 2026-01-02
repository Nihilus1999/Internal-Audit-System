'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [processes] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM processes WHERE slug IN ('process-1', 'process-2', 'process-3')`
    )

    const [controls] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM controls WHERE slug IN ('control-1', 'control-2', 'control-3', 'control-4', 'control-5', 'control-6')`
    )
    
    const processMap = {}
    for (const p of processes) {
      processMap[p.slug] = p.id
    }
    const records = controls.map((control) => {
      let processId = null
      if (['control-1', 'control-2'].includes(control.slug)) {
        processId = processMap['process-1']
      } else if (['control-3', 'control-4'].includes(control.slug)) {
        processId = processMap['process-2']
      } else if (['control-5', 'control-6'].includes(control.slug)) {
        processId = processMap['process-3']
      }
      return {
        id_process: processId,
        id_control: control.id,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })
    //Insertar en tabla intermedia
    return queryInterface.bulkInsert('process_controls', records)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('audit_process_controls', null, {})
    return queryInterface.bulkDelete('process_controls', null, {})
  }
}
