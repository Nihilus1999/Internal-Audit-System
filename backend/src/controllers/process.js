import { Process } from '../models/process.js'
import { User } from '../models/user.js'
import { Company } from '../models/company.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
import {sequelize}  from '../database/database.js'

export const getProcesses = async (req, res) => {
    try {
        const data = await Process.unscoped().findAll({
            include: {
                model: User.unscoped(),
                through: { attributes: [] },            
            },
            order: [['created_at', 'ASC']]
        })
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}

export const getProcessById = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const data = await Process.unscoped().findOne({
            where: condition,
            include: {
                model: User.unscoped(),
                through: { attributes: [] }
            }
        })
        if (!data) return res.status(404).json({ message: ['El proceso no fue encontrado'] })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const createProcess = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, description, objective, ids_user } = req.body
        const totalCount = await Process.unscoped().count({ paranoid: false, transaction: t })
        const slug = `process-${totalCount + 1}`
        const company = await Company.findOne({ where: { rif : 'J-401375855' } })
        if (!company) {
            await t.rollback()
            return res.status(404).json({ message: ['Compañía no encontrada'] })
        }        
        const process = await Process.create({ slug, name, description, objective, id_company: company.id }, { transaction: t })
        await process.setUsers(ids_user, { transaction: t })
        const data = await Process.findByPk(process.id, {
            include: {
                model: User,
                through: { attributes: [] },            
            },
            transaction: t,
        })
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const updateProcessById = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { name, description, objective, status, ids_user } = req.body
        const process = await Process.unscoped().findOne({ where: condition, transaction: t })
        if (!process) {
            await t.rollback()
            return res.status(404).json({ message: ['El proceso no fue encontrado'] })
        }
        await process.update({ name, description, objective, status }, { transaction: t })
        await process.setUsers(ids_user, { transaction: t })
        const data = await Process.unscoped().findOne({
            where: condition,
            include: {
                model: User,
                through: { attributes: [] }
            },
            transaction: t,
        })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
