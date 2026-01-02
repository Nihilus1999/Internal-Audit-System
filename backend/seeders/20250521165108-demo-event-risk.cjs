'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [events] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM events WHERE slug IN ('event-1', 'event-2', 'event-3')`
    )

    const [risks] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM risks WHERE slug IN ('risk-1', 'risk-2', 'risk-3', 'risk-4', 'risk-5', 'risk-6', 'risk-7', 'risk-8')`
    )
    
    const eventMap = {}
    for (const e of events) {
      eventMap[e.slug] = e.id
    }
    const records = risks.map((risk) => {
      let eventId = null
      if (['risk-4', 'risk-5', 'risk-6'].includes(risk.slug)) {
        eventId = eventMap['event-1']
      } else if (['risk-1', 'risk-2', 'risk-3'].includes(risk.slug)) {
        eventId = eventMap['event-2']
      } else if (['risk-7', 'risk-8'].includes(risk.slug)) {
        eventId = eventMap['event-3']
      }
      return {
        id_event: eventId,
        id_risk: risk.id,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })
    //Insertar en tabla intermedia
    return queryInterface.bulkInsert('event_risks', records)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('event_risks', null, {})
  }
}
