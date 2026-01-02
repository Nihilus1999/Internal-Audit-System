'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
      ADD CONSTRAINT companies_sector_check
      CHECK (sector IN ('Banca', 'Energía', 'Construcción/Infraestructura', 'Salud', 'Financiero', 'Educación', 'Comercio', 'Seguros', 'Alimentos', 'Transporte', 'TI / Telecomunicaciones', 'Otro')),
      ADD CONSTRAINT companies_fiscal_year_month_check
      CHECK (fiscal_year_month IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')),
      ADD CONSTRAINT companies_slug_unique UNIQUE (slug),
      ADD CONSTRAINT companies_name_unique UNIQUE (name),
      ADD CONSTRAINT companies_rif_unique UNIQUE (rif)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
      DROP CONSTRAINT IF EXISTS companies_sector_check,
      DROP CONSTRAINT IF EXISTS companies_fiscal_year_month_check,
      DROP CONSTRAINT IF EXISTS companies_slug_unique,
      DROP CONSTRAINT IF EXISTS companies_name_unique,
      DROP CONSTRAINT IF EXISTS companies_rif_unique
    `)
  }
}
