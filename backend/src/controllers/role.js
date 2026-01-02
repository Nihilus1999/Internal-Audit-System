import { Role } from '../models/role.js'
import { Permission } from '../models/permission.js'
import { serverError } from '../helpers/handleServerError.js'
import {sequelize}  from '../database/database.js'

export const getRoles = async (req, res) => {
    try {
        const data = await Role.unscoped().findAll({
            include: {
                model: Permission,
                through: { attributes: [] },            
            }
        })
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}

export const getRoleById = async (req, res) => {
    try {
        const id  = req.params.id
        const data = await Role.unscoped().findByPk(id, {
            include: {
                model: Permission,
                through: { attributes: [] },            
            }
        })
        if (!data) return res.status(404).json({ message: ['El rol no fue encontrado'] })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const createRole = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, ids_permission } = req.body
        const role = await Role.create({ name }, { transaction: t })
        await role.setPermissions(ids_permission, { transaction: t })
        const data = await Role.findByPk(role.id, {
            include: {
                model: Permission,
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

export const updateRoleById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const { name, status, ids_permission } = req.body
        const role = await Role.unscoped().findByPk(id, { transaction: t })
        if (!role) {
            await t.rollback()
            return res.status(404).json({ message: ['El rol no fue encontrado'] })
        }
        await role.update({ name, status }, { transaction: t })
        await role.setPermissions(ids_permission, { transaction: t })
        const data = await Role.unscoped().findByPk(id, {
            include: {
                model: Permission,
                through: { attributes: [] },
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
