import { Event } from '../models/event.js'
import { Risk } from '../models/risk.js'
import { File } from '../models/file.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
import { sequelize }  from '../database/database.js'
import mime from 'mime-types'

export const getEvents = async (req, res) => {
    try {
        const data = await Event.unscoped().findAll({
            include: {
                model: Risk,
                through: { attributes: [] },
                required: false            
            },
            order: [['created_at', 'DESC']]
        })
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}

export const getEventById = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const data = await Event.unscoped().findOne({
            where: condition,
            include: {
                model: Risk,
                through: { attributes: [] },
                required: false
            }
        })
        if (!data) return res.status(404).json({ message: ['El evento no fue encontrado'] })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const reportEvent = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, description, cause, consequences, criticality, incident_date, incident_hour, economic_loss, ids_risk } = req.body
        const totalCount = await Event.unscoped().count({ paranoid: false, transaction: t })
        const slug = `event-${totalCount + 1}`  
        const event = await Event.create({ slug, name, description, cause, consequences, criticality, incident_date, incident_hour, economic_loss }, { transaction: t })
        await event.setRisks(ids_risk, { transaction: t })
        const data = await Event.findByPk(event.id, {
            include: {
                model: Risk,
                through: { attributes: [] },
                required: false           
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

export const updateEventById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { name, description, cause, consequences, criticality, incident_date, incident_hour, economic_loss, status, ids_risk } = req.body
        const event = await Event.unscoped().findOne({ where: condition, transaction: t })
        if (!event) {
            await t.rollback()
            return res.status(404).json({ message: ['El evento no fue encontrado'] })
        }
        await event.update({ name, description, cause, consequences, criticality, incident_date, incident_hour, economic_loss, status }, { transaction: t })
        await event.setRisks(ids_risk, { transaction: t })
        const data = await Event.unscoped().findOne({
            where: condition,
            include: {
                model: Risk,
                through: { attributes: [] },
                required: false
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

export const getEventFiles = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const event = await Event.unscoped().findOne({ where: condition })
        if (!event) return res.status(404).json({ message: ['El evento no fue encontrado'] })
        const data = await File.findAll({
            where: { id_event: event.id },
            attributes: ['id', 'file_name', 'extension', 'created_at'],
            order: [['created_at', 'DESC']],
        })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const uploadEventFiles = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const event = await Event.unscoped().findOne({ where: condition, transaction: t })
        if (!event) {
            await t.rollback()
            return res.status(404).json({ message: ['El evento no fue encontrado'] })
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) return res.status(400).json({ error: 'No se han enviado archivos' })
        for (const file of req.files) {
            const extension = file.originalname.split('.').pop()
            if (extension.length > 5) {
                await t.rollback()
                return res.status(415).json({ error: `La extensión '${extension}' del archivo '${file.originalname}' es demasiado larga (máximo 5 caracteres)` })
            }
        }
        const filesToCreate = req.files.map(file => ({ file_name: file.originalname, extension: file.originalname.split('.').pop(), content: file.buffer, id_event: event.id, }))
        const files = await File.bulkCreate(filesToCreate, { transaction: t })    
        const data = files.map(f => ({ id: f.id, file_name: f.file_name, extension: f.extension, created_at: f.created_at, }))
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const downloadEventFile = async (req, res) => {
    try {
        const id = req.params.id
        const file = await File.findByPk(id)
        if (!file) return res.status(404).json({ message: ['Documento no encontrado'] })
        if (!file.id_event) return res.status(403).json({ message: ['Este documento no pertenece a un evento'] })
        const mimeType = mime.lookup(file.extension) || 'application/octet-stream'
        res.setHeader('Content-Type', mimeType)
        res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`)
        return res.send(file.content)
    } catch (error) {
        serverError(res, error)
    }
}

export const deleteEventFile = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const file = await File.findByPk(id, { transaction: t })
        if (!file) {
            await t.rollback()
            return res.status(404).json({ message: ['Documento no encontrado'] })
        }        
        if (!file.id_event) {
            await t.rollback()
            return res.status(403).json({ message: ['Este documento no pertenece a un evento'] })
        }
        await file.destroy({ transaction: t })
        await t.commit()
        return res.json({ message: ['Documento eliminado correctamente'] })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}