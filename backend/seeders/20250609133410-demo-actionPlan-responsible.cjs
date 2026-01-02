'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [actionPlans] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM action_plans WHERE slug IN ('actionPlan-1', 'actionPlan-2', 'actionPlan-3')`
    )

    const [users] = await queryInterface.sequelize.query(
      `SELECT id, username FROM users WHERE username IN ('aasencio11', 'jelasmar24')`
    )
    
    const usersMap = {}
    for (const u of users) {
      usersMap[u.username] = u.id
    }
    const records = actionPlans.map((actionPlan) => {
      let userId = null
      if (['actionPlan-1', 'actionPlan-2'].includes(actionPlan.slug)) {
        userId = usersMap['aasencio11']
      } else if (['actionPlan-3'].includes(actionPlan.slug)) {
        userId = usersMap['jelasmar24']
      }
      return {
        id_action_plan: actionPlan.id,
        id_user: userId,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })
    //Insertar en tabla intermedia
    return queryInterface.bulkInsert('plan_responsibles', records)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('plan_responsibles', null, {})
  }
}
