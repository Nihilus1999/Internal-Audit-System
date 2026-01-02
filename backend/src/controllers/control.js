import { Control } from '../models/control.js'
import { Process } from '../models/process.js'
import { Risk } from '../models/risk.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
import {sequelize}  from '../database/database.js'

export const getControls = async (req, res) => {
    try {
        const data = await Control.unscoped().findAll({
            include: [
                { model: Process.unscoped(), through: { attributes: [] } },
                { model: Risk.unscoped(), through: { attributes: [] }, }
            ],
            order: [['created_at', 'ASC']]
        })
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}

export const getControlById = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const data = await Control.unscoped().findOne({
            where: condition,
            include: [
                { model: Process.unscoped(), through: { attributes: [] } },
                { model: Risk.unscoped(), through: { attributes: [] } }
            ]
        })
        if (!data) return res.status(404).json({ message: ['El control no fue encontrado'] })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const createControl = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, description, control_type, management_type, teoric_effectiveness, application_frequency, ids_process, ids_risk } = req.body
        const totalCount = await Control.unscoped().count({ paranoid: false, transaction: t })
        const slug = `control-${totalCount + 1}`   
        const control = await Control.create({ slug, name, description, control_type, management_type, teoric_effectiveness, application_frequency }, { transaction: t })
        await control.setProcesses(ids_process, { transaction: t })
        await control.setRisks(ids_risk, { transaction: t })
        const data = await Control.findByPk(control.id, {
            include: [
                { model: Process, through: { attributes: [] } },
                { model: Risk, through: { attributes: [] } }
            ],
            transaction: t,
        })
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const patchControlById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { name, description, control_type, management_type, teoric_effectiveness, application_frequency, status, ids_process, ids_risk } = req.body
        const control = await Control.unscoped().findOne({ where: condition, transaction: t })
        if (!control) {
            await t.rollback()
            return res.status(404).json({ message: ['El control no fue encontrado'] })
        }
        // Apartado: Datos Generales
        if (name && description && control_type && management_type && teoric_effectiveness && application_frequency && status !== undefined) {
            await control.update({ name, description, control_type, management_type, teoric_effectiveness, application_frequency, status }, { transaction: t })
        }
        // Apartado: Procesos Responsables
        if (ids_process) {
            await control.setProcesses(ids_process, { transaction: t })
        }
        // Apartado: Riesgos
        if (ids_risk) {
            await control.setRisks(ids_risk, { transaction: t })
        }
        const data = await Control.unscoped().findByPk(control.id, {
            include: [
                { model: Process, through: { attributes: [] } },
                { model: Risk, through: { attributes: [] } }
            ],
            transaction: t
        })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
