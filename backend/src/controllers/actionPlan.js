import { ActionPlan } from '../models/actionPlan.js'
import { User } from '../models/user.js'
import { Event } from '../models/event.js'
import { AuditFinding } from '../models/auditFinding.js'
import { Task } from '../models/task.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
import {sequelize}  from '../database/database.js'

export const getActionPlans = async (req, res) => {
    try {
        const data = await ActionPlan.unscoped().findAll({
            include: [
                { model: Event, required: false, },
                { model: AuditFinding, required: false, },
                { model: User.unscoped(), through: { attributes: [] }, },
            ],
            order: [['created_at', 'DESC']]
        })
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}

export const getActionPlanById = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const data = await ActionPlan.unscoped().findOne({
            where: condition,
            include: [
                { model: Event, required: false, },
                { model: AuditFinding, required: false, },
                { model: User.unscoped(), through: { attributes: [] }, },
            ],
        })
        if (!data) return res.status(404).json({ message: ['El plan de acción no fue encontrado'] })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const createActionPlan = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, description, plan_type, start_date, end_date, id_event, id_finding, ids_user } = req.body
        const totalCount = await ActionPlan.unscoped().count({ paranoid: false, transaction: t })
        const slug = `actionPlan-${totalCount + 1}`  
        const actionPlan = await ActionPlan.create({ slug, name, description, plan_type, start_date, end_date, id_event, id_finding }, { transaction: t })
        await actionPlan.setUsers(ids_user, { transaction: t })
        const data = await ActionPlan.findByPk(actionPlan.id, {
            include: [
                { model: Event, required: false, },
                { model: AuditFinding, required: false, },
                { model: User, through: { attributes: [] }, },
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

export const updateActionPlanById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { name, description, plan_type, start_date, end_date, status, id_event, id_finding, ids_user } = req.body
        const actionPlan = await ActionPlan.unscoped().findOne({ where: condition, transaction: t })
        if (!actionPlan) {
            await t.rollback()
            return res.status(404).json({ message: ['El plan de acción no fue encontrado'] })
        }
        await actionPlan.update({ name, description, plan_type, start_date, end_date, status, id_event, id_finding }, { transaction: t })
        await actionPlan.setUsers(ids_user, { transaction: t })
        const data = await ActionPlan.unscoped().findOne({
            where: condition,
            include: [
                { model: Event, required: false, },
                { model: AuditFinding, required: false, },
                { model: User, through: { attributes: [] }, },
            ],
            transaction: t,
        })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const getPlanTasks = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const actionPlan = await ActionPlan.unscoped().findOne({ where: condition })
        if (!actionPlan) return res.status(404).json({ message: ['El plan de acción no fue encontrado'] })
        const data = await Task.unscoped().findAll({
            where: { id_action_plan: actionPlan.id },
            order: [['created_at', 'DESC']],
        })
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}

export const createPlanTask = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { name } = req.body
        const actionPlan = await ActionPlan.unscoped().findOne({ where: condition, transaction: t })
        if (!actionPlan){
            await t.rollback()
            return res.status(404).json({ message: ['El plan de acción no fue encontrado'] })
        } 
        const task = await Task.create({ name, id_action_plan: actionPlan.id }, { transaction: t })
        const data = await Task.findByPk(task.id, { transaction: t,})
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const updatePlanTaskById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const { name, status } = req.body
        const task = await Task.unscoped().findByPk(id, { transaction: t })
        if (!task){
            await t.rollback()
            return res.status(404).json({ message: ['La tarea del plan de acción no fue encontrada'] })
        } 
        await task.update({ name, status }, { transaction: t })
        const data = await Task.unscoped().findByPk(id, { transaction: t,})
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const deletePlanTaskById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const task = await Task.unscoped().findByPk(id, { transaction: t })
        if (!task) {
            await t.rollback()
            return res.status(404).json({ message: ['La tarea del plan de acción no fue encontrada'] })
        }        
        await task.destroy({ transaction: t })
        await t.commit()
        return res.json({ message: ['Tarea eliminada correctamente'] })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}