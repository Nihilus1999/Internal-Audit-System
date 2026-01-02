import { Company } from '../models/company.js'
import { serverError } from '../helpers/handleServerError.js'
import { sequelize }  from '../database/database.js'

export const getCompany = async (req, res) => {
    try {
        const data = await Company.findOne({ where: { rif : 'J-401375855' } })
        if (!data) return res.status(404).json({ message: 'La empresa no fue encontrada' })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const updateCompany = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, description, phone, email, sector, fiscal_year_month } = req.body
        const data = await Company.findOne({ where: { rif: 'J-401375855' }, transaction: t})
        if (!data){
            await t.rollback()
            return res.status(404).json({ message: 'La empresa no fue encontrada' })
        } 
        await data.update({ name, description, phone, email, sector, fiscal_year_month }, { transaction: t })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}