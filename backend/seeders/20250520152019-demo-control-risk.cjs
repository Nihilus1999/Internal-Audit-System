'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [controls] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM controls WHERE slug IN ('control-1', 'control-2', 'control-3', 'control-4', 'control-5', 'control-6')`
    )

    const [risks] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM risks WHERE slug IN ('risk-1', 'risk-2', 'risk-3', 'risk-4', 'risk-5', 'risk-6', 'risk-7', 'risk-8')`
    )
    
    const controlMap = {}
    for (const c of controls) {
      controlMap[c.slug] = c.id
    }
    const riskControlMap = {
      'risk-1': ['control-1', 'control-2'],
      'risk-2': ['control-2'],
      'risk-3': ['control-1', 'control-2'],
      'risk-4': ['control-1', 'control-2'],
      'risk-5': ['control-3', 'control-4'],
      'risk-6': ['control-3'],
      'risk-7': ['control-5', 'control-6'],
      'risk-8': ['control-5', 'control-6'],
    }
    const records = []
    for (const risk of risks) {
      const controlsForRisk = riskControlMap[risk.slug] || []
      for (const controlSlug of controlsForRisk) {
        records.push({
          id_control: controlMap[controlSlug],
          id_risk: risk.id,
          created_at: new Date(),
          updated_at: new Date(),
        })
      }
    }
    //Insertar en tabla intermedia
    return queryInterface.bulkInsert('control_risks', records)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('control_risks', null, {})
  }
}
