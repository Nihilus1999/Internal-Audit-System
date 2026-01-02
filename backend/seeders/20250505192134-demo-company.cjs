'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('companies', [
      {
        id: uuidv4(),
        slug: 'consultores-jdg-sa',
        name: 'Consultores J.D.G. S.A.',
        rif: 'J-401375855',
        description: 'Actividades de contabilidad, teneduria de libros y auditorias; Asesoramiento en materia de impuestos',
        phone: '212-7501145',
        email: 'gcabrera@grupojdg.com',
        sector: 'Financiero',
        fiscal_year_month: 'Abril',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('companies', null, {})
  }
}
